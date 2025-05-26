// frontend/js/veiculoService.js
import { apiUrlBase } from './apiConfig.js';
import { handleLogout } from './main.js'; // Importar handleLogout

const veiculosUrl = `${apiUrlBase}/veiculos/`;

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
        console.warn("Erro 401 em veiculoService: Não autorizado. Deslogando...");
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

export async function getVeiculos() {
    const response = await fetch(veiculosUrl, { headers: getAuthHeaders() });
    if (!response.ok) {
        await handleResponseError(response);
    }
    return await response.json();
}

export async function getVeiculoById(veiculoId) {
    const response = await fetch(`${veiculosUrl}${veiculoId}/`, { headers: getAuthHeaders() });
    if (!response.ok) {
        await handleResponseError(response);
    }
    return await response.json();
}

export async function createVeiculo(veiculoData) {
    const response = await fetch(veiculosUrl, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(veiculoData),
    });
    if (!response.ok) {
        await handleResponseError(response);
    }
    return await response.json();
}

export async function updateVeiculo(veiculoId, veiculoData) {
    const response = await fetch(`${veiculosUrl}${veiculoId}/`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(veiculoData),
    });
    if (!response.ok) {
        await handleResponseError(response);
    }
    return await response.json();
}

export async function deleteVeiculoAPI(veiculoId) {
    const response = await fetch(`${veiculosUrl}${veiculoId}/`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    if (!response.ok && response.status !== 204) {
        await handleResponseError(response);
    }
    return true;
}