# gestao_oficina/serializers.py
from rest_framework import serializers
from .models import Cliente, Veiculo, Usuario, Agendamento # Adicionado Agendamento aqui

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

# --- NOVO SERIALIZER PARA AGENDAMENTO ---
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