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
    populateVeiculosParaAgendamento as popularVeiculosAgendamento // Renomeando para evitar conflito
} from './agendamentoUI.js';
import {
    renderOrdensDeServico, abrirModalNovaOS, handleSalvarOS,
    // Importar funções de OS UI quando forem implementadas
    // abrirModalEditarOS, handleDeletarOS, handleVerDetalhesOS,
    populateVeiculosParaOS as popularVeiculosOS // Renomeando para evitar conflito e IMPORTANDO
} from './ordemDeServicoUI.js';

document.addEventListener('DOMContentLoaded', function() {
    renderClientes();
    renderVeiculos();
    renderAgendamentos();
    renderOrdensDeServico();

    // --- Listeners para Clientes (sem alterações) ---
    const btnNovoCliente = document.getElementById('btnNovoCliente');
    if (btnNovoCliente) btnNovoCliente.addEventListener('click', abrirModalNovoCliente);
    const btnSalvarCliente = document.getElementById('btnSalvarCliente');
    if (btnSalvarCliente) btnSalvarCliente.addEventListener('click', handleSalvarCliente);
    const listaClientesUI = document.getElementById('lista-clientes');
    if (listaClientesUI) {
        listaClientesUI.addEventListener('click', function(event) {
            const target = event.target.closest('button');
            if (!target) return;
            const clienteId = target.dataset.id;
            if (clienteId) {
                if (target.classList.contains('btn-editar')) abrirModalEditarCliente(clienteId);
                else if (target.classList.contains('btn-deletar')) handleDeletarCliente(clienteId);
                else if (target.classList.contains('btn-detalhes')) handleVerDetalhesCliente(clienteId);
            }
        });
    }

    // --- Listeners para Veículos (sem alterações) ---
    const btnNovoVeiculo = document.getElementById('btnNovoVeiculo');
    if (btnNovoVeiculo) btnNovoVeiculo.addEventListener('click', abrirModalNovoVeiculo);
    const btnSalvarVeiculo = document.getElementById('btnSalvarVeiculo');
    if (btnSalvarVeiculo) btnSalvarVeiculo.addEventListener('click', handleSalvarVeiculo);
    const listaVeiculosUI = document.getElementById('lista-veiculos');
    if (listaVeiculosUI) {
        listaVeiculosUI.addEventListener('click', function(event) {
            const target = event.target.closest('button');
            if (!target) return;
            const veiculoId = target.dataset.id;
            if (veiculoId) {
                if (target.classList.contains('btn-editar-veiculo')) abrirModalEditarVeiculo(veiculoId);
                else if (target.classList.contains('btn-deletar-veiculo')) handleDeletarVeiculo(veiculoId);
                else if (target.classList.contains('btn-detalhes-veiculo')) handleVerDetalhesVeiculo(veiculoId);
            }
        });
    }

    // --- Listeners para Agendamentos (ajustado para usar a função renomeada) ---
    const btnNovoAgendamento = document.getElementById('btnNovoAgendamento');
    if (btnNovoAgendamento) btnNovoAgendamento.addEventListener('click', abrirModalNovoAgendamento);
    const btnSalvarAgendamento = document.getElementById('btnSalvarAgendamento');
    if (btnSalvarAgendamento) btnSalvarAgendamento.addEventListener('click', handleSalvarAgendamento);
    const listaAgendamentosUI = document.getElementById('lista-agendamentos');
    if (listaAgendamentosUI) {
        listaAgendamentosUI.addEventListener('click', function(event) {
            const target = event.target.closest('button');
            if (!target) return;
            const agendamentoId = target.dataset.id;
            if (agendamentoId) {
                if (target.classList.contains('btn-editar-agendamento')) abrirModalEditarAgendamento(agendamentoId);
                else if (target.classList.contains('btn-deletar-agendamento')) handleDeletarAgendamento(agendamentoId);
                else if (target.classList.contains('btn-detalhes-agendamento')) handleVerDetalhesAgendamento(agendamentoId);
            }
        });
    }
    const agendamentoClienteSelect = document.getElementById('agendamentoCliente');
    if (agendamentoClienteSelect) {
        agendamentoClienteSelect.addEventListener('change', function() {
            const clienteId = this.value;
            console.log('[main.js] Cliente selecionado para AGENDAMENTO, ID:', clienteId);
            if (clienteId && typeof popularVeiculosAgendamento === 'function') { // Usa a função renomeada
                popularVeiculosAgendamento(clienteId, null);
            } else if (clienteId) {
                console.error("popularVeiculosAgendamento não é uma função ou não foi importada.");
            } else {
                const agendamentoVeiculoSelect = document.getElementById('agendamentoVeiculo');
                if (agendamentoVeiculoSelect) {
                    agendamentoVeiculoSelect.innerHTML = '<option value="">Selecione um cliente primeiro...</option>';
                }
            }
        });
    }

    // --- Listeners para Ordens de Serviço (NOVOS e AJUSTADOS) ---
    const btnNovaOS = document.getElementById('btnNovaOS');
    if (btnNovaOS) {
        btnNovaOS.addEventListener('click', abrirModalNovaOS);
    }

    const btnSalvarOS = document.getElementById('btnSalvarOS');
    if (btnSalvarOS) {
        btnSalvarOS.addEventListener('click', handleSalvarOS);
    }

    const listaOrdensServicoUI = document.getElementById('lista-ordens-servico');
    if (listaOrdensServicoUI) {
        listaOrdensServicoUI.addEventListener('click', function(event) {
            const target = event.target.closest('button');
            if (!target) return;
            const osId = target.dataset.id;
            if (osId) {
                // if (target.classList.contains('btn-editar-os')) {
                //     abrirModalEditarOS(osId);
                // } else if (target.classList.contains('btn-deletar-os')) {
                //     handleDeletarOS(osId);
                // } else if (target.classList.contains('btn-detalhes-os')) {
                //     handleVerDetalhesOS(osId);
                // }
                // Alertas temporários, pois as funções de UI ainda são placeholders
                if (target.classList.contains('btn-editar-os')) alert(`Editar OS ID: ${osId} (a ser implementado)`);
                else if (target.classList.contains('btn-deletar-os')) alert(`Deletar OS ID: ${osId} (a ser implementado)`);
                else if (target.classList.contains('btn-detalhes-os')) alert(`Ver Detalhes/Itens da OS ID: ${osId} (a ser implementado)`);
            }
        });
    }

    // Listener para o select de cliente (#osCliente) no modal de Ordem de Serviço
    const osClienteSelect = document.getElementById('osCliente');
    if (osClienteSelect) {
        osClienteSelect.addEventListener('change', function() {
            const clienteId = this.value;
            console.log('[main.js] Cliente selecionado para OS, ID:', clienteId);
            if (clienteId && typeof popularVeiculosOS === 'function') { // Usa a função renomeada e importada
                popularVeiculosOS(clienteId, null); // Chama a função do ordemDeServicoUI.js
            } else if (clienteId) {
                console.error("popularVeiculosOS não é uma função ou não foi importada.");
            } else {
                const osVeiculoSelect = document.getElementById('osVeiculo'); // ID do select de veículo no modal de OS
                if (osVeiculoSelect) {
                    osVeiculoSelect.innerHTML = '<option value="">Selecione um cliente primeiro...</option>';
                }
            }
        });
    }
});