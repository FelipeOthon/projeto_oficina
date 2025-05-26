// frontend/js/ordemDeServicoService.js
import { apiUrlBase } from './apiConfig.js';

const osUrl = `${apiUrlBase}/ordens-servico/`;

// Função para buscar todas as Ordens de Serviço
export async function getOrdensDeServico() {
    const response = await fetch(osUrl);
    if (!response.ok) {
        throw new Error(`Erro HTTP ao buscar Ordens de Serviço! Status: ${response.status}`);
    }
    return await response.json();
}

// Função para buscar uma OS específica pelo ID
export async function getOrdemDeServicoById(osId) {
    const response = await fetch(`<span class="math-inline">\{osUrl\}</span>{osId}/`);
    if (!response.ok) {
        if (response.status === 404) {
            throw new Error(`Ordem de Serviço com ID ${osId} não encontrada.`);
        }
        throw new Error(`Erro HTTP ao buscar Ordem de Serviço! Status: ${response.status}`);
    }
    return await response.json();
}

// Função para criar uma nova OS (apenas os dados principais da OS)
export async function createOrdemDeServico(osData) {
    const response = await fetch(osUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify(osData),
    });
    if (!response.ok) {
        const errData = await response.json().catch(() => ({ detail: `Erro HTTP ${response.status}` }));
        // ... (lógica de tratamento de erro similar aos outros services) ...
        throw new Error(`Erro ao criar Ordem de Serviço: ${response.status} - ${JSON.stringify(errData)}`);
    }
    return await response.json();
}

// Função para atualizar uma OS (apenas os dados principais da OS)
export async function updateOrdemDeServico(osId, osData) {
    const response = await fetch(`<span class="math-inline">\{osUrl\}</span>{osId}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify(osData),
    });
    if (!response.ok) {
        const errData = await response.json().catch(() => ({ detail: `Erro HTTP ${response.status}` }));
        // ... (lógica de tratamento de erro similar aos outros services) ...
        throw new Error(`Erro ao atualizar Ordem de Serviço: ${response.status} - ${JSON.stringify(errData)}`);
    }
    return await response.json();
}

// Função para deletar uma OS
export async function deleteOrdemDeServicoAPI(osId) {
    const response = await fetch(`<span class="math-inline">\{osUrl\}</span>{osId}/`, {
        method: 'DELETE',
    });
    if (!response.ok && response.status !== 204) {
        const errData = await response.json().catch(() => ({ detail: `Erro HTTP ${response.status}` }));
        throw new Error(`Erro ao deletar Ordem de Serviço: ${response.status} - ${errData.detail || 'Erro desconhecido'}`);
    }
    return true;
}

// TODO: Funções para gerenciar itens de peças e serviços de uma OS específica
// Ex: addItemPeca(osId, pecaData), updateItemPeca(osId, pecaId, pecaData), etc.
// Elas usarão os endpoints como /api/ordens-servico/<os_id>/pecas/