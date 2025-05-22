# projeto_oficina/gestao_oficina/urls.py
from django.urls import path
from . import views # Importa as views do app gestao_oficina

app_name = 'gestao_oficina' # Boa prática

urlpatterns = [
    path('clientes/', views.cliente_list_create_api, name='cliente_list_create'),
    path('clientes/<int:pk>/', views.cliente_detail_update_delete_api, name='cliente_detail_update_delete'),
    # Outras URLs do app gestao_oficina virão aqui
]