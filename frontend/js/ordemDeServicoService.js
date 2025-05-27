// frontend/js/ordemDeServicoService.js
import { apiUrlBase } from './apiConfig.js';
import { handleLogout } from './main.js'; // Importar handleLogout

const osUrl = `${apiUrlBase}/ordens-servico/`;

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

// Função para lidar com erros de resposta e possível logout em 401
async function handleResponseError(response) {
    if (response.status === 401) {
        console.warn("Erro 401 em ordemDeServicoService: Não autorizado. Deslogando...");
        handleLogout();
    }
    const errData = await response.json().catch(() => ({ detail: `Erro HTTP ${response.status}. Não foi possível obter detalhes do erro do servidor.` }));

    let erroMsg = `${response.status}: ${errData.detail || response.statusText || 'Erro desconhecido ao processar a requisição.'}`;

    if (errData && typeof errData === 'object' && Object.keys(errData).length > 1) {
        const fieldErrors = [];
        for (const field in errData) {
            if (field !== 'detail') {
                fieldErrors.push(`${field}: ${Array.isArray(errData[field]) ? errData[field].join(', ') : errData[field]}`);
            }
        }
        if (fieldErrors.length > 0) {
            erroMsg += `\nDetalhes:\n${fieldErrors.join('\n')}`;
        }
    }
    throw new Error(erroMsg);
}

// MODIFICADO para aceitar searchTerm
export async function getOrdensDeServico(searchTerm = '') {
    let url = osUrl;
    if (searchTerm && searchTerm.trim() !== '') {
        url += `?search=${encodeURIComponent(searchTerm.trim())}`;
    }
    const response = await fetch(url, { headers: getAuthHeaders() });
    if (!response.ok) {
        await handleResponseError(response);
    }
    return await response.json();
}

export async function getOrdemDeServicoById(osId) {
    const response = await fetch(`${osUrl}${osId}/`, { headers: getAuthHeaders() });
    if (!response.ok) {
        await handleResponseError(response);
    }
    return await response.json();
}

export async function createOrdemDeServico(osData) {
    const response = await fetch(osUrl, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(osData),
    });
    if (!response.ok) {
        await handleResponseError(response);
    }
    return await response.json();
}

export async function updateOrdemDeServico(osId, osData) {
    const response = await fetch(`${osUrl}${osId}/`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(osData),
    });
    if (!response.ok) {
        await handleResponseError(response);
    }
    return await response.json();
}

export async function deleteOrdemDeServicoAPI(osId) {
    const response = await fetch(`${osUrl}${osId}/`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    if (!response.ok && response.status !== 204) {
        await handleResponseError(response);
    }
    return true;
}