from django.db import models


class ServiceType(models.Model):
    name = models.CharField(
        max_length=100,
        verbose_name="Hizmat turi nomi"
    )

    price = models.IntegerField(
        verbose_name="Hizmat turi narxi",
        help_text="Hizmat turi narxini kiriting! Agar usta haqqi bo'lsa 1m² uchun narxni kiriting"
    )

    def __str__(self):
        return f"{self.name}"

    class Meta:
        verbose_name = "Hizmat turi nomi"
        verbose_name_plural = "Hizmat turlari"
