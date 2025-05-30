# gestao_oficina/views.py

from .models import (
    Cliente, Veiculo, Agendamento,
    OrdemDeServico, ItemOsPeca, ItemOsServico,
    Usuario
)
from .serializers import (
    ClienteSerializer, VeiculoSerializer, AgendamentoSerializer,
    OrdemDeServicoSerializer, ItemOsPecaSerializer, ItemOsServicoSerializer,
    MecanicoSerializer,
    AdminUserManagementSerializer,
    MecanicoChangePasswordSerializer
)
from rest_framework import generics, views, status
from rest_framework.response import Response
from django.db import IntegrityError, models as django_models
from rest_framework.permissions import IsAuthenticated, AllowAny
from .permissions import IsAdminUser, IsAdminOrMecanico, AdminFullAccessMecanicoReadOnly, IsMecanicoUser

from django.http import HttpResponse
from django.template.loader import get_template
from xhtml2pdf import pisa
from django.shortcuts import get_object_or_404
from rest_framework.filters import SearchFilter
from django.contrib.auth import update_session_auth_hash
from datetime import datetime, time as datetime_time  # Adicionado time
from django.utils import timezone

# --- FUNÇÃO UTILITÁRIA PARA RENDERIZAR PDF (AJUSTADA PARA FILENAME) ---
def render_pdf_view(template_path, context_dict={}, filename="documento.pdf"):
    template = get_template(template_path)
    html = template.render(context_dict)
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = f'inline; filename="{filename}"'  # Usa o filename fornecido

    pisa_status = pisa.CreatePDF(html, dest=response)
    if pisa_status.err:
        return HttpResponse('Ocorreu um erro ao gerar o PDF <pre>' + html + '</pre>')
    return response


# --- VIEWS DE CLIENTE ---
class ClienteListCreateAPIView(generics.ListCreateAPIView):
    queryset = Cliente.objects.all().order_by('nome_completo')
    serializer_class = ClienteSerializer
    filter_backends = [SearchFilter]
    search_fields = ['nome_completo', 'email', 'cpf_cnpj', 'telefone_principal']

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
    filter_backends = [SearchFilter]
    search_fields = ['placa', 'marca', 'modelo', 'cliente__nome_completo', 'chassi']

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
    filter_backends = [SearchFilter]
    search_fields = [
        'cliente__nome_completo', 'veiculo__placa', 'veiculo__marca', 'veiculo__modelo',
        'servico_solicitado', 'status_agendamento', 'mecanico_atribuido__username',
        'mecanico_atribuido__first_name', 'mecanico_atribuido__last_name'
    ]


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
    filter_backends = [SearchFilter]
    search_fields = [
        'numero_os', 'cliente__nome_completo', 'veiculo__placa', 'veiculo__marca', 'veiculo__modelo',
        'status_os', 'descricao_problema_cliente', 'diagnostico_mecanico',
        'mecanico_responsavel__username', 'mecanico_responsavel__first_name', 'mecanico_responsavel__last_name'
    ]


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


# --- VIEWS PARA ITENS DE PEÇAS E SERVIÇOS (mantidas como estavam) ---
class ItemOsPecaListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = ItemOsPecaSerializer
    permission_classes = [IsAdminOrMecanico]

    def get_queryset(self):
        return ItemOsPeca.objects.filter(ordem_servico_id=self.kwargs['os_pk'])

    def perform_create(self, serializer):
        ordem_servico = get_object_or_404(OrdemDeServico, pk=self.kwargs['os_pk'])
        serializer.save(ordem_servico=ordem_servico)


class ItemOsPecaRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ItemOsPecaSerializer
    lookup_url_kwarg = 'item_pk'
    permission_classes = [IsAdminOrMecanico]

    def get_queryset(self):
        return ItemOsPeca.objects.filter(ordem_servico_id=self.kwargs['os_pk'])


class ItemOsServicoListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = ItemOsServicoSerializer
    permission_classes = [IsAdminOrMecanico]

    def get_queryset(self):
        return ItemOsServico.objects.filter(ordem_servico_id=self.kwargs['os_pk'])

    def perform_create(self, serializer):
        ordem_servico = get_object_or_404(OrdemDeServico, pk=self.kwargs['os_pk'])
        serializer.save(ordem_servico=ordem_servico)


class ItemOsServicoRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ItemOsServicoSerializer
    lookup_url_kwarg = 'item_pk'
    permission_classes = [IsAdminOrMecanico]

    def get_queryset(self):
        return ItemOsServico.objects.filter(ordem_servico_id=self.kwargs['os_pk'])


# --- VIEW PARA LISTAR MECÂNICOS ---
class MecanicoListAPIView(generics.ListAPIView):
    queryset = Usuario.objects.filter(tipo_usuario='mecanico', is_active=True).order_by('first_name', 'last_name',
                                                                                        'username')
    serializer_class = MecanicoSerializer
    permission_classes = [IsAdminOrMecanico]


# --- VIEW PARA GERAR PDF DA ORDEM DE SERVIÇO INDIVIDUAL ---
class OrdemDeServicoPDFView(generics.GenericAPIView):
    queryset = OrdemDeServico.objects.select_related(
        'cliente', 'veiculo', 'mecanico_responsavel'
    ).prefetch_related('itens_pecas', 'itens_servicos').all()
    permission_classes = [IsAdminOrMecanico]
    serializer_class = OrdemDeServicoSerializer
    lookup_field = 'pk'

    def get(self, request, *args, **kwargs):
        os_instance = self.get_object()  # get_object_or_404 é chamado por get_object
        context = {'os': os_instance}

        numero_da_os = str(os_instance.numero_os).replace('/', '_').replace('\\',
                                                                            '_') if os_instance.numero_os else f"id_{os_instance.id}"
        filename = f"OS_{numero_da_os}.pdf"

        pdf = render_pdf_view('gestao_oficina/pdf/os_pdf_template.html', context, filename=filename)
        return pdf


# --- VIEWS DE GERENCIAMENTO DE USUÁRIOS (ADMIN) ---
class AdminUserListCreateAPIView(generics.ListCreateAPIView):
    queryset = Usuario.objects.all().order_by('username')
    serializer_class = AdminUserManagementSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [SearchFilter]
    search_fields = ['username', 'first_name', 'last_name', 'email']


class AdminUserRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Usuario.objects.all()
    serializer_class = AdminUserManagementSerializer
    permission_classes = [IsAdminUser]
    lookup_field = 'pk'

    def perform_destroy(self, instance):
        if instance.is_superuser and self.request.user == instance:
            active_superusers = Usuario.objects.filter(is_superuser=True, is_active=True).count()
            if active_superusers <= 1:
                print(
                    f"Tentativa de desativar o único superusuário ativo (ID: {instance.id}) por ele mesmo. Ação impedida.")
                # Para realmente impedir, poderíamos levantar uma exceção:
                # from rest_framework.exceptions import PermissionDenied
                # raise PermissionDenied("Não é possível desativar o único superusuário ativo.")
                return
        instance.is_active = False
        instance.save()


# --- VIEW PARA MECÂNICO ALTERAR A PRÓPRIA SENHA ---
class MecanicoChangePasswordView(generics.UpdateAPIView):
    serializer_class = MecanicoChangePasswordSerializer
    model = Usuario
    permission_classes = [IsAuthenticated, IsMecanicoUser]

    def get_object(self, queryset=None):
        return self.request.user

    def update(self, request, *args, **kwargs):
        self.object = self.get_object()
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            update_session_auth_hash(request, self.object)
            return Response({"detail": "Senha alterada com sucesso."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# --- NOVAS VIEWS PARA RELATÓRIOS ---
# --- VIEWS PARA RELATÓRIOS (COM CORREÇÃO FINAL NA LÓGICA DE DATA) ---
class RelatorioOSConcluidasPDFView(views.APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, *args, **kwargs):
        data_inicio_str = request.query_params.get('data_inicio', None)
        data_fim_str = request.query_params.get('data_fim', None)

        if not data_inicio_str or not data_fim_str:
            return Response(
                {"detail": "Parâmetros 'data_inicio' e 'data_fim' (YYYY-MM-DD) são obrigatórios."},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            data_inicio_date = datetime.strptime(data_inicio_str, "%Y-%m-%d").date()
            data_fim_date = datetime.strptime(data_fim_str, "%Y-%m-%d").date()

            # --- CORREÇÃO APLICADA AQUI ---
            # Usa datetime_time.min e datetime_time.max que foram importados corretamente
            start_datetime = timezone.make_aware(datetime.combine(data_inicio_date, datetime_time.min))
            end_datetime = timezone.make_aware(datetime.combine(data_fim_date, datetime_time.max))

        except ValueError:
            return Response(
                {"detail": "Formato de data inválido para 'data_inicio' ou 'data_fim'. Use YYYY-MM-DD."},
                status=status.HTTP_400_BAD_REQUEST
            )

        status_relatorio = ['Concluida', 'Faturada']

        ordens_concluidas = OrdemDeServico.objects.filter(
            status_os__in=status_relatorio,
            data_conclusao__gte=start_datetime,
            data_conclusao__lte=end_datetime
        ).select_related('cliente', 'veiculo').order_by('data_conclusao', 'numero_os')

        context = {
            'ordens_de_servico': ordens_concluidas,
            'data_inicio': data_inicio_date,
            'data_fim': data_fim_date,
            'total_os_processadas': ordens_concluidas.count(),
            'titulo_relatorio': "Relatório de Ordens de Serviço Concluídas/Faturadas"
        }

        filename = f"Relatorio_OS_Concluidas_{data_inicio_str}_a_{data_fim_str}.pdf"
        pdf = render_pdf_view('gestao_oficina/pdf/relatorio_os_concluidas_pdf.html', context, filename=filename)
        return pdf


class RelatorioFaturamentoPDFView(views.APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, *args, **kwargs):
        data_inicio_str = request.query_params.get('data_inicio', None)
        data_fim_str = request.query_params.get('data_fim', None)

        if not data_inicio_str or not data_fim_str:
            return Response(
                {"detail": "Parâmetros 'data_inicio' e 'data_fim' (YYYY-MM-DD) são obrigatórios."},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            data_inicio_date = datetime.strptime(data_inicio_str, "%Y-%m-%d").date()
            data_fim_date = datetime.strptime(data_fim_str, "%Y-%m-%d").date()

            # --- CORREÇÃO APLICADA AQUI ---
            # Usa datetime_time.min e datetime_time.max que foram importados corretamente
            start_datetime = timezone.make_aware(datetime.combine(data_inicio_date, datetime_time.min))
            end_datetime = timezone.make_aware(datetime.combine(data_fim_date, datetime_time.max))

        except ValueError:
            return Response(
                {"detail": "Formato de data inválido para 'data_inicio' ou 'data_fim'. Use YYYY-MM-DD."},
                status=status.HTTP_400_BAD_REQUEST
            )

        status_faturamento = ['Concluida', 'Faturada']

        ordens_para_faturamento = OrdemDeServico.objects.filter(
            status_os__in=status_faturamento,
            data_conclusao__gte=start_datetime,
            data_conclusao__lte=end_datetime
        ).select_related('cliente', 'veiculo')

        total_faturado = ordens_para_faturamento.aggregate(total=django_models.Sum('valor_total_os'))['total'] or 0.00

        context = {
            'ordens_de_servico': ordens_para_faturamento.order_by('data_conclusao', 'numero_os'),
            'data_inicio': data_inicio_date,
            'data_fim': data_fim_date,
            'total_os_processadas': ordens_para_faturamento.count(),
            'total_faturamento': total_faturado,
            'titulo_relatorio': "Relatório de Faturamento"
        }

        filename = f"Relatorio_Faturamento_{data_inicio_str}_a_{data_fim_str}.pdf"
        pdf = render_pdf_view('gestao_oficina/pdf/relatorio_os_concluidas_pdf.html', context, filename=filename)
        return pdf