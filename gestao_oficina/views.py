# gestao_oficina/views.py

from .models import (
    Cliente, Veiculo, Agendamento,
    OrdemDeServico  # Adicionado OrdemDeServico ao import dos models
)
from .serializers import (
    ClienteSerializer, VeiculoSerializer, AgendamentoSerializer,
    OrdemDeServicoSerializer  # Adicionado OrdemDeServicoSerializer ao import
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
    queryset = Agendamento.objects.select_related('cliente', 'veiculo', 'mecanico_atribuido').all().order_by('data_agendamento', 'hora_agendamento')
    serializer_class = AgendamentoSerializer
    # permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class AgendamentoRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Agendamento.objects.select_related('cliente', 'veiculo', 'mecanico_atribuido').all()
    serializer_class = AgendamentoSerializer
    lookup_field = 'pk'
    # permission_classes = [permissions.IsAuthenticatedOrReadOnly]


# --- VIEWS DE ORDEM DE SERVIÇO COM DJANGO REST FRAMEWORK (NOVAS) ---
class OrdemDeServicoListCreateAPIView(generics.ListCreateAPIView):
    queryset = OrdemDeServico.objects.select_related(
        'cliente', 'veiculo', 'mecanico_responsavel'
    ).prefetch_related( # prefetch_related para many-to-many ou reverse foreign keys
        'itens_pecas', 'itens_servicos'
    ).all().order_by('-data_entrada')
    serializer_class = OrdemDeServicoSerializer
    # permission_classes = [permissions.IsAuthenticatedOrReadOnly] # Exemplo de permissão

    # Se precisar de lógica customizada ao criar (ex: definir usuário logado como mecânico),
    # você pode sobrescrever perform_create:
    # def perform_create(self, serializer):
    #     if self.request.user.is_authenticated and self.request.user.tipo_usuario == 'mecanico':
    #         serializer.save(mecanico_responsavel=self.request.user)
    #     else:
    #         # Lidar com caso onde não há mecânico ou usuário não é mecânico
    #         # Poderia levantar um erro de validação ou salvar sem mecânico se o campo permite null
    #         serializer.save()
    #     # Lógica adicional, como atualizar os totais da OS se necessário aqui.

class OrdemDeServicoRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = OrdemDeServico.objects.select_related(
        'cliente', 'veiculo', 'mecanico_responsavel'
    ).prefetch_related(
        'itens_pecas', 'itens_servicos'
    ).all()
    serializer_class = OrdemDeServicoSerializer
    lookup_field = 'pk'
    # permission_classes = [permissions.IsAuthenticatedOrReadOnly] # Exemplo de permissão

    # Lógica customizada ao atualizar pode ir em perform_update, se necessário.