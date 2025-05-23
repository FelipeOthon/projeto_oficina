from django.http import JsonResponse, HttpResponseBadRequest, HttpResponseNotAllowed, HttpResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .models import Cliente, Veiculo  # Adicionado Veiculo aqui


# VIEWS PARA CLIENTE (EXISTENTES)
@csrf_exempt
def cliente_list_create_api(request):
    if request.method == 'GET':
        clientes = Cliente.objects.all()
        data = {"clientes": list(clientes.values('id', 'nome_completo', 'telefone_principal', 'email'))}
        return JsonResponse(data)

    elif request.method == 'POST':
        try:
            dados = json.loads(request.body)
            # Validação básica de campos obrigatórios
            if not dados.get('nome_completo') or not dados.get('telefone_principal'):
                return JsonResponse({'erro': 'Nome completo e telefone principal são obrigatórios.'}, status=400)

            novo_cliente = Cliente.objects.create(
                nome_completo=dados.get('nome_completo'),
                telefone_principal=dados.get('telefone_principal'),
                telefone_secundario=dados.get('telefone_secundario'),
                email=dados.get('email'),
                cpf_cnpj=dados.get('cpf_cnpj'),
                endereco_rua=dados.get('endereco_rua'),
                endereco_numero=dados.get('endereco_numero'),
                endereco_complemento=dados.get('endereco_complemento'),
                endereco_bairro=dados.get('endereco_bairro'),
                endereco_cidade=dados.get('endereco_cidade'),
                endereco_estado=dados.get('endereco_estado'),
                endereco_cep=dados.get('endereco_cep')
            )
            return JsonResponse({
                'id': novo_cliente.id,
                'nome_completo': novo_cliente.nome_completo,
                'email': novo_cliente.email
            }, status=201)
        except Exception as e:
            # Para erros de integridade (como email/cpf_cnpj duplicado), o Django levanta IntegrityError
            # Você pode querer tratar isso de forma mais específica.
            return JsonResponse({'erro': str(e)}, status=400)

    return HttpResponseNotAllowed(['GET', 'POST'])


@csrf_exempt
def cliente_detail_update_delete_api(request, pk):
    try:
        cliente = Cliente.objects.get(pk=pk)
    except Cliente.DoesNotExist:
        return JsonResponse({'erro': 'Cliente não encontrado'}, status=404)

    if request.method == 'GET':
        data = {
            'id': cliente.id,
            'nome_completo': cliente.nome_completo,
            'telefone_principal': cliente.telefone_principal,
            'telefone_secundario': cliente.telefone_secundario,
            'email': cliente.email,
            'cpf_cnpj': cliente.cpf_cnpj,
            'endereco_rua': cliente.endereco_rua,
            'endereco_numero': cliente.endereco_numero,
            'endereco_complemento': cliente.endereco_complemento,
            'endereco_bairro': cliente.endereco_bairro,
            'endereco_cidade': cliente.endereco_cidade,
            'endereco_estado': cliente.endereco_estado,
            'endereco_cep': cliente.endereco_cep,
            'data_cadastro': cliente.data_cadastro.strftime('%d/%m/%Y %H:%M:%S') if cliente.data_cadastro else None
        }
        return JsonResponse(data)

    elif request.method == 'PUT':
        try:
            dados = json.loads(request.body)
            cliente.nome_completo = dados.get('nome_completo', cliente.nome_completo)
            cliente.telefone_principal = dados.get('telefone_principal', cliente.telefone_principal)
            cliente.telefone_secundario = dados.get('telefone_secundario', cliente.telefone_secundario)
            cliente.email = dados.get('email', cliente.email)
            cliente.cpf_cnpj = dados.get('cpf_cnpj', cliente.cpf_cnpj)
            cliente.endereco_rua = dados.get('endereco_rua', cliente.endereco_rua)
            cliente.endereco_numero = dados.get('endereco_numero', cliente.endereco_numero)
            cliente.endereco_complemento = dados.get('endereco_complemento', cliente.endereco_complemento)
            cliente.endereco_bairro = dados.get('endereco_bairro', cliente.endereco_bairro)
            cliente.endereco_cidade = dados.get('endereco_cidade', cliente.endereco_cidade)
            cliente.endereco_estado = dados.get('endereco_estado', cliente.endereco_estado)
            cliente.endereco_cep = dados.get('endereco_cep', cliente.endereco_cep)

            # Validação básica de campos obrigatórios na atualização
            if not cliente.nome_completo or not cliente.telefone_principal:
                return JsonResponse({'erro': 'Nome completo e telefone principal são obrigatórios.'}, status=400)

            cliente.save()
            # Retornar todos os dados atualizados para confirmação
            data_atualizada = {
                'id': cliente.id, 'nome_completo': cliente.nome_completo,
                'telefone_principal': cliente.telefone_principal,
                'telefone_secundario': cliente.telefone_secundario, 'email': cliente.email,
                'cpf_cnpj': cliente.cpf_cnpj,
                'endereco_rua': cliente.endereco_rua, 'endereco_numero': cliente.endereco_numero,
                'endereco_complemento': cliente.endereco_complemento, 'endereco_bairro': cliente.endereco_bairro,
                'endereco_cidade': cliente.endereco_cidade, 'endereco_estado': cliente.endereco_estado,
                'endereco_cep': cliente.endereco_cep,
                'data_cadastro': cliente.data_cadastro.strftime('%d/%m/%Y %H:%M:%S') if cliente.data_cadastro else None
            }
            return JsonResponse(data_atualizada)
        except Exception as e:
            return JsonResponse({'erro': str(e)}, status=400)

    elif request.method == 'DELETE':
        cliente.delete()
        return HttpResponse(status=204)

    return HttpResponseNotAllowed(['GET', 'PUT', 'DELETE'])


# VIEWS PARA VEICULO (NOVAS)
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

            # Validar campos obrigatórios na atualização, se necessário
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