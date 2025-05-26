// frontend/js/itemOsPecaService.js
import { apiUrlBase } from './apiConfig.js';

function getItemOsPecaUrl(osId) {
    return `${apiUrlBase}/ordens-servico/${osId}/pecas/`;
}

function getSpecificItemOsPecaUrl(osId, itemPecaId) {
    return `${apiUrlBase}/ordens-servico/${osId}/pecas/${itemPecaId}/`;
}

export async function getItemOsPecas(osId) {
    const response = await fetch(getItemOsPecaUrl(osId));
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: `Erro HTTP ${response.status} ao buscar peças.` }));
        throw new Error(`Erro ao buscar peças da OS ${osId}: ${errorData.detail || response.statusText}`);
    }
    return await response.json();
}

export async function getItemOsPecaById(osId, itemPecaId) {
    const response = await fetch(getSpecificItemOsPecaUrl(osId, itemPecaId));
    if (!response.ok) {
        if (response.status === 404) {
            throw new Error(`Item de Peça com ID ${itemPecaId} não encontrado para a OS ${osId}.`);
        }
        const errorData = await response.json().catch(() => ({ detail: `Erro HTTP ${response.status} ao buscar item de peça.` }));
        throw new Error(`Erro HTTP ao buscar item de peça: ${errorData.detail || response.statusText}`);
    }
    return await response.json();
}

export async function createItemOsPeca(osId, itemPecaData) {
    const response = await fetch(getItemOsPecaUrl(osId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify(itemPecaData),
    });
    if (response.status !== 201) {
        const errData = await response.json().catch(() => ({ detail: `Erro HTTP ${response.status}` }));
        let erroMsg = `Erro ao criar item de peça para OS ${osId}: ${response.status}`;
        const fieldErrors = [];
        for (const field in errData) {
            if (field !== 'detail') { fieldErrors.push(`${field}: ${Array.isArray(errData[field]) ? errData[field].join(', ') : errData[field]}`); }
        }
        if (fieldErrors.length > 0) { erroMsg += `\nDetalhes:\n${fieldErrors.join('\n')}`; }
        else if (errData.detail) { erroMsg += `\nDetalhe: ${errData.detail}`; }
        else { erroMsg += `\n${JSON.stringify(errData)}` }
        throw new Error(erroMsg);
    }
    return await response.json();
}

export async function updateItemOsPeca(osId, itemPecaId, itemPecaData) {
    const response = await fetch(getSpecificItemOsPecaUrl(osId, itemPecaId), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify(itemPecaData),
    });
    if (!response.ok) {
        const errData = await response.json().catch(() => ({ detail: `Erro HTTP ${response.status}` }));
        let erroMsg = `Erro ao atualizar item de peça ${itemPecaId} da OS ${osId}: ${response.status}`;
        const fieldErrors = [];
        for (const field in errData) {
            if (field !== 'detail') { fieldErrors.push(`${field}: ${Array.isArray(errData[field]) ? errData[field].join(', ') : errData[field]}`); }
        }
        if (fieldErrors.length > 0) { erroMsg += `\nDetalhes:\n${fieldErrors.join('\n')}`; }
        else if (errData.detail) { erroMsg += `\nDetalhe: ${errData.detail}`; }
        else { erroMsg += `\n${JSON.stringify(errData)}` }
        throw new Error(erroMsg);
    }
    return await response.json();
}

export async function deleteItemOsPecaAPI(osId, itemPecaId) {
    const response = await fetch(getSpecificItemOsPecaUrl(osId, itemPecaId), {
        method: 'DELETE',
    });
    if (!response.ok && response.status !== 204) {
        const errData = await response.json().catch(() => ({ detail: `Erro HTTP ${response.status}` }));
        throw new Error(`Erro ao deletar item de peça ${itemPecaId} da OS ${osId}: ${response.status} - ${errData.detail || 'Erro desconhecido'}`);
    }
    return true;
}