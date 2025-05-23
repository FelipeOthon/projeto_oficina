// frontend/scripts.js
document.addEventListener('DOMContentLoaded', function() {
    carregarClientes();
});

function carregarClientes() {
    const listaClientesUI = document.getElementById('lista-clientes');
    listaClientesUI.innerHTML = '<li class="list-group-item">Carregando clientes...</li>';
    const apiUrl = 'http://127.0.0.1:8000/api/clientes/';

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erro HTTP! status: ${response.status}, Mensagem: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => { // 'data' AGORA É ESPERADO QUE SEJA O ARRAY DE CLIENTES DIRETAMENTE
            listaClientesUI.innerHTML = '';
            if (Array.isArray(data) && data.length > 0) { // VERIFICA SE 'data' É UM ARRAY E TEM ITENS
                data.forEach(cliente => { // ITERA DIRETAMENTE SOBRE O ARRAY 'data'
                    const item = document.createElement('li');
                    item.className = 'list-group-item d-flex justify-content-between align-items-center';
                    // Ajuste para usar os nomes de campo corretos retornados pelo seu ClienteSerializer
                    // Por exemplo, se o serializer retorna 'nome_completo', 'email', 'telefone_principal'
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
                // Se 'data' não for um array ou estiver vazio, ou se a API retornar algo inesperado que não seja um array de clientes
                listaClientesUI.innerHTML = '<li class="list-group-item">Nenhum cliente encontrado ou formato de dados inesperado.</li>';
            }
        })
        .catch(error => {
            console.error('Erro ao buscar clientes:', error);
            listaClientesUI.innerHTML = `<li class="list-group-item text-danger">Erro ao carregar clientes. Verifique o console (F12) para mais detalhes. Detalhe: ${error.message}</li>`;
        });
}

// Funções placeholder (estas continuam iguais por enquanto)
function abrirModalNovoCliente() { alert('Funcionalidade Novo Cliente a ser implementada!'); }
function verDetalhesCliente(clienteId) { alert(`Ver detalhes do cliente ID: ${clienteId} (a ser implementado)`); }
function editarCliente(clienteId) { alert(`Editar cliente ID: ${clienteId} (a ser implementado)`); }
function deletarCliente(clienteId) { alert(`Deletar cliente ID: ${clienteId} (a ser implementado)`); }