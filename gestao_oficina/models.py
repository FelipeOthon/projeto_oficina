# gestao_oficina/models.py

from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
from decimal import Decimal


# 1. Model para Usuarios
class Usuario(AbstractUser):
    TIPO_USUARIO_CHOICES = [
        ('admin', 'Administrador'),
        ('mecanico', 'Mecânico'),
    ]
    tipo_usuario = models.CharField(
        max_length=10,
        choices=TIPO_USUARIO_CHOICES,
        default='mecanico',
        help_text='Define o papel do usuário no sistema'
    )

    def get_full_name_or_username(self):
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        return self.username

    get_full_name_or_username.short_description = 'Nome Completo / Usuário'

    def __str__(self):
        return self.get_full_name_or_username()


# 2. Model para Clientes
class Cliente(models.Model):
    nome_completo = models.CharField(max_length=255)
    telefone_principal = models.CharField(max_length=20)
    telefone_secundario = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(unique=True, blank=True, null=True)
    cpf_cnpj = models.CharField(max_length=20, unique=True, blank=True, null=True)
    endereco_rua = models.CharField(max_length=255, blank=True, null=True)
    endereco_numero = models.CharField(max_length=20, blank=True, null=True)
    endereco_complemento = models.CharField(max_length=100, blank=True, null=True)
    endereco_bairro = models.CharField(max_length=100, blank=True, null=True)
    endereco_cidade = models.CharField(max_length=100, blank=True, null=True)
    endereco_estado = models.CharField(max_length=2, blank=True, null=True)
    endereco_cep = models.CharField(max_length=10, blank=True, null=True)
    data_cadastro = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nome_completo


# 3. Model para Veiculos
class Veiculo(models.Model):
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE, related_name='veiculos')
    placa = models.CharField(max_length=10, unique=True)
    marca = models.CharField(max_length=100)
    modelo = models.CharField(max_length=100)
    ano_fabricacao = models.IntegerField(blank=True, null=True)
    ano_modelo = models.IntegerField(blank=True, null=True)
    cor = models.CharField(max_length=50, blank=True, null=True)
    chassi = models.CharField(max_length=50, unique=True, blank=True, null=True)
    observacoes = models.TextField(blank=True, null=True)
    data_cadastro = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.marca} {self.modelo} ({self.placa}) - Cliente: {self.cliente.nome_completo}"


# 4. Model para OrdensDeServico
class OrdemDeServico(models.Model):
    STATUS_OS_CHOICES = [
        ('Aberta', 'Aberta'),
        ('Em Andamento', 'Em Andamento'),
        ('Aguardando Pecas', 'Aguardando Peças'),
        ('Aguardando Aprovacao', 'Aguardando Aprovação'),
        ('Concluida', 'Concluída'),
        ('Cancelada', 'Cancelada'),
        ('Faturada', 'Faturada'),
    ]

    numero_os = models.CharField(
        max_length=50,
        unique=True,
        help_text="Número único da Ordem de Serviço (gerado automaticamente)",
        blank=True,  # Permitir blank para que o save() possa preenchê-lo
        editable=False  # Não editável no admin/formulários diretos do Django
    )
    cliente = models.ForeignKey(Cliente, on_delete=models.PROTECT, related_name='ordens_servico')
    veiculo = models.ForeignKey(Veiculo, on_delete=models.PROTECT, related_name='ordens_servico')
    mecanico_responsavel = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='os_responsaveis',
        limit_choices_to={'tipo_usuario': 'mecanico'}
    )
    data_entrada = models.DateTimeField(auto_now_add=True)
    data_saida_prevista = models.DateField(blank=True, null=True)
    data_conclusao = models.DateTimeField(blank=True, null=True)

    descricao_problema_cliente = models.TextField()
    diagnostico_mecanico = models.TextField(blank=True, null=True)
    servicos_executados_obs = models.TextField(blank=True, null=True,
                                               help_text="Observações gerais sobre os serviços executados")

    valor_total_pecas = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    valor_total_servicos = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    valor_desconto = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    valor_total_os = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))

    status_os = models.CharField(
        max_length=30,
        choices=STATUS_OS_CHOICES,
        default='Aberta'
    )
    observacoes_internas = models.TextField(blank=True, null=True)

    def _gerar_proximo_numero_os(self):
        ultima_os_com_numero = OrdemDeServico.objects.filter(numero_os__regex=r'^[0-9]+$').order_by('numero_os').last()

        if ultima_os_com_numero and ultima_os_com_numero.numero_os.isdigit():
            try:
                proximo_numero = int(ultima_os_com_numero.numero_os) + 1
                return str(proximo_numero)
            except ValueError:
                pass

        ultima_os_qualquer = OrdemDeServico.objects.all().order_by('id').last()
        if ultima_os_qualquer:
            return str((ultima_os_qualquer.id or 0) + 1001)
        return "1001"

    def save(self, *args, **kwargs):
        if not self.pk and not self.numero_os:
            self.numero_os = self._gerar_proximo_numero_os()
            while OrdemDeServico.objects.filter(numero_os=self.numero_os).exists():
                try:
                    self.numero_os = str(int(self.numero_os) + 1)
                except ValueError:
                    # Se o numero_os não for um inteiro simples (ex: "ANO-XXXX"), esta lógica de fallback precisaria ser mais robusta.
                    self.numero_os = self._gerar_proximo_numero_os()  # Tenta gerar um novo completamente
                    import random  # Import local para evitar poluir o escopo global do módulo
                    self.numero_os = f"{self.numero_os}-{random.randint(1, 9)}"  # Adiciona um sufixo
        super().save(*args, **kwargs)

    def get_valor_total_calculado(self):
        return (self.valor_total_pecas or Decimal('0.00')) + \
            (self.valor_total_servicos or Decimal('0.00')) - \
            (self.valor_desconto or Decimal('0.00'))

    def __str__(self):
        return f"OS Nº: {self.numero_os} - Cliente: {self.cliente.nome_completo} - Veículo: {self.veiculo.placa}"

    class Meta:
        verbose_name = "Ordem de Serviço"
        verbose_name_plural = "Ordens de Serviço"
        ordering = ['-data_entrada']


# 5. Model para ItensOsPecas
class ItemOsPeca(models.Model):
    ordem_servico = models.ForeignKey(OrdemDeServico, on_delete=models.CASCADE, related_name='itens_pecas')
    descricao_peca = models.CharField(max_length=255)
    quantidade = models.DecimalField(max_digits=10, decimal_places=2)
    valor_unitario = models.DecimalField(max_digits=10, decimal_places=2)

    @property
    def valor_total_item(self):
        return (self.quantidade or Decimal('0.00')) * (self.valor_unitario or Decimal('0.00'))

    def __str__(self):
        return f"{self.quantidade}x {self.descricao_peca} (OS: {self.ordem_servico.numero_os if self.ordem_servico_id else 'N/A'})"

    class Meta:
        verbose_name = "Item de Peça da OS"
        verbose_name_plural = "Itens de Peças da OS"


# 6. Model para ItensOsServicos
class ItemOsServico(models.Model):
    ordem_servico = models.ForeignKey(OrdemDeServico, on_delete=models.CASCADE, related_name='itens_servicos')
    descricao_servico = models.CharField(max_length=255)
    valor_servico = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.descricao_servico} - R$ {self.valor_servico} (OS: {self.ordem_servico.numero_os if self.ordem_servico_id else 'N/A'})"

    class Meta:
        verbose_name = "Item de Serviço da OS"
        verbose_name_plural = "Itens de Serviços da OS"


# 7. Model para Agendamentos
class Agendamento(models.Model):
    STATUS_AGENDAMENTO_CHOICES = [
        ('Agendado', 'Agendado'),
        ('Confirmado', 'Confirmado'),
        ('Cancelado', 'Cancelado'),
        ('Realizado', 'Realizado'),
        ('Nao Compareceu', 'Não Compareceu'),
    ]

    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE, related_name='agendamentos')
    veiculo = models.ForeignKey(Veiculo, on_delete=models.CASCADE, related_name='agendamentos')
    mecanico_atribuido = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='agendamentos_responsaveis',
        limit_choices_to={'tipo_usuario': 'mecanico'}
    )
    data_agendamento = models.DateField()
    hora_agendamento = models.TimeField()
    servico_solicitado = models.TextField()
    status_agendamento = models.CharField(
        max_length=20,
        choices=STATUS_AGENDAMENTO_CHOICES,
        default='Agendado'
    )
    observacoes = models.TextField(blank=True, null=True)
    data_criacao_agendamento = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Agendamento para {self.cliente.nome_completo} - {self.veiculo.placa} em {self.data_agendamento.strftime('%d/%m/%Y')} às {self.hora_agendamento.strftime('%H:%M')}"

    class Meta:
        verbose_name = "Agendamento"
        verbose_name_plural = "Agendamentos"
        ordering = ['data_agendamento', 'hora_agendamento']
        unique_together = [['data_agendamento', 'hora_agendamento', 'mecanico_atribuido']]