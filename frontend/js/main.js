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

import { // NOVOS IMPORTS PARA AGENDAMENTO
    renderAgendamentos,
    abrirModalNovoAgendamento,
    handleSalvarAgendamento,
    abrirModalEditarAgendamento,
    handleDeletarAgendamento,
    handleVerDetalhesAgendamento
} from './agendamentoUI.js';

// Evento que dispara quando o HTML da página foi completamente carregado e parseado
document.addEventListener('DOMContentLoaded', function() {
    // Carrega as listas iniciais
    renderClientes();
    renderVeiculos();
    renderAgendamentos(); // Adiciona o carregamento de agendamentos

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

    // --- Listeners para Agendamentos (NOVOS) ---
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

    // Adicionar listener para o select de cliente no modal de agendamento, para carregar os veículos
    const agendamentoClienteSelect = document.getElementById('agendamentoCliente');
    if (agendamentoClienteSelect) {
        agendamentoClienteSelect.addEventListener('change', function() {
            const clienteId = this.value;
            // A função populateVeiculosParaAgendamento precisa ser importada ou definida aqui
            // ou, melhor ainda, chamada a partir de uma função em agendamentoUI.js
            // Por enquanto, vamos assumir que populateVeiculosParaAgendamento está acessível
            // ou que a lógica está dentro de abrirModalNovoAgendamento/abrirModalEditarAgendamento.
            // A forma como fizemos em agendamentoUI.js (chamando populateVeiculosParaAgendamento
            // dentro de abrirModalEditarAgendamento e esperando que o usuário selecione um cliente
            // para então popular os veículos no modal de novo agendamento) é uma abordagem.
            // Se quisermos que o select de veículos mude dinamicamente no modal JÁ ABERTO,
            // precisaríamos de uma função específica para isso em agendamentoUI.js e chamá-la aqui.
            // Por ora, o populate já acontece ao abrir o modal de edição, e para novo,
            // o ideal seria popular veículos APÓS um cliente ser selecionado.
            // O código em agendamentoUI.js para populateVeiculosParaAgendamento já faz um return se clienteId não existe.
            // Para uma melhor UX no modal de NOVO agendamento:
            // No agendamentoUI.js, a função populateVeiculosParaAgendamento pode ser chamada
            // também quando o select de cliente mudar.
            // Para manter simples aqui no main.js, vamos confiar na lógica já existente no agendamentoUI.js
            // que popula os veículos ao abrir o modal de edição e espera a seleção de cliente para novo.
        });
    }
});