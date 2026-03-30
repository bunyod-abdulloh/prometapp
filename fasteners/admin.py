from django.contrib import admin

from .models import Fasteners


@admin.register(Fasteners)
class FastenersAdmin(admin.ModelAdmin):
    list_display = ['name', 'dimensions', 'price', 'is_active']
    list_editable = ['is_active', ]
    search_fields = ['name', 'dimensions', ]
    list_filter = ['name', 'is_active']

# @admin.register(Adhesive)
# class AdhesiveAdmin(admin.ModelAdmin):
#     list_display = ['name', 'price', 'is_active']
#     list_editable = ['is_active', ]
#     search_fields = ['name', ]
#     list_filter = ['is_active']
