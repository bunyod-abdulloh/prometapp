from django.urls import path

from .views import CountryOptionsView, CalculateView, CountryListView, ColorListView

# app_name = 'profnastil'  # kerak bo'lsa

urlpatterns = [
    path('countries/', CountryListView.as_view(), name='country-list'),
    path('profnastil/<slug:slug>/', CountryOptionsView.as_view(), name='country-options'),
    path('calculate/', CalculateView.as_view(), name='calculate'),
    path('colors/', ColorListView.as_view(), name='color-list'),
]
