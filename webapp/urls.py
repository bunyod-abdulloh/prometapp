from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include

from coreapp.views import home

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', home, name="home"),
    path('api/roof/', include('roofing.urls')),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)