// frontend/js/clienteService.js
import { apiUrlBase } from './apiConfig.js';
// Importe handleLogout se quiser usá-la aqui em caso de 401.
// Para isso, handleLogout precisaria ser exportada de main.js
// import { handleLogout } from './main.js'; // Supondo que main.js exporte handleLogout

const clientesUrl = `${apiUrlBase}/clientes/`;

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
        // Se main.js exportar handleLogout e for importada aqui:
        // handleLogout();
        // alert("Sua sessão expirou ou você não está autorizado. Por favor, faça login novamente.");
        // Ou simplesmente lançar o erro para ser tratado onde a função foi chamada
        // Para simplificar agora, vamos apenas deixar que o erro seja lançado e a UI lide com não receber dados.
        // A chamada explícita ao handleLogout aqui pode ser um pouco complexa devido a imports circulares ou
        // necessidade de tornar handleLogout global.
        console.warn("Erro 401: Não autorizado. O token pode ter expirado.");
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


export async function getClientes() {
    const response = await fetch(clientesUrl, { headers: getAuthHeaders() });
    if (!response.ok) {
        await handleResponseError(response);
    }
    return await response.json();
}

export async function getClienteById(clienteId) {
    const response = await fetch(`${clientesUrl}${clienteId}/`, { headers: getAuthHeaders() });
    if (!response.ok) {
       await handleResponseError(response);
    }
    return await response.json();
}

export async function createCliente(clienteData) {
    const response = await fetch(clientesUrl, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(clienteData),
    });
    if (!response.ok) { // Espera-se 201 para POST bem-sucedido, mas DRF retorna 201 (que é .ok)
        await handleResponseError(response);
    }
    return await response.json();
}

export async function updateCliente(clienteId, clienteData) {
    const response = await fetch(`${clientesUrl}${clienteId}/`, {
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
    const response = await fetch(`${clientesUrl}${clienteId}/`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    if (!response.ok && response.status !== 204) { // 204 é OK para DELETE
        await handleResponseError(response);
    }
    return true; // DELETE bem-sucedido (204) não tem corpo JSON
}