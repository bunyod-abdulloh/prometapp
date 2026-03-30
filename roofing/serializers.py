from rest_framework import serializers


class CountryOptionsSerializer(serializers.Serializer):
    """Davlat bo'yicha mavjud qalinliklar va turlar."""
    thicknesses = serializers.ListField(child=serializers.CharField())
    types = serializers.ListField(child=serializers.CharField())


class CalculateRequestSerializer(serializers.Serializer):
    """Narx hisoblash uchun kiritilgan ma'lumotlar."""
    area = serializers.FloatField(min_value=0.01)
    country = serializers.SlugField()
    thickness = serializers.CharField(max_length=10)
    type = serializers.CharField(max_length=20)
    roof = serializers.SlugField()
    color = serializers.SlugField()


class CalculateResponseSerializer(serializers.Serializer):
    """Hisoblash natijasi."""
    roof_area = serializers.FloatField()
    total_price = serializers.IntegerField()
    type = serializers.CharField()
    thickness = serializers.CharField()
    country = serializers.CharField()
