# projeto_oficina/projeto_oficina/urls.py
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('gestao_oficina.urls')),
]