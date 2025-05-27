# gestao_oficina/serializers.py
from rest_framework import serializers
from .models import (
    Cliente,
    Veiculo,
    Usuario,
    Agendamento,
    OrdemDeServico,
    ItemOsPeca,
    ItemOsServico
)

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
    mecanico_nome = serializers.CharField(source='mecanico_atribuido.get_full_name_or_username', read_only=True, allow_null=True)


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
    mecanico_nome = serializers.CharField(source='mecanico_responsavel.get_full_name_or_username', read_only=True, allow_null=True)
    itens_pecas = ItemOsPecaSerializer(many=True, read_only=True)
    itens_servicos = ItemOsServicoSerializer(many=True, read_only=True)

    # numero_os será read_only devido ao editable=False no modelo,
    # mas podemos ser explícitos se quisermos.
    # O DRF infere read_only=True para campos com editable=False no modelo.

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
            'numero_os', # Garantindo que seja read-only aqui também
            'data_entrada', 'cliente_nome', 'veiculo_info', 'mecanico_nome',
            'itens_pecas', 'itens_servicos',
            'valor_total_pecas', 'valor_total_servicos', 'valor_total_os'
        )