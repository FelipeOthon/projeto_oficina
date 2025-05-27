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

import {
    renderAdminUsuarios,
    abrirModalNovoAdminUsuario,
    abrirModalEditarAdminUsuario,
    handleSalvarAdminUsuario,
    handleDeletarAdminUsuario,
    handleMecanicoMudarSenha
} from './adminPanelUI.js';

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

const placeholdersBusca = {
    clientes: "Buscar cliente por nome, email, CPF/CNPJ ou telefone...",
    veiculos: "Buscar veículo por placa, marca, modelo, chassi ou nome do cliente...",
    agendamentos: "Buscar agendamento por cliente, veículo, serviço, status ou mecânico...",
    os: "Buscar OS por número, cliente, veículo, status, problema, diagnóstico ou mecânico..."
};

async function verifyTokenAndGetUserData(token) {
    if (!token) {
        console.log("verifyTokenAndGetUserData: Nenhum token fornecido.");
        return null;
    }
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log("verifyTokenAndGetUserData: Payload do token decodificado:", payload);

        const usernameFromPayload = payload.user_id; // SIMPLE JWT USA user_id por padrão.
                                                    // Se você customizou o token para ter 'username', use payload.username

        if (usernameFromPayload === undefined) { // Checa se user_id (ou username) existe no payload
            console.error("verifyTokenAndGetUserData: 'user_id' (ou 'username') não encontrado no payload do token.");
            return { tokenValid: false, username: undefined, userType: undefined };
        }

        // Para exibição, idealmente teríamos o username. Se payload.username não existe,
        // e user_id é um número, precisaremos de outra forma de obter o username real para exibição.
        // Por agora, se payload.username não existir, usernameForDisplay será o user_id.
        const usernameForDisplay = payload.username || String(usernameFromPayload);


        // !!!!! IMPORTANTE: LÓGICA PARA DETERMINAR ADMIN !!!!!
        // Se você usa 'felipeothon' como username do admin, E 'username' está no payload:
        // const userType = (payload.username === 'felipeothon') ? 'admin' : 'mecanico';
        // SE você usa o user_id e sabe que o user_id do admin 'felipeothon' é 1:
        const userType = (payload.user_id === 1 && payload.username === 'felipeothon') ? 'admin' : 'mecanico'; // AJUSTE CONFORME SEU CASO

        console.log(`verifyTokenAndGetUserData: Username/ID do payload: ${usernameFromPayload}, Username para display: ${usernameForDisplay}, UserType determinado: ${userType}`);

        // Validação do token no backend (RECOMENDADO, mas opcional por agora para simplificar)
        /*
        try {
            const verifyResponse = await fetch(`${apiUrlBase}/token/verify/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: token })
            });
            if (!verifyResponse.ok) {
                const errorData = await verifyResponse.json();
                console.warn("verifyTokenAndGetUserData: A verificação do token no backend falhou.", errorData);
                // Mesmo se a verificação falhar (ex: token expirado), ainda retornamos os dados decodificados
                // para que handleLogout possa limpar o localStorage, mas marcamos como tokenValid: false.
                return { username: usernameForDisplay, userType, tokenValid: false };
            }
            console.log("verifyTokenAndGetUserData: Token verificado com sucesso no backend.");
            return { username: usernameForDisplay, userType, tokenValid: true };
        } catch (verifyError) {
            console.error("verifyTokenAndGetUserData: Erro ao tentar verificar token no backend:", verifyError);
            return { username: usernameForDisplay, userType, tokenValid: false };
        }
        */
       // Sem a chamada de verificação explícita acima, assumimos que a decodificação é o suficiente por agora.
       // Mas um token decodificável PODE estar expirado.
        return { username: usernameForDisplay, userType, tokenValid: true };


    } catch (e) {
        console.error("verifyTokenAndGetUserData: Erro ao decodificar token ou token já inválido (malformado/corrompido):", e);
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
    console.log(`Tentando login com username: ${usernameVal}`);

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
            console.log("Tokens salvos no localStorage após login.");

            const userData = await verifyTokenAndGetUserData(data.access);

            if (userData && userData.tokenValid && userData.username) { // userData.username é o usernameForDisplay
                localStorage.setItem('username', userData.username);
                localStorage.setItem('user_type', userData.userType);
                console.log(`Login bem-sucedido. Username: ${userData.username}, UserType: ${userData.userType} salvos no localStorage.`);

                if(usernameInput) usernameInput.value = '';
                if(passwordInput) passwordInput.value = '';
                await setupApplicationAfterLogin();
            } else {
                console.error("Token obtido no login parece inválido ou dados do usuário (username) não puderam ser processados a partir do token.", userData);
                handleLogout();
                if (loginErrorDiv) {
                    loginErrorDiv.textContent = "Erro ao processar informações do usuário após login.";
                    loginErrorDiv.style.display = 'block';
                }
            }
        } else {
            const errorMessage = data.detail || `Usuário ou senha inválidos (status: ${response.status}).`;
            console.error("Erro de login:", errorMessage, data);
            if (loginErrorDiv) {
                loginErrorDiv.textContent = errorMessage;
                loginErrorDiv.style.display = 'block';
            } else {
                alert(errorMessage);
            }
        }
    } catch (error) {
        console.error('Erro na requisição de login:', error);
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
    console.log("Executando logout...");
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_type');
    localStorage.removeItem('username');
    if (userInfoSpan) userInfoSpan.innerHTML = '';
    showLoginScreen();
}

function showMainScreen() {
    if (loginContainer) loginContainer.style.display = 'none';
    if (mainContentWrapper) mainContentWrapper.style.display = 'block';
}

function showLoginScreen() {
    if (loginContainer) loginContainer.style.display = 'block';
    if (mainContentWrapper) mainContentWrapper.style.display = 'none';
    if(inputBuscaGlobal) inputBuscaGlobal.value = '';
    const adminPanelSection = document.getElementById('admin-panel-section');
    if(adminPanelSection) adminPanelSection.style.display = 'none';
    const adminUsuariosOption = document.querySelector("#selectTipoBusca option[value='admin_usuarios']");
    if (adminUsuariosOption) adminUsuariosOption.remove();
    if(selectTipoBusca && selectTipoBusca.options.length > 0) { // Garante que há opções antes de tentar definir o valor
        selectTipoBusca.value = 'clientes';
    }
    atualizarPlaceholderBuscaGlobal();
}

async function loadInitialData(tipo = 'clientes', searchTerm = '') {
    const token = localStorage.getItem('access_token');
    const currentUsername = localStorage.getItem('username');
    const currentUserType = localStorage.getItem('user_type');

    if (!token || currentUsername === null || currentUserType === null) { // Checa explicitamente por null se username/userType não forem achados
        console.warn("loadInitialData: Token, username ou userType ausentes do localStorage. Deslogando.");
        handleLogout();
        return;
    }

    console.log(`loadInitialData - Tipo: ${tipo}, Termo: ${searchTerm || "Nenhum"}, Usuário: ${currentUsername} (${currentUserType})`);
    try {
        switch (tipo) {
            case 'clientes': await renderClientes(searchTerm); break;
            case 'veiculos': await renderVeiculos(searchTerm); break;
            case 'agendamentos': await renderAgendamentos(searchTerm); break;
            case 'os': await renderOrdensDeServico(searchTerm); break;
            case 'admin_usuarios':
                 if (currentUserType === 'admin') await renderAdminUsuarios(searchTerm);
                 else console.warn("Tentativa de carregar admin_usuarios por usuário não admin.");
                 break;
            default:
                console.warn(`loadInitialData: Tipo de busca desconhecido '${tipo}'. Carregando clientes.`);
                await renderClientes(searchTerm);
        }

        if (!searchTerm && tipo === 'clientes' && mainContentWrapper.style.display === 'block') {
             console.log("loadInitialData: Carregando listas adicionais em paralelo (carga inicial e tela principal visível).");
             const promises = [renderVeiculos(), renderAgendamentos(), renderOrdensDeServico()];
             if (currentUserType === 'admin') {
                // Evita chamar renderAdminUsuarios duas vezes se a aba já for admin_usuarios
                if (selectTipoBusca && selectTipoBusca.value !== 'admin_usuarios') {
                    promises.push(renderAdminUsuarios());
                }
             }
             await Promise.all(promises);
        }
    } catch (error) {
        console.error(`Erro ao carregar dados para tipo '${tipo}':`, error);
    }
}

function atualizarPlaceholderBuscaGlobal() {
    if (selectTipoBusca && inputBuscaGlobal) {
        const tipoSelecionado = selectTipoBusca.value;
        if (tipoSelecionado === 'admin_usuarios') {
            inputBuscaGlobal.placeholder = "Buscar usuário por username, nome ou email...";
        } else {
            inputBuscaGlobal.placeholder = placeholdersBusca[tipoSelecionado] || "Digite para buscar...";
        }
    }
}

async function executarBuscaGlobal() {
    if (!selectTipoBusca || !inputBuscaGlobal) return;
    const tipo = selectTipoBusca.value;
    const termo = inputBuscaGlobal.value.trim();
    console.log(`Executando busca global em '${tipo}' por '${termo}'`);
    const listaId = (tipo === 'admin_usuarios') ? 'lista-admin-usuarios' : `lista-${tipo}`;
    const listaUI = document.getElementById(listaId);
    if (listaUI) {
        listaUI.innerHTML = `<li class="list-group-item">Buscando ${tipo.replace('_', ' ')}...</li>`;
    } else {
        console.warn(`Elemento de lista com ID '${listaId}' não encontrado para busca global.`);
    }
    await loadInitialData(tipo, termo);
}

function limparBuscaGlobalEAtualizar() {
    if (!selectTipoBusca || !inputBuscaGlobal) return;
    inputBuscaGlobal.value = '';
    const tipo = selectTipoBusca.value;
    console.log(`Limpando busca e atualizando para tipo: ${tipo}`);
    loadInitialData(tipo);
}

function setupBuscaGlobalListeners() {
    if (selectTipoBusca) {
        selectTipoBusca.addEventListener('change', () => {
            console.log("Tipo de busca alterado para:", selectTipoBusca.value);
            atualizarPlaceholderBuscaGlobal();
            if(inputBuscaGlobal) inputBuscaGlobal.value = '';
            executarBuscaGlobal();
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

function setupCommonEventListeners() {
    // ... (todos os seus event listeners para botões de CRUD etc. permanecem aqui) ...
    // Certifique-se que os listeners para 'btnNovoUsuarioAdmin', 'btnSalvarAdminUsuario',
    // e 'btnSalvarNovaSenhaMecanico' estão aqui e corretos.

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
            else if (id && targetButton.classList.contains('btn-deletar-admin-usuario')) handleDeletarAdminUsuario(id);

            const osDetalhesModalElement = document.getElementById('osDetalhesItensModal');
            if (osDetalhesModalElement && osDetalhesModalElement.contains(targetButton)) {
                const osIdContext = osDetalhesModalElement.dataset.currentOsId;
                const itemId = targetButton.dataset.itemId;
                if (targetButton.id === 'btnAbrirModalAdicionarPecaOS' && osIdContext) abrirModalAdicionarPeca(osIdContext);
                else if (targetButton.id === 'btnAbrirModalAdicionarServicoOS' && osIdContext) abrirModalAdicionarServico(osIdContext);
                else if (itemId) {
                    const osIdFromButton = targetButton.dataset.osId;
                    if (targetButton.classList.contains('btn-editar-item-peca')) abrirModalEditarItemPeca(osIdFromButton, itemId);
                    else if (targetButton.classList.contains('btn-editar-item-servico')) abrirModalEditarItemServico(osIdFromButton, itemId);
                    else if (targetButton.classList.contains('btn-deletar-item-peca')) handleDeletarItemPeca(osIdFromButton, itemId);
                    else if (targetButton.classList.contains('btn-deletar-item-servico')) handleDeletarItemServico(osIdFromButton, itemId);
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

async function setupApplicationAfterLogin() {
    console.log("Executando setupApplicationAfterLogin...");
    showMainScreen();

    const username = localStorage.getItem('username');
    const userType = localStorage.getItem('user_type');
    console.log(`setupApplicationAfterLogin - Valores atuais do localStorage - Username: ${username}, UserType: ${userType}`);

    if (!username || !userType) {
        console.error("setupApplicationAfterLogin: Username ou UserType NÃO ENCONTRADOS no localStorage. Isso não deveria acontecer após um login bem-sucedido. Deslogando.");
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
    } else {
        console.warn("Elemento userInfoSpan não encontrado no DOM.");
    }

    const adminPanelSection = document.getElementById('admin-panel-section');
    let adminUsuariosOption = document.querySelector("#selectTipoBusca option[value='admin_usuarios']");

    if (userType === 'admin') {
        console.log("Usuário é admin. Configurando painel e opção de busca.");
        if (adminPanelSection) adminPanelSection.style.display = 'block';
        if (selectTipoBusca && !adminUsuariosOption) {
            const option = document.createElement('option');
            option.value = 'admin_usuarios';
            option.textContent = 'Usuários (Admin)';
            selectTipoBusca.appendChild(option);
        }
    } else {
        console.log("Usuário não é admin. Ocultando painel e removendo opção de busca.");
        if (adminPanelSection) adminPanelSection.style.display = 'none';
        if (adminUsuariosOption) adminUsuariosOption.remove();
    }

    atualizarPlaceholderBuscaGlobal(); // Atualiza o placeholder DEPOIS de mexer nas options

    const tipoBuscaInicial = selectTipoBusca ? selectTipoBusca.value : 'clientes';
    console.log("Carregando dados iniciais para a aba selecionada:", tipoBuscaInicial);
    await loadInitialData(tipoBuscaInicial);
}


document.addEventListener('DOMContentLoaded', async () => {
    console.log("DOM completamente carregado e parseado.");
    if (formLogin) formLogin.addEventListener('submit', handleLogin);
    if (btnLogout) btnLogout.addEventListener('click', handleLogout);

    setupCommonEventListeners();
    setupBuscaGlobalListeners();

    const token = localStorage.getItem('access_token');
    if (token) {
        console.log("Token encontrado no localStorage na carga inicial. Verificando...");
        const userData = await verifyTokenAndGetUserData(token);

        if (userData && userData.tokenValid && userData.username) {
            localStorage.setItem('username', userData.username); // Garante que username está atualizado
            localStorage.setItem('user_type', userData.userType); // Garante que userType está atualizado
            console.log("Token verificado na carga inicial. Username e UserType definidos/confirmados no localStorage. Configurando aplicação...");
            await setupApplicationAfterLogin();
        } else {
            console.warn("Token encontrado na carga inicial mas inválido ou dados do usuário (username) não puderam ser obtidos do token. Deslogando.");
            handleLogout();
        }
    } else {
        console.log("Nenhum token encontrado no localStorage na carga inicial. Mostrando tela de login.");
        showLoginScreen();
    }
});