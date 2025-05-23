// frontend/js/clienteUI.js
import { getClientes, getClienteById, createCliente, updateCliente, deleteClienteAPI } from './clienteService.js';

const listaClientesUI = document.getElementById('lista-clientes');
const formCliente = document.getElementById('formCliente');
const clienteIdInput = document.getElementById('clienteId'); // O input hidden para o ID
const modalLabel = document.getElementById('clienteModalLabel');
const clienteModal = $('#clienteModal'); // jQuery para o modal Bootstrap

// Função para renderizar a lista de clientes no HTML
export async function renderClientes() {
    listaClientesUI.innerHTML = '<li class="list-group-item">Carregando clientes...</li>';
    try {
        const clientes = await getClientes(); // Chama a função do service
        listaClientesUI.innerHTML = '';
        if (Array.isArray(clientes) && clientes.length > 0) {
            clientes.forEach(cliente => {
                const item = document.createElement('li');
                item.className = 'list-group-item d-flex justify-content-between align-items-center';
                // Adicionando data-id e classes específicas para os botões para event delegation
                item.innerHTML = `
                    <div>
                        <strong>${cliente.nome_completo}</strong><br>
                        <small>Email: ${cliente.email || 'N/A'} | Tel: ${cliente.telefone_principal || 'N/A'}</small>
                    </div>
                    <div>
                        <button class="btn btn-sm btn-info mr-2 btn-detalhes" data-id="${cliente.id}">Detalhes</button>
                        <button class="btn btn-sm btn-warning mr-2 btn-editar" data-id="${cliente.id}">Editar</button>
                        <button class="btn btn-sm btn-danger btn-deletar" data-id="${cliente.id}">Deletar</button>
                    </div>
                `;
                listaClientesUI.appendChild(item);
            });
        } else {
            listaClientesUI.innerHTML = '<li class="list-group-item">Nenhum cliente encontrado.</li>';
        }
    } catch (error) {
        console.error('Erro ao renderizar clientes:', error);
        listaClientesUI.innerHTML = `<li class="list-group-item text-danger">Erro ao carregar clientes: ${error.message}</li>`;
    }
}

// Função para abrir o modal para um novo cliente
export function abrirModalNovoCliente() {
    formCliente.reset();
    clienteIdInput.value = '';
    modalLabel.textContent = 'Adicionar Novo Cliente';
    clienteModal.modal('show');
}

// Função para abrir o modal para editar um cliente existente
export async function abrirModalEditarCliente(id) {
    formCliente.reset();
    modalLabel.textContent = 'Editar Cliente';
    try {
        const cliente = await getClienteById(id); // Chama a função do service
        clienteIdInput.value = cliente.id;
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
        clienteModal.modal('show');
    } catch (error) {
        console.error('Erro ao carregar cliente para edição:', error);
        alert(`Erro ao carregar dados do cliente: ${error.message}`);
    }
}

// Função para lidar com o submit do formulário (criar ou atualizar)
export async function handleSalvarCliente() {
    const id = clienteIdInput.value;
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

    try {
        if (id) { // Atualizar cliente existente
            await updateCliente(id, dadosCliente); // Chama a função do service
            alert('Cliente atualizado com sucesso!');
        } else { // Criar novo cliente
            await createCliente(dadosCliente); // Chama a função do service
            alert('Cliente criado com sucesso!');
        }
        clienteModal.modal('hide');
        renderClientes(); // Re-renderiza a lista de clientes
    } catch (error) {
        console.error('Erro ao salvar cliente:', error);
        alert(`Erro ao salvar cliente: ${error.message}`);
    }
}

// Função para lidar com a deleção de um cliente
export async function handleDeletarCliente(id) {
    if (confirm(`Tem certeza que deseja deletar o cliente com ID: ${id}? Esta ação não pode ser desfeita.`)) {
        try {
            await deleteClienteAPI(id); // Chama a função do service
            alert('Cliente deletado com sucesso!');
            renderClientes(); // Re-renderiza a lista de clientes
        } catch (error) {
            console.error('Erro ao deletar cliente:', error);
            alert(`Erro ao deletar cliente: ${error.message}`);
        }
    }
}

// Placeholder para detalhes (pode ser implementado depois)
export function handleVerDetalhesCliente(id) {
    alert(`Ver detalhes do cliente ID: ${id} (a ser implementado)`);
}