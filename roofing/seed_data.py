"""
Boshlang'ich profnastil ma'lumotlarini bazaga yuklash.
Ishlatish: python manage.py seed_data
"""
from .models import (
    Country, ProfnastilType, Thickness, CountryProfnastil,
)
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Bazaga boshlang'ich profnastil ma'lumotlarini yuklash"

    def handle(self, *args, **options):
        self.stdout.write("Ma'lumotlar yuklanmoqda...")

        # ────────────────────────────────────────
        # 1. Qalinliklar
        # ────────────────────────────────────────
        thickness_data = [
            ("0.30", 1),
            ("0.35", 2),
            ("0.40", 3),
            ("0.45", 4),
            ("0.50", 5),
            ("0.55", 6),
            ("0.60", 7),
            ("0.70", 8),
        ]
        thicknesses = {}
        for value, order in thickness_data:
            obj, created = Thickness.objects.update_or_create(
                value=value,
                defaults={"order": order}
            )
            thicknesses[value] = obj
            if created:
                self.stdout.write(f"  + Qalinlik: {value}mm")

        # ────────────────────────────────────────
        # 2. Profnastil turlari (faqat 2 ta)
        # ────────────────────────────────────────
        type_data = [
            ("matoviy", 1.0),
            ("glyanseviy", 1.15),
        ]
        for name, mult in type_data:
            obj, created = ProfnastilType.objects.update_or_create(
                name=name,
                defaults={"multiplier": mult}
            )
            label = obj.get_name_display()
            if created:
                self.stdout.write(f"  + Tur: {label} (x{mult})")
            else:
                self.stdout.write(f"  ✓ Tur mavjud: {label} (x{mult})")

        # ────────────────────────────────────────
        # 3. Tom turlari
        # ────────────────────────────────────────
        roof_data = [
            ("flat", "Tekis", 1.00, 1),
            ("shed", "Bir tomonli", 1.15, 2),
            ("gable", "Ikki tomonli", 1.22, 3),
            ("hip", "To'rt tomonli", 1.30, 4),
            ("pyramid", "Piramida", 1.28, 5),
            ("mansard", "Mansard", 1.45, 6),
            ("doppili", "Do'ppili", 1.35, 7),
        ]
        # for code, name, mult, order in roof_data:
        #     obj, created = RoofType.objects.update_or_create(
        #         code=code,
        #         defaults={"name": name, "multiplier": mult, "order": order}
        #     )
        #     if created:
        #         self.stdout.write(f"  + Tom turi: {name} (x{mult})")

        # ────────────────────────────────────────
        # 4. Davlatlar va ularning narxlari
        # ────────────────────────────────────────
        countries_data = {
            "samarkand": {
                "name": "Samarqand",
                "order": 1,
                "thicknesses": {
                    "0.30": 38000,
                    "0.35": 42000,
                    "0.40": 48000,
                    "0.45": 54000,
                    "0.50": 60000,
                },
            },
            "tashkent": {
                "name": "Toshkent",
                "order": 2,
                "thicknesses": {
                    "0.35": 45000,
                    "0.40": 52000,
                    "0.45": 58000,
                    "0.50": 65000,
                    "0.55": 72000,
                    "0.60": 80000,
                },
            },
            "china": {
                "name": "Xitoy",
                "order": 3,
                "thicknesses": {
                    "0.35": 42000,
                    "0.40": 48000,
                    "0.45": 54000,
                    "0.50": 60000,
                    "0.55": 67000,
                    "0.60": 74000,
                    "0.70": 88000,
                },
            },
            "russia": {
                "name": "Rossiya",
                "order": 4,
                "thicknesses": {
                    "0.40": 62000,
                    "0.45": 70000,
                    "0.50": 78000,
                    "0.55": 86000,
                    "0.60": 95000,
                    "0.70": 112000,
                },
            },
        }

        for code, data in countries_data.items():
            country, created = Country.objects.update_or_create(
                code=code,
                defaults={"name": data["name"], "order": data["order"]}
            )
            if created:
                self.stdout.write(f"\n  ★ Davlat: {data['name']}")

            # Narxlar
            for thick_val, price in data["thicknesses"].items():
                thick_obj = thicknesses[thick_val]
                CountryProfnastil.objects.update_or_create(
                    country=country,
                    thickness=thick_obj,
                    defaults={"price_per_m2": price}
                )

            self.stdout.write(
                f"    {data['name']}: {len(data['thicknesses'])} qalinlik"
            )

        self.stdout.write(self.style.SUCCESS(
            "\n✅ Barcha ma'lumotlar muvaffaqiyatli yuklandi!"
        ))
