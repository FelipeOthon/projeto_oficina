# gestao_oficina/serializers.py
from rest_framework import serializers
from .models import Cliente, Veiculo, Usuario # Adicione outros models aqui conforme necessário

class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = '__all__'
        read_only_fields = ('data_cadastro',)

# --- SERIALIZER PARA VEICULO (AGORA DEFINIDO) ---
class VeiculoSerializer(serializers.ModelSerializer):
    # Para exibir o nome do cliente em vez de apenas o ID na resposta (somente leitura)
    cliente_nome = serializers.CharField(source='cliente.nome_completo', read_only=True)
    # O campo 'cliente' abaixo (que é o ForeignKey no model) será usado para
    # receber o ID do cliente ao criar ou atualizar um veículo.
    # O DRF o representará como um ID na entrada e pode mostrar mais detalhes na saída,
    # especialmente se usarmos 'depth' ou serializers aninhados, mas 'cliente_nome' já ajuda.

    class Meta:
        model = Veiculo
        fields = [
            'id',
            'cliente', # Este campo aceitará o ID do cliente para associação
            'placa',
            'marca',
            'modelo',
            'ano_fabricacao',
            'ano_modelo',
            'cor',
            'chassi',
            'observacoes',
            'data_cadastro',
            'cliente_nome' # Campo extra para visualização
        ]
        read_only_fields = ('data_cadastro', 'cliente_nome')