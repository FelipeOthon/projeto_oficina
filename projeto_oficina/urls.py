# projeto_oficina/projeto_oficina/urls.py
from django.contrib import admin
from django.urls import path, include  # Certifique-se de que 'include' está importado

# Adicione os prints de depuração para termos certeza que este arquivo está sendo carregado
print("--- DEBUG: Carregando o arquivo urls.py DO PROJETO (projeto_oficina/projeto_oficina/urls.py) ---")

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('gestao_oficina.urls')), # Esta linha direciona para o urls.py do seu app
]

print(f"--- DEBUG: urlpatterns no urls.py DO PROJETO: {urlpatterns} ---")