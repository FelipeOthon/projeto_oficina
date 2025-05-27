// frontend/js/agendamentoUI.js
import { getAgendamentos, getAgendamentoById, createAgendamento, updateAgendamento, deleteAgendamentoAPI } from './agendamentoService.js';
import { getClientes } from './clienteService.js';
import { getVeiculos } from './veiculoService.js';
import { getMecanicos } from './usuarioService.js'; // <-- IMPORTAÇÃO ADICIONADA

const listaAgendamentosUI = document.getElementById('lista-agendamentos');
const formAgendamento = document.getElementById('formAgendamento');
const agendamentoIdInput = document.getElementById('agendamentoId');
const agendamentoClienteSelect = document.getElementById('agendamentoCliente');
const agendamentoVeiculoSelect = document.getElementById('agendamentoVeiculo');
const agendamentoMecanicoSelect = document.getElementById('agendamentoMecanico'); //
const agendamentoDataInput = document.getElementById('agendamentoData');
const agendamentoHoraInput = document.getElementById('agendamentoHora');
const agendamentoServicoSolicitadoInput = document.getElementById('agendamentoServicoSolicitado');
const agendamentoStatusSelect = document.getElementById('agendamentoStatus');
const agendamentoObservacoesInput = document.getElementById('agendamentoObservacoes');
const agendamentoModalLabel = document.getElementById('agendamentoModalLabel');
const agendamentoModal = $('#agendamentoModal');
const btnSalvarAgendamentoModal = document.getElementById('btnSalvarAgendamento');

export async function populateClientesParaAgendamentoDropdown(selectedClienteId = null) {
    if (!agendamentoClienteSelect) {
        console.error("Elemento #agendamentoCliente não encontrado para popular clientes.");
        return;
    }
    try {
        console.log("[agendamentoUI.js] Buscando clientes para dropdown de agendamento..."); //
        const clientes = await getClientes();
        agendamentoClienteSelect.innerHTML = '<option value="">Selecione um Cliente...</option>'; //
        if (Array.isArray(clientes) && clientes.length > 0) {
            clientes.forEach(cliente => {
                const option = document.createElement('option');
                option.value = cliente.id;
                option.textContent = cliente.nome_completo;
                if (selectedClienteId && String(cliente.id) === String(selectedClienteId)) { // Comparação mais segura
                    option.selected = true;
                }
                agendamentoClienteSelect.appendChild(option);
            });
            console.log("[agendamentoUI.js] Dropdown de clientes para agendamento populado."); //
        } else {
            console.log("[agendamentoUI.js] Nenhum cliente encontrado para popular dropdown de agendamento."); //
        }
    } catch (error) {
        console.error('Erro ao popular dropdown de clientes para agendamento:', error);
        agendamentoClienteSelect.innerHTML = '<option value="">Erro ao carregar clientes</option>';
    }
}

export async function populateVeiculosParaAgendamentoDropdown(clienteId, selectedVeiculoId = null) {
    console.log('[agendamentoUI.js] populateVeiculosParaAgendamentoDropdown chamado com clienteId:', clienteId, 'e selectedVeiculoId:', selectedVeiculoId); //
    if (!agendamentoVeiculoSelect) {
        console.error("Elemento #agendamentoVeiculo não encontrado.");
        return;
    }
    agendamentoVeiculoSelect.innerHTML = '<option value="">Carregando veículos...</option>'; //
    if (!clienteId || clienteId === "") {
        agendamentoVeiculoSelect.innerHTML = '<option value="">Selecione um cliente primeiro...</option>'; //
        console.log('[agendamentoUI.js] Nenhum clienteId fornecido para populateVeiculosParaAgendamentoDropdown.'); //
        return;
    }
    try {
        const todosVeiculos = await getVeiculos(); // Busca todos os veículos (sem filtro aqui)
        console.log('[agendamentoUI.js] Todos os veículos buscados para agendamento:', todosVeiculos); //
        agendamentoVeiculoSelect.innerHTML = '<option value="">Selecione um Veículo...</option>'; //
        if (Array.isArray(todosVeiculos) && todosVeiculos.length > 0) {
            const veiculosDoCliente = todosVeiculos.filter(v => String(v.cliente) === String(clienteId)); // Comparação mais segura
            console.log('[agendamentoUI.js] Veículos filtrados para agendamento do cliente:', veiculosDoCliente); //
            if (veiculosDoCliente.length > 0) {
                veiculosDoCliente.forEach(veiculo => {
                    const option = document.createElement('option');
                    option.value = veiculo.id;
                    option.textContent = `${veiculo.marca} ${veiculo.modelo} (${veiculo.placa})`;
                    if (selectedVeiculoId && String(veiculo.id) === String(selectedVeiculoId)) { // Comparação mais segura
                        option.selected = true;
                    }
                    agendamentoVeiculoSelect.appendChild(option);
                });
            } else {
                 agendamentoVeiculoSelect.innerHTML = '<option value="">Nenhum veículo cadastrado para este cliente</option>'; //
            }
        } else {
            agendamentoVeiculoSelect.innerHTML = '<option value="">Nenhum veículo encontrado no sistema</option>'; //
        }
    } catch (error) {
        console.error('Erro ao popular dropdown de veículos para agendamento:', error);
        agendamentoVeiculoSelect.innerHTML = '<option value="">Erro ao carregar veículos</option>';
    }
}

export async function populateMecanicosParaAgendamentoDropdown(selectedMecanicoId = null) {
    if (!agendamentoMecanicoSelect) {
        console.error("Elemento #agendamentoMecanico não encontrado para popular mecânicos.");
        return;
    }
    try {
        console.log("[agendamentoUI.js] Buscando mecânicos para dropdown..."); //
        const mecanicos = await getMecanicos();
        agendamentoMecanicoSelect.innerHTML = '<option value="">Selecione um Mecânico (Opcional)...</option>'; //
        if (Array.isArray(mecanicos) && mecanicos.length > 0) {
            mecanicos.forEach(mecanico => {
                const option = document.createElement('option');
                option.value = mecanico.id;
                option.textContent = mecanico.nome_display || mecanico.username; //
                if (selectedMecanicoId && String(mecanico.id) === String(selectedMecanicoId)) { // Comparação mais segura
                    option.selected = true;
                }
                agendamentoMecanicoSelect.appendChild(option);
            });
            console.log("[agendamentoUI.js] Dropdown de mecânicos populado."); //
        } else {
            console.log("[agendamentoUI.js] Nenhum mecânico encontrado."); //
            agendamentoMecanicoSelect.innerHTML = '<option value="">Nenhum mecânico disponível</option>'; //
        }
    } catch (error) {
        console.error('Erro ao popular dropdown de mecânicos:', error);
        agendamentoMecanicoSelect.innerHTML = '<option value="">Erro ao carregar mecânicos</option>';
    }
}


async function configurarModalAgendamento(modo, agendamentoData = null) {
    if (!formAgendamento) { console.error("Formulário de Agendamento não encontrado."); return; }
    formAgendamento.reset();

    if(agendamentoIdInput) agendamentoIdInput.value = agendamentoData ? agendamentoData.id : '';

    const camposFormulario = formAgendamento.elements;
    let tituloModal = '';
    let salvarVisivel = true;
    let camposDesabilitados = false;

    await populateMecanicosParaAgendamentoDropdown(agendamentoData ? agendamentoData.mecanico_atribuido : null);

    if (modo === 'novo') {
        tituloModal = 'Adicionar Novo Agendamento';
        await populateClientesParaAgendamentoDropdown();
        if (agendamentoVeiculoSelect) agendamentoVeiculoSelect.innerHTML = '<option value="">Selecione um cliente primeiro...</option>'; //
    } else if (modo === 'editar' || modo === 'detalhes') {
        tituloModal = (modo === 'editar') ? 'Editar Agendamento' : 'Detalhes do Agendamento';
        salvarVisivel = (modo === 'editar');
        camposDesabilitados = (modo === 'detalhes');

        if (agendamentoData) {
            await populateClientesParaAgendamentoDropdown(agendamentoData.cliente); //
            await populateVeiculosParaAgendamentoDropdown(agendamentoData.cliente, agendamentoData.veiculo); //

            if (agendamentoDataInput) agendamentoDataInput.value = agendamentoData.data_agendamento || '';
            if (agendamentoHoraInput) agendamentoHoraInput.value = agendamentoData.hora_agendamento ? agendamentoData.hora_agendamento.substring(0,5) : '';
            if (agendamentoServicoSolicitadoInput) agendamentoServicoSolicitadoInput.value = agendamentoData.servico_solicitado || '';
            if (agendamentoStatusSelect) agendamentoStatusSelect.value = agendamentoData.status_agendamento || 'Agendado';
            if (agendamentoObservacoesInput) agendamentoObservacoesInput.value = agendamentoData.observacoes || '';
        } else {
            await populateClientesParaAgendamentoDropdown();
        }
    }

    for (let campo of camposFormulario) {
        if (campo.type !== 'hidden' && campo.type !== 'button') {
            campo.disabled = camposDesabilitados;
        }
    }
    if (agendamentoClienteSelect) agendamentoClienteSelect.disabled = camposDesabilitados; // Simplificado
    if (agendamentoVeiculoSelect) agendamentoVeiculoSelect.disabled = camposDesabilitados; // Simplificado
    if (agendamentoMecanicoSelect) agendamentoMecanicoSelect.disabled = camposDesabilitados; // Simplificado


    if(agendamentoModalLabel) agendamentoModalLabel.textContent = tituloModal;
    if (btnSalvarAgendamentoModal) {
        btnSalvarAgendamentoModal.style.display = salvarVisivel ? 'inline-block' : 'none';
    }
    if(agendamentoModal.length) agendamentoModal.modal('show');
}

// MODIFICADO para aceitar searchTerm
export async function renderAgendamentos(searchTerm = '') {
    if (!listaAgendamentosUI) { console.warn("Elemento #lista-agendamentos não encontrado no DOM."); return; }
    listaAgendamentosUI.innerHTML = '<li class="list-group-item">Carregando agendamentos...</li>';
    try {
        const agendamentos = await getAgendamentos(searchTerm); // Passa o searchTerm
        listaAgendamentosUI.innerHTML = '';
        if (Array.isArray(agendamentos) && agendamentos.length > 0) {
            agendamentos.forEach(ag => {
                const item = document.createElement('li');
                item.className = 'list-group-item'; //
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
            if (searchTerm) {
                listaAgendamentosUI.innerHTML = `<li class="list-group-item">Nenhum agendamento encontrado para "${searchTerm}".</li>`;
            } else {
                listaAgendamentosUI.innerHTML = '<li class="list-group-item">Nenhum agendamento cadastrado.</li>';
            }
        }
    } catch (error) {
        console.error('Erro ao renderizar agendamentos:', error);
        listaAgendamentosUI.innerHTML = `<li class="list-group-item text-danger">Erro ao carregar agendamentos: ${error.message}</li>`;
    }
}

export async function abrirModalNovoAgendamento() {
    await configurarModalAgendamento('novo');
}

export async function abrirModalEditarAgendamento(id) {
    console.log('[agendamentoUI.js] -> abrirModalEditarAgendamento - ID recebido:', id, '- Tipo:', typeof id); //
    try {
        const agendamento = await getAgendamentoById(id);
        if (!agendamento) { alert(`Agendamento com ID ${id} não encontrado.`); return; }
        await configurarModalAgendamento('editar', agendamento);
    } catch (error) {
        console.error('Erro ao carregar agendamento para edição:', error);
        alert(`Erro ao carregar dados do agendamento: ${error.message}`);
    }
}

export async function handleVerDetalhesAgendamento(id) {
    console.log('[agendamentoUI.js] -> handleVerDetalhesAgendamento - ID recebido:', id, '- Tipo:', typeof id); //
     try {
        const agendamento = await getAgendamentoById(id);
        if (!agendamento) { alert(`Agendamento com ID ${id} não encontrado.`); return; }
        await configurarModalAgendamento('detalhes', agendamento);
    } catch (error) {
        console.error('Erro ao carregar detalhes do agendamento:', error);
        alert(`Erro ao carregar detalhes do agendamento: ${error.message}`);
    }
}

export async function handleSalvarAgendamento() {
    if (!formAgendamento || !agendamentoIdInput) return;
    const id = agendamentoIdInput.value;
    const dadosAgendamento = {
        cliente: document.getElementById('agendamentoCliente')?.value,
        veiculo: document.getElementById('agendamentoVeiculo')?.value,
        mecanico_atribuido: document.getElementById('agendamentoMecanico')?.value || null, //
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
        renderAgendamentos(); // Ou renderAgendamentos(termoDoFiltroGlobalAtual)
    } catch (error) {
        console.error('Erro ao salvar agendamento:', error);
        alert(`Erro ao salvar agendamento: ${error.message}`);
    }
}

export async function handleDeletarAgendamento(id) {
    console.log('[agendamentoUI.js] -> handleDeletarAgendamento - ID recebido:', id, '- Tipo:', typeof id); //
    if (confirm(`Tem certeza que deseja deletar o agendamento com ID: ${id}?`)) {
        try {
            await deleteAgendamentoAPI(id);
            alert('Agendamento deletado com sucesso!');
            renderAgendamentos(); // Ou renderAgendamentos(termoDoFiltroGlobalAtual)
        } catch (error) {
            console.error('Erro ao deletar agendamento:', error);
            alert(`Erro ao deletar agendamento: ${error.message}`);
        }
    }
}