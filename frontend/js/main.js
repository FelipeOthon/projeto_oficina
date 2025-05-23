// frontend/js/main.js
import {
    renderClientes,
    abrirModalNovoCliente,
    handleSalvarCliente,
    abrirModalEditarCliente,
    handleDeletarCliente,
    handleVerDetalhesCliente // Mesmo que seja placeholder, vamos ligar o evento
} from './clienteUI.js';

// Evento que dispara quando o HTML da página foi completamente carregado e parseado
document.addEventListener('DOMContentLoaded', function() {
    // Carrega a lista inicial de clientes
    renderClientes();

    // Adiciona listener para o botão "Novo Cliente"
    const btnNovoCliente = document.getElementById('btnNovoCliente');
    if (btnNovoCliente) {
        btnNovoCliente.addEventListener('click', abrirModalNovoCliente);
    }

    // Adiciona listener para o botão "Salvar Cliente" dentro do modal
    const btnSalvarCliente = document.getElementById('btnSalvarCliente');
    if (btnSalvarCliente) {
        btnSalvarCliente.addEventListener('click', handleSalvarCliente);
    }

    // Adiciona listeners para os botões de Ações na lista de clientes (Editar, Deletar, Detalhes)
    // Usando delegação de eventos, pois os itens da lista são criados dinamicamente
    const listaClientesUI = document.getElementById('lista-clientes');
    if (listaClientesUI) {
        listaClientesUI.addEventListener('click', function(event) {
            const target = event.target; // Elemento que foi clicado
            const clienteId = target.dataset.id; // Pega o data-id do botão

            if (clienteId) { // Verifica se clicamos em um botão com data-id
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
});