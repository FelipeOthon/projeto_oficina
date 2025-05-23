# gestao_oficina/urls.py
from django.urls import path
from .views import (
    ClienteListCreateAPIView,
    ClienteRetrieveUpdateDestroyAPIView,
    VeiculoListCreateAPIView,
    VeiculoRetrieveUpdateDestroyAPIView,
    AgendamentoListCreateAPIView,     # ADICIONADA VIEW DRF PARA AGENDAMENTO
    AgendamentoRetrieveUpdateDestroyAPIView  # ADICIONADA VIEW DRF PARA AGENDAMENTO
)

app_name = 'gestao_oficina'

urlpatterns = [
    # URLs de Cliente (COM DRF)
    path('clientes/', ClienteListCreateAPIView.as_view(), name='cliente-list-create'),
    path('clientes/<int:pk>/', ClienteRetrieveUpdateDestroyAPIView.as_view(), name='cliente-detail-update-delete'),

    # URLs de Veiculo (COM DRF)
    path('veiculos/', VeiculoListCreateAPIView.as_view(), name='veiculo-list-create'),
    path('veiculos/<int:pk>/', VeiculoRetrieveUpdateDestroyAPIView.as_view(), name='veiculo-detail-update-delete'),

    # URLs de Agendamento (NOVAS - COM DRF CLASS-BASED VIEWS)
    path('agendamentos/', AgendamentoListCreateAPIView.as_view(), name='agendamento-list-create'),
    path('agendamentos/<int:pk>/', AgendamentoRetrieveUpdateDestroyAPIView.as_view(), name='agendamento-detail-update-delete'),
]