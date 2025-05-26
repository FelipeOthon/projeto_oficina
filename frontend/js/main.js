// frontend/js/main.js
import {
    renderClientes, abrirModalNovoCliente, handleSalvarCliente,
    abrirModalEditarCliente, handleDeletarCliente, handleVerDetalhesCliente
} from './clienteUI.js';

import {
    renderVeiculos, abrirModalNovoVeiculo, handleSalvarVeiculo,
    abrirModalEditarVeiculo, handleDeletarVeiculo, handleVerDetalhesVeiculo
} from './veiculoUI.js';

import {
    renderAgendamentos, abrirModalNovoAgendamento, handleSalvarAgendamento,
    abrirModalEditarAgendamento, handleDeletarAgendamento, handleVerDetalhesAgendamento,
    populateClientesParaAgendamentoDropdown,
    populateVeiculosParaAgendamentoDropdown
} from './agendamentoUI.js';

import {
    renderOrdensDeServico,
    abrirModalNovaOS,
    handleSalvarOS,
    abrirModalEditarOS,
    handleDeletarOS,
    handleVerDetalhesOS,
    populateClientesParaOS,
    populateVeiculosParaOS,
    // Funções para gerenciar itens da OS
    abrirModalAdicionarPeca,
    handleSalvarItemPeca,
    abrirModalEditarItemPeca,
    handleDeletarItemPeca,
    abrirModalAdicionarServico,
    handleSalvarItemServico,
    abrirModalEditarItemServico,
    handleDeletarItemServico
} from './ordemDeServicoUI.js';


document.addEventListener('DOMContentLoaded', function() {
    // Carrega as listas iniciais
    renderClientes();
    renderVeiculos();
    renderAgendamentos();
    renderOrdensDeServico();

    // --- Listeners para Clientes ---
    const btnNovoCliente = document.getElementById('btnNovoCliente');
    if (btnNovoCliente) btnNovoCliente.addEventListener('click', abrirModalNovoCliente);
    const btnSalvarCliente = document.getElementById('btnSalvarCliente');
    if (btnSalvarCliente) btnSalvarCliente.addEventListener('click', handleSalvarCliente);
    const listaClientesUI = document.getElementById('lista-clientes');
    if (listaClientesUI) {
        listaClientesUI.addEventListener('click', function(event) {
            const targetButton = event.target.closest('button');
            if (!targetButton) return;
            const clienteId = targetButton.dataset.id;
            if (clienteId) {
                if (targetButton.classList.contains('btn-editar')) abrirModalEditarCliente(clienteId);
                else if (targetButton.classList.contains('btn-deletar')) handleDeletarCliente(clienteId);
                else if (targetButton.classList.contains('btn-detalhes')) handleVerDetalhesCliente(clienteId);
            }
        });
    }

    // --- Listeners para Veículos ---
    const btnNovoVeiculo = document.getElementById('btnNovoVeiculo');
    if (btnNovoVeiculo) btnNovoVeiculo.addEventListener('click', abrirModalNovoVeiculo);
    const btnSalvarVeiculo = document.getElementById('btnSalvarVeiculo');
    if (btnSalvarVeiculo) btnSalvarVeiculo.addEventListener('click', handleSalvarVeiculo);
    const listaVeiculosUI = document.getElementById('lista-veiculos');
    if (listaVeiculosUI) {
        listaVeiculosUI.addEventListener('click', function(event) {
            const targetButton = event.target.closest('button');
            if (!targetButton) return;
            const veiculoId = targetButton.dataset.id;
            if (veiculoId) {
                if (targetButton.classList.contains('btn-editar-veiculo')) abrirModalEditarVeiculo(veiculoId);
                else if (targetButton.classList.contains('btn-deletar-veiculo')) handleDeletarVeiculo(veiculoId);
                else if (targetButton.classList.contains('btn-detalhes-veiculo')) handleVerDetalhesVeiculo(veiculoId);
            }
        });
    }

    // --- Listeners para Agendamentos ---
    const btnNovoAgendamento = document.getElementById('btnNovoAgendamento');
    if (btnNovoAgendamento) btnNovoAgendamento.addEventListener('click', abrirModalNovoAgendamento);
    const btnSalvarAgendamento = document.getElementById('btnSalvarAgendamento');
    if (btnSalvarAgendamento) btnSalvarAgendamento.addEventListener('click', handleSalvarAgendamento);
    const listaAgendamentosUI = document.getElementById('lista-agendamentos');
    if (listaAgendamentosUI) {
        listaAgendamentosUI.addEventListener('click', function(event) {
            const targetButton = event.target.closest('button');
            if (!targetButton) return;
            const agendamentoId = targetButton.dataset.id;
            if (agendamentoId) {
                if (targetButton.classList.contains('btn-editar-agendamento')) abrirModalEditarAgendamento(agendamentoId);
                else if (targetButton.classList.contains('btn-deletar-agendamento')) handleDeletarAgendamento(agendamentoId);
                else if (targetButton.classList.contains('btn-detalhes-agendamento')) handleVerDetalhesAgendamento(agendamentoId);
            }
        });
    }
    const agendamentoClienteSelect = document.getElementById('agendamentoCliente');
    if (agendamentoClienteSelect) {
        agendamentoClienteSelect.addEventListener('change', function() {
            const clienteId = this.value;
            if (clienteId && typeof populateVeiculosParaAgendamentoDropdown === 'function') {
                populateVeiculosParaAgendamentoDropdown(clienteId, null);
            } else { /* ... */ }
        });
    }

    // --- Listeners para Ordens de Serviço (Entidade Principal) ---
    const btnNovaOS = document.getElementById('btnNovaOS');
    if (btnNovaOS) btnNovaOS.addEventListener('click', abrirModalNovaOS);
    const btnSalvarOS = document.getElementById('btnSalvarOS');
    if (btnSalvarOS) btnSalvarOS.addEventListener('click', handleSalvarOS);
    const listaOrdensServicoUI = document.getElementById('lista-ordens-servico');
    if (listaOrdensServicoUI) {
        listaOrdensServicoUI.addEventListener('click', function(event) {
            const target = event.target.closest('button');
            if (!target) return;
            const osId = target.dataset.id;
            if (osId) {
                if (target.classList.contains('btn-editar-os')) abrirModalEditarOS(osId);
                else if (target.classList.contains('btn-deletar-os')) handleDeletarOS(osId);
                else if (target.classList.contains('btn-detalhes-os')) handleVerDetalhesOS(osId);
            }
        });
    }
    const osClienteSelect = document.getElementById('osCliente');
    if (osClienteSelect) {
        osClienteSelect.addEventListener('change', function() {
            const clienteId = this.value;
            if (clienteId && typeof populateVeiculosParaOS === 'function') {
                populateVeiculosParaOS(clienteId, null);
            } else { /* ... */ }
        });
    }

    // --- LISTENERS PARA ITENS DENTRO DO MODAL DE DETALHES DA OS (#osDetalhesItensModal) ---
    const osDetalhesModalElement = document.getElementById('osDetalhesItensModal');
    if (osDetalhesModalElement) {
        osDetalhesModalElement.addEventListener('click', function(event) {
            const targetButton = event.target.closest('button');
            if (!targetButton) return;

            const osId = targetButton.dataset.osId;
            const itemId = targetButton.dataset.itemId;

            // Botões para ADICIONAR itens
            if (targetButton.id === 'btnAbrirModalAdicionarPecaOS') {
                if (osId && typeof abrirModalAdicionarPeca === 'function') {
                    abrirModalAdicionarPeca(osId);
                } else { console.error("ID da OS ou função abrirModalAdicionarPeca não disponível."); }
            }
            else if (targetButton.id === 'btnAbrirModalAdicionarServicoOS') {
                if (osId && typeof abrirModalAdicionarServico === 'function') {
                    abrirModalAdicionarServico(osId);
                } else { console.error("ID da OS ou função abrirModalAdicionarServico não disponível."); }
            }
            // Botões para EDITAR itens
            else if (targetButton.classList.contains('btn-editar-item-peca')) {
                if (osId && itemId && typeof abrirModalEditarItemPeca === 'function') {
                    abrirModalEditarItemPeca(osId, itemId);
                } else { console.error("IDs ou função abrirModalEditarItemPeca não disponíveis."); }
            }
            else if (targetButton.classList.contains('btn-editar-item-servico')) {
                if (osId && itemId && typeof abrirModalEditarItemServico === 'function') {
                    abrirModalEditarItemServico(osId, itemId);
                } else { console.error("IDs ou função abrirModalEditarItemServico não disponíveis."); }
            }
            // Botões para DELETAR itens
            else if (targetButton.classList.contains('btn-deletar-item-peca')) {
                 if (osId && itemId && typeof handleDeletarItemPeca === 'function') {
                    handleDeletarItemPeca(osId, itemId);
                } else { console.error("IDs ou função handleDeletarItemPeca não disponíveis."); }
            }
            else if (targetButton.classList.contains('btn-deletar-item-servico')) {
                if (osId && itemId && typeof handleDeletarItemServico === 'function') {
                    handleDeletarItemServico(osId, itemId);
                } else { console.error("IDs ou função handleDeletarItemServico não disponíveis."); }
            }
        });
    }

    // Listener para o botão "Salvar Peça"
    const btnSalvarItemPeca = document.getElementById('btnSalvarItemPeca');
    if (btnSalvarItemPeca) {
        btnSalvarItemPeca.addEventListener('click', handleSalvarItemPeca);
    }

    // Listener para o botão "Salvar Serviço"
    const btnSalvarItemServico = document.getElementById('btnSalvarItemServico');
    if (btnSalvarItemServico) {
        btnSalvarItemServico.addEventListener('click', handleSalvarItemServico);
    }
});