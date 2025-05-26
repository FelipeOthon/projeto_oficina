// frontend/js/agendamentoService.js
import { apiUrlBase } from './apiConfig.js';

const agendamentosUrl = `${apiUrlBase}/agendamentos/`;

export async function getAgendamentos() {
    const response = await fetch(agendamentosUrl);
    if (!response.ok) {
        throw new Error(`Erro HTTP ao buscar agendamentos! Status: ${response.status}`);
    }
    return await response.json();
}

export async function getAgendamentoById(agendamentoId) {
    const response = await fetch(`${agendamentosUrl}${agendamentoId}/`); // CORRIGIDO
    if (!response.ok) {
        if (response.status === 404) {
            throw new Error(`Agendamento com ID ${agendamentoId} não encontrado.`);
        }
        throw new Error(`Erro HTTP ao buscar agendamento! Status: ${response.status}`);
    }
    return await response.json();
}

export async function createAgendamento(agendamentoData) {
    const response = await fetch(agendamentosUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify(agendamentoData),
    });
    if (!response.ok) {
        const errData = await response.json().catch(() => ({ detail: `Erro HTTP ${response.status}` }));
        let erroMsg = `Erro ao criar agendamento: ${response.status}`;
        const fieldErrors = [];
        for (const field in errData) {
            if (field !== 'detail') { fieldErrors.push(`${field}: ${Array.isArray(errData[field]) ? errData[field].join(', ') : errData[field]}`);}
        }
        if (fieldErrors.length > 0) { erroMsg += `\nDetalhes:\n${fieldErrors.join('\n')}`; }
        else if (errData.detail) { erroMsg += `\nDetalhe: ${errData.detail}`; }
        throw new Error(erroMsg);
    }
    return await response.json();
}

export async function updateAgendamento(agendamentoId, agendamentoData) {
    const response = await fetch(`${agendamentosUrl}${agendamentoId}/`, { // CORRIGIDO
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify(agendamentoData),
    });
    if (!response.ok) {
        const errData = await response.json().catch(() => ({ detail: `Erro HTTP ${response.status}` }));
        let erroMsg = `Erro ao atualizar agendamento: ${response.status}`;
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

export async function deleteAgendamentoAPI(agendamentoId) {
    const response = await fetch(`${agendamentosUrl}${agendamentoId}/`, { // CORRIGIDO
        method: 'DELETE',
    });
    if (!response.ok && response.status !== 204) {
        const errData = await response.json().catch(() => ({ detail: `Erro HTTP ${response.status}` }));
        throw new Error(`Erro ao deletar agendamento: ${response.status} - ${errData.detail || 'Erro desconhecido'}`);
    }
    return true;
}