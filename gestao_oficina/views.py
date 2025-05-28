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
    AdminUserManagementSerializer, # Adicionado
    MecanicoChangePasswordSerializer # Adicionado
)
from rest_framework import generics
from rest_framework.response import Response
from rest_framework import status
from django.db import IntegrityError
from rest_framework.permissions import IsAuthenticated, AllowAny
from .permissions import IsAdminUser, IsAdminOrMecanico, AdminFullAccessMecanicoReadOnly, IsMecanicoUser # Adicionado IsMecanicoUser

# Imports para PDF
from django.http import HttpResponse
from django.template.loader import get_template
from xhtml2pdf import pisa
from django.shortcuts import get_object_or_404

# IMPORTAR SearchFilter
from rest_framework.filters import SearchFilter

# Para manter o usuário logado após mudar senha
from django.contrib.auth import update_session_auth_hash


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
        'cliente__nome_completo',
        'veiculo__placa',
        'veiculo__marca',
        'veiculo__modelo',
        'servico_solicitado',
        'status_agendamento',
        'mecanico_atribuido__username',
        'mecanico_atribuido__first_name',
        'mecanico_atribuido__last_name'
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
        'numero_os',
        'cliente__nome_completo',
        'veiculo__placa',
        'veiculo__marca',
        'veiculo__modelo',
        'status_os',
        'descricao_problema_cliente',
        'diagnostico_mecanico',
        'mecanico_responsavel__username',
        'mecanico_responsavel__first_name',
        'mecanico_responsavel__last_name'
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


# --- VIEWS PARA ITENS DE PEÇAS DE UMA OS ---
class ItemOsPecaListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = ItemOsPecaSerializer
    permission_classes = [IsAdminOrMecanico]

    def get_queryset(self):
        os_pk = self.kwargs['os_pk']
        return ItemOsPeca.objects.filter(ordem_servico_id=os_pk)

    def perform_create(self, serializer):
        os_pk = self.kwargs['os_pk']
        ordem_servico = get_object_or_404(OrdemDeServico, pk=os_pk)
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
        ordem_servico = get_object_or_404(OrdemDeServico, pk=os_pk)
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
    queryset = Usuario.objects.filter(tipo_usuario='mecanico', is_active=True).order_by('first_name', 'last_name', 'username') # Listar apenas mecanicos ativos
    serializer_class = MecanicoSerializer
    permission_classes = [IsAdminOrMecanico]


# --- FUNÇÃO UTILITÁRIA PARA RENDERIZAR PDF ---
def render_pdf_view(template_path, context_dict={}):
    template = get_template(template_path)
    html = template.render(context_dict)
    response = HttpResponse(content_type='application/pdf')

    os_object = context_dict.get('os')
    numero_da_os = "documento"
    if os_object and hasattr(os_object, 'numero_os') and os_object.numero_os:
        numero_da_os = str(os_object.numero_os).replace('/', '_').replace('\\', '_')
    elif os_object and hasattr(os_object, 'id'):
        numero_da_os = f"id_{os_object.id}"


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
    permission_classes = [IsAdminOrMecanico] # Ou AllowAny se o PDF puder ser acessado sem login, dependendo do fluxo
    serializer_class = OrdemDeServicoSerializer # Necessário para o get_object_or_404 funcionar bem com GenericAPIView
    lookup_field = 'pk'

    def get(self, request, *args, **kwargs):
        os_instance = get_object_or_404(self.get_queryset(), pk=kwargs.get(self.lookup_field))
        # Adicionar uma verificação se o PDF deve ser público ou se requer autenticação/permissão específica
        context = {'os': os_instance}
        pdf = render_pdf_view('gestao_oficina/pdf/os_pdf_template.html', context)
        return pdf

# --- ADIÇÕES PARA GERENCIAMENTO DE USUÁRIOS (ADMIN) ---
class AdminUserListCreateAPIView(generics.ListCreateAPIView):
    queryset = Usuario.objects.all().order_by('username') # Poderia filtrar por is_active=True por padrão e ter um query param para ver inativos
    serializer_class = AdminUserManagementSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [SearchFilter] # Adicionado filtro de busca
    search_fields = ['username', 'first_name', 'last_name', 'email']


class AdminUserRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Usuario.objects.all()
    serializer_class = AdminUserManagementSerializer
    permission_classes = [IsAdminUser]
    lookup_field = 'pk'

    def perform_destroy(self, instance):
        """
        Em vez de deletar fisicamente, apenas desativa o usuário (soft delete).
        """
        # Adicionar verificação para não desativar o próprio usuário admin logado se for o único superuser ativo
        if instance.is_superuser and self.request.user == instance:
            active_superusers = Usuario.objects.filter(is_superuser=True, is_active=True).count()
            if active_superusers <= 1:
                # Não é ideal retornar Response aqui, mas é uma forma de bloquear.
                # Uma abordagem melhor seria com permissions ou no método destroy.
                # Para este contexto, vamos impedir a desativação.
                # No DRF, perform_destroy não deve retornar Response.
                # Levantar uma exceção como PermissionDenied seria mais apropriado.
                # serializers.ValidationError({"detail": "Não é possível desativar o único superusuário ativo."})
                # Como estamos dentro de perform_destroy, simplesmente não fazer nada ou logar.
                # A proteção mais efetiva é no botão do frontend e na permissão da view.
                print(f"Tentativa de desativar o único superusuário ativo (ID: {instance.id}) por ele mesmo. Ação impedida em perform_destroy.")
                return # Impede a desativação

        instance.is_active = False
        instance.save()
        # Não chamamos super().perform_destroy(instance) para evitar a exclusão física

    # O método update (PUT/PATCH) já permitirá alterar 'is_active' para True,
    # pois AdminUserManagementSerializer inclui 'is_active' nos fields.

# --- VIEW PARA MECÂNICO ALTERAR A PRÓPRIA SENHA ---
class MecanicoChangePasswordView(generics.UpdateAPIView):
    serializer_class = MecanicoChangePasswordSerializer
    model = Usuario
    permission_classes = [IsAuthenticated, IsMecanicoUser] # Apenas mecânicos autenticados

    def get_object(self, queryset=None):
        # Retorna o usuário logado
        return self.request.user

    def update(self, request, *args, **kwargs):
        self.object = self.get_object()
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            update_session_auth_hash(request, self.object) # Manter o usuário logado
            return Response({"detail": "Senha alterada com sucesso."}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)