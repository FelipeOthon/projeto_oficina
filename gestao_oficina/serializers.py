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
    mecanico_nome = serializers.CharField(source='mecanico_atribuido.username', read_only=True, allow_null=True)

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
    valor_total_item = serializers.ReadOnlyField() # Usa a @property do model

    class Meta:
        model = ItemOsPeca
        fields = ['id', 'descricao_peca', 'quantidade', 'valor_unitario', 'valor_total_item']

class ItemOsServicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItemOsServico
        fields = ['id', 'descricao_servico', 'valor_servico']

class OrdemDeServicoSerializer(serializers.ModelSerializer):
    cliente_nome = serializers.CharField(source='cliente.nome_completo', read_only=True)
    veiculo_info = serializers.CharField(source='veiculo.__str__', read_only=True)
    mecanico_nome = serializers.CharField(source='mecanico_responsavel.username', read_only=True, allow_null=True)
    itens_pecas = ItemOsPecaSerializer(many=True, read_only=True)
    itens_servicos = ItemOsServicoSerializer(many=True, read_only=True)
    # O campo 'valor_total_os' agora é um campo do model, então ele será incluído por 'fields'
    # e marcado como read_only abaixo.

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
            'valor_total_os', # Campo do model para o total geral
            'status_os', 'observacoes_internas',
            'itens_pecas', 'itens_servicos',
        ]
        read_only_fields = (
            'data_entrada', 'cliente_nome', 'veiculo_info', 'mecanico_nome',
            'itens_pecas', 'itens_servicos',
            'valor_total_pecas', 'valor_total_servicos', 'valor_total_os' # Todos os totais são calculados no backend
        )