from django.db import models


class Country(models.Model):
    """Ishlab chiqaruvchi davlat."""
    name = models.CharField(
        max_length=100, verbose_name="Nomi",
        help_text="Ko'rsatiladigan to'liq nom, masalan: Xitoy, Rossiya"
    )
    slug = models.SlugField(
        max_length=50, unique=True, verbose_name="Slug",
        help_text="URL uchun: china, russia, korea, kazakhstan"
    )
    is_active = models.BooleanField(default=True, verbose_name="Faolmi")

    class Meta:
        verbose_name = "Ishlab chiqaruvchi"
        verbose_name_plural = "Ishlab chiqaruvchilar"

    def __str__(self):
        return self.name


class ProfnastilType(models.Model):
    """Profnastil profil turi"""
    name = models.CharField(
        max_length=20, unique=True, verbose_name="Turi"
    )
    is_active = models.BooleanField(default=True, verbose_name="Faolmi")

    class Meta:
        verbose_name = "Profnastil turi"
        verbose_name_plural = "Profnastil turlari"

    def __str__(self):
        return self.name


class RoofType(models.Model):
    """Tom turi: gable, hip, mansard va h.k."""
    name = models.CharField(max_length=30, unique=True, verbose_name="Nomi")
    slug = models.SlugField(max_length=30, unique=True, verbose_name="Slug")

    class Meta:
        verbose_name = "Tom turi"
        verbose_name_plural = "Tom turlari"

    def __str__(self):
        return self.name


class Thickness(models.Model):
    """Profnastil qalinligi (0.35, 0.40, 0.50 va h.k.)."""
    value = models.CharField(
        max_length=10, unique=True, verbose_name="Qalinlik (mm)",
        help_text="Masalan: 0.35, 0.40, 0.50"
    )

    class Meta:
        verbose_name = "Qalinlik"
        verbose_name_plural = "Qalinliklar"
        ordering = ['value']

    def __str__(self):
        return f"{self.value} mm"


class ProfnastilColor(models.Model):
    """Profnastil ranglari (rasm bilan)."""

    name = models.CharField(
        max_length=50,
        verbose_name="Rang nomi",
        help_text="Masalan: Qizil, Ko‘k, Yashil"
    )

    slug = models.SlugField(
        max_length=50,
        unique=True,
        verbose_name="Slug",
        help_text="Masalan: red, blue, green"
    )

    image = models.ImageField(
        upload_to='profnastil/colors/',
        verbose_name="Rasm",
        help_text="Rang preview rasmi"
    )

    is_active = models.BooleanField(
        default=True,
        verbose_name="Faolmi"
    )

    class Meta:
        verbose_name = "Profnastil rangi"
        verbose_name_plural = "Profnastil ranglari"
        ordering = ['name']

    def __str__(self):
        return self.name


class CountryProfnastil(models.Model):
    """
    Davlat + Qalinlik + Profnastil turi + Narx.
    Har bir kombinatsiya uchun alohida narx.
    """
    country = models.ForeignKey(
        Country, on_delete=models.CASCADE,
        related_name='profnastil_prices',
        verbose_name="Davlat"
    )
    thickness = models.ForeignKey(
        Thickness, on_delete=models.CASCADE,
        verbose_name="Qalinlik"
    )
    prof_type = models.ForeignKey(
        ProfnastilType, on_delete=models.CASCADE,
        verbose_name="Profnastil turi"
    )
    price_per_m2 = models.PositiveIntegerField(
        verbose_name="Narx (so'm/m²)",
        help_text="1 m² profnastil narxi"
    )
    is_active = models.BooleanField(default=True, verbose_name="Faolmi")

    class Meta:
        ordering = ['country', 'thickness']
        verbose_name = "Davlat narxi"
        verbose_name_plural = "Davlat narxlari"
        # Bitta kombinatsiya faqat 1 marta bo'lishi kerak
        constraints = [
            models.UniqueConstraint(
                fields=['country', 'thickness', 'prof_type'],
                name='unique_country_thickness_type'
            )
        ]

    def __str__(self):
        return f"{self.country.name} — {self.prof_type.name} — {self.thickness.value}mm — {self.price_per_m2:,} so'm"
