# gestao_oficina/urls.py
from django.urls import path
from .views import (
    ClienteListCreateAPIView,
    ClienteRetrieveUpdateDestroyAPIView,
    VeiculoListCreateAPIView,     # NOVA VIEW DRF PARA VEICULO
    VeiculoRetrieveUpdateDestroyAPIView  # NOVA VIEW DRF PARA VEICULO
)

app_name = 'gestao_oficina'

urlpatterns = [
    # URLs de Cliente (COM DRF)
    path('clientes/', ClienteListCreateAPIView.as_view(), name='cliente-list-create'),
    path('clientes/<int:pk>/', ClienteRetrieveUpdateDestroyAPIView.as_view(), name='cliente-detail-update-delete'),

    # URLs de Veiculo (AGORA COM DRF CLASS-BASED VIEWS)
    path('veiculos/', VeiculoListCreateAPIView.as_view(), name='veiculo-list-create'),
    path('veiculos/<int:pk>/', VeiculoRetrieveUpdateDestroyAPIView.as_view(), name='veiculo-detail-update-delete'),
]