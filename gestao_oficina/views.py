from django.shortcuts import render

# Create your views here.
from django.http import JsonResponse, HttpResponseBadRequest, HttpResponseNotAllowed, HttpResponse
from django.views.decorators.csrf import csrf_exempt # Para desabilitar CSRF em APIs (use com cautela ou implemente tokens)
import json
from .models import Cliente

@csrf_exempt # Desabilitar CSRF para simplificar os exemplos iniciais de POST/PUT/DELETE. Em produção, use autenticação por token.
def cliente_list_create_api(request):
    if request.method == 'GET':
        clientes = Cliente.objects.all()
        data = {"clientes": list(clientes.values('id', 'nome_completo', 'telefone_principal', 'email'))}
        return JsonResponse(data)

    elif request.method == 'POST':
        try:
            dados = json.loads(request.body)
            novo_cliente = Cliente.objects.create(
                nome_completo=dados.get('nome_completo'),
                telefone_principal=dados.get('telefone_principal'),
                telefone_secundario=dados.get('telefone_secundario'),
                email=dados.get('email'),
                cpf_cnpj=dados.get('cpf_cnpj'),
                # Adicione outros campos conforme necessário
            )
            return JsonResponse({'id': novo_cliente.id, 'nome_completo': novo_cliente.nome_completo}, status=201) # 201 Created
        except Exception as e:
            return JsonResponse({'erro': str(e)}, status=400) # Bad Request

    return HttpResponseNotAllowed(['GET', 'POST']) # Se for outro método HTTP

@csrf_exempt # Desabilitar CSRF
def cliente_detail_update_delete_api(request, pk): # 'pk' é a chave primária (id) do cliente
    try:
        cliente = Cliente.objects.get(pk=pk)
    except Cliente.DoesNotExist:
        return JsonResponse({'erro': 'Cliente não encontrado'}, status=404) # Not Found

    if request.method == 'GET':
        data = {
            'id': cliente.id,
            'nome_completo': cliente.nome_completo,
            'telefone_principal': cliente.telefone_principal,
            'telefone_secundario': cliente.telefone_secundario,
            'email': cliente.email,
            'cpf_cnpj': cliente.cpf_cnpj,
            # Adicione outros campos
        }
        return JsonResponse(data)

    elif request.method == 'PUT': # Atualização completa do recurso
        try:
            dados = json.loads(request.body)
            cliente.nome_completo = dados.get('nome_completo', cliente.nome_completo)
            cliente.telefone_principal = dados.get('telefone_principal', cliente.telefone_principal)
            cliente.telefone_secundario = dados.get('telefone_secundario', cliente.telefone_secundario)
            cliente.email = dados.get('email', cliente.email)
            cliente.cpf_cnpj = dados.get('cpf_cnpj', cliente.cpf_cnpj)
            # Adicione outros campos
            cliente.save()
            return JsonResponse({'id': cliente.id, 'nome_completo': cliente.nome_completo})
        except Exception as e:
            return JsonResponse({'erro': str(e)}, status=400)

    elif request.method == 'DELETE':
        cliente.delete()
        return HttpResponse(status=204) # No Content (sucesso, sem corpo na resposta)

    return HttpResponseNotAllowed(['GET', 'PUT', 'DELETE'])