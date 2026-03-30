from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from fasteners.models import Fasteners
from service.models import ServiceType
from structure.models import Batten, Rafter, Purlin, PostColumn, Brace
from .models import Country, CountryProfnastil, ProfnastilColor
from .serializers import CalculateRequestSerializer

# ═══════════════════════════════════════════════
# Tom turi bo'yicha koeffitsientlar
# Key = material nomi, value = area ga ko'paytiriladigan son
# ═══════════════════════════════════════════════

ROOF_COEFFICIENTS = {
    'doppili': {
        'rafter_11_35': 1.2,
        'rafter_14_35': 1.38,
        'purlin': 0.32,
        'batten': 5.2,
        'post_column': 0.3,
        'brace': 0,
        'prof': 2.07,
        'cut_bend': 2.08,
        'germetic': 0.05,
        'big_screw': 0.05,
        'small_screw': 0.0075,
        'duga': 0.35,
        'labor': 2.5875
    },
    'shed': {
        'rafter_11_35': 0,
        'rafter_14_35': 1.96,
        'purlin': 0.4,
        'batten': 3.2,
        'post_column': 0.3,
        'brace': 0.44,
        'prof': 1.4,
        'cut_bend': 0.2,
        'germetic': 0.05,
        'big_screw': 0.05,
        'small_screw': 0.0075,
        'duga': 0,
        'labor': 2.5875
    },
}
# gable = shed bilan bir xil koeffitsientlar
ROOF_COEFFICIENTS['gable'] = ROOF_COEFFICIENTS['shed']


class CountryListView(APIView):
    """GET /api/countries/"""

    def get(self, request):
        countries = Country.objects.filter(is_active=True).values('name', 'slug')
        return Response(list(countries))


class CountryOptionsView(APIView):
    """
    GET /api/profnastil/{slug}/            → turlar ro'yxati
    GET /api/profnastil/{slug}/?type=HC35  → qalinliklar + narxlar
    """

    def get(self, request, slug):
        try:
            country = Country.objects.get(slug=slug, is_active=True)
        except Country.DoesNotExist:
            return Response(
                {'error': 'Davlat topilmadi'},
                status=status.HTTP_404_NOT_FOUND,
            )

        qs = CountryProfnastil.objects.filter(
            country=country, is_active=True,
        ).select_related('thickness', 'prof_type')

        prof_type = request.query_params.get('type')

        if prof_type:
            items = (
                qs.filter(prof_type__name=prof_type)
                .values('thickness__value', 'price_per_m2')
                .order_by('thickness__value')
            )
            thicknesses = [
                {'value': i['thickness__value'], 'price': i['price_per_m2']}
                for i in items
            ]
            return Response({'thicknesses': thicknesses})

        types = list(
            qs.values_list('prof_type__name', flat=True)
            .distinct()
        )
        return Response({'types': types})


class ColorListView(APIView):
    """GET /api/colors/"""

    def get(self, request):
        colors = ProfnastilColor.objects.filter(is_active=True).values(
            'name', 'slug', 'image',
        )
        result = [
            {
                'name': c['name'],
                'slug': c['slug'],
                'image': request.build_absolute_uri(f"/media/{c['image']}"),
            }
            for c in colors
        ]
        return Response(result)


# ═══════════════════════════════════════════════
# Narxlarni batch yuklash (1-2 query o'rniga 12 ta)
# ═══════════════════════════════════════════════

def _load_prices():
    """Barcha materiallar narxlarini bitta dict da qaytaradi."""

    # Yog'och — dimensions bo'yicha dict
    rafters = dict(
        Rafter.objects.values_list('dimensions', 'price_per_m2')
    )
    purlins = dict(
        Purlin.objects.values_list('dimensions', 'price_per_m2')
    )
    battens = dict(
        Batten.objects.values_list('dimensions', 'price_per_m2')
    )
    posts = dict(
        PostColumn.objects.values_list('column_type', 'price_per_m2')
    )
    braces = dict(
        Brace.objects.values_list('dimensions', 'price_per_m2')
    )

    # Aksessuarlar — name bo'yicha dict
    fasteners = dict(
        Fasteners.objects.values_list('name', 'price')
    )

    # Xizmatlar
    services = dict(
        ServiceType.objects.values_list('name', 'price')
    )

    return {
        'rafter_11_35': rafters.get('11.35', 0),
        'rafter_14_35': rafters.get('14.35', 0),
        'purlin': purlins.get('16*5', 0),
        'batten': battens.get('9*21', 0),
        'post_column': posts.get('Terak', 0),
        'brace': braces.get('0', 0),
        'germetic': fasteners.get('germetik', 0),
        'big_screw': fasteners.get('shurup_katta', 0),
        'small_screw': fasteners.get('shurup_kichik', 0),
        'duga': fasteners.get('duga', 0),
        'cut_bend': services.get('usluga', 0),
        'labor': services.get('Tom yopish', 0),
    }


def _calculate(area, roof_type, prof_price, prices):
    """
    Koeffitsientlar + narxlar asosida hisoblash.
    Qaytaradi: {roof_covering, structure, helpers, labor_price}
    """
    coeff = ROOF_COEFFICIENTS.get(roof_type)
    if not coeff:
        return None

    def cost(key):
        """area * koeffitsient * narx"""
        c = coeff.get(key, 0)
        return round(area * c * prices.get(key, 0)) if c else 0

    # Profnastil qoplama
    prof_summary = round(area * coeff['prof'] * prof_price)
    cut_bend_summary = round(area * coeff['cut_bend'] * prices['cut_bend'])
    roof_covering = prof_summary + cut_bend_summary
    labor_summary = round(area * coeff['labor'] * prices['labor'])

    # Yog'och konstruktsiya
    structure = (
            cost('rafter_11_35') + cost('rafter_14_35')
            + cost('purlin') + cost('batten')
            + cost('post_column') + cost('brace')
    )

    # Aksessuarlar
    helpers = cost('germetic') + cost('big_screw') + cost('small_screw') + cost('duga')

    return {
        'roof_covering': roof_covering,
        'structure': structure,
        'helpers': helpers,
        'labor_price': labor_summary,
    }


class CalculateView(APIView):
    """POST /api/calculate/"""

    def post(self, request):
        serializer = CalculateRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        d = serializer.validated_data

        # Profnastil narxini olish
        try:
            prof_price = CountryProfnastil.objects.values_list(
                'price_per_m2', flat=True,
            ).get(
                country__slug=d['country'],
                thickness__value=d['thickness'],
                prof_type__name=d['type'],
            )
        except CountryProfnastil.DoesNotExist:
            return Response(
                {'error': 'Profnastil konfiguratsiyasi topilmadi'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Batch yuklash + hisoblash
        prices = _load_prices()
        result = _calculate(d['area'], d['roof'], prof_price, prices)

        if result is None:
            return Response(
                {'error': 'Noto\'g\'ri tom turi'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        total = (
                result['roof_covering']
                + result['structure']
                + result['helpers']
                + result['labor_price']
        )

        return Response({
            'roof_area': d['area'],
            'roof_type': d['roof'],
            'country': d['country'],
            'type': d['type'],
            'thickness': d['thickness'],
            'color': d['color'],
            # Narx bo'limlari
            'roof_covering': result['roof_covering'],
            'structure': result['structure'],
            'helpers': result['helpers'],
            'labor_price': result['labor_price'],
            'total_price': total,
        })
