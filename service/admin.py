from django.contrib import admin

from .models import ServiceType


@admin.register(ServiceType)
class ServiceTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'price')
    list_filter = ('name',)
    list_editable = ('price',)
