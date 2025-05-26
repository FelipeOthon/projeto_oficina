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
from rest_framework.response import Response # Adicionado para respostas customizadas
from rest_framework import status # Adicionado para códigos de status HTTP
from django.db import IntegrityError # Adicionado para capturar o erro de deleção

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


# --- VIEWS DE VEICULO COM DRF (MODIFICADA PARA TRATAR ERRO DE DELEÇÃO) ---
class VeiculoListCreateAPIView(generics.ListCreateAPIView):
    queryset = Veiculo.objects.select_related('cliente').all().order_by('marca', 'modelo')
    serializer_class = VeiculoSerializer
    # permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class VeiculoRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Veiculo.objects.select_related('cliente').all()
    serializer_class = VeiculoSerializer
    lookup_field = 'pk'
    # permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            self.perform_destroy(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except IntegrityError:
            # Se on_delete=PROTECT em OrdemDeServico.veiculo impede a deleção
            if OrdemDeServico.objects.filter(veiculo=instance).exists():
                return Response(
                    {"detail": "Este veículo não pode ser excluído pois está referenciado em uma ou mais Ordens de Serviço."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            # Se on_delete=PROTECT em Agendamento.veiculo impede a deleção (se você mudar de CASCADE para PROTECT)
            # elif Agendamento.objects.filter(veiculo=instance).exists():
            #     return Response(
            #         {"detail": "Este veículo não pode ser excluído pois está referenciado em um ou mais Agendamentos."},
            #         status=status.HTTP_400_BAD_REQUEST
            #     )
            # Outros IntegrityErrors genéricos (raro para delete se não for FK)
            return Response(
                {"detail": "Não foi possível excluir o veículo devido a restrições de integridade."},
                status=status.HTTP_400_BAD_REQUEST
            )


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
        # A lógica para atualizar totais da OrdemDeServico está nos signals.py

class ItemOsPecaRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ItemOsPecaSerializer
    lookup_url_kwarg = 'item_pk'
    # permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        os_pk = self.kwargs['os_pk']
        return ItemOsPeca.objects.filter(ordem_servico_id=os_pk)
    # A lógica para atualizar totais da OrdemDeServico em perform_update e perform_destroy está nos signals.py


# --- VIEWS PARA ITENS DE SERVIÇOS DE UMA OS (JÁ EXISTENTES E CORRETAS) ---
class ItemOsServicoListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = ItemOsServicoSerializer
    # permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        os_pk = self.kwargs['os_pk']
        return ItemOsServico.objects.filter(ordem_servico_id=os_pk)

    def perform_create(self, serializer):
        os_pk = self.kwargs['os_pk']
        ordem_servico = OrdemDeServico.objects.get(pk=os_pk)
        serializer.save(ordem_servico=ordem_servico)
        # A lógica para atualizar totais da OrdemDeServico está nos signals.py

class ItemOsServicoRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ItemOsServicoSerializer
    lookup_url_kwarg = 'item_pk'
    # permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        os_pk = self.kwargs['os_pk']
        return ItemOsServico.objects.filter(ordem_servico_id=os_pk)
    # A lógica para atualizar totais da OrdemDeServico em perform_update e perform_destroy está nos signals.py