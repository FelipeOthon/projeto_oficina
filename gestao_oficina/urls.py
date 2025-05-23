# gestao_oficina/urls.py
from django.urls import path
from .views import (
    ClienteListCreateAPIView,
    ClienteRetrieveUpdateDestroyAPIView,
    veiculo_list_create_api, # View antiga de veículo (função)
    veiculo_detail_update_delete_api # View antiga de veículo (função)
)

app_name = 'gestao_oficina'

urlpatterns = [
    # URLs de Cliente (AGORA COM DRF CLASS-BASED VIEWS)
    path('clientes/', ClienteListCreateAPIView.as_view(), name='cliente-list-create'), # Novo nome para evitar conflito se quiser manter o antigo temporariamente
    path('clientes/<int:pk>/', ClienteRetrieveUpdateDestroyAPIView.as_view(), name='cliente-detail-update-delete'),

    # URLs de Veiculo (AINDA NO FORMATO ANTIGO - FUNCTION-BASED VIEWS)
    path('veiculos/', veiculo_list_create_api, name='veiculo_list_create'),
    path('veiculos/<int:pk>/', veiculo_detail_update_delete_api, name='veiculo_detail_update_delete'),
]