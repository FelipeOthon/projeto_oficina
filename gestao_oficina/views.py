# gestao_oficina/views.py

# Imports para as views antigas de Veiculo (ainda não refatoradas)
from django.http import JsonResponse, HttpResponseBadRequest, HttpResponseNotAllowed, HttpResponse
from django.views.decorators.csrf import csrf_exempt
import json

# Imports para DRF e os models
from .models import Cliente, Veiculo  # Certifique-se de que Veiculo está aqui
from .serializers import ClienteSerializer  # Importe o novo serializer
from rest_framework import generics


# from rest_framework import status # Útil para retornar códigos de status HTTP mais explicitamente
# from rest_framework.response import Response # Alternativa ao JsonResponse, mais poderosa no DRF

# --- VIEWS DE CLIENTE REATORADAS COM DJANGO REST FRAMEWORK ---
class ClienteListCreateAPIView(generics.ListCreateAPIView):
    queryset = Cliente.objects.all().order_by('nome_completo')  # Adicionado ordenação
    serializer_class = ClienteSerializer
    # Para adicionar permissões depois:
    # permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class ClienteRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer
    lookup_field = 'pk'  # 'pk' já é o padrão, mas é bom saber que pode ser definido
    # Para adicionar permissões depois:
    # permission_classes = [permissions.IsAuthenticatedOrReadOnly]


# --- VIEWS PARA VEICULO (AINDA NO FORMATO ANTIGO - NÃO REATORADO) ---
@csrf_exempt
def veiculo_list_create_api(request):
    if request.method == 'GET':
        veiculos = Veiculo.objects.all()
        data_veiculos = []
        for veiculo in veiculos:
            data_veiculos.append({
                'id': veiculo.id,
                'placa': veiculo.placa,
                'marca': veiculo.marca,
                'modelo': veiculo.modelo,
                'ano_fabricacao': veiculo.ano_fabricacao,
                'ano_modelo': veiculo.ano_modelo,
                'cor': veiculo.cor,
                'cliente_id': veiculo.cliente.id,
                'cliente_nome': veiculo.cliente.nome_completo
            })
        return JsonResponse({'veiculos': data_veiculos})

    elif request.method == 'POST':
        try:
            dados = json.loads(request.body)
            cliente_id = dados.get('cliente_id')
            placa = dados.get('placa')
            marca = dados.get('marca')
            modelo = dados.get('modelo')

            if not all([cliente_id, placa, marca, modelo]):
                return JsonResponse({'erro': 'cliente_id, placa, marca e modelo são obrigatórios.'}, status=400)

            try:
                cliente_obj = Cliente.objects.get(pk=cliente_id)
            except Cliente.DoesNotExist:
                return JsonResponse({'erro': f'Cliente com id {cliente_id} não encontrado.'}, status=404)

            novo_veiculo = Veiculo.objects.create(
                cliente=cliente_obj,
                placa=placa,
                marca=marca,
                modelo=modelo,
                ano_fabricacao=dados.get('ano_fabricacao'),
                ano_modelo=dados.get('ano_modelo'),
                cor=dados.get('cor'),
                chassi=dados.get('chassi'),
                observacoes=dados.get('observacoes')
            )
            return JsonResponse({
                'id': novo_veiculo.id,
                'placa': novo_veiculo.placa,
                'marca': novo_veiculo.marca,
                'modelo': novo_veiculo.modelo,
                'cliente_id': novo_veiculo.cliente.id
            }, status=201)
        except Exception as e:
            return JsonResponse({'erro': str(e)}, status=400)

    return HttpResponseNotAllowed(['GET', 'POST'])


@csrf_exempt
def veiculo_detail_update_delete_api(request, pk):
    try:
        veiculo = Veiculo.objects.get(pk=pk)
    except Veiculo.DoesNotExist:
        return JsonResponse({'erro': 'Veículo não encontrado'}, status=404)

    if request.method == 'GET':
        data = {
            'id': veiculo.id,
            'placa': veiculo.placa,
            'marca': veiculo.marca,
            'modelo': veiculo.modelo,
            'ano_fabricacao': veiculo.ano_fabricacao,
            'ano_modelo': veiculo.ano_modelo,
            'cor': veiculo.cor,
            'chassi': veiculo.chassi,
            'observacoes': veiculo.observacoes,
            'cliente_id': veiculo.cliente.id,
            'cliente_nome': veiculo.cliente.nome_completo,
            'data_cadastro': veiculo.data_cadastro.strftime('%d/%m/%Y %H:%M:%S') if veiculo.data_cadastro else None
        }
        return JsonResponse(data)

    elif request.method == 'PUT':
        try:
            dados = json.loads(request.body)

            if dados.get('placa') == "" or dados.get('marca') == "" or dados.get('modelo') == "":
                return JsonResponse({'erro': 'Placa, marca e modelo não podem ser vazios na atualização.'}, status=400)

            veiculo.placa = dados.get('placa', veiculo.placa)
            veiculo.marca = dados.get('marca', veiculo.marca)
            veiculo.modelo = dados.get('modelo', veiculo.modelo)
            veiculo.ano_fabricacao = dados.get('ano_fabricacao', veiculo.ano_fabricacao)
            veiculo.ano_modelo = dados.get('ano_modelo', veiculo.ano_modelo)
            veiculo.cor = dados.get('cor', veiculo.cor)
            veiculo.chassi = dados.get('chassi', veiculo.chassi)
            veiculo.observacoes = dados.get('observacoes', veiculo.observacoes)
            veiculo.save()

            data_atualizada = {
                'id': veiculo.id, 'placa': veiculo.placa, 'marca': veiculo.marca,
                'modelo': veiculo.modelo, 'ano_fabricacao': veiculo.ano_fabricacao,
                'ano_modelo': veiculo.ano_modelo, 'cor': veiculo.cor,
                'chassi': veiculo.chassi, 'observacoes': veiculo.observacoes,
                'cliente_id': veiculo.cliente.id,
                'cliente_nome': veiculo.cliente.nome_completo
            }
            return JsonResponse(data_atualizada)
        except Exception as e:
            return JsonResponse({'erro': str(e)}, status=400)

    elif request.method == 'DELETE':
        veiculo.delete()
        return HttpResponse(status=204)

    return HttpResponseNotAllowed(['GET', 'PUT', 'DELETE'])