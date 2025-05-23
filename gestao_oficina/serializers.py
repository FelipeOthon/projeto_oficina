# gestao_oficina/serializers.py
from rest_framework import serializers
from .models import Cliente, Veiculo, Usuario # Adicione outros models conforme for criando serializers para eles

class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        # Inclui todos os campos do model Cliente.
        # Para campos de data como 'data_cadastro', o DRF os formata por padrão em ISO 8601.
        # Podemos adicionar formatação customizada depois, se necessário.
        fields = '__all__'
        # Se quiser campos específicos:
        # fields = ['id', 'nome_completo', 'telefone_principal', 'email', 'cpf_cnpj',
        #             'endereco_rua', 'endereco_numero', 'endereco_complemento',
        #             'endereco_bairro', 'endereco_cidade', 'endereco_estado',
        #             'endereco_cep', 'data_cadastro']
        read_only_fields = ('data_cadastro',) # data_cadastro é auto_now_add

# Serializer para Veiculo (vamos criar depois, quando refatorarmos Veiculo)
# class VeiculoSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Veiculo
#         fields = '__all__'
#         read_only_fields = ('data_cadastro',)