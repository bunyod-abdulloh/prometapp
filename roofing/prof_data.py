"""
Profnastil ma'lumotlarini bazadan olish va narx hisoblash logikasi.
"""
from .models import Country, CountryProfnastil, ProfnastilType


def get_countries():
    """Barcha faol davlatlarni qaytaradi."""
    countries = Country.objects.filter(is_active=True)
    return [
        {"value": c.code, "name": c.name}
        for c in countries
    ]


def get_profnastil_types():
    """Barcha faol profnastil turlarini qaytaradi (matoviy / glyanseviy)."""
    types = ProfnastilType.objects.filter(is_active=True)
    return [
        {"value": t.name, "label": t.get_name_display()}
        for t in types
    ]


def get_country_options(country_code):
    """Berilgan davlat uchun mavjud qalinlik va turlarni DB dan oladi."""
    try:
        country = Country.objects.get(code=country_code, is_active=True)
    except Country.DoesNotExist:
        return None

    # Faol qalinliklar (narx mavjud bo'lganlar)
    thickness_qs = CountryProfnastil.objects.filter(
        country=country, is_active=True
    ).select_related('thickness').order_by('thickness__order')

    thicknesses = [cp.thickness.value for cp in thickness_qs]

    # Profnastil turlari — global (matoviy / glyanseviy)
    types = get_profnastil_types()

    return {
        "country": country_code,
        "name": country.name,
        "thicknesses": thicknesses,
        "types": types,
    }


def calculate_price(area, country_code, thickness_value, prof_type_name, roof_type_code, pitch=2.5):
    """
    Tom narxini hisoblaydi — barcha koeffitsientlar DB dan olinadi.

    Args:
        area: Tom maydoni (m²)
        country_code: Davlat kodi
        thickness_value: Qalinlik (str, masalan "0.40")
        prof_type_name: Profnastil turi ("matoviy" yoki "glyanseviy")
        roof_type_code: Tom turi kodi
        pitch: Tom balandligi (m)

    Returns:
        dict: Hisoblash natijalari yoki xato
    """
    # --- Davlatni topish ---
    try:
        country = Country.objects.get(code=country_code, is_active=True)
    except Country.DoesNotExist:
        return {"error": f"Noma'lum davlat: {country_code}"}

    # --- Narxni topish (davlat + qalinlik) ---
    try:
        cp = CountryProfnastil.objects.select_related('thickness').get(
            country=country,
            thickness__value=thickness_value,
            is_active=True
        )
        base_price = cp.price_per_m2
    except CountryProfnastil.DoesNotExist:
        return {"error": f"{country.name} uchun {thickness_value}mm qalinlik mavjud emas"}

    # --- Profnastil turi koeffitsienti (matoviy / glyanseviy) ---
    try:
        prof_type = ProfnastilType.objects.get(name=prof_type_name, is_active=True)
        type_mult = prof_type.multiplier
        type_label = prof_type.get_name_display()
    except ProfnastilType.DoesNotExist:
        type_mult = 1.0
        type_label = prof_type_name

    # --- Tom turi koeffitsienti ---
    # try:
    #     roof_type = RoofType.objects.get(code=roof_type_code, is_active=True)
    #     roof_mult = roof_type.multiplier
    # except RoofType.DoesNotExist:
    #     roof_mult = 1.0

    # --- Hisoblash ---
    pitch_mult = 1 + (pitch - 0.5) * 0.04
    total_area = area * 1 * pitch_mult
    price_per_m2 = base_price * type_mult
    total_price = round(total_area * price_per_m2)

    return {
        "area": round(area, 2),
        "roof_area": round(total_area, 2),
        "price_per_m2": round(price_per_m2),
        "total_price": total_price,
        "country": country.name,
        "thickness": thickness_value,
        "type": type_label,
        "roof_type": roof_type_code,
    }
