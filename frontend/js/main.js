// frontend/js/main.js
import { apiUrlBase } from './apiConfig.js';
import {
    renderClientes, abrirModalNovoCliente, handleSalvarCliente,
    abrirModalEditarCliente, handleDeletarCliente, handleVerDetalhesCliente
} from './clienteUI.js';
import {
    renderVeiculos, abrirModalNovoVeiculo, handleSalvarVeiculo,
    abrirModalEditarVeiculo, handleDeletarVeiculo, handleVerDetalhesVeiculo
} from './veiculoUI.js';
import {
    renderAgendamentos, abrirModalNovoAgendamento, handleSalvarAgendamento,
    abrirModalEditarAgendamento, handleDeletarAgendamento, handleVerDetalhesAgendamento,
    populateClientesParaAgendamentoDropdown,
    populateVeiculosParaAgendamentoDropdown
} from './agendamentoUI.js';
import {
    renderOrdensDeServico,
    abrirModalNovaOS,
    handleSalvarOS,
    abrirModalEditarOS,
    handleDeletarOS,
    handleVerDetalhesOS,
    populateClientesParaOS,
    populateVeiculosParaOS,
    abrirModalAdicionarPeca,
    handleSalvarItemPeca,
    abrirModalEditarItemPeca,
    handleDeletarItemPeca,
    abrirModalAdicionarServico,
    handleSalvarItemServico,
    abrirModalEditarItemServico,
    handleDeletarItemServico
} from './ordemDeServicoUI.js';

// --- Elementos da UI para Autenticação ---
const loginContainer = document.getElementById('login-container');
const mainContentWrapper = document.getElementById('main-content-wrapper');
const formLogin = document.getElementById('formLogin');
const btnLogout = document.getElementById('btnLogout');
const loginErrorDiv = document.getElementById('loginError');
const userInfoSpan = document.getElementById('userInfo');

// --- Elementos para Busca Global --- MODIFICADO/ADICIONADO
const selectTipoBusca = document.getElementById('selectTipoBusca');
const inputBuscaGlobal = document.getElementById('inputBuscaGlobal');
const btnLimparBuscaGlobal = document.getElementById('btnLimparBuscaGlobal');
let debounceTimerGlobal;

const placeholdersBusca = {
    clientes: "Buscar cliente por nome, email, CPF/CNPJ ou telefone...",
    veiculos: "Buscar veículo por placa, marca, modelo, chassi ou nome do cliente...",
    agendamentos: "Buscar agendamento por cliente, veículo, serviço, status ou mecânico...",
    os: "Buscar OS por número, cliente, veículo, status, problema, diagnóstico ou mecânico..."
};

// --- Funções de Autenticação ---
async function handleLogin(event) {
    event.preventDefault();
    const usernameInput = document.getElementById('loginUsername');
    const passwordInput = document.getElementById('loginPassword');
    const username = usernameInput.value;
    const password = passwordInput.value;

    if (loginErrorDiv) loginErrorDiv.style.display = 'none';

    try {
        const response = await fetch(`${apiUrlBase}/token/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('access_token', data.access);
            localStorage.setItem('refresh_token', data.refresh);
            if(usernameInput) usernameInput.value = '';
            if(passwordInput) passwordInput.value = '';
            await setupApplicationAfterLogin();
        } else {
            const errorMessage = data.detail || 'Usuário ou senha inválidos.';
            if (loginErrorDiv) {
                loginErrorDiv.textContent = errorMessage;
                loginErrorDiv.style.display = 'block';
            } else {
                alert(errorMessage);
            }
        }
    } catch (error) {
        console.error('Erro no login:', error);
        const connErrorMessage = 'Erro de conexão ao tentar fazer login.';
        if (loginErrorDiv) {
            loginErrorDiv.textContent = connErrorMessage;
            loginErrorDiv.style.display = 'block';
        } else {
            alert(connErrorMessage);
        }
    }
}

export function handleLogout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    if (userInfoSpan) userInfoSpan.textContent = '';
    showLoginScreen();
}

function showMainScreen() {
    if (loginContainer) loginContainer.style.display = 'none';
    if (mainContentWrapper) mainContentWrapper.style.display = 'block';
}

function showLoginScreen() {
    if (loginContainer) loginContainer.style.display = 'block';
    if (mainContentWrapper) mainContentWrapper.style.display = 'none';
    if(inputBuscaGlobal) inputBuscaGlobal.value = ''; // Limpa busca global ao deslogar
}

async function loadInitialData(tipo = 'clientes', searchTerm = '') { // MODIFICADO
    try {
        // Por padrão, carrega clientes sem filtro, mas permite carregar outros tipos
        // A busca global irá controlar qual função de render chamar com searchTerm
        switch (tipo) {
            case 'clientes':
                await renderClientes(searchTerm);
                break;
            case 'veiculos':
                await renderVeiculos(searchTerm);
                break;
            case 'agendamentos':
                await renderAgendamentos(searchTerm);
                break;
            case 'os':
                await renderOrdensDeServico(searchTerm);
                break;
            default:
                await renderClientes(); // Fallback
        }
        // Se quiser carregar todas as listas de uma vez (sem filtro) ao iniciar, pode manter o Promise.all
        // Mas com a busca global, geralmente carregamos uma por vez ou sob demanda.
        // Se quiser carregar todas as listas na inicialização, faça-o aqui:
        if (!searchTerm) { // Só carrega tudo se não for uma busca específica
             await Promise.all([
                 renderClientes(), // Já chamado ou será chamado pelo switch
                 renderVeiculos(),
                 renderAgendamentos(),
                 renderOrdensDeServico()
             ]);
        }

    } catch (error) {
        console.error("Erro ao carregar dados:", error);
    }
}

// --- Lógica para Busca Global --- ADICIONADO
function atualizarPlaceholderBuscaGlobal() {
    if (selectTipoBusca && inputBuscaGlobal) {
        const tipoSelecionado = selectTipoBusca.value;
        inputBuscaGlobal.placeholder = placeholdersBusca[tipoSelecionado] || "Digite para buscar...";
    }
}

async function executarBuscaGlobal() {
    if (!selectTipoBusca || !inputBuscaGlobal) return;
    const tipo = selectTipoBusca.value;
    const termo = inputBuscaGlobal.value.trim();

    console.log(`Buscando em '${tipo}' por '${termo}'`);

    // Mostra "carregando" na lista apropriada
    const listaUI = document.getElementById(`lista-${tipo}`); // Ex: lista-clientes, lista-veiculos
    if (listaUI) {
        listaUI.innerHTML = `<li class="list-group-item">Buscando ${tipo}...</li>`;
    } else {
        console.warn(`Elemento de lista para '${tipo}' não encontrado.`);
    }


    switch (tipo) {
        case 'clientes':
            await renderClientes(termo);
            break;
        case 'veiculos':
            await renderVeiculos(termo);
            break;
        case 'agendamentos':
            await renderAgendamentos(termo);
            break;
        case 'os':
            await renderOrdensDeServico(termo);
            break;
        default:
            console.warn("Tipo de busca desconhecido:", tipo);
    }
}

function limparBuscaGlobalEAtualizar() {
    if (!selectTipoBusca || !inputBuscaGlobal) return;
    inputBuscaGlobal.value = '';
    const tipo = selectTipoBusca.value;
    switch (tipo) { // Renderiza a lista completa da seção atual
        case 'clientes':
            renderClientes();
            break;
        case 'veiculos':
            renderVeiculos();
            break;
        case 'agendamentos':
            renderAgendamentos();
            break;
        case 'os':
            renderOrdensDeServico();
            break;
    }
}

function setupBuscaGlobalListeners() {
    if (selectTipoBusca) {
        selectTipoBusca.addEventListener('change', () => {
            atualizarPlaceholderBuscaGlobal();
            if(inputBuscaGlobal) inputBuscaGlobal.value = ''; // Limpa o campo de busca ao mudar o tipo
            executarBuscaGlobal(); // Carrega a lista do novo tipo selecionado (sem termo de busca)
            if(inputBuscaGlobal) inputBuscaGlobal.focus();
        });
    }
    if (inputBuscaGlobal) {
        inputBuscaGlobal.addEventListener('keyup', () => {
            clearTimeout(debounceTimerGlobal);
            debounceTimerGlobal = setTimeout(executarBuscaGlobal, 500);
        });
    }
    if (btnLimparBuscaGlobal) {
        btnLimparBuscaGlobal.addEventListener('click', limparBuscaGlobalEAtualizar);
    }
}
// --- FIM Lógica para Busca Global ---


function setupCommonEventListeners() {
    // Listeners para botões "Novo *" e "Salvar *" nos modais.
    const btnNovoCliente = document.getElementById('btnNovoCliente');
    if (btnNovoCliente) btnNovoCliente.addEventListener('click', abrirModalNovoCliente);
    const btnSalvarCliente = document.getElementById('btnSalvarCliente');
    if (btnSalvarCliente) btnSalvarCliente.addEventListener('click', handleSalvarCliente);

    const btnNovoVeiculo = document.getElementById('btnNovoVeiculo');
    if (btnNovoVeiculo) btnNovoVeiculo.addEventListener('click', abrirModalNovoVeiculo);
    const btnSalvarVeiculo = document.getElementById('btnSalvarVeiculo');
    if (btnSalvarVeiculo) btnSalvarVeiculo.addEventListener('click', handleSalvarVeiculo);

    const btnNovoAgendamento = document.getElementById('btnNovoAgendamento');
    if (btnNovoAgendamento) btnNovoAgendamento.addEventListener('click', abrirModalNovoAgendamento);
    const btnSalvarAgendamento = document.getElementById('btnSalvarAgendamento');
    if (btnSalvarAgendamento) btnSalvarAgendamento.addEventListener('click', handleSalvarAgendamento);

    const agendamentoClienteSelect = document.getElementById('agendamentoCliente');
    if (agendamentoClienteSelect) {
        agendamentoClienteSelect.addEventListener('change', function() {
            const clienteId = this.value;
            populateVeiculosParaAgendamentoDropdown(clienteId, null);
        });
    }

    const btnNovaOS = document.getElementById('btnNovaOS');
    if (btnNovaOS) btnNovaOS.addEventListener('click', abrirModalNovaOS);
    const btnSalvarOS = document.getElementById('btnSalvarOS');
    if (btnSalvarOS) btnSalvarOS.addEventListener('click', handleSalvarOS);

    const osClienteSelect = document.getElementById('osCliente');
    if (osClienteSelect) {
        osClienteSelect.addEventListener('change', function() {
            const clienteId = this.value;
            populateVeiculosParaOS(clienteId, null);
        });
    }

    const btnSalvarItemPeca = document.getElementById('btnSalvarItemPeca');
    if (btnSalvarItemPeca) btnSalvarItemPeca.addEventListener('click', handleSalvarItemPeca);
    const btnSalvarItemServico = document.getElementById('btnSalvarItemServico');
    if (btnSalvarItemServico) btnSalvarItemServico.addEventListener('click', handleSalvarItemServico);

    // Delegação de eventos para listas dinâmicas
    const mainContainer = document.getElementById('main-content-wrapper'); // Ou um container mais específico se preferir
    if (mainContainer) {
        mainContainer.addEventListener('click', function(event) {
            const targetButton = event.target.closest('button');
            if (!targetButton) return;

            const id = targetButton.dataset.id;
            // Cliente
            if (id && targetButton.classList.contains('btn-editar')) abrirModalEditarCliente(id);
            else if (id && targetButton.classList.contains('btn-deletar')) handleDeletarCliente(id);
            else if (id && targetButton.classList.contains('btn-detalhes')) handleVerDetalhesCliente(id);
            // Veículo
            else if (id && targetButton.classList.contains('btn-editar-veiculo')) abrirModalEditarVeiculo(id);
            else if (id && targetButton.classList.contains('btn-deletar-veiculo')) handleDeletarVeiculo(id);
            else if (id && targetButton.classList.contains('btn-detalhes-veiculo')) handleVerDetalhesVeiculo(id);
            // Agendamento
            else if (id && targetButton.classList.contains('btn-editar-agendamento')) abrirModalEditarAgendamento(id);
            else if (id && targetButton.classList.contains('btn-deletar-agendamento')) handleDeletarAgendamento(id);
            else if (id && targetButton.classList.contains('btn-detalhes-agendamento')) handleVerDetalhesAgendamento(id);
            // OS
            else if (id && targetButton.classList.contains('btn-editar-os')) abrirModalEditarOS(id);
            else if (id && targetButton.classList.contains('btn-deletar-os')) handleDeletarOS(id);
            else if (id && targetButton.classList.contains('btn-detalhes-os')) {
                const osDetalhesModalElement = document.getElementById('osDetalhesItensModal');
                if(osDetalhesModalElement) osDetalhesModalElement.dataset.currentOsId = id;
                handleVerDetalhesOS(id);
            }

            // Eventos dentro do Modal de Detalhes da OS
            const osDetalhesModalElement = document.getElementById('osDetalhesItensModal');
            if (osDetalhesModalElement && osDetalhesModalElement.contains(targetButton)) {
                const osIdContext = osDetalhesModalElement.dataset.currentOsId;
                const itemId = targetButton.dataset.itemId; // Pode ser undefined se não for um botão de item

                if (targetButton.id === 'btnAbrirModalAdicionarPecaOS') {
                    if (osIdContext) abrirModalAdicionarPeca(osIdContext);
                } else if (targetButton.id === 'btnAbrirModalAdicionarServicoOS') {
                    if (osIdContext) abrirModalAdicionarServico(osIdContext);
                } else if (itemId) { // Ações que dependem de um itemId
                    const osIdFromButton = targetButton.dataset.osId; // Os botões de item têm data-os-id
                    if (targetButton.classList.contains('btn-editar-item-peca')) abrirModalEditarItemPeca(osIdFromButton, itemId);
                    else if (targetButton.classList.contains('btn-editar-item-servico')) abrirModalEditarItemServico(osIdFromButton, itemId);
                    else if (targetButton.classList.contains('btn-deletar-item-peca')) handleDeletarItemPeca(osIdFromButton, itemId);
                    else if (targetButton.classList.contains('btn-deletar-item-servico')) handleDeletarItemServico(osIdFromButton, itemId);
                }
            }
        });
    }
}


async function setupApplicationAfterLogin() {
    showMainScreen();
    // Carrega a lista inicial (Clientes por padrão) e atualiza o placeholder
    atualizarPlaceholderBuscaGlobal(); // Define o placeholder inicial
    await loadInitialData('clientes'); // Carrega clientes inicialmente

    // Carrega as outras listas em segundo plano para que as seções não fiquem vazias ao mudar o tipo de busca
    // antes de uma busca ser efetivamente realizada para aquele tipo.
    // Isso é opcional, mas melhora a UX.
    renderVeiculos();
    renderAgendamentos();
    renderOrdensDeServico();

    setupCommonEventListeners();
    setupBuscaGlobalListeners(); // Configura os listeners da busca global
}

// --- Inicialização da Aplicação ---
document.addEventListener('DOMContentLoaded', async () => {
    if (formLogin) formLogin.addEventListener('submit', handleLogin);
    if (btnLogout) btnLogout.addEventListener('click', handleLogout);

    const token = localStorage.getItem('access_token');
    if (token) {
        console.log("Token encontrado, carregando app...");
        await setupApplicationAfterLogin();
    } else {
        console.log("Nenhum token encontrado, mostrando login...");
        showLoginScreen();
    }
});

// Exportar handleLogout para que possa ser chamado por outros módulos em caso de erro 401.
// window.appGlobal = { handleLogout }; // Uma forma, mas a importação direta é melhor.