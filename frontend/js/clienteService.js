// frontend/js/clienteService.js
import { apiUrlBase } from './apiConfig.js';
import { handleLogout } from './main.js'; // Certifique-se que handleLogout é exportada de main.js

const clientesUrlBase = `${apiUrlBase}/clientes/`; // Renomeado para clareza

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
        console.warn("Erro 401 em clienteService: Não autorizado. Deslogando...");
        handleLogout(); // Chama a função global de logout
    }
    const errData = await response.json().catch(() => ({ detail: `Erro HTTP ${response.status}. Não foi possível obter detalhes do erro.` }));

    let erroMsg = `${response.status}: ${errData.detail || response.statusText || 'Erro desconhecido'}`;
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

// Modificada para aceitar um termo de busca
export async function getClientes(searchTerm = '') {
    let url = clientesUrlBase;
    if (searchTerm && searchTerm.trim() !== '') {
        // O backend espera o parâmetro 'search' para o SearchFilter
        url += `?search=${encodeURIComponent(searchTerm.trim())}`;
    }
    const response = await fetch(url, { headers: getAuthHeaders() });
    if (!response.ok) {
        await handleResponseError(response);
    }
    return await response.json();
}

export async function getClienteById(clienteId) {
    const response = await fetch(`${clientesUrlBase}${clienteId}/`, { headers: getAuthHeaders() });
    if (!response.ok) {
       await handleResponseError(response);
    }
    return await response.json();
}

export async function createCliente(clienteData) {
    const response = await fetch(clientesUrlBase, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(clienteData),
    });
    if (!response.ok) {
        await handleResponseError(response);
    }
    return await response.json();
}

export async function updateCliente(clienteId, clienteData) {
    const response = await fetch(`${clientesUrlBase}${clienteId}/`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(clienteData),
    });
    if (!response.ok) {
        await handleResponseError(response);
    }
    return await response.json();
}

export async function deleteClienteAPI(clienteId) {
    const response = await fetch(`${clientesUrlBase}${clienteId}/`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    if (!response.ok && response.status !== 204) {
        await handleResponseError(response);
    }
    return true;
}