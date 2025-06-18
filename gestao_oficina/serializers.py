# gestao_oficina/serializers.py
from rest_framework import serializers
from django.utils import timezone
from .models import (
    Cliente,
    Veiculo,
    Usuario,
    Agendamento,
    OrdemDeServico,
    ItemOsPeca,
    ItemOsServico
)
from django.contrib.auth.hashers import make_password


class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = '__all__'
        read_only_fields = ('data_cadastro',)


class VeiculoSerializer(serializers.ModelSerializer):
    cliente_nome = serializers.CharField(source='cliente.nome_completo', read_only=True)

    class Meta:
        model = Veiculo
        fields = [
            'id', 'cliente', 'placa', 'marca', 'modelo',
            'ano_fabricacao', 'ano_modelo', 'cor', 'chassi',
            'observacoes', 'data_cadastro', 'cliente_nome'
        ]
        read_only_fields = ('data_cadastro', 'cliente_nome')


class AgendamentoSerializer(serializers.ModelSerializer):
    cliente_nome = serializers.CharField(source='cliente.nome_completo', read_only=True)
    veiculo_info = serializers.SerializerMethodField(read_only=True)
    mecanico_nome = serializers.CharField(source='mecanico_atribuido.get_full_name_or_username', read_only=True,
                                          allow_null=True)

    class Meta:
        model = Agendamento
        fields = [
            'id', 'cliente', 'veiculo', 'mecanico_atribuido',
            'data_agendamento', 'hora_agendamento', 'servico_solicitado',
            'status_agendamento', 'observacoes', 'data_criacao_agendamento',
            'cliente_nome', 'veiculo_info', 'mecanico_nome'
        ]
        read_only_fields = ('data_criacao_agendamento', 'cliente_nome', 'veiculo_info', 'mecanico_nome')

    def get_veiculo_info(self, obj):
        if obj.veiculo:
            return f"{obj.veiculo.marca} {obj.veiculo.modelo} ({obj.veiculo.placa})"
        return None


class ItemOsPecaSerializer(serializers.ModelSerializer):
    valor_total_item = serializers.ReadOnlyField()

    class Meta:
        model = ItemOsPeca
        fields = ['id', 'descricao_peca', 'quantidade', 'valor_unitario', 'valor_total_item']


class ItemOsServicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItemOsServico
        fields = ['id', 'descricao_servico', 'valor_servico']


class MecanicoSerializer(serializers.ModelSerializer):
    nome_display = serializers.SerializerMethodField()

    class Meta:
        model = Usuario
        fields = ['id', 'username', 'first_name', 'last_name', 'nome_display']

    def get_nome_display(self, obj):
        if obj.first_name and obj.last_name:
            return f"{obj.first_name} {obj.last_name}"
        return obj.username


# >>>>> CLASSE COM A CORREÇÃO <<<<<
class OrdemDeServicoSerializer(serializers.ModelSerializer):
    cliente_nome = serializers.CharField(source='cliente.nome_completo', read_only=True)
    veiculo_info = serializers.CharField(source='veiculo.__str__', read_only=True)
    mecanico_nome = serializers.CharField(source='mecanico_responsavel.get_full_name_or_username', read_only=True,
                                          allow_null=True)
    itens_pecas = ItemOsPecaSerializer(many=True, read_only=True)
    itens_servicos = ItemOsServicoSerializer(many=True, read_only=True)

    class Meta:
        model = OrdemDeServico
        fields = [
            'id', 'numero_os',
            'cliente', 'cliente_nome',
            'veiculo', 'veiculo_info',
            'mecanico_responsavel', 'mecanico_nome',
            'data_entrada', 'data_saida_prevista', 'data_conclusao',
            'descricao_problema_cliente', 'diagnostico_mecanico', 'servicos_executados_obs',
            'valor_total_pecas', 'valor_total_servicos', 'valor_desconto',
            'valor_total_os',
            'status_os', 'observacoes_internas',
            'itens_pecas', 'itens_servicos',
        ]
        # Torna 'data_conclusao' "read-only" para o usuário, pois será controlada pelo sistema
        read_only_fields = (
            'numero_os',
            'data_entrada', 'cliente_nome', 'veiculo_info', 'mecanico_nome',
            'itens_pecas', 'itens_servicos',
            'valor_total_pecas', 'valor_total_servicos', 'valor_total_os',
            'data_conclusao'
        )

    # --- LÓGICA ADICIONADA PARA CORRIGIR O PROBLEMA DO RELATÓRIO ---
    def update(self, instance, validated_data):
        """
        Sobrescreve o método update para preencher ou limpar a data_conclusao automaticamente
        baseado na mudança de status da OS.
        """
        # Pega o status que está vindo na requisição. Se não vier, usa o que já está na OS
        novo_status = validated_data.get('status_os', instance.status_os)

        # Se o status está mudando para 'Concluida' ou 'Faturada' E a data de conclusão ainda não foi definida
        if novo_status in ['Concluida', 'Faturada'] and not instance.data_conclusao:
            instance.data_conclusao = timezone.now()

        # Se o status estiver voltando de 'Concluida' ou 'Faturada' para um status anterior (ex: reabertura da OS)
        elif instance.status_os in ['Concluida', 'Faturada'] and novo_status not in ['Concluida', 'Faturada']:
            instance.data_conclusao = None  # Limpa a data se a OS for reaberta

        # Chama o método de update original da classe pai para salvar todas as alterações no banco de dados
        return super().update(instance, validated_data)


# --- ADIÇÕES PARA GERENCIAMENTO DE USUÁRIOS ---
class AdminUserManagementSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, style={'input_type': 'password'})

    class Meta:
        model = Usuario
        fields = [
            'id', 'username', 'password', 'first_name', 'last_name', 'email',
            'tipo_usuario', 'is_active', 'is_staff', 'is_superuser', 'date_joined', 'last_login'
        ]
        read_only_fields = ('date_joined', 'last_login', 'id')
        extra_kwargs = {
            'first_name': {'required': False, 'allow_blank': True},
            'last_name': {'required': False, 'allow_blank': True},
            'email': {'required': False, 'allow_blank': True, 'allow_null': True},
            'tipo_usuario': {'required': False}
        }

    def create(self, validated_data):
        validated_data.setdefault('tipo_usuario', 'mecanico')
        if 'password' not in validated_data or not validated_data.get('password'):
            raise serializers.ValidationError({'password': 'Este campo é obrigatório na criação.'})
        validated_data['password'] = make_password(validated_data.get('password'))
        validated_data.setdefault('is_staff', False)
        validated_data.setdefault('is_superuser', False)
        user = Usuario.objects.create(**validated_data)
        return user

    def update(self, instance, validated_data):
        if 'password' in validated_data and validated_data['password']:
            validated_data['password'] = make_password(validated_data.get('password'))
        else:
            validated_data.pop('password', None)
        return super().update(instance, validated_data)


class MecanicoChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True, write_only=True, style={'input_type': 'password'})
    new_password = serializers.CharField(required=True, write_only=True, style={'input_type': 'password'})

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError(
                "Sua senha antiga foi inserida incorretamente. Por favor, tente novamente.")
        return value

    def save(self, **kwargs):
        password = self.validated_data['new_password']
        user = self.context['request'].user
        user.set_password(password)
        user.save()
        return user