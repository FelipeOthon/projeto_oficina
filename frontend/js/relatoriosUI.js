// frontend/js/relatoriosUI.js
import { gerarRelatorioOsConcluidasPDF, gerarRelatorioFaturamentoPDF } from './relatoriosService.js';

const relatorioDataInicioInput = document.getElementById('relatorioDataInicio');
const relatorioDataFimInput = document.getElementById('relatorioDataFim');
const btnGerarRelatorioOSConcluidas = document.getElementById('btnGerarRelatorioOSConcluidas');
const btnGerarRelatorioFaturamento = document.getElementById('btnGerarRelatorioFaturamento');
const relatoriosErrorDiv = document.getElementById('relatoriosError');

function mostrarErroRelatorios(mensagem) {
    if (relatoriosErrorDiv) {
        relatoriosErrorDiv.textContent = mensagem;
        relatoriosErrorDiv.style.display = 'block';
    }
}

function limparErroRelatorios() {
    if (relatoriosErrorDiv) {
        relatoriosErrorDiv.textContent = '';
        relatoriosErrorDiv.style.display = 'none';
    }
}

function validarDatas() {
    limparErroRelatorios();
    const dataInicio = relatorioDataInicioInput.value;
    const dataFim = relatorioDataFimInput.value;

    if (!dataInicio || !dataFim) {
        mostrarErroRelatorios("Por favor, selecione a Data de Início e a Data de Fim.");
        return false;
    }
    if (new Date(dataInicio) > new Date(dataFim)) {
        mostrarErroRelatorios("A Data de Início não pode ser posterior à Data de Fim.");
        return false;
    }
    return { dataInicio, dataFim };
}

async function handleGerarRelatorioOSConcluidas() {
    const datas = validarDatas();
    if (!datas) return;

    try {
        btnGerarRelatorioOSConcluidas.disabled = true;
        btnGerarRelatorioOSConcluidas.textContent = 'Gerando...';
        await gerarRelatorioOsConcluidasPDF(datas.dataInicio, datas.dataFim);
    } catch (error) {
        console.error("Erro capturado em relatoriosUI (OS Concluídas):", error);
        mostrarErroRelatorios(error.message || "Ocorreu um erro ao gerar o relatório de OS.");
    } finally {
        btnGerarRelatorioOSConcluidas.disabled = false;
        btnGerarRelatorioOSConcluidas.textContent = 'Gerar Relatório de OS Concluídas/Faturadas';
    }
}

async function handleGerarRelatorioFaturamento() {
    const datas = validarDatas();
    if (!datas) return;

    try {
        btnGerarRelatorioFaturamento.disabled = true;
        btnGerarRelatorioFaturamento.textContent = 'Gerando...';
        await gerarRelatorioFaturamentoPDF(datas.dataInicio, datas.dataFim);
    } catch (error) {
        console.error("Erro capturado em relatoriosUI (Faturamento):", error);
        mostrarErroRelatorios(error.message || "Ocorreu um erro ao gerar o relatório de faturamento.");
    } finally {
        btnGerarRelatorioFaturamento.disabled = false;
        btnGerarRelatorioFaturamento.textContent = 'Gerar Relatório de Faturamento';
    }
}

export function setupRelatoriosListeners() {
    if (btnGerarRelatorioOSConcluidas) {
        btnGerarRelatorioOSConcluidas.addEventListener('click', handleGerarRelatorioOSConcluidas);
    }
    if (btnGerarRelatorioFaturamento) {
        btnGerarRelatorioFaturamento.addEventListener('click', handleGerarRelatorioFaturamento);
    }
    // Limpar erros ao mudar as datas
    if (relatorioDataInicioInput) {
        relatorioDataInicioInput.addEventListener('change', limparErroRelatorios);
    }
    if (relatorioDataFimInput) {
        relatorioDataFimInput.addEventListener('change', limparErroRelatorios);
    }
    console.log("Listeners de Relatórios configurados.");
}