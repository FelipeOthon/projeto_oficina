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
    // renderAgendamentos, // Removida importação da função antiga
    inicializarCalendarioAgendamentos, // Adicionada importação da nova função
    abrirModalNovoAgendamento, handleSalvarAgendamento,
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
import {
    renderAdminUsuarios,
    abrirModalNovoAdminUsuario,
    abrirModalEditarAdminUsuario,
    handleSalvarAdminUsuario,
    handleToggleUserActiveStateAdmin,
    handleMecanicoMudarSenha
} from './adminPanelUI.js';
import { setupRelatoriosListeners } from './relatoriosUI.js';

const loginContainer = document.getElementById('login-container');
const mainContentWrapper = document.getElementById('main-content-wrapper');
const formLogin = document.getElementById('formLogin');
const btnLogout = document.getElementById('btnLogout');
const loginErrorDiv = document.getElementById('loginError');
const userInfoSpan = document.getElementById('userInfo');
const selectTipoBusca = document.getElementById('selectTipoBusca');
const inputBuscaGlobal = document.getElementById('inputBuscaGlobal');
const btnLimparBuscaGlobal = document.getElementById('btnLimparBuscaGlobal');
let debounceTimerGlobal;

window.fullCalendarInstance = null;

const placeholdersBusca = {
    clientes: "Buscar cliente por nome, email, CPF/CNPJ ou telefone...",
    veiculos: "Buscar veículo por placa, marca, modelo, chassi ou nome do cliente...",
    agendamentos: "Filtros de agendamento serão aplicados no calendário.",
    os: "Buscar OS por número, cliente, veículo, status, problema, diagnóstico ou mecânico..."
};

async function verifyTokenAndGetUserData(token, usernameFromContext = null) {
    if (!token) {
        return null;
    }
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userIdFromPayload = payload.user_id;

        if (userIdFromPayload === undefined) {
            console.error("verifyTokenAndGetUserData: 'user_id' não encontrado no payload.");
            return { tokenValid: false, username: undefined, userType: undefined };
        }
        const usernameForDisplay = payload.username || usernameFromContext || String(userIdFromPayload);
        const userType = (String(userIdFromPayload) === '1' || usernameForDisplay.toLowerCase() === 'felipeothon') ? 'admin' : 'mecanico';
        return { username: usernameForDisplay, userType, tokenValid: true };
    } catch (e) {
        console.error("verifyTokenAndGetUserData: Erro ao decodificar token:", e);
        return { tokenValid: false, username: undefined, userType: undefined };
    }
}

async function handleLogin(event) {
    event.preventDefault();
    const usernameInput = document.getElementById('loginUsername');
    const passwordInput = document.getElementById('loginPassword');
    const usernameVal = usernameInput.value;
    const password = passwordInput.value;

    if (loginErrorDiv) loginErrorDiv.style.display = 'none';

    try {
        const response = await fetch(`${apiUrlBase}/token/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: usernameVal, password }),
        });
        const data = await response.json();

        if (response.ok && data.access) {
            localStorage.setItem('access_token', data.access);
            localStorage.setItem('refresh_token', data.refresh);
            const userData = await verifyTokenAndGetUserData(data.access, usernameVal);

            if (userData && userData.tokenValid && userData.username) {
                localStorage.setItem('username', userData.username);
                localStorage.setItem('user_type', userData.userType);
                if(usernameInput) usernameInput.value = '';
                if(passwordInput) passwordInput.value = '';
                await setupApplicationAfterLogin();
            } else {
                handleLogout();
                if (loginErrorDiv) {
                    loginErrorDiv.textContent = "Erro ao processar informações do usuário.";
                    loginErrorDiv.style.display = 'block';
                }
            }
        } else {
            const errorMessage = data.detail || `Usuário ou senha inválidos.`;
            if (loginErrorDiv) {
                loginErrorDiv.textContent = errorMessage;
                loginErrorDiv.style.display = 'block';
            } else { alert(errorMessage); }
        }
    } catch (error) {
        console.error('Erro na requisição de login:', error);
        if (loginErrorDiv) {
            loginErrorDiv.textContent = 'Erro de conexão ao tentar fazer login.';
            loginErrorDiv.style.display = 'block';
        } else { alert('Erro de conexão.'); }
    }
}

export function handleLogout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_type');
    localStorage.removeItem('username');
    if (userInfoSpan) userInfoSpan.innerHTML = '';
    if (window.fullCalendarInstance) {
        window.fullCalendarInstance.destroy();
        window.fullCalendarInstance = null;
        calendarioAgendamentosPronto = false;
    }
    showLoginScreen();
}

function showMainScreen() {
    if (loginContainer) loginContainer.style.display = 'none';
    if (mainContentWrapper) mainContentWrapper.style.display = 'block';
}

function showLoginScreen() {
    if (loginContainer) loginContainer.style.display = 'block';
    if (mainContentWrapper) mainContentWrapper.style.display = 'none';
    if(inputBuscaGlobal) {
        inputBuscaGlobal.value = '';
        inputBuscaGlobal.disabled = false;
    }
    const adminPanelSection = document.getElementById('admin-panel-section');
    if(adminPanelSection) adminPanelSection.style.display = 'none';
    const adminUsuariosOption = document.querySelector("#selectTipoBusca option[value='admin_usuarios']");
    if (adminUsuariosOption) adminUsuariosOption.remove();
    if(selectTipoBusca && selectTipoBusca.options.length > 0) {
        if (selectTipoBusca.value === 'admin_usuarios') {
             selectTipoBusca.value = 'clientes';
        }
    }
    atualizarPlaceholderBuscaGlobal();
}

let calendarioAgendamentosPronto = false;

async function loadInitialData(tipo = 'clientes', searchTerm = '') {
    const token = localStorage.getItem('access_token');
    const currentUsername = localStorage.getItem('username');
    const currentUserType = localStorage.getItem('user_type');

    if (!token || !currentUsername || !currentUserType) {
        handleLogout();
        return;
    }
    try {
        if (tipo === 'agendamentos') {
            if (calendarioAgendamentosPronto && window.fullCalendarInstance) {
                 window.fullCalendarInstance.refetchEvents();
            } else if (typeof inicializarCalendarioAgendamentos === "function" && !calendarioAgendamentosPronto) {
                // Só inicializa se não estiver pronto. A chamada principal é em setupApplicationAfterLogin
                // console.log("loadInitialData chamando inicializarCalendarioAgendamentos pois não estava pronto.");
                // window.fullCalendarInstance = inicializarCalendarioAgendamentos();
                // calendarioAgendamentosPronto = true;
            }
        } else {
            switch (tipo) {
                case 'clientes': await renderClientes(searchTerm); break;
                case 'veiculos': await renderVeiculos(searchTerm); break;
                case 'os': await renderOrdensDeServico(searchTerm); break;
                case 'admin_usuarios':
                     if (currentUserType === 'admin') await renderAdminUsuarios(searchTerm);
                     break;
                default:
                     console.warn(`loadInitialData: Tipo de busca desconhecido '${tipo}'. Carregando clientes.`);
                     await renderClientes(searchTerm);
            }
        }
    } catch (error) {
        console.error(`Erro ao carregar dados para tipo '${tipo}' com termo '${searchTerm}':`, error);
    }
}

function atualizarPlaceholderBuscaGlobal() {
    if (selectTipoBusca && inputBuscaGlobal) {
        const tipoSelecionado = selectTipoBusca.value;
        if (tipoSelecionado === 'admin_usuarios') {
            inputBuscaGlobal.placeholder = "Buscar usuário por username, nome ou email...";
            inputBuscaGlobal.disabled = false;
        } else if (tipoSelecionado === 'agendamentos'){
            inputBuscaGlobal.placeholder = "Filtros e navegação direto no calendário.";
            inputBuscaGlobal.disabled = true;
        } else {
            inputBuscaGlobal.disabled = false;
            inputBuscaGlobal.placeholder = placeholdersBusca[tipoSelecionado] || "Digite para buscar...";
        }
    }
}

async function executarBuscaGlobal() {
    if (!selectTipoBusca || !inputBuscaGlobal) return;
    const tipo = selectTipoBusca.value;
    const termo = inputBuscaGlobal.value.trim();

    if (tipo === 'agendamentos') {
        console.log("Busca global para agendamentos: Ações são feitas no calendário.");
        return;
    }
    const listaId = (tipo === 'admin_usuarios') ? 'lista-admin-usuarios' : `lista-${tipo.replace('os', 'ordens-servico')}`;
    const listaUI = document.getElementById(listaId);
    if (listaUI) {
        listaUI.innerHTML = `<li class="list-group-item">Buscando ${tipo.replace('_', ' ')}...</li>`;
    }
    await loadInitialData(tipo, termo);
}

function limparBuscaGlobalEAtualizar() {
    if (!selectTipoBusca || !inputBuscaGlobal) return;
    inputBuscaGlobal.value = '';
    const tipo = selectTipoBusca.value;
    if (tipo === 'agendamentos') {
        // Nenhuma ação específica de recarga para o calendário ao limpar a busca global (que está desabilitada)
    } else {
        loadInitialData(tipo);
    }
    if (inputBuscaGlobal && !inputBuscaGlobal.disabled) {
        inputBuscaGlobal.focus();
    }
}

function setupBuscaGlobalListeners() {
    if (selectTipoBusca) {
        selectTipoBusca.addEventListener('change', () => {
            atualizarPlaceholderBuscaGlobal();
            const tipoSelecionado = selectTipoBusca.value;
            if(inputBuscaGlobal) inputBuscaGlobal.value = '';

            if(tipoSelecionado !== 'agendamentos') {
                executarBuscaGlobal();
            } else {
                 // Se mudou para agendamentos, o calendário já deve ter sido inicializado
                 // por setupApplicationAfterLogin. Apenas garante que esteja visível.
                 // Se quiser recarregar os eventos sempre que mudar para a aba agendamentos:
                 if (calendarioAgendamentosPronto && window.fullCalendarInstance) {
                    //  window.fullCalendarInstance.refetchEvents();
                 }
            }
            if(inputBuscaGlobal && !inputBuscaGlobal.disabled) inputBuscaGlobal.focus();
        });
    }
    if (inputBuscaGlobal) {
        inputBuscaGlobal.addEventListener('keyup', () => {
            if(selectTipoBusca.value === 'agendamentos' || inputBuscaGlobal.disabled) return;
            clearTimeout(debounceTimerGlobal);
            debounceTimerGlobal = setTimeout(executarBuscaGlobal, 500);
        });
    }
    if (btnLimparBuscaGlobal) {
        btnLimparBuscaGlobal.addEventListener('click', limparBuscaGlobalEAtualizar);
    }
}

function setupCommonEventListeners() {
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
            populateVeiculosParaAgendamentoDropdown(this.value, null);
        });
    }

    const btnNovaOS = document.getElementById('btnNovaOS');
    if (btnNovaOS) btnNovaOS.addEventListener('click', abrirModalNovaOS);
    const btnSalvarOS = document.getElementById('btnSalvarOS');
    if (btnSalvarOS) btnSalvarOS.addEventListener('click', handleSalvarOS);
    const osClienteSelect = document.getElementById('osCliente');
    if (osClienteSelect) {
        osClienteSelect.addEventListener('change', function() {
            populateVeiculosParaOS(this.value, null);
        });
    }

    const btnSalvarItemPeca = document.getElementById('btnSalvarItemPeca');
    if (btnSalvarItemPeca) btnSalvarItemPeca.addEventListener('click', handleSalvarItemPeca);
    const btnSalvarItemServico = document.getElementById('btnSalvarItemServico');
    if (btnSalvarItemServico) btnSalvarItemServico.addEventListener('click', handleSalvarItemServico);

    const btnNovoUsuarioAdmin = document.getElementById('btnNovoUsuarioAdmin');
    if (btnNovoUsuarioAdmin) btnNovoUsuarioAdmin.addEventListener('click', abrirModalNovoAdminUsuario);
    const btnSalvarAdminUsuario = document.getElementById('btnSalvarAdminUsuario');
    if (btnSalvarAdminUsuario) btnSalvarAdminUsuario.addEventListener('click', handleSalvarAdminUsuario);
    const btnSalvarNovaSenhaMecanico = document.getElementById('btnSalvarNovaSenhaMecanico');
    if(btnSalvarNovaSenhaMecanico) btnSalvarNovaSenhaMecanico.addEventListener('click', handleMecanicoMudarSenha);

    const mainContainer = document.getElementById('main-content-wrapper');
    if (mainContainer) {
        mainContainer.addEventListener('click', function(event) {
            const targetButton = event.target.closest('button');
            if (!targetButton) return;
            const id = targetButton.dataset.id;

            if (id && targetButton.classList.contains('btn-editar')) abrirModalEditarCliente(id);
            else if (id && targetButton.classList.contains('btn-deletar')) handleDeletarCliente(id);
            else if (id && targetButton.classList.contains('btn-detalhes')) handleVerDetalhesCliente(id);
            else if (id && targetButton.classList.contains('btn-editar-veiculo')) abrirModalEditarVeiculo(id);
            else if (id && targetButton.classList.contains('btn-deletar-veiculo')) handleDeletarVeiculo(id);
            else if (id && targetButton.classList.contains('btn-detalhes-veiculo')) handleVerDetalhesVeiculo(id);
            else if (id && targetButton.classList.contains('btn-editar-agendamento')) abrirModalEditarAgendamento(id);
            else if (id && targetButton.classList.contains('btn-deletar-agendamento')) handleDeletarAgendamento(id);
            else if (id && targetButton.classList.contains('btn-detalhes-agendamento')) handleVerDetalhesAgendamento(id);
            else if (id && targetButton.classList.contains('btn-editar-os')) abrirModalEditarOS(id);
            else if (id && targetButton.classList.contains('btn-deletar-os')) handleDeletarOS(id);
            else if (id && targetButton.classList.contains('btn-detalhes-os')) {
                const osDetalhesModalElement = document.getElementById('osDetalhesItensModal');
                if(osDetalhesModalElement) osDetalhesModalElement.dataset.currentOsId = id;
                handleVerDetalhesOS(id);
            }
            else if (id && targetButton.classList.contains('btn-editar-admin-usuario')) abrirModalEditarAdminUsuario(id);
            else if (id && targetButton.classList.contains('btn-toggle-status-admin-usuario')) {
                const currentStatus = targetButton.dataset.currentIsActive;
                handleToggleUserActiveStateAdmin(id, currentStatus);
            }

            const osDetalhesModalElement = document.getElementById('osDetalhesItensModal');
            if (osDetalhesModalElement && osDetalhesModalElement.contains(targetButton)) {
                const osIdContext = osDetalhesModalElement.dataset.currentOsId;
                const itemId = targetButton.dataset.itemId;
                if (targetButton.id === 'btnAbrirModalAdicionarPecaOS' && osIdContext) abrirModalAdicionarPeca(osIdContext);
                else if (targetButton.id === 'btnAbrirModalAdicionarServicoOS' && osIdContext) abrirModalAdicionarServico(osIdContext);
                else if (itemId && osIdContext) {
                    if (targetButton.classList.contains('btn-editar-item-peca')) abrirModalEditarItemPeca(osIdContext, itemId);
                    else if (targetButton.classList.contains('btn-editar-item-servico')) abrirModalEditarItemServico(osIdContext, itemId);
                    else if (targetButton.classList.contains('btn-deletar-item-peca')) handleDeletarItemPeca(osIdContext, itemId);
                    else if (targetButton.classList.contains('btn-deletar-item-servico')) handleDeletarItemServico(osIdContext, itemId);
                }
            }
        });
    }

    document.addEventListener('click', function(event) {
        if (event.target && event.target.id === 'btnAbrirModalMudarSenhaMecanico') {
            const changePasswordModal = $('#mecanicoChangePasswordModal');
            if (changePasswordModal.length) {
                const form = document.getElementById('formMecanicoChangePassword');
                const errorDiv = document.getElementById('changePasswordError');
                if(form) form.reset();
                if(errorDiv) errorDiv.style.display = 'none';
                changePasswordModal.modal('show');
            }
        }
    });
}

// FUNÇÃO ATUALIZADA
async function setupApplicationAfterLogin() {
    showMainScreen();

    const username = localStorage.getItem('username');
    const userType = localStorage.getItem('user_type');

    if (!username || !userType) {
        console.error("setupApplicationAfterLogin: Dados de sessão ausentes. Deslogando.");
        handleLogout();
        return;
    }

    if (userInfoSpan) {
        userInfoSpan.innerHTML = `Usuário: <strong>${username}</strong> (${userType}) `;
        const oldChangePassButton = document.getElementById('btnAbrirModalMudarSenhaMecanico');
        if (oldChangePassButton) oldChangePassButton.remove();
        if (userType === 'mecanico') {
            const changePassButton = document.createElement('button');
            changePassButton.className = 'btn btn-sm btn-outline-info ml-2';
            changePassButton.id = 'btnAbrirModalMudarSenhaMecanico';
            changePassButton.textContent = 'Alterar Senha';
            userInfoSpan.appendChild(changePassButton);
        }
    }

    const adminPanelSection = document.getElementById('admin-panel-section');
    let adminUsuariosOption = document.querySelector("#selectTipoBusca option[value='admin_usuarios']");

    if (userType === 'admin') {
        if (adminPanelSection) adminPanelSection.style.display = 'block';
        if (selectTipoBusca && !adminUsuariosOption) {
            const option = document.createElement('option');
            option.value = 'admin_usuarios';
            option.textContent = 'Usuários (Admin)';
            selectTipoBusca.appendChild(option);
        }
    } else {
        if (adminPanelSection) adminPanelSection.style.display = 'none';
        if (adminUsuariosOption) adminUsuariosOption.remove();
    }

    atualizarPlaceholderBuscaGlobal();

    if (userType !== 'admin' && selectTipoBusca && selectTipoBusca.value === 'admin_usuarios') {
        selectTipoBusca.value = 'clientes';
    }
    const tipoBuscaInicial = selectTipoBusca ? selectTipoBusca.value : 'clientes';
    // console.log("Aba inicial selecionada para carregamento:", tipoBuscaInicial);

    // 1. Carrega os dados da aba inicial (se não for 'agendamentos')
    if (tipoBuscaInicial !== 'agendamentos') {
        await loadInitialData(tipoBuscaInicial);
    }

    // 2. Inicializa o calendário (será feito apenas uma vez aqui)
    if (!calendarioAgendamentosPronto && typeof inicializarCalendarioAgendamentos === "function") {
        // console.log("Inicializando o calendário de agendamentos em setupApplicationAfterLogin...");
        window.fullCalendarInstance = inicializarCalendarioAgendamentos();
        calendarioAgendamentosPronto = true;
    }
    // Se a aba inicial for 'agendamentos', o calendário já está pronto.
    // Se loadInitialData foi chamado para 'agendamentos', ele pode ter tentado refetch, o que é ok.

    // 3. Carrega as outras seções principais em paralelo
    // console.log("Iniciando carregamento paralelo de outras seções...");
    const promisesToLoadInParallel = [];
    const todasAsSecoes = {
        'clientes': renderClientes,
        'veiculos': renderVeiculos,
        'os': renderOrdensDeServico,
        'admin_usuarios': userType === 'admin' ? renderAdminUsuarios : null
    };

    for (const secao in todasAsSecoes) {
        if (secao !== tipoBuscaInicial && secao !== 'agendamentos' && todasAsSecoes[secao]) {
            // console.log(`Adicionando ${secao} ao carregamento paralelo.`);
            promisesToLoadInParallel.push(todasAsSecoes[secao]().catch(e => console.error(`Erro ao renderizar ${secao} em paralelo:`, e)));
        }
    }

    if (promisesToLoadInParallel.length > 0) {
        await Promise.all(promisesToLoadInParallel);
        // console.log("Carregamento paralelo concluído.");
    } else {
        // console.log("Nenhuma seção adicional para carregamento paralelo ou aba de agendamentos é a inicial.");
    }
}


document.addEventListener('DOMContentLoaded', async () => {
    // console.log("DOM completamente carregado e parseado.");
    if (formLogin) formLogin.addEventListener('submit', handleLogin);
    if (btnLogout) btnLogout.addEventListener('click', handleLogout);

    setupCommonEventListeners();
    setupBuscaGlobalListeners();

    if (typeof setupRelatoriosListeners === "function") { // Configura listeners dos relatórios
        setupRelatoriosListeners();
    }

    const token = localStorage.getItem('access_token');
    if (token) {
        const usernameFromStorage = localStorage.getItem('username');
        const userData = await verifyTokenAndGetUserData(token, usernameFromStorage);

        if (userData && userData.tokenValid && userData.username) {
            localStorage.setItem('username', userData.username);
            localStorage.setItem('user_type', userData.userType);
            await setupApplicationAfterLogin();
        } else {
            console.warn("Token inválido ou dados do usuário não obtidos na carga. Deslogando.");
            handleLogout();
        }
    } else {
        showLoginScreen();
    }
});