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
const userInfoSpan = document.getElementById('userInfo'); // Para exibir nome do usuário, por exemplo

// --- Funções de Autenticação ---
async function handleLogin(event) {
    event.preventDefault();
    const usernameInput = document.getElementById('loginUsername');
    const passwordInput = document.getElementById('loginPassword');
    const username = usernameInput.value;
    const password = passwordInput.value;

    if (loginErrorDiv) loginErrorDiv.style.display = 'none';

    try {
        const response = await fetch(`${apiUrlBase}/token/`, { // Endpoint para obter token
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('access_token', data.access);
            localStorage.setItem('refresh_token', data.refresh);

            // Opcional: Decodificar token para obter nome de usuário se o backend o incluir no payload
            // try {
            //     const decodedToken = jwt_decode(data.access); // Necessita da lib jwt-decode
            //     if (userInfoSpan && decodedToken.username) { // Supondo que 'username' está no payload
            //         userInfoSpan.textContent = `Usuário: ${decodedToken.username}`;
            //     }
            // } catch (e) { console.error("Erro ao decodificar token:", e); }


            if(usernameInput) usernameInput.value = '';
            if(passwordInput) passwordInput.value = '';

            await setupApplicationAfterLogin(); // Configura UI e carrega dados
        } else {
            if (loginErrorDiv) {
                loginErrorDiv.textContent = data.detail || 'Usuário ou senha inválidos.';
                loginErrorDiv.style.display = 'block';
            } else {
                alert(data.detail || 'Usuário ou senha inválidos.');
            }
        }
    } catch (error) {
        console.error('Erro no login:', error);
        if (loginErrorDiv) {
            loginErrorDiv.textContent = 'Erro de conexão ao tentar fazer login.';
            loginErrorDiv.style.display = 'block';
        } else {
            alert('Erro de conexão ao tentar fazer login.');
        }
    }
}

export function handleLogout() { // Exportada para ser chamada globalmente se necessário
    // Lógica de blacklist do token de refresh no backend (opcional, mas recomendado)
    // const refreshToken = localStorage.getItem('refresh_token');
    // if (refreshToken) { /* ... chamada à API de blacklist ... */ }

    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    // localStorage.removeItem('username'); // Se estiver guardando username
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
}

async function loadInitialData() {
    // Só chama as funções de renderização se o token existir e for válido (implicitamente)
    // As próprias funções de service agora devem lidar com 401 e talvez chamar handleLogout
    try {
        await Promise.all([ // Carrega em paralelo, se possível e desejável
            renderClientes(),
            renderVeiculos(),
            renderAgendamentos(),
            renderOrdensDeServico()
        ]);
    } catch (error) {
        console.error("Erro ao carregar dados iniciais:", error);
        // Se um erro 401 ocorrer aqui dentro das funções de render/service,
        // a função handleResponseError (que você adicionará aos services)
        // deve idealmente já ter acionado o handleLogout ou preparado para isso.
    }
}

function setupCommonEventListeners() {
    // Estes são os listeners que não dependem de listas dinâmicas,
    // ou que podem ser configurados uma vez.
    // Listeners para botões "Novo *" e "Salvar *" nos modais.

    // --- Listeners para Clientes ---
    const btnNovoCliente = document.getElementById('btnNovoCliente');
    if (btnNovoCliente) btnNovoCliente.addEventListener('click', abrirModalNovoCliente);
    const btnSalvarCliente = document.getElementById('btnSalvarCliente');
    if (btnSalvarCliente) btnSalvarCliente.addEventListener('click', handleSalvarCliente);

    // --- Listeners para Veículos ---
    const btnNovoVeiculo = document.getElementById('btnNovoVeiculo');
    if (btnNovoVeiculo) btnNovoVeiculo.addEventListener('click', abrirModalNovoVeiculo);
    const btnSalvarVeiculo = document.getElementById('btnSalvarVeiculo');
    if (btnSalvarVeiculo) btnSalvarVeiculo.addEventListener('click', handleSalvarVeiculo);

    // --- Listeners para Agendamentos ---
    const btnNovoAgendamento = document.getElementById('btnNovoAgendamento');
    if (btnNovoAgendamento) btnNovoAgendamento.addEventListener('click', abrirModalNovoAgendamento);
    const btnSalvarAgendamento = document.getElementById('btnSalvarAgendamento');
    if (btnSalvarAgendamento) btnSalvarAgendamento.addEventListener('click', handleSalvarAgendamento);
    const agendamentoClienteSelect = document.getElementById('agendamentoCliente');
    if (agendamentoClienteSelect) {
        agendamentoClienteSelect.addEventListener('change', function() {
            const clienteId = this.value;
            if (clienteId && typeof populateVeiculosParaAgendamentoDropdown === 'function') {
                populateVeiculosParaAgendamentoDropdown(clienteId, null);
            }
        });
    }

    // --- Listeners para Ordens de Serviço (Entidade Principal) ---
    const btnNovaOS = document.getElementById('btnNovaOS');
    if (btnNovaOS) btnNovaOS.addEventListener('click', abrirModalNovaOS);
    const btnSalvarOS = document.getElementById('btnSalvarOS');
    if (btnSalvarOS) btnSalvarOS.addEventListener('click', handleSalvarOS);
    const osClienteSelect = document.getElementById('osCliente');
    if (osClienteSelect) {
        osClienteSelect.addEventListener('change', function() {
            const clienteId = this.value;
            if (clienteId && typeof populateVeiculosParaOS === 'function') {
                populateVeiculosParaOS(clienteId, null);
            }
        });
    }

    // --- Listeners para Salvar Itens de OS ---
    const btnSalvarItemPeca = document.getElementById('btnSalvarItemPeca');
    if (btnSalvarItemPeca) btnSalvarItemPeca.addEventListener('click', handleSalvarItemPeca);
    const btnSalvarItemServico = document.getElementById('btnSalvarItemServico');
    if (btnSalvarItemServico) btnSalvarItemServico.addEventListener('click', handleSalvarItemServico);

    // Listeners para as listas dinâmicas (delegação de eventos)
    // Estes são os que precisam ser configurados APÓS as listas serem populadas,
    // ou usar delegação de evento no contêiner pai (mainContentWrapper ou document.body)
    // Por simplicidade, vamos re-adicionar se necessário, ou mover para uma função chamada após cada render.
    // A estrutura atual do seu código já os adiciona uma vez, e a delegação acontece no elemento da lista.
    // Isso deve funcionar bem, desde que os elementos da lista sejam recriados com os mesmos IDs.
    const listaClientesUI = document.getElementById('lista-clientes');
    if (listaClientesUI) {
        listaClientesUI.addEventListener('click', function(event) {
            const targetButton = event.target.closest('button');
            if (!targetButton) return;
            const clienteId = targetButton.dataset.id;
            if (clienteId) {
                if (targetButton.classList.contains('btn-editar')) abrirModalEditarCliente(clienteId);
                else if (targetButton.classList.contains('btn-deletar')) handleDeletarCliente(clienteId);
                else if (targetButton.classList.contains('btn-detalhes')) handleVerDetalhesCliente(clienteId);
            }
        });
    }

    const listaVeiculosUI = document.getElementById('lista-veiculos');
    if (listaVeiculosUI) {
        listaVeiculosUI.addEventListener('click', function(event) {
            // ... (lógica de eventos para veículos) ...
             const targetButton = event.target.closest('button');
            if (!targetButton) return;
            const veiculoId = targetButton.dataset.id;
            if (veiculoId) {
                if (targetButton.classList.contains('btn-editar-veiculo')) abrirModalEditarVeiculo(veiculoId);
                else if (targetButton.classList.contains('btn-deletar-veiculo')) handleDeletarVeiculo(veiculoId);
                else if (targetButton.classList.contains('btn-detalhes-veiculo')) handleVerDetalhesVeiculo(veiculoId);
            }
        });
    }

    const listaAgendamentosUI = document.getElementById('lista-agendamentos');
    if (listaAgendamentosUI) {
        listaAgendamentosUI.addEventListener('click', function(event) {
            // ... (lógica de eventos para agendamentos) ...
            const targetButton = event.target.closest('button');
            if (!targetButton) return;
            const agendamentoId = targetButton.dataset.id;
            if (agendamentoId) {
                if (targetButton.classList.contains('btn-editar-agendamento')) abrirModalEditarAgendamento(agendamentoId);
                else if (targetButton.classList.contains('btn-deletar-agendamento')) handleDeletarAgendamento(agendamentoId);
                else if (targetButton.classList.contains('btn-detalhes-agendamento')) handleVerDetalhesAgendamento(agendamentoId);
            }
        });
    }

    const listaOrdensServicoUI = document.getElementById('lista-ordens-servico');
    if (listaOrdensServicoUI) {
        listaOrdensServicoUI.addEventListener('click', function(event) {
            // ... (lógica de eventos para OS) ...
            const target = event.target.closest('button');
            if (!target) return;
            const osId = target.dataset.id;
            if (osId) {
                if (target.classList.contains('btn-editar-os')) abrirModalEditarOS(osId);
                else if (target.classList.contains('btn-deletar-os')) handleDeletarOS(osId);
                else if (target.classList.contains('btn-detalhes-os')) {
                    // Armazena o ID da OS no próprio elemento do modal de detalhes
                    // para que os botões "Adicionar Peça/Serviço" possam acessá-lo
                    const osDetalhesModalElement = document.getElementById('osDetalhesItensModal');
                    if(osDetalhesModalElement) osDetalhesModalElement.dataset.currentOsId = osId;
                    handleVerDetalhesOS(osId);
                }
            }
        });
    }

    const osDetalhesModalElement = document.getElementById('osDetalhesItensModal');
    if (osDetalhesModalElement) {
        osDetalhesModalElement.addEventListener('click', function(event) {
            // ... (lógica de eventos dentro do modal de detalhes da OS) ...
            const targetButton = event.target.closest('button');
            if (!targetButton) return;

            // Usa o ID da OS armazenado no próprio modal
            const osId = osDetalhesModalElement.dataset.currentOsId;
            const itemId = targetButton.dataset.itemId;

            if (targetButton.id === 'btnAbrirModalAdicionarPecaOS') {
                if (osId && typeof abrirModalAdicionarPeca === 'function') abrirModalAdicionarPeca(osId);
                else console.error("ID da OS para adicionar peça não disponível (modal).");
            }
            else if (targetButton.id === 'btnAbrirModalAdicionarServicoOS') {
                if (osId && typeof abrirModalAdicionarServico === 'function') abrirModalAdicionarServico(osId);
                else console.error("ID da OS para adicionar serviço não disponível (modal).");
            }
            // As demais condições para editar/deletar itens devem pegar osId e itemId dos data attributes dos próprios botões
            else if (targetButton.classList.contains('btn-editar-item-peca')) {
                const btnOsId = targetButton.dataset.osId; // Pega dos botões específicos
                if (btnOsId && itemId && typeof abrirModalEditarItemPeca === 'function') abrirModalEditarItemPeca(btnOsId, itemId);
            }
            else if (targetButton.classList.contains('btn-editar-item-servico')) {
                 const btnOsId = targetButton.dataset.osId;
                if (btnOsId && itemId && typeof abrirModalEditarItemServico === 'function') abrirModalEditarItemServico(btnOsId, itemId);
            }
            else if (targetButton.classList.contains('btn-deletar-item-peca')) {
                const btnOsId = targetButton.dataset.osId;
                if (btnOsId && itemId && typeof handleDeletarItemPeca === 'function') handleDeletarItemPeca(btnOsId, itemId);
            }
            else if (targetButton.classList.contains('btn-deletar-item-servico')) {
                const btnOsId = targetButton.dataset.osId;
                if (btnOsId && itemId && typeof handleDeletarItemServico === 'function') handleDeletarItemServico(btnOsId, itemId);
            }
        });
    }
}

async function setupApplicationAfterLogin() {
    showMainScreen();
    await loadInitialData();
    setupCommonEventListeners(); // Configura os event listeners após o conteúdo estar visível
}

// --- Inicialização da Aplicação ---
document.addEventListener('DOMContentLoaded', async () => {
    if (formLogin) formLogin.addEventListener('submit', handleLogin);
    if (btnLogout) btnLogout.addEventListener('click', handleLogout);

    const token = localStorage.getItem('access_token');
    if (token) {
        // Opcional: Adicionar verificação de token aqui com /api/token/verify/
        // Se o token for válido, carrega o conteúdo principal.
        // Por agora, vamos assumir que se existe, é válido para simplificar.
        console.log("Token encontrado, carregando app...");
        await setupApplicationAfterLogin();
    } else {
        console.log("Nenhum token encontrado, mostrando login...");
        showLoginScreen();
        // Não configurar outros event listeners se não estiver logado
    }
});

// Se precisar que handleLogout seja acessível de outros módulos que não podem importá-lo diretamente:
// window.appGlobal = { handleLogout };