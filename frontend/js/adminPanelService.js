// frontend/js/adminPanelService.js
import { apiUrlBase } from './apiConfig.js';
import { handleLogout } from './main.js'; // Para deslogar em caso de 401

// Função auxiliar para obter headers de autenticação
function getAuthHeaders() {
    const token = localStorage.getItem('access_token');
    const headers = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}

// Função para lidar com erros de resposta
async function handleResponseError(response, defaultErrorMessage = 'Erro desconhecido') {
    if (response.status === 401) {
        console.warn(`Erro 401 em adminPanelService: Não autorizado. Deslogando...`);
        handleLogout(); // Chama a função global de logout
    }

    let errorData;
    try {
        errorData = await response.json();
    } catch (e) {
        errorData = { detail: `Erro HTTP ${response.status}. ${defaultErrorMessage}` };
    }

    let erroMsg = `${response.status}: ${errorData.detail || response.statusText || defaultErrorMessage}`;

    if (errorData && typeof errorData === 'object' && Object.keys(errorData).length > (errorData.detail ? 1: 0) ) {
        const fieldErrors = [];
        for (const field in errorData) {
            if (field !== 'detail') {
                fieldErrors.push(`${field.replace("_", " ")}: ${Array.isArray(errorData[field]) ? errorData[field].join(', ') : errorData[field]}`);
            }
        }
        if (fieldErrors.length > 0) {
            erroMsg = `Por favor, corrija os seguintes erros:\n${fieldErrors.join('\n')}`;
            // Se também houver um 'detail', adiciona-o (caso não seja a mensagem principal)
            if (errorData.detail && !erroMsg.includes(errorData.detail)) {
                 erroMsg = `${errorData.detail}\n${erroMsg}`;
            }
        }
    }
    // Se a mensagem de erro ainda for genérica e houver um detail, usa o detail.
    if ((erroMsg.startsWith("400:") || erroMsg.startsWith("500:")) && errorData.detail) {
        erroMsg = errorData.detail;
    }
    throw new Error(erroMsg);
}


// --- Funções para Admin Gerenciar Usuários ---
const adminUsuariosUrl = `${apiUrlBase}/admin/usuarios/`;

export async function getAdminUsuarios(searchTerm = '') {
    let url = adminUsuariosUrl;
    if (searchTerm && searchTerm.trim() !== '') {
        url += `?search=${encodeURIComponent(searchTerm.trim())}`;
    }
    const response = await fetch(url, { headers: getAuthHeaders() });
    if (!response.ok) {
        await handleResponseError(response, "Falha ao buscar usuários.");
    }
    return await response.json();
}

export async function getAdminUsuarioById(userId) {
    const response = await fetch(`${adminUsuariosUrl}${userId}/`, { headers: getAuthHeaders() });
    if (!response.ok) {
       await handleResponseError(response, `Falha ao buscar usuário ID: ${userId}.`);
    }
    return await response.json();
}

export async function createAdminUsuario(userData) {
    const response = await fetch(adminUsuariosUrl, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData),
    });
    if (!response.ok) {
        // Lança o objeto de erro do DRF diretamente para tratamento no UI
        const errData = await response.json().catch(() => ({ detail: `Erro HTTP ${response.status} ao criar usuário.` }));
        throw errData;
    }
    return await response.json();
}

export async function updateAdminUsuario(userId, userData) {
    const response = await fetch(`${adminUsuariosUrl}${userId}/`, {
        method: 'PATCH', // <<< ALTERADO DE PUT PARA PATCH
        headers: getAuthHeaders(),
        body: JSON.stringify(userData),
    });
    if (!response.ok) {
        const errData = await response.json().catch(() => ({ detail: `Erro HTTP ${response.status} ao atualizar usuário.` }));
        throw errData; // Lança o objeto de erro do DRF diretamente
    }
    return await response.json();
}

// Esta função agora será usada para DESATIVAR um usuário (o backend trata o soft delete)
export async function deleteAdminUsuarioAPI(userId) {
    const response = await fetch(`${adminUsuariosUrl}${userId}/`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    if (!response.ok && response.status !== 204) {
        await handleResponseError(response, `Falha ao desativar usuário ID: ${userId}.`);
    }
    return true;
}


// --- Função para Mecânico Alterar a Própria Senha ---
const mecanicoChangePasswordUrl = `${apiUrlBase}/usuarios/mudar-senha/`;

export async function mecanicoChangeOwnPassword(passwordData) {
    const response = await fetch(mecanicoChangePasswordUrl, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(passwordData),
    });
    if (!response.ok) {
        const errData = await response.json().catch(() => ({ detail: `Erro HTTP ${response.status} ao alterar senha.` }));
        throw errData;
    }
    return await response.json();
}