# projeto_oficina/projeto_oficina/urls.py
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import ( # Adicionar estes imports
    TokenObtainPairView,
    TokenRefreshView,
    # TokenVerifyView, # Opcional, se quiser um endpoint para verificar o token
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('gestao_oficina.urls')),

    # Novas URLs para JWT
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    # path('api/token/verify/', TokenVerifyView.as_view(), name='token_verify'), # Opcional
]