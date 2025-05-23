# gestao_oficina/serializers.py
from rest_framework import serializers
from .models import (
    Cliente,
    Veiculo,
    Usuario,  # Mantido se você planeja um serializer para Usuario depois
    Agendamento,
    OrdemDeServico,  # Adicionado
    ItemOsPeca,  # Adicionado
    ItemOsServico  # Adicionado
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


# --- NOVOS SERIALIZERS PARA ORDEM DE SERVIÇO E SEUS ITENS ---

class ItemOsPecaSerializer(serializers.ModelSerializer):
    valor_total_item = serializers.ReadOnlyField()  # Já que é uma @property no model

    class Meta:
        model = ItemOsPeca
        # Excluindo 'ordem_servico' daqui pois será usado em um contexto aninhado
        # ou gerenciado pelo endpoint específico do item.
        # Se fosse um endpoint dedicado para ItemOsPeca, 'ordem_servico' seria incluído.
        fields = ['id', 'descricao_peca', 'quantidade', 'valor_unitario', 'valor_total_item']


class ItemOsServicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItemOsServico
        # Excluindo 'ordem_servico' por motivos similares ao ItemOsPecaSerializer
        fields = ['id', 'descricao_servico', 'valor_servico']


class OrdemDeServicoSerializer(serializers.ModelSerializer):
    # Representações de leitura para ForeignKeys
    cliente_nome = serializers.CharField(source='cliente.nome_completo', read_only=True)
    veiculo_info = serializers.CharField(source='veiculo.__str__', read_only=True)  # Usando o __str__ do Veiculo
    mecanico_nome = serializers.CharField(source='mecanico_responsavel.username', read_only=True, allow_null=True)

    # Aninhando os serializers de itens para leitura (GET)
    # O related_name nos models (itens_pecas, itens_servicos) é usado aqui como source.
    itens_pecas = ItemOsPecaSerializer(many=True, read_only=True)
    itens_servicos = ItemOsServicoSerializer(many=True, read_only=True)

    valor_total_os_calculado = serializers.ReadOnlyField()  # Para a @property do model

    class Meta:
        model = OrdemDeServico
        fields = [
            'id', 'numero_os',
            'cliente', 'cliente_nome',  # cliente é o ID para escrita, cliente_nome para leitura
            'veiculo', 'veiculo_info',  # veiculo é o ID para escrita, veiculo_info para leitura
            'mecanico_responsavel', 'mecanico_nome',  # mecanico_responsavel ID para escrita, mecanico_nome para leitura
            'data_entrada', 'data_saida_prevista', 'data_conclusao',
            'descricao_problema_cliente', 'diagnostico_mecanico', 'servicos_executados_obs',
            'valor_total_pecas', 'valor_total_servicos', 'valor_desconto',
            'status_os', 'observacoes_internas',
            # Removi 'data_criacao_os' do serializer, assumindo que 'data_entrada' (auto_now_add) cobre isso.
            # Se 'data_criacao_os' for um campo separado e importante no model, adicione-o aqui.
            'itens_pecas',
            'itens_servicos',
            'valor_total_os_calculado'
        ]
        read_only_fields = (
            'data_entrada', 'cliente_nome', 'veiculo_info', 'mecanico_nome',
            'itens_pecas', 'itens_servicos', 'valor_total_os_calculado',
            'valor_total_pecas', 'valor_total_servicos'  # Estes serão calculados e atualizados no backend
        )
        # Ao criar uma OS, você fornecerá os IDs para: 'cliente', 'veiculo', 'mecanico_responsavel'
        # e os campos de texto/data. Os itens e os totais serão tratados separadamente ou via lógica customizada.