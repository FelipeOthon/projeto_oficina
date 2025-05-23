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
} from './veiculoUI.js'; // Importando funcionalidades de Veiculo

// Evento que dispara quando o HTML da página foi completamente carregado e parseado
document.addEventListener('DOMContentLoaded', function() {
    // Carrega as listas iniciais
    renderClientes();
    renderVeiculos(); // Adiciona o carregamento de veículos

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

    // --- Listeners para Veículos (NOVOS) ---
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
});