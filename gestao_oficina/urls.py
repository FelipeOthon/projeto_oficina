# gestao_oficina/urls.py
from django.urls import path
from . import views # Importa as views do app gestao_oficina

app_name = 'gestao_oficina'

urlpatterns = [
    # URLs de Cliente
    path('clientes/', views.cliente_list_create_api, name='cliente_list_create'),
    path('clientes/<int:pk>/', views.cliente_detail_update_delete_api, name='cliente_detail_update_delete'),

    # URLs de Veiculo (NOVAS)
    path('veiculos/', views.veiculo_list_create_api, name='veiculo_list_create'),
    path('veiculos/<int:pk>/', views.veiculo_detail_update_delete_api, name='veiculo_detail_update_delete'),
]