// frontend/js/relatoriosService.js
import { apiUrlBase } from './apiConfig.js';
import { handleLogout } from './main.js'; // Para deslogar em caso de 401

function getAuthHeaders() {
    const token = localStorage.getItem('access_token');
    const headers = {
        // 'Content-Type': 'application/json', // Não necessário para GET simples de PDF
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}

async function handlePdfResponse(response, defaultFilename = 'relatorio.pdf') {
    if (response.status === 401) {
        console.warn("Erro 401: Não autorizado. Deslogando...");
        handleLogout();
        throw new Error("Não autorizado. Faça login novamente.");
    }

    if (!response.ok) {
        let errorDetail = `Erro HTTP ${response.status} ao gerar o relatório.`;
        try {
            const errData = await response.json();
            errorDetail = errData.detail || errorDetail;
        } catch (e) {
            // Não conseguiu parsear JSON, usa a mensagem de status
        }
        throw new Error(errorDetail);
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/pdf") !== -1) {
        const blob = await response.blob();
        const fileURL = URL.createObjectURL(blob);
        window.open(fileURL, '_blank'); // Abre o PDF em uma nova aba
    } else {
        // Se não for PDF, pode ser um erro em JSON que não foi pego antes
        let errorDetail = 'Resposta inesperada do servidor. Esperava um PDF.';
        try {
            const errData = await response.json();
            errorDetail = errData.detail || errorDetail;
        } catch(e) {
            //
        }
        console.error('A resposta não foi um PDF. Resposta:', await response.text());
        throw new Error(errorDetail);
    }
}

export async function gerarRelatorioOsConcluidasPDF(dataInicio, dataFim) {
    if (!dataInicio || !dataFim) {
        throw new Error("Data de início e Data de fim são obrigatórias.");
    }
    const url = `${apiUrlBase}/relatorios/os-concluidas/pdf/?data_inicio=${dataInicio}&data_fim=${dataFim}`;
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        await handlePdfResponse(response, `Relatorio_OS_Concluidas_${dataInicio}_a_${dataFim}.pdf`);
    } catch (error) {
        console.error("Erro ao gerar relatório de OS Concluídas:", error);
        throw error; // Re-lança para ser pego no UI
    }
}

export async function gerarRelatorioFaturamentoPDF(dataInicio, dataFim) {
    if (!dataInicio || !dataFim) {
        throw new Error("Data de início e Data de fim são obrigatórias.");
    }
    const url = `${apiUrlBase}/relatorios/faturamento/pdf/?data_inicio=${dataInicio}&data_fim=${dataFim}`;
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        await handlePdfResponse(response, `Relatorio_Faturamento_${dataInicio}_a_${dataFim}.pdf`);
    } catch (error) {
        console.error("Erro ao gerar relatório de faturamento:", error);
        throw error; // Re-lança para ser pego no UI
    }
}