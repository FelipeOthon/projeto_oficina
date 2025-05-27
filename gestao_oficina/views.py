# gestao_oficina/views.py

from .models import (
    Cliente, Veiculo, Agendamento,
    OrdemDeServico, ItemOsPeca, ItemOsServico,
    Usuario
)
from .serializers import (
    ClienteSerializer, VeiculoSerializer, AgendamentoSerializer,
    OrdemDeServicoSerializer, ItemOsPecaSerializer, ItemOsServicoSerializer,
    MecanicoSerializer
)
from rest_framework import generics
from rest_framework.response import Response
from rest_framework import status
from django.db import IntegrityError
from rest_framework.permissions import IsAuthenticated
from .permissions import IsAdminUser, IsAdminOrMecanico, AdminFullAccessMecanicoReadOnly

# Imports para PDF
from django.http import HttpResponse
from django.template.loader import get_template
from xhtml2pdf import pisa
from django.shortcuts import get_object_or_404

# IMPORTAR SearchFilter
from rest_framework.filters import SearchFilter


# --- VIEWS DE CLIENTE ---
class ClienteListCreateAPIView(generics.ListCreateAPIView):
    queryset = Cliente.objects.all().order_by('nome_completo')
    serializer_class = ClienteSerializer
    # CONFIGURAR FILTROS
    filter_backends = [SearchFilter]
    search_fields = ['nome_completo', 'email', 'cpf_cnpj']  # Campos onde a busca será aplicada

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminUser()]
        return [IsAdminOrMecanico()]


class ClienteRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer
    lookup_field = 'pk'
    permission_classes = [AdminFullAccessMecanicoReadOnly]


# --- VIEWS DE VEICULO ---
class VeiculoListCreateAPIView(generics.ListCreateAPIView):
    queryset = Veiculo.objects.select_related('cliente').all().order_by('marca', 'modelo')
    serializer_class = VeiculoSerializer

    # Se quisermos adicionar filtro de busca para veículos no futuro, faremos aqui.
    # filter_backends = [SearchFilter]
    # search_fields = ['placa', 'marca', 'modelo', 'cliente__nome_completo']
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminUser()]
        return [IsAdminOrMecanico()]


class VeiculoRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Veiculo.objects.select_related('cliente').all()
    serializer_class = VeiculoSerializer
    lookup_field = 'pk'
    permission_classes = [AdminFullAccessMecanicoReadOnly]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            self.perform_destroy(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except IntegrityError:
            if OrdemDeServico.objects.filter(veiculo=instance).exists():
                return Response(
                    {
                        "detail": "Este veículo não pode ser excluído pois está referenciado em uma ou mais Ordens de Serviço."},
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
    permission_classes = [IsAdminOrMecanico]
    # Se quisermos adicionar filtro de busca para agendamentos:
    # filter_backends = [SearchFilter]
    # search_fields = ['cliente__nome_completo', 'veiculo__placa', 'servico_solicitado', 'status_agendamento']


class AgendamentoRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Agendamento.objects.select_related('cliente', 'veiculo', 'mecanico_atribuido').all()
    serializer_class = AgendamentoSerializer
    lookup_field = 'pk'

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
    permission_classes = [IsAdminOrMecanico]
    # Se quisermos adicionar filtro de busca para OS:
    # filter_backends = [SearchFilter]
    # search_fields = ['numero_os', 'cliente__nome_completo', 'veiculo__placa', 'status_os']


class OrdemDeServicoRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = OrdemDeServico.objects.select_related(
        'cliente', 'veiculo', 'mecanico_responsavel'
    ).prefetch_related(
        'itens_pecas', 'itens_servicos'
    ).all()
    serializer_class = OrdemDeServicoSerializer
    lookup_field = 'pk'

    def get_permissions(self):
        if self.request.method == 'DELETE':
            return [IsAdminUser()]
        return [IsAdminOrMecanico()]


# --- VIEWS PARA ITENS DE PEÇAS DE UMA OS ---
class ItemOsPecaListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = ItemOsPecaSerializer
    permission_classes = [IsAdminOrMecanico]

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
    permission_classes = [IsAdminOrMecanico]

    def get_queryset(self):
        os_pk = self.kwargs['os_pk']
        return ItemOsPeca.objects.filter(ordem_servico_id=os_pk)


# --- VIEWS PARA ITENS DE SERVIÇOS DE UMA OS ---
class ItemOsServicoListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = ItemOsServicoSerializer
    permission_classes = [IsAdminOrMecanico]

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
    permission_classes = [IsAdminOrMecanico]

    def get_queryset(self):
        os_pk = self.kwargs['os_pk']
        return ItemOsServico.objects.filter(ordem_servico_id=os_pk)


# --- VIEW PARA LISTAR MECÂNICOS ---
class MecanicoListAPIView(generics.ListAPIView):
    queryset = Usuario.objects.filter(tipo_usuario='mecanico').order_by('first_name', 'last_name', 'username')
    serializer_class = MecanicoSerializer
    permission_classes = [IsAdminOrMecanico]


# --- FUNÇÃO UTILITÁRIA PARA RENDERIZAR PDF ---
def render_pdf_view(template_path, context_dict={}):
    template = get_template(template_path)
    html = template.render(context_dict)
    response = HttpResponse(content_type='application/pdf')

    os_object = context_dict.get('os')
    numero_da_os = "documento"
    if os_object and hasattr(os_object, 'numero_os'):
        numero_da_os = os_object.numero_os

    filename = f"os_{numero_da_os}.pdf"
    response['Content-Disposition'] = f'inline; filename="{filename}"'

    pisa_status = pisa.CreatePDF(
        html, dest=response
    )
    if pisa_status.err:
        return HttpResponse('Ocorreu um erro ao gerar o PDF <pre>' + html + '</pre>')
    return response


# --- VIEW PARA GERAR PDF DA ORDEM DE SERVIÇO ---
class OrdemDeServicoPDFView(generics.GenericAPIView):
    queryset = OrdemDeServico.objects.select_related(
        'cliente', 'veiculo', 'mecanico_responsavel'
    ).prefetch_related(
        'itens_pecas',
        'itens_servicos'
    ).all()
    permission_classes = [IsAdminOrMecanico]
    lookup_field = 'pk'

    def get(self, request, *args, **kwargs):
        os_instance = get_object_or_404(self.get_queryset(), pk=self.kwargs.get(self.lookup_field))
        context = {'os': os_instance}
        pdf = render_pdf_view('gestao_oficina/pdf/os_pdf_template.html', context)
        return pdf