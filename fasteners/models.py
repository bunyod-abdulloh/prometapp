from django.db import models


class Screw(models.Model):
    """Shurup"""
    dimensions = models.IntegerField(verbose_name="O'lchami",
                                     help_text="Shurup o'lchami, masalan: 3, 5 | Faqat namunadagidek kiritilishi lozim!")

    price = models.PositiveIntegerField(
        verbose_name="Narx (so'm/kg)",
        help_text="1 kg shurup narxi"
    )

    is_active = models.BooleanField(default=True, verbose_name="Faolmi")

    class Meta:
        verbose_name = "Shurup"
        verbose_name_plural = "Shuruplar"

    def __str__(self):
        return f"{self.dimensions} | {self.price}"


class Adhesive(models.Model):
    """ Kley """
    name = models.CharField(
        max_length=100,
        verbose_name="Kley nomi/turi"
    )
    price = models.PositiveIntegerField(
        verbose_name="Narx (so'm/dona)",
        help_text="1 dona kley narxi"
    )

    is_active = models.BooleanField(default=True, verbose_name="Faolmi")

    class Meta:
        verbose_name = "Germetik"
        verbose_name_plural = "Germetiklar"

    def __str__(self):
        return self.name


class Fasteners(models.Model):
    """ Yordamchi mahsulotlar uchun umumiy model """
    name = models.CharField(
        max_length=255,
        verbose_name="Nomi"
    )
    dimensions = models.CharField(
        max_length=255,
        verbose_name="O'lchami"
    )
    price = models.PositiveIntegerField(
        verbose_name="Narx",
    )
    is_active = models.BooleanField(default=True, verbose_name="Faolmi")

    class Meta:
        verbose_name = "Yordamchi mahsulotlar"
        verbose_name_plural = "Yordamchi mahsulotlar"

    def __str__(self):
        return self.name
