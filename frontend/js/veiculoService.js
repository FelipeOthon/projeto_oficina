// frontend/js/veiculoService.js
import { apiUrlBase } from './apiConfig.js';

const veiculosUrl = `${apiUrlBase}/veiculos/`;

export async function getVeiculos() {
    const response = await fetch(veiculosUrl);
    if (!response.ok) {
        throw new Error(`Erro HTTP ao buscar veículos! Status: ${response.status}`);
    }
    return await response.json();
}

export async function getVeiculoById(veiculoId) {
    const response = await fetch(`${veiculosUrl}${veiculoId}/`); // CORRIGIDO
    if (!response.ok) {
        if (response.status === 404) {
            throw new Error(`Veículo com ID ${veiculoId} não encontrado.`);
        }
        throw new Error(`Erro HTTP ao buscar veículo! Status: ${response.status}`);
    }
    return await response.json();
}

export async function createVeiculo(veiculoData) {
    const response = await fetch(veiculosUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify(veiculoData),
    });
    if (!response.ok) {
        const errData = await response.json().catch(() => ({ detail: `Erro HTTP ${response.status}` }));
        let erroMsg = `Erro ao criar veículo: ${response.status}`;
        const fieldErrors = [];
        for (const field in errData) {
            if (field !== 'detail') { fieldErrors.push(`${field}: ${Array.isArray(errData[field]) ? errData[field].join(', ') : errData[field]}`); }
        }
        if (fieldErrors.length > 0) { erroMsg += `\nDetalhes:\n${fieldErrors.join('\n')}`; }
        else if (errData.detail) { erroMsg += `\nDetalhe: ${errData.detail}`; }
        throw new Error(erroMsg);
    }
    return await response.json();
}

export async function updateVeiculo(veiculoId, veiculoData) {
    const response = await fetch(`${veiculosUrl}${veiculoId}/`, { // CORRIGIDO
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify(veiculoData),
    });
    if (!response.ok) {
        const errData = await response.json().catch(() => ({ detail: `Erro HTTP ${response.status}` }));
        let erroMsg = `Erro ao atualizar veículo: ${response.status}`;
        const fieldErrors = [];
        for (const field in errData) {
             if (field !== 'detail') { fieldErrors.push(`${field}: ${Array.isArray(errData[field]) ? errData[field].join(', ') : errData[field]}`); }
        }
        if (fieldErrors.length > 0) { erroMsg += `\nDetalhes:\n${fieldErrors.join('\n')}`; }
        else if (errData.detail) { erroMsg += `\nDetalhe: ${errData.detail}`; }
        throw new Error(erroMsg);
    }
    return await response.json();
}

export async function deleteVeiculoAPI(veiculoId) {
    const response = await fetch(`${veiculosUrl}${veiculoId}/`, { // CORRIGIDO
        method: 'DELETE',
    });
    if (!response.ok && response.status !== 204) {
        const errData = await response.json().catch(() => ({ detail: `Erro HTTP ${response.status}` }));
        throw new Error(`Erro ao deletar veículo: ${response.status} - ${errData.detail || 'Erro desconhecido'}`);
    }
    return true;
}