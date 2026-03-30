from django.contrib import admin

from .models import Country, ProfnastilType, RoofType, Thickness, CountryProfnastil, ProfnastilColor


@admin.register(Country)
class CountryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'is_active')
    prepopulated_fields = {'slug': ('name',)}


@admin.register(ProfnastilType)
class ProfnastilTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_active')


@admin.register(RoofType)
class RoofTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug',)
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Thickness)
class ThicknessAdmin(admin.ModelAdmin):
    list_display = ('value',)


@admin.register(CountryProfnastil)
class CountryProfnastilAdmin(admin.ModelAdmin):
    list_display = ('country', 'prof_type', 'thickness', 'price_per_m2', 'is_active')
    list_filter = ('country', 'prof_type', 'is_active')
    list_editable = ('price_per_m2', 'is_active')


@admin.register(ProfnastilColor)
class ProfnastilColorAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_active', 'image')
    list_filter = ('name', 'is_active')
    list_editable = ('is_active',)
