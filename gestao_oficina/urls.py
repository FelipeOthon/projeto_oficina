# gestao_oficina/urls.py
from django.urls import path
from .views import (
    ClienteListCreateAPIView,
    ClienteRetrieveUpdateDestroyAPIView,
    VeiculoListCreateAPIView,
    VeiculoRetrieveUpdateDestroyAPIView,
    AgendamentoListCreateAPIView,
    AgendamentoRetrieveUpdateDestroyAPIView,
    OrdemDeServicoListCreateAPIView,
    OrdemDeServicoRetrieveUpdateDestroyAPIView
)

app_name = 'gestao_oficina'

urlpatterns = [
    # URLs de Cliente (COM DRF)
    path('clientes/', ClienteListCreateAPIView.as_view(), name='cliente-list-create'),
    path('clientes/<int:pk>/', ClienteRetrieveUpdateDestroyAPIView.as_view(), name='cliente-detail-update-delete'),

    # URLs de Veiculo (COM DRF)
    path('veiculos/', VeiculoListCreateAPIView.as_view(), name='veiculo-list-create'),
    path('veiculos/<int:pk>/', VeiculoRetrieveUpdateDestroyAPIView.as_view(), name='veiculo-detail-update-delete'),

    # URLs de Agendamento (COM DRF)
    path('agendamentos/', AgendamentoListCreateAPIView.as_view(), name='agendamento-list-create'),
    path('agendamentos/<int:pk>/', AgendamentoRetrieveUpdateDestroyAPIView.as_view(),
         name='agendamento-detail-update-delete'),

    # URLs de Ordem de Serviço (COM DRF)
    path('ordens-servico/', OrdemDeServicoListCreateAPIView.as_view(), name='ordemdeservico-list-create'),
    path('ordens-servico/<int:pk>/', OrdemDeServicoRetrieveUpdateDestroyAPIView.as_view(),
         name='ordemdeservico-detail-update-delete'),
]