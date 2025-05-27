# gestao_oficina/serializers.py
from rest_framework import serializers
from .models import (
    Cliente,
    Veiculo,
    Usuario,  # Certifique-se que Usuario está importado
    Agendamento,
    OrdemDeServico,
    ItemOsPeca,
    ItemOsServico
)
from django.contrib.auth.hashers import make_password  # Para hashear a senha


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
        read_only_fields = (
            'numero_os',
            'data_entrada', 'cliente_nome', 'veiculo_info', 'mecanico_nome',
            'itens_pecas', 'itens_servicos',
            'valor_total_pecas', 'valor_total_servicos', 'valor_total_os'
        )


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
            'tipo_usuario': {'required': False}  # Permitir que admin defina, mas com default no create
        }

    def create(self, validated_data):
        validated_data.setdefault('tipo_usuario', 'mecanico')

        if 'password' not in validated_data or not validated_data.get('password'):
            raise serializers.ValidationError({'password': 'Este campo é obrigatório na criação.'})

        validated_data['password'] = make_password(validated_data.get('password'))
        # Se o admin não especificar is_staff ou is_superuser, eles serão False por padrão no model do Django.
        # No nosso caso, um mecânico não deve ser staff nem superuser por padrão.
        validated_data.setdefault('is_staff', False)
        validated_data.setdefault('is_superuser', False)
        user = Usuario.objects.create(**validated_data)
        return user

    def update(self, instance, validated_data):
        if 'password' in validated_data and validated_data['password']:
            validated_data['password'] = make_password(validated_data.get('password'))
        else:
            validated_data.pop('password', None)

        # Admin não deve poder alterar o próprio tipo de usuário ou de outros para admin facilmente aqui.
        # Se 'tipo_usuario' não for enviado na requisição de update, mantém o existente.
        # Se for enviado, atualiza. (Cuidado para admin não se rebaixar sem querer)
        # instance.tipo_usuario = validated_data.get('tipo_usuario', instance.tipo_usuario)

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