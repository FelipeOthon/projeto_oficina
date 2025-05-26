// frontend/js/ordemDeServicoService.js
import { apiUrlBase } from './apiConfig.js';

const osUrl = `${apiUrlBase}/ordens-servico/`;

export async function getOrdensDeServico() {
    const response = await fetch(osUrl);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: `Erro HTTP ${response.status}` }));
        throw new Error(`Erro ao buscar Ordens de Serviço: ${errorData.detail || response.statusText}`);
    }
    return await response.json();
}

export async function getOrdemDeServicoById(osId) {
    const response = await fetch(`${osUrl}${osId}/`); // CORRIGIDO
    if (!response.ok) {
        if (response.status === 404) {
            throw new Error(`Ordem de Serviço com ID ${osId} não encontrada.`);
        }
        const errorData = await response.json().catch(() => ({ detail: `Erro HTTP ${response.status}` }));
        throw new Error(`Erro HTTP ao buscar Ordem de Serviço: ${errorData.detail || response.statusText}`);
    }
    return await response.json();
}

export async function createOrdemDeServico(osData) {
    const response = await fetch(osUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify(osData),
    });
    if (response.status !== 201) {
        const errData = await response.json().catch(() => ({ detail: `Erro HTTP ${response.status}` }));
        let erroMsg = `Erro ao criar Ordem de Serviço: ${response.status}`;
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

export async function updateOrdemDeServico(osId, osData) {
    const response = await fetch(`${osUrl}${osId}/`, { // CORRIGIDO
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify(osData),
    });
    if (!response.ok) {
        const errData = await response.json().catch(() => ({ detail: `Erro HTTP ${response.status}` }));
        let erroMsg = `Erro ao atualizar Ordem de Serviço: ${response.status}`;
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

export async function deleteOrdemDeServicoAPI(osId) {
    const response = await fetch(`${osUrl}${osId}/`, { // CORRIGIDO
        method: 'DELETE',
    });
    if (!response.ok && response.status !== 204) {
        const errData = await response.json().catch(() => ({ detail: `Erro HTTP ${response.status}` }));
        throw new Error(`Erro ao deletar Ordem de Serviço: ${response.status} - ${errData.detail || 'Erro desconhecido'}`);
    }
    return true;
}