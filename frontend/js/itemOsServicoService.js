// frontend/js/itemOsServicoService.js
import { apiUrlBase } from './apiConfig.js';

function getItemOsServicoUrl(osId) {
    return `${apiUrlBase}/ordens-servico/${osId}/servicos/`;
}

function getSpecificItemOsServicoUrl(osId, itemServicoId) {
    return `${apiUrlBase}/ordens-servico/${osId}/servicos/${itemServicoId}/`;
}

export async function getItemOsServicos(osId) {
    const response = await fetch(getItemOsServicoUrl(osId));
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: `Erro HTTP ${response.status} ao buscar serviços.` }));
        throw new Error(`Erro ao buscar serviços da OS ${osId}: ${errorData.detail || response.statusText}`);
    }
    return await response.json();
}

export async function getItemOsServicoById(osId, itemServicoId) {
    const response = await fetch(getSpecificItemOsServicoUrl(osId, itemServicoId));
    if (!response.ok) {
        if (response.status === 404) {
            throw new Error(`Item de Serviço com ID ${itemServicoId} não encontrado para a OS ${osId}.`);
        }
        const errorData = await response.json().catch(() => ({ detail: `Erro HTTP ${response.status} ao buscar item de serviço.` }));
        throw new Error(`Erro HTTP ao buscar item de serviço: ${errorData.detail || response.statusText}`);
    }
    return await response.json();
}

export async function createItemOsServico(osId, itemServicoData) {
    const response = await fetch(getItemOsServicoUrl(osId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify(itemServicoData),
    });
    if (response.status !== 201) {
        const errData = await response.json().catch(() => ({ detail: `Erro HTTP ${response.status}` }));
        let erroMsg = `Erro ao criar item de serviço para OS ${osId}: ${response.status}`;
        const fieldErrors = [];
        for (const field in errData) {
            if (field !== 'detail') { fieldErrors.push(`${field}: ${Array.isArray(errData[field]) ? errData[field].join(', ') : errData[field]}`); }
        }
        if (fieldErrors.length > 0) { erroMsg += `\nDetalhes:\n${fieldErrors.join('\n')}`; }
        else if (errData.detail) { erroMsg += `\nDetalhe: ${errData.detail}`; }
        else { erroMsg += `\n${JSON.stringify(errData)}`}
        throw new Error(erroMsg);
    }
    return await response.json();
}

export async function updateItemOsServico(osId, itemServicoId, itemServicoData) {
    const response = await fetch(getSpecificItemOsServicoUrl(osId, itemServicoId), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify(itemServicoData),
    });
    if (!response.ok) {
        const errData = await response.json().catch(() => ({ detail: `Erro HTTP ${response.status}` }));
        let erroMsg = `Erro ao atualizar item de serviço ${itemServicoId} da OS ${osId}: ${response.status}`;
        const fieldErrors = [];
        for (const field in errData) {
            if (field !== 'detail') { fieldErrors.push(`${field}: ${Array.isArray(errData[field]) ? errData[field].join(', ') : errData[field]}`); }
        }
        if (fieldErrors.length > 0) { erroMsg += `\nDetalhes:\n${fieldErrors.join('\n')}`; }
        else if (errData.detail) { erroMsg += `\nDetalhe: ${errData.detail}`; }
        else { erroMsg += `\n${JSON.stringify(errData)}`}
        throw new Error(erroMsg);
    }
    return await response.json();
}

export async function deleteItemOsServicoAPI(osId, itemServicoId) {
    const response = await fetch(getSpecificItemOsServicoUrl(osId, itemServicoId), {
        method: 'DELETE',
    });
    if (!response.ok && response.status !== 204) {
        const errData = await response.json().catch(() => ({ detail: `Erro HTTP ${response.status}` }));
        throw new Error(`Erro ao deletar item de serviço ${itemServicoId} da OS ${osId}: ${response.status} - ${errData.detail || 'Erro desconhecido'}`);
    }
    return true;
}