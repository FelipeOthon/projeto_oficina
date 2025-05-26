// frontend/js/main.js
import {
    renderClientes,
    abrirModalNovoCliente,
    handleSalvarCliente,
    abrirModalEditarCliente,
    handleDeletarCliente,
    handleVerDetalhesCliente
} from './clienteUI.js';

import {
    renderVeiculos,
    abrirModalNovoVeiculo,
    handleSalvarVeiculo,
    abrirModalEditarVeiculo,
    handleDeletarVeiculo,
    handleVerDetalhesVeiculo
} from './veiculoUI.js';

import {
    renderAgendamentos,
    abrirModalNovoAgendamento,
    handleSalvarAgendamento,
    abrirModalEditarAgendamento,
    handleDeletarAgendamento,
    handleVerDetalhesAgendamento,
    populateVeiculosParaAgendamento // CERTIFIQUE-SE QUE ESTÁ IMPORTADA
} from './agendamentoUI.js';

document.addEventListener('DOMContentLoaded', function() {
    renderClientes();
    renderVeiculos();
    renderAgendamentos();

    // --- Listeners para Clientes ---
    const btnNovoCliente = document.getElementById('btnNovoCliente');
    if (btnNovoCliente) {
        btnNovoCliente.addEventListener('click', abrirModalNovoCliente);
    }
    const btnSalvarCliente = document.getElementById('btnSalvarCliente');
    if (btnSalvarCliente) {
        btnSalvarCliente.addEventListener('click', handleSalvarCliente);
    }
    const listaClientesUI = document.getElementById('lista-clientes');
    if (listaClientesUI) {
        listaClientesUI.addEventListener('click', function(event) {
            const target = event.target;
            const clienteId = target.dataset.id;
            if (clienteId) {
                if (target.classList.contains('btn-editar')) {
                    abrirModalEditarCliente(clienteId);
                } else if (target.classList.contains('btn-deletar')) {
                    handleDeletarCliente(clienteId);
                } else if (target.classList.contains('btn-detalhes')) {
                    handleVerDetalhesCliente(clienteId);
                }
            }
        });
    }

    // --- Listeners para Veículos ---
    const btnNovoVeiculo = document.getElementById('btnNovoVeiculo');
    if (btnNovoVeiculo) {
        btnNovoVeiculo.addEventListener('click', abrirModalNovoVeiculo);
    }
    const btnSalvarVeiculo = document.getElementById('btnSalvarVeiculo');
    if (btnSalvarVeiculo) {
        btnSalvarVeiculo.addEventListener('click', handleSalvarVeiculo);
    }
    const listaVeiculosUI = document.getElementById('lista-veiculos');
    if (listaVeiculosUI) {
        listaVeiculosUI.addEventListener('click', function(event) {
            const target = event.target;
            const veiculoId = target.dataset.id;
            if (veiculoId) {
                if (target.classList.contains('btn-editar-veiculo')) {
                    abrirModalEditarVeiculo(veiculoId);
                } else if (target.classList.contains('btn-deletar-veiculo')) {
                    handleDeletarVeiculo(veiculoId);
                } else if (target.classList.contains('btn-detalhes-veiculo')) {
                    handleVerDetalhesVeiculo(veiculoId);
                }
            }
        });
    }

    // --- Listeners para Agendamentos ---
    const btnNovoAgendamento = document.getElementById('btnNovoAgendamento');
    if (btnNovoAgendamento) {
        btnNovoAgendamento.addEventListener('click', abrirModalNovoAgendamento);
    }
    const btnSalvarAgendamento = document.getElementById('btnSalvarAgendamento');
    if (btnSalvarAgendamento) {
        btnSalvarAgendamento.addEventListener('click', handleSalvarAgendamento);
    }
    const listaAgendamentosUI = document.getElementById('lista-agendamentos');
    if (listaAgendamentosUI) {
        listaAgendamentosUI.addEventListener('click', function(event) {
            const target = event.target;
            const agendamentoId = target.dataset.id;
            if (agendamentoId) {
                if (target.classList.contains('btn-editar-agendamento')) {
                    abrirModalEditarAgendamento(agendamentoId);
                } else if (target.classList.contains('btn-deletar-agendamento')) {
                    handleDeletarAgendamento(agendamentoId);
                } else if (target.classList.contains('btn-detalhes-agendamento')) {
                    handleVerDetalhesAgendamento(agendamentoId);
                }
            }
        });
    }

    // Listener para o select de cliente no modal de agendamento
    const agendamentoClienteSelect = document.getElementById('agendamentoCliente');
    if (agendamentoClienteSelect) {
        agendamentoClienteSelect.addEventListener('change', function() {
            const clienteId = this.value;
            console.log('[main.js] Cliente selecionado para agendamento, ID:', clienteId); // DEBUG
            if (clienteId && typeof populateVeiculosParaAgendamento === 'function') {
                populateVeiculosParaAgendamento(clienteId, null); // Passa null para selectedVeiculoId
            } else if (clienteId) {
                console.error("populateVeiculosParaAgendamento não é uma função ou não foi importada.");
            } else {
                // Limpa o select de veículos se "Selecione um cliente" for escolhido
                const agendamentoVeiculoSelect = document.getElementById('agendamentoVeiculo');
                if (agendamentoVeiculoSelect) {
                    agendamentoVeiculoSelect.innerHTML = '<option value="">Selecione um cliente primeiro...</option>';
                }
            }
        });
    }
});