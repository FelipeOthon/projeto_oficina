# gestao_oficina/views.py

from .models import (
    Cliente, Veiculo, Agendamento,
    OrdemDeServico, ItemOsPeca, ItemOsServico
)
from .serializers import (
    ClienteSerializer, VeiculoSerializer, AgendamentoSerializer,
    OrdemDeServicoSerializer, ItemOsPecaSerializer, ItemOsServicoSerializer
)
from rest_framework import generics
from rest_framework.response import Response
from rest_framework import status
from django.db import IntegrityError
# Imports de Permissão Atualizados:
from rest_framework.permissions import IsAuthenticated # Pode ser necessário para lógica em get_permissions
from .permissions import IsAdminUser, IsAdminOrMecanico, AdminFullAccessMecanicoReadOnly


# --- VIEWS DE CLIENTE ---
class ClienteListCreateAPIView(generics.ListCreateAPIView):
    queryset = Cliente.objects.all().order_by('nome_completo')
    serializer_class = ClienteSerializer
    # Admin pode Criar. Admin e Mecânico podem Listar.
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminUser()]
        return [IsAdminOrMecanico()] # Permite GET para Admin e Mecanico

class ClienteRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer
    lookup_field = 'pk'
    # Admin pode Ver, Editar, Deletar. Mecânico pode apenas Ver.
    permission_classes = [AdminFullAccessMecanicoReadOnly]


# --- VIEWS DE VEICULO ---
class VeiculoListCreateAPIView(generics.ListCreateAPIView):
    queryset = Veiculo.objects.select_related('cliente').all().order_by('marca', 'modelo')
    serializer_class = VeiculoSerializer
    # Admin pode Criar. Admin e Mecânico podem Listar.
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminUser()]
        return [IsAdminOrMecanico()]

class VeiculoRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Veiculo.objects.select_related('cliente').all()
    serializer_class = VeiculoSerializer
    lookup_field = 'pk'
    # Admin pode Ver, Editar, Deletar. Mecânico pode apenas Ver.
    permission_classes = [AdminFullAccessMecanicoReadOnly]

    def destroy(self, request, *args, **kwargs): # Lógica de destroy existente
        instance = self.get_object()
        try:
            self.perform_destroy(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except IntegrityError:
            if OrdemDeServico.objects.filter(veiculo=instance).exists():
                return Response(
                    {"detail": "Este veículo não pode ser excluído pois está referenciado em uma ou mais Ordens de Serviço."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            return Response(
                {"detail": "Não foi possível excluir o veículo devido a restrições de integridade."},
                status=status.HTTP_400_BAD_REQUEST
            )

# --- VIEWS DE AGENDAMENTO ---
class AgendamentoListCreateAPIView(generics.ListCreateAPIView):
    queryset = Agendamento.objects.select_related('cliente', 'veiculo', 'mecanico_atribuido').all().order_by(
        'data_agendamento', 'hora_agendamento')
    serializer_class = AgendamentoSerializer
    permission_classes = [IsAdminOrMecanico] # Admin e Mecânico podem listar e criar

class AgendamentoRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Agendamento.objects.select_related('cliente', 'veiculo', 'mecanico_atribuido').all()
    serializer_class = AgendamentoSerializer
    lookup_field = 'pk'
    # Admin e Mecânico podem ver e editar. Só Admin deleta.
    def get_permissions(self):
        if self.request.method == 'DELETE':
            return [IsAdminUser()]
        return [IsAdminOrMecanico()]


# --- VIEWS DE ORDEM DE SERVIÇO ---
class OrdemDeServicoListCreateAPIView(generics.ListCreateAPIView):
    queryset = OrdemDeServico.objects.select_related(
        'cliente', 'veiculo', 'mecanico_responsavel'
    ).prefetch_related(
        'itens_pecas', 'itens_servicos'
    ).all().order_by('-data_entrada')
    serializer_class = OrdemDeServicoSerializer
    permission_classes = [IsAdminOrMecanico] # Admin e Mecânico podem listar e criar

class OrdemDeServicoRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = OrdemDeServico.objects.select_related(
        'cliente', 'veiculo', 'mecanico_responsavel'
    ).prefetch_related(
        'itens_pecas', 'itens_servicos'
    ).all()
    serializer_class = OrdemDeServicoSerializer
    lookup_field = 'pk'
    # Admin e Mecânico podem ver e editar. Só Admin deleta OS inteira.
    def get_permissions(self):
        if self.request.method == 'DELETE':
            return [IsAdminUser()]
        return [IsAdminOrMecanico()]


# --- VIEWS PARA ITENS DE PEÇAS DE UMA OS ---
class ItemOsPecaListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = ItemOsPecaSerializer
    permission_classes = [IsAdminOrMecanico] # Admin e Mecânico gerenciam itens

    def get_queryset(self):
        os_pk = self.kwargs['os_pk']
        return ItemOsPeca.objects.filter(ordem_servico_id=os_pk)

    def perform_create(self, serializer):
        os_pk = self.kwargs['os_pk']
        ordem_servico = OrdemDeServico.objects.get(pk=os_pk)
        serializer.save(ordem_servico=ordem_servico)

class ItemOsPecaRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ItemOsPecaSerializer
    lookup_url_kwarg = 'item_pk'
    permission_classes = [IsAdminOrMecanico] # Admin e Mecânico gerenciam itens

    def get_queryset(self):
        os_pk = self.kwargs['os_pk']
        return ItemOsPeca.objects.filter(ordem_servico_id=os_pk)


# --- VIEWS PARA ITENS DE SERVIÇOS DE UMA OS ---
class ItemOsServicoListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = ItemOsServicoSerializer
    permission_classes = [IsAdminOrMecanico] # Admin e Mecânico gerenciam itens

    def get_queryset(self):
        os_pk = self.kwargs['os_pk']
        return ItemOsServico.objects.filter(ordem_servico_id=os_pk)

    def perform_create(self, serializer):
        os_pk = self.kwargs['os_pk']
        ordem_servico = OrdemDeServico.objects.get(pk=os_pk)
        serializer.save(ordem_servico=ordem_servico)

class ItemOsServicoRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ItemOsServicoSerializer
    lookup_url_kwarg = 'item_pk'
    permission_classes = [IsAdminOrMecanico] # Admin e Mecânico gerenciam itens

    def get_queryset(self):
        os_pk = self.kwargs['os_pk']
        return ItemOsServico.objects.filter(ordem_servico_id=os_pk)