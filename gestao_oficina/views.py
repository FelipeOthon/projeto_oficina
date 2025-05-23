# gestao_oficina/views.py

from .models import (
    Cliente, Veiculo, Agendamento,
    OrdemDeServico, ItemOsPeca, ItemOsServico  # Adicionado ItemOsServico ao import dos models
)
from .serializers import (
    ClienteSerializer, VeiculoSerializer, AgendamentoSerializer,
    OrdemDeServicoSerializer, ItemOsPecaSerializer, ItemOsServicoSerializer  # Adicionado ItemOsServicoSerializer
)
from rest_framework import generics


# from rest_framework import permissions # Para permissões, se necessário depois

# --- VIEWS DE CLIENTE COM DRF (JÁ EXISTENTES E CORRETAS) ---
class ClienteListCreateAPIView(generics.ListCreateAPIView):
    queryset = Cliente.objects.all().order_by('nome_completo')
    serializer_class = ClienteSerializer
    # permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class ClienteRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer
    lookup_field = 'pk'
    # permission_classes = [permissions.IsAuthenticatedOrReadOnly]


# --- VIEWS DE VEICULO COM DRF (JÁ EXISTENTES E CORRETAS) ---
class VeiculoListCreateAPIView(generics.ListCreateAPIView):
    queryset = Veiculo.objects.select_related('cliente').all().order_by('marca', 'modelo')
    serializer_class = VeiculoSerializer
    # permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class VeiculoRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Veiculo.objects.select_related('cliente').all()
    serializer_class = VeiculoSerializer
    lookup_field = 'pk'
    # permission_classes = [permissions.IsAuthenticatedOrReadOnly]


# --- VIEWS DE AGENDAMENTO COM DRF (JÁ EXISTENTES E CORRETAS) ---
class AgendamentoListCreateAPIView(generics.ListCreateAPIView):
    queryset = Agendamento.objects.select_related('cliente', 'veiculo', 'mecanico_atribuido').all().order_by(
        'data_agendamento', 'hora_agendamento')
    serializer_class = AgendamentoSerializer
    # permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class AgendamentoRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Agendamento.objects.select_related('cliente', 'veiculo', 'mecanico_atribuido').all()
    serializer_class = AgendamentoSerializer
    lookup_field = 'pk'
    # permission_classes = [permissions.IsAuthenticatedOrReadOnly]


# --- VIEWS DE ORDEM DE SERVIÇO COM DRF (JÁ EXISTENTES E CORRETAS) ---
class OrdemDeServicoListCreateAPIView(generics.ListCreateAPIView):
    queryset = OrdemDeServico.objects.select_related(
        'cliente', 'veiculo', 'mecanico_responsavel'
    ).prefetch_related(
        'itens_pecas', 'itens_servicos'
    ).all().order_by('-data_entrada')
    serializer_class = OrdemDeServicoSerializer
    # permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class OrdemDeServicoRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = OrdemDeServico.objects.select_related(
        'cliente', 'veiculo', 'mecanico_responsavel'
    ).prefetch_related(
        'itens_pecas', 'itens_servicos'
    ).all()
    serializer_class = OrdemDeServicoSerializer
    lookup_field = 'pk'
    # permission_classes = [permissions.IsAuthenticatedOrReadOnly]


# --- VIEWS PARA ITENS DE PEÇAS DE UMA OS (JÁ EXISTENTES E CORRETAS) ---
class ItemOsPecaListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = ItemOsPecaSerializer

    # permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        os_pk = self.kwargs['os_pk']
        return ItemOsPeca.objects.filter(ordem_servico_id=os_pk)

    def perform_create(self, serializer):
        os_pk = self.kwargs['os_pk']
        ordem_servico = OrdemDeServico.objects.get(pk=os_pk)
        serializer.save(ordem_servico=ordem_servico)
        # TODO: Lógica para atualizar totais da OrdemDeServico


class ItemOsPecaRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ItemOsPecaSerializer
    lookup_url_kwarg = 'item_pk'

    # permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        os_pk = self.kwargs['os_pk']
        return ItemOsPeca.objects.filter(ordem_servico_id=os_pk)

    # TODO: Lógica para atualizar totais da OrdemDeServico em perform_update e perform_destroy


# --- VIEWS PARA ITENS DE SERVIÇOS DE UMA OS (NOVAS) ---
class ItemOsServicoListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = ItemOsServicoSerializer

    # permission_classes = [permissions.IsAuthenticatedOrReadOnly] # Exemplo

    def get_queryset(self):
        """
        Esta view deve retornar uma lista de todos os serviços
        para a Ordem de Serviço especificada pela URL (os_pk).
        """
        os_pk = self.kwargs['os_pk']
        return ItemOsServico.objects.filter(ordem_servico_id=os_pk)

    def perform_create(self, serializer):
        """
        Associa o novo serviço à Ordem de Serviço especificada na URL.
        """
        os_pk = self.kwargs['os_pk']
        ordem_servico = OrdemDeServico.objects.get(pk=os_pk)
        serializer.save(ordem_servico=ordem_servico)
        # TODO: Adicionar lógica para atualizar os totais da OrdemDeServico


class ItemOsServicoRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ItemOsServicoSerializer
    # permission_classes = [permissions.IsAuthenticatedOrReadOnly] # Exemplo
    lookup_url_kwarg = 'item_pk'  # Usar 'item_pk' da URL para buscar o item

    def get_queryset(self):
        """
        Esta view deve retornar o item do serviço especificado
        pelo 'os_pk' e 'item_pk' da URL.
        """
        os_pk = self.kwargs['os_pk']
        return ItemOsServico.objects.filter(ordem_servico_id=os_pk)

    # TODO: Adicionar lógica para atualizar os totais da OrdemDeServico em perform_update e perform_destroy