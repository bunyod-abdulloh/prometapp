from django.db import models


class Rafter(models.Model):
    """Stropila"""
    length = models.IntegerField(
        verbose_name="Uzunligi",
        help_text="Stropila uzunligi, masalan: 4, 6 metr. Faqat raqam kiritilishi lozim!"
    )
    dimensions = models.CharField(max_length=20, verbose_name="O'lchami",
                                  help_text="Stropila o'lchami, masalan: 11.35, 14.35 | Faqat namunadagidek kiritilishi lozim!")
    price_per_m2 = models.PositiveIntegerField(
        verbose_name="Narx (so'm/m²)",
        help_text="1 m² stropila narxi"
    )
    is_active = models.BooleanField(default=True, verbose_name="Faolmi")

    class Meta:
        verbose_name = "Stropila"
        verbose_name_plural = "Stropilalar"

    def __str__(self):
        return f"{self.length} | {self.dimensions}"


class Purlin(models.Model):
    """Sarrob"""

    length = models.IntegerField(
        verbose_name="Uzunligi",
        help_text="Sarrob uzunligi, masalan: 4, 6 metr. Faqat raqam kiritilishi lozim!"
    )
    dimensions = models.CharField(max_length=20, verbose_name="O'lchami",
                                  help_text="Sarrob o'lchami, masalan: 16*5 | Faqat namunadagidek kiritilishi lozim!")
    price_per_m2 = models.PositiveIntegerField(
        verbose_name="Narx (so'm/m²)",
        help_text="1 m² sarrob narxi"
    )
    is_active = models.BooleanField(default=True, verbose_name="Faolmi")

    class Meta:
        verbose_name = "Sarrob"
        verbose_name_plural = "Sarroblar"

    def __str__(self):
        return f"{self.length} | {self.dimensions}"


class Batten(models.Model):
    """Lapsha"""

    length = models.IntegerField(
        verbose_name="Uzunligi",
        help_text="Lapsha uzunligi, masalan: 4, 6 metr. Faqat raqam kiritilishi lozim!"
    )
    dimensions = models.CharField(max_length=20, verbose_name="O'lchami",
                                  help_text="Lapsha o'lchami, masalan: 9*21 | Faqat namunadagidek kiritilishi lozim!")
    price_per_m2 = models.PositiveIntegerField(
        verbose_name="Narx (so'm/m²)",
        help_text="1 m² lapsha narxi"
    )
    is_active = models.BooleanField(default=True, verbose_name="Faolmi")

    class Meta:
        verbose_name = "Lapsha"
        verbose_name_plural = "Lapshalar"

    def __str__(self):
        return f"{self.length} | {self.dimensions}"


class Brace(models.Model):
    """Qo'l"""

    length = models.IntegerField(
        verbose_name="Uzunligi",
        help_text="Qo'l uzunligi, masalan: 4, 6 metr. Faqat raqam kiritilishi lozim!"
    )
    dimensions = models.CharField(max_length=20, verbose_name="O'lchami",
                                  help_text="Qo'l o'lchami, masalan: 16*5 | Faqat namunadagidek kiritilishi lozim!")
    price_per_m2 = models.PositiveIntegerField(
        verbose_name="Narx (so'm/m²)",
        help_text="1 m² qo'l narxi"
    )
    is_active = models.BooleanField(default=True, verbose_name="Faolmi")

    class Meta:
        verbose_name = "Qo'l"
        verbose_name_plural = "Qo'llar"

    def __str__(self):
        return f"{self.length} | {self.dimensions}"


class PostColumn(models.Model):
    """Ustun"""
    column_type = models.CharField(
        max_length=255,
        verbose_name="Ustun turi",
        help_text="Ustun turini kiriting, masalan, terak, profil"
    )
    length = models.IntegerField(
        verbose_name="Uzunligi",
        help_text="Ustun uzunligi, masalan: 4, 6 metr. Faqat raqam kiritilishi lozim!"
    )
    dimensions = models.CharField(max_length=20, verbose_name="O'lchami",
                                  help_text="Ustun o'lchami, masalan: 16*5 | Faqat namunadagidek kiritilishi lozim!")
    price_per_m2 = models.PositiveIntegerField(
        verbose_name="Narx (so'm/m²)",
        help_text="1 m² ustun narxi"
    )
    is_active = models.BooleanField(default=True, verbose_name="Faolmi")

    class Meta:
        verbose_name = "Ustun"
        verbose_name_plural = "Ustunlar"

    def __str__(self):
        return f"{self.length} | {self.dimensions}"
