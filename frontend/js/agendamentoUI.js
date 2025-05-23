// frontend/js/agendamentoUI.js
import { getAgendamentos, getAgendamentoById, createAgendamento, updateAgendamento, deleteAgendamentoAPI } from './agendamentoService.js';
import { getClientes } from './clienteService.js';
import { getVeiculos } from './veiculoService.js'; // Para popular dropdown de veículos

// IDs dos elementos HTML que serão criados no index.html para agendamentos
const listaAgendamentosUI = document.getElementById('lista-agendamentos');
const formAgendamento = document.getElementById('formAgendamento');
const agendamentoIdInput = document.getElementById('agendamentoId');
const agendamentoClienteSelect = document.getElementById('agendamentoCliente');
const agendamentoVeiculoSelect = document.getElementById('agendamentoVeiculo');
const agendamentoMecanicoSelect = document.getElementById('agendamentoMecanico'); // Opcional, se você adicionar este campo ao modal
const agendamentoModalLabel = document.getElementById('agendamentoModalLabel');
const agendamentoModal = $('#agendamentoModal'); // jQuery para o modal Bootstrap

// --- Funções para Popular Selects (Dropdowns) ---
async function populateClientesParaAgendamento(selectedClienteId = null) {
    if (!agendamentoClienteSelect) return; // Evita erro se o elemento não existir
    try {
        const clientes = await getClientes();
        agendamentoClienteSelect.innerHTML = '<option value="">Selecione um Cliente...</option>';
        if (Array.isArray(clientes) && clientes.length > 0) {
            clientes.forEach(cliente => {
                const option = document.createElement('option');
                option.value = cliente.id;
                option.textContent = cliente.nome_completo;
                if (selectedClienteId && cliente.id === parseInt(selectedClienteId)) {
                    option.selected = true;
                }
                agendamentoClienteSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Erro ao popular dropdown de clientes para agendamento:', error);
        agendamentoClienteSelect.innerHTML = '<option value="">Erro ao carregar clientes</option>';
    }
}

async function populateVeiculosParaAgendamento(clienteId, selectedVeiculoId = null) {
    if (!agendamentoVeiculoSelect) return; // Evita erro se o elemento não existir
    agendamentoVeiculoSelect.innerHTML = '<option value="">Selecione um Veículo...</option>';
    if (!clienteId) {
        agendamentoVeiculoSelect.innerHTML = '<option value="">Selecione um cliente primeiro...</option>';
        return;
    }
    try {
        // Idealmente, você teria um endpoint /api/clientes/<id_cliente>/veiculos/
        // Por enquanto, buscamos todos e filtramos.
        const todosVeiculos = await getVeiculos();
        if (Array.isArray(todosVeiculos) && todosVeiculos.length > 0) {
            // No DRF, o campo 'cliente' no VeiculoSerializer é o ID do cliente.
            const veiculosDoCliente = todosVeiculos.filter(v => v.cliente === parseInt(clienteId));
            if (veiculosDoCliente.length > 0) {
                veiculosDoCliente.forEach(veiculo => {
                    const option = document.createElement('option');
                    option.value = veiculo.id;
                    option.textContent = `${veiculo.marca} ${veiculo.modelo} (${veiculo.placa})`;
                    if (selectedVeiculoId && veiculo.id === parseInt(selectedVeiculoId)) {
                        option.selected = true;
                    }
                    agendamentoVeiculoSelect.appendChild(option);
                });
            } else {
                 agendamentoVeiculoSelect.innerHTML = '<option value="">Nenhum veículo para este cliente</option>';
            }
        }
    } catch (error) {
        console.error('Erro ao popular dropdown de veículos para agendamento:', error);
        agendamentoVeiculoSelect.innerHTML = '<option value="">Erro ao carregar veículos</option>';
    }
}

// Função para popular mecânicos (Exemplo, se você tiver um endpoint para buscar usuários do tipo 'mecanico')
// async function populateMecanicosParaAgendamento(selectedMecanicoId = null) {
//     if (!agendamentoMecanicoSelect) return;
//     try {
//         // Supondo uma função em usuarioService.js: const usuarios = await getUsuariosPorTipo('mecanico');
//         // agendamentoMecanicoSelect.innerHTML = '<option value="">Selecione um Mecânico (Opcional)...</option>';
//         // ... lógica para popular o select ...
//     } catch (error) {
//         console.error('Erro ao popular mecânicos:', error);
//         agendamentoMecanicoSelect.innerHTML = '<option value="">Erro ao carregar mecânicos</option>';
//     }
// }


// Função para renderizar a lista de agendamentos no HTML
export async function renderAgendamentos() {
    if (!listaAgendamentosUI) {
        console.warn("Elemento #lista-agendamentos não encontrado no DOM.");
        return;
    }
    listaAgendamentosUI.innerHTML = '<li class="list-group-item">Carregando agendamentos...</li>';
    try {
        const agendamentos = await getAgendamentos();
        listaAgendamentosUI.innerHTML = '';
        if (Array.isArray(agendamentos) && agendamentos.length > 0) {
            agendamentos.forEach(ag => {
                const item = document.createElement('li');
                item.className = 'list-group-item';
                // Formata a data e hora para exibição
                const dataFormatada = ag.data_agendamento ? new Date(ag.data_agendamento + 'T00:00:00').toLocaleDateString('pt-BR') : 'N/A';
                const horaFormatada = ag.hora_agendamento ? ag.hora_agendamento.substring(0,5) : 'N/A';

                item.innerHTML = `
                    <div>
                        <strong>${ag.servico_solicitado}</strong> - Cliente: ${ag.cliente_nome || 'N/A'}<br>
                        <small>Veículo: ${ag.veiculo_info || 'N/A'} | Data: ${dataFormatada} às ${horaFormatada}</small><br>
                        <small>Status: ${ag.status_agendamento} | Mecânico: ${ag.mecanico_nome || 'Não atribuído'}</small>
                    </div>
                    <div class="mt-2">
                        <button class="btn btn-sm btn-info mr-2 btn-detalhes-agendamento" data-id="${ag.id}">Detalhes</button>
                        <button class="btn btn-sm btn-warning mr-2 btn-editar-agendamento" data-id="${ag.id}">Editar</button>
                        <button class="btn btn-sm btn-danger btn-deletar-agendamento" data-id="${ag.id}">Deletar</button>
                    </div>
                `;
                listaAgendamentosUI.appendChild(item);
            });
        } else {
            listaAgendamentosUI.innerHTML = '<li class="list-group-item">Nenhum agendamento encontrado.</li>';
        }
    } catch (error) {
        console.error('Erro ao renderizar agendamentos:', error);
        listaAgendamentosUI.innerHTML = `<li class="list-group-item text-danger">Erro ao carregar agendamentos: ${error.message}</li>`;
    }
}

// Função para abrir o modal para um novo agendamento
export async function abrirModalNovoAgendamento() {
    if (!formAgendamento) return;
    formAgendamento.reset();
    if (agendamentoIdInput) agendamentoIdInput.value = '';
    if (agendamentoModalLabel) agendamentoModalLabel.textContent = 'Adicionar Novo Agendamento';
    await populateClientesParaAgendamento();
    if (agendamentoVeiculoSelect) agendamentoVeiculoSelect.innerHTML = '<option value="">Selecione um cliente primeiro...</option>';
    // await populateMecanicosParaAgendamento(); // Descomente se for usar
    if (agendamentoModal.length) agendamentoModal.modal('show'); // Verifica se o elemento modal existe
}

// Função para abrir o modal para editar um agendamento existente
export async function abrirModalEditarAgendamento(id) {
    if (!formAgendamento) return;
    formAgendamento.reset();
    if (agendamentoModalLabel) agendamentoModalLabel.textContent = 'Editar Agendamento';
    try {
        const agendamento = await getAgendamentoById(id);
        await populateClientesParaAgendamento(agendamento.cliente);
        await populateVeiculosParaAgendamento(agendamento.cliente, agendamento.veiculo);
        // await populateMecanicosParaAgendamento(agendamento.mecanico_atribuido); // Descomente se for usar

        if (agendamentoIdInput) agendamentoIdInput.value = agendamento.id;
        // Certifique-se de que os IDs dos elementos do formulário existem no seu HTML
        if (document.getElementById('agendamentoData')) document.getElementById('agendamentoData').value = agendamento.data_agendamento;
        if (document.getElementById('agendamentoHora')) document.getElementById('agendamentoHora').value = agendamento.hora_agendamento.substring(0,5);
        if (document.getElementById('agendamentoServicoSolicitado')) document.getElementById('agendamentoServicoSolicitado').value = agendamento.servico_solicitado || '';
        if (document.getElementById('agendamentoStatus')) document.getElementById('agendamentoStatus').value = agendamento.status_agendamento || 'Agendado';
        if (document.getElementById('agendamentoObservacoes')) document.getElementById('agendamentoObservacoes').value = agendamento.observacoes || '';
        // if (document.getElementById('agendamentoMecanico') && agendamento.mecanico_atribuido) document.getElementById('agendamentoMecanico').value = agendamento.mecanico_atribuido;

        if (agendamentoModal.length) agendamentoModal.modal('show');
    } catch (error) {
        console.error('Erro ao carregar agendamento para edição:', error);
        alert(`Erro ao carregar dados do agendamento: ${error.message}`);
    }
}

// Função para lidar com o submit do formulário de agendamento
export async function handleSalvarAgendamento() {
    if (!formAgendamento) return;
    const id = agendamentoIdInput.value;
    const dadosAgendamento = {
        cliente: document.getElementById('agendamentoCliente')?.value,
        veiculo: document.getElementById('agendamentoVeiculo')?.value,
        mecanico_atribuido: document.getElementById('agendamentoMecanico')?.value || null,
        data_agendamento: document.getElementById('agendamentoData')?.value,
        hora_agendamento: document.getElementById('agendamentoHora')?.value,
        servico_solicitado: document.getElementById('agendamentoServicoSolicitado')?.value,
        status_agendamento: document.getElementById('agendamentoStatus')?.value,
        observacoes: document.getElementById('agendamentoObservacoes')?.value || null,
    };

    if (!dadosAgendamento.cliente || !dadosAgendamento.veiculo || !dadosAgendamento.data_agendamento || !dadosAgendamento.hora_agendamento || !dadosAgendamento.servico_solicitado) {
        alert('Cliente, Veículo, Data, Hora e Serviço Solicitado são obrigatórios!');
        return;
    }

    try {
        if (id) {
            await updateAgendamento(id, dadosAgendamento);
            alert('Agendamento atualizado com sucesso!');
        } else {
            await createAgendamento(dadosAgendamento);
            alert('Agendamento criado com sucesso!');
        }
        if (agendamentoModal.length) agendamentoModal.modal('hide');
        renderAgendamentos();
    } catch (error) {
        console.error('Erro ao salvar agendamento:', error);
        alert(`Erro ao salvar agendamento: ${error.message}`);
    }
}

// Função para lidar com a deleção de um agendamento
export async function handleDeletarAgendamento(id) {
    if (confirm(`Tem certeza que deseja deletar o agendamento com ID: ${id}?`)) {
        try {
            await deleteAgendamentoAPI(id);
            alert('Agendamento deletado com sucesso!');
            renderAgendamentos();
        } catch (error) {
            console.error('Erro ao deletar agendamento:', error);
            alert(`Erro ao deletar agendamento: ${error.message}`);
        }
    }
}

// Placeholder para detalhes do agendamento
export function handleVerDetalhesAgendamento(id) {
    alert(`Ver detalhes do agendamento ID: ${id} (a ser implementado)`);
}