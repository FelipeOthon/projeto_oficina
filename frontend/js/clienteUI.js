// frontend/js/clienteUI.js
import { getClientes, getClienteById, createCliente, updateCliente, deleteClienteAPI } from './clienteService.js';

const listaClientesUI = document.getElementById('lista-clientes');
const formCliente = document.getElementById('formCliente');
const clienteIdInput = document.getElementById('clienteId');
const modalLabel = document.getElementById('clienteModalLabel');
const clienteModal = $('#clienteModal'); // jQuery para o modal Bootstrap
const btnSalvarClienteModal = document.getElementById('btnSalvarCliente');

// Elementos para a busca de clientes
const inputBuscaCliente = document.getElementById('inputBuscaCliente');
const btnLimparBuscaCliente = document.getElementById('btnLimparBuscaCliente');

let debounceTimer; // Variável para o debounce

// Função auxiliar para configurar o modo do formulário e modal de Cliente
function configurarModalCliente(modo, clienteData = null) {
    formCliente.reset();
    clienteIdInput.value = clienteData ? clienteData.id : '';

    const camposFormulario = formCliente.elements;
    let tituloModal = '';
    let salvarVisivel = true;

    if (modo === 'novo') {
        tituloModal = 'Adicionar Novo Cliente';
        for (let campo of camposFormulario) {
            if (campo.type !== 'hidden' && campo.type !== 'submit' && campo.type !== 'button') {
                campo.disabled = false;
            }
        }
    } else if (modo === 'editar') {
        tituloModal = 'Editar Cliente';
        for (let campo of camposFormulario) {
            if (campo.type !== 'hidden' && campo.type !== 'submit' && campo.type !== 'button') {
                campo.disabled = false;
            }
        }
        if (clienteData) {
            document.getElementById('nomeCompleto').value = clienteData.nome_completo || '';
            document.getElementById('telefonePrincipal').value = clienteData.telefone_principal || '';
            document.getElementById('telefoneSecundario').value = clienteData.telefone_secundario || '';
            document.getElementById('email').value = clienteData.email || '';
            document.getElementById('cpfCnpj').value = clienteData.cpf_cnpj || '';
            document.getElementById('enderecoRua').value = clienteData.endereco_rua || '';
            document.getElementById('enderecoNumero').value = clienteData.endereco_numero || '';
            document.getElementById('enderecoComplemento').value = clienteData.endereco_complemento || '';
            document.getElementById('enderecoBairro').value = clienteData.endereco_bairro || '';
            document.getElementById('enderecoCidade').value = clienteData.endereco_cidade || '';
            document.getElementById('enderecoEstado').value = clienteData.endereco_estado || '';
            document.getElementById('enderecoCep').value = clienteData.endereco_cep || '';
        }
    } else if (modo === 'detalhes') {
        tituloModal = 'Detalhes do Cliente';
        salvarVisivel = false;
        for (let campo of camposFormulario) {
            if (campo.type !== 'hidden' && campo.type !== 'submit' && campo.type !== 'button') {
                campo.disabled = true;
            }
        }
        if (clienteData) {
            document.getElementById('nomeCompleto').value = clienteData.nome_completo || '';
            document.getElementById('telefonePrincipal').value = clienteData.telefone_principal || '';
            document.getElementById('telefoneSecundario').value = clienteData.telefone_secundario || '';
            document.getElementById('email').value = clienteData.email || '';
            document.getElementById('cpfCnpj').value = clienteData.cpf_cnpj || '';
            document.getElementById('enderecoRua').value = clienteData.endereco_rua || '';
            document.getElementById('enderecoNumero').value = clienteData.endereco_numero || '';
            document.getElementById('enderecoComplemento').value = clienteData.endereco_complemento || '';
            document.getElementById('enderecoBairro').value = clienteData.endereco_bairro || '';
            document.getElementById('enderecoCidade').value = clienteData.endereco_cidade || '';
            document.getElementById('enderecoEstado').value = clienteData.endereco_estado || '';
            document.getElementById('enderecoCep').value = clienteData.endereco_cep || '';
        }
    }

    modalLabel.textContent = tituloModal;
    if (btnSalvarClienteModal) {
        btnSalvarClienteModal.style.display = salvarVisivel ? 'inline-block' : 'none';
    }
    clienteModal.modal('show');
}


// Função para renderizar a lista de clientes no HTML - MODIFICADA para aceitar searchTerm
export async function renderClientes(searchTerm = '') {
    if (!listaClientesUI) return;
    listaClientesUI.innerHTML = '<li class="list-group-item">Carregando clientes...</li>';
    try {
        // Passa o searchTerm para getClientes
        const clientes = await getClientes(searchTerm);
        listaClientesUI.innerHTML = ''; // Limpa a lista antes de adicionar novos itens

        if (Array.isArray(clientes) && clientes.length > 0) {
            clientes.forEach(cliente => {
                const item = document.createElement('li');
                item.className = 'list-group-item d-flex justify-content-between align-items-center';
                // Corrigido o template string para interpolação correta
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
            if (searchTerm) {
                listaClientesUI.innerHTML = `<li class="list-group-item">Nenhum cliente encontrado para "${searchTerm}".</li>`;
            } else {
                listaClientesUI.innerHTML = '<li class="list-group-item">Nenhum cliente cadastrado.</li>';
            }
        }
    } catch (error) {
        console.error('Erro ao renderizar clientes:', error);
        listaClientesUI.innerHTML = `<li class="list-group-item text-danger">Erro ao carregar clientes: ${error.message}</li>`;
    }
}

// Função para abrir o modal para um novo cliente
export function abrirModalNovoCliente() {
    configurarModalCliente('novo');
}

// Função para abrir o modal para editar um cliente existente
export async function abrirModalEditarCliente(id) {
    console.log('[clienteUI.js] -> abrirModalEditarCliente - ID recebido:', id, '- Tipo:', typeof id);
    try {
        const cliente = await getClienteById(id);
        configurarModalCliente('editar', cliente);
    } catch (error) {
        console.error('Erro ao carregar cliente para edição:', error);
        alert(`Erro ao carregar dados do cliente: ${error.message}`);
    }
}

export async function handleVerDetalhesCliente(id) {
    console.log('[clienteUI.js] -> handleVerDetalhesCliente - ID recebido:', id, '- Tipo:', typeof id);
    try {
        const cliente = await getClienteById(id);
        configurarModalCliente('detalhes', cliente);
    } catch (error) {
        console.error('Erro ao carregar detalhes do cliente:', error);
        alert(`Erro ao carregar detalhes do cliente: ${error.message}`);
    }
}

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
        if (id) {
            await updateCliente(id, dadosCliente);
            alert('Cliente atualizado com sucesso!');
        } else {
            await createCliente(dadosCliente);
            alert('Cliente criado com sucesso!');
        }
        clienteModal.modal('hide');
        // Ao salvar, renderiza a lista com o termo de busca atual (se houver) ou a lista completa
        renderClientes(inputBuscaCliente.value);
    } catch (error) {
        console.error('Erro ao salvar cliente:', error);
        alert(`Erro ao salvar cliente: ${error.message}`);
    }
}

export async function handleDeletarCliente(id) {
    console.log('[clienteUI.js] -> handleDeletarCliente - ID recebido:', id, '- Tipo:', typeof id);
    if (confirm(`Tem certeza que deseja deletar o cliente com ID: ${id}? Esta ação não pode ser desfeita.`)) {
        try {
            await deleteClienteAPI(id);
            alert('Cliente deletado com sucesso!');
            // Ao deletar, renderiza a lista com o termo de busca atual (se houver) ou a lista completa
            renderClientes(inputBuscaCliente.value);
        } catch (error) {
            console.error('Erro ao deletar cliente:', error);
            alert(`Erro ao deletar cliente: ${error.message}`);
        }
    }
}

// --- LÓGICA PARA BUSCA DE CLIENTES ---

// Função para lidar com a busca de clientes
function realizarBuscaClientes() {
    const termoBusca = inputBuscaCliente.value.trim();
    renderClientes(termoBusca);
}

// Event listener para o input de busca (com debounce)
if (inputBuscaCliente) {
    inputBuscaCliente.addEventListener('keyup', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(realizarBuscaClientes, 500); // Espera 500ms após o usuário parar de digitar
    });
}

// Event listener para o botão de limpar busca
if (btnLimparBuscaCliente) {
    btnLimparBuscaCliente.addEventListener('click', () => {
        inputBuscaCliente.value = ''; // Limpa o campo de busca
        renderClientes(); // Renderiza todos os clientes
    });
}

// Inicialização: Carrega todos os clientes ao carregar a página
// Certifique-se que main.js chama renderClientes após o login/inicialização da UI principal.
// Se renderClientes já é chamada em main.js, essa chamada aqui pode ser redundante ou
// pode ser a principal se não houver outra.
// document.addEventListener('DOMContentLoaded', () => {
// renderClientes(); // Se precisar carregar na inicialização deste módulo especificamente.
// });