# projeto_oficina/urls.py (o principal do projeto)
from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView # <<< ADICIONADO
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    # Nova rota para servir o index.html na raiz
    path('', TemplateView.as_view(template_name='index.html'), name='app_root'), # <<< ADICIONADO

    path('admin/', admin.site.urls),
    path('api/', include('gestao_oficina.urls')), # URLs da sua aplicação gestao_oficina

    # URLs para JWT (já existentes no seu arquivo)
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

# Você pode adicionar a configuração para servir arquivos de mídia em DEBUG aqui, se necessário
# from django.conf import settings
# from django.conf.urls.static import static
# if settings.DEBUG:
#     urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
#     urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT) # Se STATIC_ROOT estiver definido