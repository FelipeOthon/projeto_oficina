// frontend/js/usuarioService.js
import { apiUrlBase } from './apiConfig.js';
import { handleLogout } from './main.js'; // Para lidar com erros 401

const usuariosUrl = `${apiUrlBase}/usuarios`; // Base URL para usuários, se houver mais endpoints no futuro

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
        console.warn("Erro 401 em usuarioService: Não autorizado. Deslogando...");
        handleLogout(); // Chama a função de logout global
    }
    // Tenta obter detalhes do erro do corpo da resposta
    const errData = await response.json().catch(() => ({ detail: `Erro HTTP ${response.status}. Não foi possível obter detalhes do erro do servidor.` }));

    let erroMsg = `${response.status}: ${errData.detail || response.statusText || 'Erro desconhecido ao processar a requisição.'}`;

    // Se houver erros de campo específicos do DRF, adiciona-os à mensagem
    if (errData && typeof errData === 'object' && Object.keys(errData).length > 1) {
        const fieldErrors = [];
        for (const field in errData) {
            if (field !== 'detail') { // Não repete o 'detail' se já estiver na mensagem principal
                fieldErrors.push(`${field}: ${Array.isArray(errData[field]) ? errData[field].join(', ') : errData[field]}`);
            }
        }
        if (fieldErrors.length > 0) {
            erroMsg += `\nDetalhes:\n${fieldErrors.join('\n')}`;
        }
    }
    throw new Error(erroMsg);
}

/**
 * Busca a lista de usuários do tipo 'mecanico'.
 * @returns {Promise<Array>} Uma promessa que resolve para um array de mecânicos.
 */
export async function getMecanicos() {
    const response = await fetch(`${usuariosUrl}/mecanicos/`, { headers: getAuthHeaders() });
    if (!response.ok) {
        await handleResponseError(response);
    }
    return await response.json();
}