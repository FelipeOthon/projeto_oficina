// frontend/scripts.js
document.addEventListener('DOMContentLoaded', function() {
    carregarClientes();

    document.getElementById('btnNovoCliente').addEventListener('click', abrirModalNovoCliente);
    document.getElementById('btnSalvarCliente').addEventListener('click', salvarCliente);
});

const apiUrlBase = 'http://127.0.0.1:8000/api';

function carregarClientes() {
    const listaClientesUI = document.getElementById('lista-clientes');
    listaClientesUI.innerHTML = '<li class="list-group-item">Carregando clientes...</li>';

    fetch(`${apiUrlBase}/clientes/`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erro HTTP! status: ${response.status}, Mensagem: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            listaClientesUI.innerHTML = '';
            if (Array.isArray(data) && data.length > 0) {
                data.forEach(cliente => {
                    const item = document.createElement('li');
                    item.className = 'list-group-item d-flex justify-content-between align-items-center';
                    item.innerHTML = `
                        <div>
                            <strong>${cliente.nome_completo}</strong><br>
                            <small>Email: ${cliente.email || 'N/A'} | Tel: ${cliente.telefone_principal || 'N/A'}</small>
                        </div>
                        <div>
                            <button class="btn btn-sm btn-info mr-2" onclick="verDetalhesCliente(${cliente.id})">Detalhes</button>
                            <button class="btn btn-sm btn-warning mr-2" onclick="editarCliente(${cliente.id})">Editar</button>
                            <button class="btn btn-sm btn-danger" onclick="deletarCliente(${cliente.id})">Deletar</button>
                        </div>
                    `;
                    listaClientesUI.appendChild(item);
                });
            } else {
                listaClientesUI.innerHTML = '<li class="list-group-item">Nenhum cliente encontrado.</li>';
            }
        })
        .catch(error => {
            console.error('Erro ao buscar clientes:', error);
            listaClientesUI.innerHTML = `<li class="list-group-item text-danger">Erro ao carregar clientes. Detalhe: ${error.message}</li>`;
        });
}

function abrirModalNovoCliente() {
    document.getElementById('formCliente').reset();
    document.getElementById('clienteId').value = ''; // Garante que clienteId está vazio para criação
    document.getElementById('clienteModalLabel').textContent = 'Adicionar Novo Cliente';
    $('#clienteModal').modal('show');
}

function editarCliente(clienteId) {
    document.getElementById('formCliente').reset(); // Limpa o formulário primeiro
    document.getElementById('clienteModalLabel').textContent = 'Editar Cliente';

    fetch(`${apiUrlBase}/clientes/${clienteId}/`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erro HTTP! status: ${response.status}`);
            }
            return response.json();
        })
        .then(cliente => {
            document.getElementById('clienteId').value = cliente.id;
            document.getElementById('nomeCompleto').value = cliente.nome_completo || '';
            document.getElementById('telefonePrincipal').value = cliente.telefone_principal || '';
            document.getElementById('telefoneSecundario').value = cliente.telefone_secundario || '';
            document.getElementById('email').value = cliente.email || '';
            document.getElementById('cpfCnpj').value = cliente.cpf_cnpj || '';
            document.getElementById('enderecoRua').value = cliente.endereco_rua || '';
            document.getElementById('enderecoNumero').value = cliente.endereco_numero || '';
            document.getElementById('enderecoComplemento').value = cliente.endereco_complemento || '';
            document.getElementById('enderecoBairro').value = cliente.endereco_bairro || '';
            document.getElementById('enderecoCidade').value = cliente.endereco_cidade || '';
            document.getElementById('enderecoEstado').value = cliente.endereco_estado || '';
            document.getElementById('enderecoCep').value = cliente.endereco_cep || '';

            $('#clienteModal').modal('show');
        })
        .catch(error => {
            console.error('Erro ao buscar dados do cliente para edição:', error);
            alert(`Erro ao carregar dados do cliente: ${error.message}`);
        });
}

function salvarCliente() {
    const clienteId = document.getElementById('clienteId').value;

    const dadosCliente = {
        nome_completo: document.getElementById('nomeCompleto').value,
        telefone_principal: document.getElementById('telefonePrincipal').value,
        telefone_secundario: document.getElementById('telefoneSecundario').value || null,
        email: document.getElementById('email').value || null,
        cpf_cnpj: document.getElementById('cpfCnpj').value || null,
        endereco_rua: document.getElementById('enderecoRua').value || null,
        endereco_numero: document.getElementById('enderecoNumero').value || null,
        endereco_complemento: document.getElementById('enderecoComplemento').value || null,
        endereco_bairro: document.getElementById('enderecoBairro').value || null,
        endereco_cidade: document.getElementById('enderecoCidade').value || null,
        endereco_estado: document.getElementById('enderecoEstado').value || null,
        endereco_cep: document.getElementById('enderecoCep').value || null,
    };

    if (!dadosCliente.nome_completo || !dadosCliente.telefone_principal) {
        alert('Nome completo e Telefone Principal são obrigatórios!');
        return;
    }

    let url = `${apiUrlBase}/clientes/`;
    let method = 'POST';

    if (clienteId) {
        url = `${apiUrlBase}/clientes/${clienteId}/`;
        method = 'PUT';
    }

    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosCliente)
    })
    .then(response => {
        if ((method === 'POST' && response.status === 201) || (method === 'PUT' && response.ok)) {
            return response.json();
        } else {
            // Se a resposta não for OK, tenta ler como JSON para obter a mensagem de erro do DRF
            return response.json().then(errData => {
                let erroMsg = `Erro ao ${method === 'POST' ? 'criar' : 'atualizar'} cliente: ${response.status}`;
                if (errData) {
                    const fieldErrors = [];
                    // Loop para formatar erros de campo do DRF
                    for (const field in errData) {
                        fieldErrors.push(`${field}: ${Array.isArray(errData[field]) ? errData[field].join(', ') : errData[field]}`);
                    }
                    if (fieldErrors.length > 0) {
                        erroMsg += `\nDetalhes:\n${fieldErrors.join('\n')}`;
                    } else if (errData.detail) { // Mensagem de erro geral do DRF
                         erroMsg += `\nDetalhe: ${errData.detail}`;
                    } else { // Outro formato de erro JSON
                        erroMsg += `\n${JSON.stringify(errData)}`;
                    }
                }
                throw new Error(erroMsg);
            });
        }
    })
    .then(data => {
        alert(`Cliente ${method === 'POST' ? 'criado' : 'atualizado'} com sucesso!`);
        $('#clienteModal').modal('hide');
        carregarClientes();
    })
    .catch(error => {
        console.error(`Erro ao ${method === 'POST' ? 'criar' : 'atualizar'} cliente:`, error);
        alert(error.message); // Exibe a mensagem de erro formatada
    });
}

function verDetalhesCliente(clienteId) {
    alert(`Ver detalhes do cliente ID: ${clienteId} (a ser implementado)`);
}

// --- FUNÇÃO DELETARCLIENTE IMPLEMENTADA ---
function deletarCliente(clienteId) {
    if (confirm(`Tem certeza que deseja deletar o cliente com ID: ${clienteId}? Esta ação não pode ser desfeita.`)) {
        fetch(`${apiUrlBase}/clientes/${clienteId}/`, {
            method: 'DELETE',
            headers: {
                // 'Content-Type': 'application/json', // Não é estritamente necessário para DELETE sem corpo
                // Adicionar headers de autenticação se necessário no futuro
            },
        })
        .then(response => {
            if (response.status === 204) { // 204 No Content - Sucesso para DELETE
                alert('Cliente deletado com sucesso!');
                carregarClientes(); // Recarrega a lista de clientes
            } else if (!response.ok) {
                // Tenta ler como JSON para pegar o erro do DRF (ex: 'detail': 'Não encontrado.')
                // ou outras mensagens de erro que a API possa retornar como JSON
                return response.json().then(errData => {
                    throw new Error(`Erro ao deletar cliente: ${response.status} - ${errData.detail || JSON.stringify(errData)}`);
                });
            } else {
                // Caso a resposta seja OK mas não 204 (pouco comum para DELETE bem-sucedido)
                alert('Cliente deletado, mas o servidor retornou uma resposta inesperada.');
                carregarClientes(); // Recarrega mesmo assim, pois pode ter deletado
            }
        })
        .catch(error => {
            console.error('Erro ao deletar cliente:', error);
            alert(`Erro ao deletar cliente: ${error.message}`);
        });
    }
}