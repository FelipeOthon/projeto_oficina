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
async function handleResponseError(response) {
    if (response.status === 401) {
        console.warn("Erro 401 em adminPanelService: Não autorizado. Deslogando...");
        handleLogout(); // Chama a função global de logout
    }
    // Tenta obter detalhes do erro do corpo da resposta
    const errData = await response.json().catch(() => ({ detail: `Erro HTTP ${response.status}. Não foi possível obter detalhes do erro.` }));

    let erroMsg = `${response.status}: ${errData.detail || response.statusText || 'Erro desconhecido'}`;

    // Se houver erros de campo específicos do DRF, adiciona-os à mensagem
    if (errData && typeof errData === 'object' && Object.keys(errData).length > 1) {
        const fieldErrors = [];
        for (const field in errData) {
            if (field !== 'detail') { // Não repete o 'detail'
                fieldErrors.push(`${field}: ${Array.isArray(errData[field]) ? errData[field].join(', ') : errData[field]}`);
            }
        }
        if (fieldErrors.length > 0) {
            erroMsg += `\nDetalhes:\n${fieldErrors.join('\n')}`;
        }
    }
    throw new Error(erroMsg);
}

// --- Funções para Admin Gerenciar Usuários ---
const adminUsuariosUrl = `${apiUrlBase}/admin/usuarios/`;

export async function getAdminUsuarios(searchTerm = '') {
    let url = adminUsuariosUrl;
    if (searchTerm && searchTerm.trim() !== '') {
        url += `?search=${encodeURIComponent(searchTerm.trim())}`; // Supondo que o backend suporte busca
    }
    const response = await fetch(url, { headers: getAuthHeaders() });
    if (!response.ok) {
        await handleResponseError(response);
    }
    return await response.json();
}

export async function getAdminUsuarioById(userId) {
    const response = await fetch(`${adminUsuariosUrl}${userId}/`, { headers: getAuthHeaders() });
    if (!response.ok) {
       await handleResponseError(response);
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
        await handleResponseError(response);
    }
    return await response.json();
}

export async function updateAdminUsuario(userId, userData) {
    const response = await fetch(`${adminUsuariosUrl}${userId}/`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData),
    });
    if (!response.ok) {
        await handleResponseError(response);
    }
    return await response.json();
}

export async function deleteAdminUsuarioAPI(userId) {
    const response = await fetch(`${adminUsuariosUrl}${userId}/`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    if (!response.ok && response.status !== 204) { // 204 No Content é sucesso para DELETE
        await handleResponseError(response);
    }
    return true; // Ou response.ok se preferir retornar o status da resposta
}


// --- Função para Mecânico Alterar a Própria Senha ---
const mecanicoChangePasswordUrl = `${apiUrlBase}/usuarios/mudar-senha/`;

export async function mecanicoChangeOwnPassword(passwordData) {
    const response = await fetch(mecanicoChangePasswordUrl, {
        method: 'PUT', // Ou POST, dependendo de como a view está configurada (UpdateAPIView usa PUT)
        headers: getAuthHeaders(),
        body: JSON.stringify(passwordData),
    });
    if (!response.ok) {
        // Aqui, queremos que a mensagem de erro do serializer seja exibida no modal
        const errData = await response.json().catch(() => ({ detail: `Erro HTTP ${response.status}.` }));
        throw errData; // Lança os dados do erro para serem tratados no UI
    }
    return await response.json(); // Para mensagem de sucesso
}