// frontend/js/veiculoService.js
import { apiUrlBase } from './apiConfig.js'; // Importa a URL base da API

const veiculosUrl = `${apiUrlBase}/veiculos/`;

// Função para buscar todos os veículos
export async function getVeiculos() {
    const response = await fetch(veiculosUrl);
    if (!response.ok) {
        throw new Error(`Erro HTTP ao buscar veículos! Status: ${response.status}`);
    }
    return await response.json();
}

// Função para buscar um veículo específico pelo ID
export async function getVeiculoById(veiculoId) {
    const response = await fetch(`<span class="math-inline">\{veiculosUrl\}</span>{veiculoId}/`);
    if (!response.ok) {
        if (response.status === 404) {
            throw new Error(`Veículo com ID ${veiculoId} não encontrado.`);
        }
        throw new Error(`Erro HTTP ao buscar veículo! Status: ${response.status}`);
    }
    return await response.json();
}

// Função para criar um novo veículo
// veiculoData deve conter: cliente (ID), placa, marca, modelo, e outros campos opcionais
export async function createVeiculo(veiculoData) {
    const response = await fetch(veiculosUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(veiculoData),
    });
    if (!response.ok) {
        const errData = await response.json().catch(() => ({ detail: `Erro HTTP ${response.status}` }));
        let erroMsg = `Erro ao criar veículo: ${response.status}`;
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
    return await response.json(); // Espera-se status 201 e o objeto criado
}

// Função para atualizar um veículo existente
export async function updateVeiculo(veiculoId, veiculoData) {
    const response = await fetch(`<span class="math-inline">\{veiculosUrl\}</span>{veiculoId}/`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(veiculoData),
    });
    if (!response.ok) {
        const errData = await response.json().catch(() => ({ detail: `Erro HTTP ${response.status}` }));
        let erroMsg = `Erro ao atualizar veículo: ${response.status}`;
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
    return await response.json(); // Espera-se status 200 e o objeto atualizado
}

// Função para deletar um veículo
export async function deleteVeiculoAPI(veiculoId) {
    const response = await fetch(`<span class="math-inline">\{veiculosUrl\}</span>{veiculoId}/`, {
        method: 'DELETE',
    });
    if (!response.ok && response.status !== 204) { // 204 No Content é sucesso para DELETE
        const errData = await response.json().catch(() => ({ detail: `Erro HTTP ${response.status}` }));
        throw new Error(`Erro ao deletar veículo: ${response.status} - ${errData.detail || 'Erro desconhecido'}`);
    }
    return true;
}