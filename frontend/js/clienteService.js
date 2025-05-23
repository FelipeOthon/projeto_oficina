// frontend/js/clienteService.js
import { apiUrlBase } from './apiConfig.js'; // Importa a URL base da API

const clientesUrl = `${apiUrlBase}/clientes/`;

// Função para buscar todos os clientes
export async function getClientes() {
    const response = await fetch(clientesUrl);
    if (!response.ok) {
        throw new Error(`Erro HTTP ao buscar clientes! Status: ${response.status}`);
    }
    return await response.json();
}

// Função para buscar um cliente específico pelo ID
export async function getClienteById(clienteId) {
    // CORREÇÃO AQUI: Usar template string corretamente
    const response = await fetch(`${clientesUrl}${clienteId}/`);
    if (!response.ok) {
        if (response.status === 404) {
            throw new Error(`Cliente com ID ${clienteId} não encontrado.`);
        }
        throw new Error(`Erro HTTP ao buscar cliente! Status: ${response.status}`);
    }
    return await response.json();
}

// Função para criar um novo cliente
export async function createCliente(clienteData) {
    const response = await fetch(clientesUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(clienteData),
    });
    if (!response.ok) {
        const errData = await response.json().catch(() => ({ detail: `Erro HTTP ${response.status}` }));
        let erroMsg = `Erro ao criar cliente: ${response.status}`;
        const fieldErrors = [];
        for (const field in errData) {
            if (field !== 'detail') {
                fieldErrors.push(`${field}: ${Array.isArray(errData[field]) ? errData[field].join(', ') : errData[field]}`);
            }
        }
        if (fieldErrors.length > 0) {
            erroMsg += `\nDetalhes:\n${fieldErrors.join('\n')}`;
        } else if (errData.detail) {
             erroMsg += `\nDetalhe: ${errData.detail}`;
        }
        throw new Error(erroMsg);
    }
    return await response.json();
}

// Função para atualizar um cliente existente
export async function updateCliente(clienteId, clienteData) {
    // CORREÇÃO AQUI: Usar template string corretamente
    const response = await fetch(`${clientesUrl}${clienteId}/`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(clienteData),
    });
    if (!response.ok) {
        const errData = await response.json().catch(() => ({ detail: `Erro HTTP ${response.status}` }));
        let erroMsg = `Erro ao atualizar cliente: ${response.status}`;
        const fieldErrors = [];
        for (const field in errData) {
             if (field !== 'detail') {
                fieldErrors.push(`${field}: ${Array.isArray(errData[field]) ? errData[field].join(', ') : errData[field]}`);
            }
        }
        if (fieldErrors.length > 0) {
            erroMsg += `\nDetalhes:\n${fieldErrors.join('\n')}`;
        } else if (errData.detail) {
             erroMsg += `\nDetalhe: ${errData.detail}`;
        }
        throw new Error(erroMsg);
    }
    return await response.json();
}

// Função para deletar um cliente
export async function deleteClienteAPI(clienteId) {
    // CORREÇÃO AQUI: Usar template string corretamente
    const response = await fetch(`${clientesUrl}${clienteId}/`, {
        method: 'DELETE',
    });
    if (!response.ok && response.status !== 204) {
        const errData = await response.json().catch(() => ({ detail: `Erro HTTP ${response.status}` }));
        throw new Error(`Erro ao deletar cliente: ${response.status} - ${errData.detail || 'Erro desconhecido'}`);
    }
    return true;
}