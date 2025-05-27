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
    OrdemDeServicoRetrieveUpdateDestroyAPIView,
    ItemOsPecaListCreateAPIView,
    ItemOsPecaRetrieveUpdateDestroyAPIView,
    ItemOsServicoListCreateAPIView,
    ItemOsServicoRetrieveUpdateDestroyAPIView,
    MecanicoListAPIView,
    OrdemDeServicoPDFView # Importar a nova view
)

app_name = 'gestao_oficina'

urlpatterns = [
    # URLs de Cliente
    path('clientes/', ClienteListCreateAPIView.as_view(), name='cliente-list-create'),
    path('clientes/<int:pk>/', ClienteRetrieveUpdateDestroyAPIView.as_view(), name='cliente-detail-update-delete'),

    # URLs de Veiculo
    path('veiculos/', VeiculoListCreateAPIView.as_view(), name='veiculo-list-create'),
    path('veiculos/<int:pk>/', VeiculoRetrieveUpdateDestroyAPIView.as_view(), name='veiculo-detail-update-delete'),

    # URLs de Agendamento
    path('agendamentos/', AgendamentoListCreateAPIView.as_view(), name='agendamento-list-create'),
    path('agendamentos/<int:pk>/', AgendamentoRetrieveUpdateDestroyAPIView.as_view(),
         name='agendamento-detail-update-delete'),

    # URLs de Ordem de Serviço
    path('ordens-servico/', OrdemDeServicoListCreateAPIView.as_view(), name='ordemdeservico-list-create'),
    path('ordens-servico/<int:pk>/', OrdemDeServicoRetrieveUpdateDestroyAPIView.as_view(),
         name='ordemdeservico-detail-update-delete'),
    # URL para o PDF da Ordem de Serviço
    path('ordens-servico/<int:pk>/pdf/', OrdemDeServicoPDFView.as_view(), name='ordemdeservico-pdf'), # ADICIONADO

    # URLs para Itens de Peças de uma OS específica
    path('ordens-servico/<int:os_pk>/pecas/', ItemOsPecaListCreateAPIView.as_view(), name='itemospeca-list-create'),
    path('ordens-servico/<int:os_pk>/pecas/<int:item_pk>/', ItemOsPecaRetrieveUpdateDestroyAPIView.as_view(),
         name='itemospeca-detail-update-delete'),

    # URLs para Itens de Serviços de uma OS específica
    path('ordens-servico/<int:os_pk>/servicos/', ItemOsServicoListCreateAPIView.as_view(),
         name='itemosservico-list-create'),
    path('ordens-servico/<int:os_pk>/servicos/<int:item_pk>/', ItemOsServicoRetrieveUpdateDestroyAPIView.as_view(),
         name='itemosservico-detail-update-delete'),

    # URL para listar mecânicos
    path('usuarios/mecanicos/', MecanicoListAPIView.as_view(), name='mecanico-list'),
]