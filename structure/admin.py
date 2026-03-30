from django.contrib import admin

from .models import Rafter, Batten, Brace, PostColumn, Purlin


@admin.register(Rafter)
class RafterAdmin(admin.ModelAdmin):
    list_display = ('length', 'dimensions', 'price_per_m2', 'is_active')
    list_filter = ('is_active',)
    list_editable = ('is_active',)


@admin.register(Purlin)
class PurlinAdmin(admin.ModelAdmin):
    list_display = ('length', 'dimensions', 'price_per_m2', 'is_active')
    list_filter = ('is_active',)
    list_editable = ('is_active',)


@admin.register(Batten)
class BattenAdmin(admin.ModelAdmin):
    list_display = ('length', 'dimensions', 'price_per_m2', 'is_active')
    list_filter = ('is_active',)
    list_editable = ('is_active',)


@admin.register(Brace)
class BraceAdmin(admin.ModelAdmin):
    list_display = ('length', 'dimensions', 'price_per_m2', 'is_active')
    list_filter = ('is_active',)
    list_editable = ('is_active',)


@admin.register(PostColumn)
class PostColumnAdmin(admin.ModelAdmin):
    list_display = ('column_type', 'length', 'dimensions', 'price_per_m2', 'is_active')
    list_filter = ('column_type', 'is_active',)
    list_editable = ('is_active',)
