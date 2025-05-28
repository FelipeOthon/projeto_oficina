// frontend/js/agendamentoUI.js
import { getAgendamentos, getAgendamentoById, createAgendamento, updateAgendamento, deleteAgendamentoAPI } from './agendamentoService.js';
import { getClientes } from './clienteService.js';
import { getVeiculos } from './veiculoService.js';
import { getMecanicos } from './usuarioService.js';

const formAgendamento = document.getElementById('formAgendamento');
const agendamentoIdInput = document.getElementById('agendamentoId');
const agendamentoClienteSelect = document.getElementById('agendamentoCliente');
const agendamentoVeiculoSelect = document.getElementById('agendamentoVeiculo');
const agendamentoMecanicoSelect = document.getElementById('agendamentoMecanico');
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
        return;
    }
    try {
        const clientes = await getClientes();
        agendamentoClienteSelect.innerHTML = '<option value="">Selecione um Cliente...</option>';
        if (Array.isArray(clientes) && clientes.length > 0) {
            clientes.forEach(cliente => {
                const option = document.createElement('option');
                option.value = cliente.id;
                option.textContent = cliente.nome_completo;
                if (selectedClienteId && String(cliente.id) === String(selectedClienteId)) {
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

export async function populateVeiculosParaAgendamentoDropdown(clienteId, selectedVeiculoId = null) {
    if (!agendamentoVeiculoSelect) {
        return;
    }
    agendamentoVeiculoSelect.innerHTML = '<option value="">Carregando veículos...</option>';
    if (!clienteId || clienteId === "") {
        agendamentoVeiculoSelect.innerHTML = '<option value="">Selecione um cliente primeiro...</option>';
        return;
    }
    try {
        const todosVeiculos = await getVeiculos();
        agendamentoVeiculoSelect.innerHTML = '<option value="">Selecione um Veículo...</option>';
        if (Array.isArray(todosVeiculos) && todosVeiculos.length > 0) {
            const veiculosDoCliente = todosVeiculos.filter(v => String(v.cliente) === String(clienteId));
            if (veiculosDoCliente.length > 0) {
                veiculosDoCliente.forEach(veiculo => {
                    const option = document.createElement('option');
                    option.value = veiculo.id;
                    option.textContent = `${veiculo.marca} ${veiculo.modelo} (${veiculo.placa})`;
                    if (selectedVeiculoId && String(veiculo.id) === String(selectedVeiculoId)) {
                        option.selected = true;
                    }
                    agendamentoVeiculoSelect.appendChild(option);
                });
            } else {
                 agendamentoVeiculoSelect.innerHTML = '<option value="">Nenhum veículo cadastrado para este cliente</option>';
            }
        } else {
            agendamentoVeiculoSelect.innerHTML = '<option value="">Nenhum veículo encontrado no sistema</option>';
        }
    } catch (error) {
        console.error('Erro ao popular dropdown de veículos para agendamento:', error);
        agendamentoVeiculoSelect.innerHTML = '<option value="">Erro ao carregar veículos</option>';
    }
}

export async function populateMecanicosParaAgendamentoDropdown(selectedMecanicoId = null) {
    if (!agendamentoMecanicoSelect) {
        return;
    }
    try {
        const mecanicos = await getMecanicos();
        agendamentoMecanicoSelect.innerHTML = '<option value="">Selecione um Mecânico (Opcional)...</option>';
        if (Array.isArray(mecanicos) && mecanicos.length > 0) {
            mecanicos.forEach(mecanico => {
                const option = document.createElement('option');
                option.value = mecanico.id;
                option.textContent = mecanico.nome_display || mecanico.username;
                if (selectedMecanicoId && String(mecanico.id) === String(selectedMecanicoId)) {
                    option.selected = true;
                }
                agendamentoMecanicoSelect.appendChild(option);
            });
        } else {
            agendamentoMecanicoSelect.innerHTML = '<option value="">Nenhum mecânico disponível</option>';
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
        if (agendamentoVeiculoSelect) agendamentoVeiculoSelect.innerHTML = '<option value="">Selecione um cliente primeiro...</option>';
    } else if (modo === 'editar' || modo === 'detalhes') {
        tituloModal = (modo === 'editar') ? 'Editar Agendamento' : 'Detalhes do Agendamento';
        salvarVisivel = (modo === 'editar');
        camposDesabilitados = (modo === 'detalhes');

        if (agendamentoData) {
            await populateClientesParaAgendamentoDropdown(agendamentoData.cliente);
            await populateVeiculosParaAgendamentoDropdown(agendamentoData.cliente, agendamentoData.veiculo);

            if (agendamentoDataInput) agendamentoDataInput.value = agendamentoData.data_agendamento || '';
            if (agendamentoHoraInput && agendamentoData.hora_agendamento) {
                 agendamentoHoraInput.value = agendamentoData.hora_agendamento.substring(0,5);
            } else if (agendamentoHoraInput) {
                agendamentoHoraInput.value = '';
            }

            if (agendamentoServicoSolicitadoInput) agendamentoServicoSolicitadoInput.value = agendamentoData.servico_solicitado || '';
            if (agendamentoStatusSelect) agendamentoStatusSelect.value = agendamentoData.status_agendamento || 'Agendado';
            if (agendamentoObservacoesInput) agendamentoObservacoesInput.value = agendamentoData.observacoes || '';
        } else {
            await populateClientesParaAgendamentoDropdown();
            if (agendamentoVeiculoSelect) agendamentoVeiculoSelect.innerHTML = '<option value="">Selecione um cliente primeiro...</option>';
        }
    }

    for (let campo of camposFormulario) {
        if (campo.type !== 'hidden' && campo.type !== 'button') {
            campo.disabled = camposDesabilitados;
        }
    }
    if (agendamentoClienteSelect) agendamentoClienteSelect.disabled = camposDesabilitados;
    if (agendamentoVeiculoSelect) agendamentoVeiculoSelect.disabled = camposDesabilitados;
    if (agendamentoMecanicoSelect) agendamentoMecanicoSelect.disabled = camposDesabilitados;

    if(agendamentoModalLabel) agendamentoModalLabel.textContent = tituloModal;
    if (btnSalvarAgendamentoModal) {
        btnSalvarAgendamentoModal.style.display = salvarVisivel ? 'inline-block' : 'none';
    }
    if(agendamentoModal.length) agendamentoModal.modal('show');
}

export function inicializarCalendarioAgendamentos() {
    const calendarioEl = document.getElementById('calendarioAgendamentos');
    if (!calendarioEl) {
        console.error("Elemento #calendarioAgendamentos não encontrado no DOM!");
        return null;
    }
    calendarioEl.innerHTML = '';

    const calendar = new FullCalendar.Calendar(calendarioEl, {
        initialView: 'dayGridMonth',
        locale: 'pt-br',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
        },
        buttonText: {
            today:    'Hoje',
            month:    'Mês',
            week:     'Semana',
            day:      'Dia',
            list:     'Lista'
        },
        events: async function(fetchInfo, successCallback, failureCallback) {
            try {
                const agendamentos = await getAgendamentos();
                const eventosFormatados = agendamentos.map(ag => {
                    const horaValida = ag.hora_agendamento && ag.hora_agendamento.length >= 5
                                       ? ag.hora_agendamento.substring(0,5)
                                       : '00:00';

                    let corFundo = '#007bff'; // Azul padrão (Agendado)
                    let corBorda = '#007bff';
                    let corTexto = '#ffffff'; // Branco para boa legibilidade

                    switch (ag.status_agendamento) {
                        case 'Confirmado':
                            corFundo = '#28a745'; // Verde
                            corBorda = '#28a745';
                            break;
                        case 'Realizado':
                            corFundo = '#6c757d'; // Cinza
                            corBorda = '#6c757d';
                            break;
                        case 'Cancelado':
                            corFundo = '#dc3545'; // Vermelho
                            corBorda = '#dc3545';
                            break;
                        case 'Nao Compareceu': // Corrigido para corresponder ao value do select
                            corFundo = '#ffc107'; // Amarelo/Laranja Bootstrap
                            corBorda = '#ffc107';
                            corTexto = '#212529'; // Texto escuro para fundos claros
                            break;
                        case 'Agendado':
                        default:
                            // Mantém o azul padrão já definido
                            break;
                    }

                    return {
                        id: String(ag.id), // Garante que o ID é uma string, como esperado por alguns usos do FullCalendar
                        title: `${ag.servico_solicitado.substring(0,25)}${ag.servico_solicitado.length > 25 ? '...' : ''} (${ag.cliente_nome || 'N/A'})`,
                        start: `${ag.data_agendamento}T${horaValida}:00`,
                        backgroundColor: corFundo,
                        borderColor: corBorda,
                        textColor: corTexto,
                        extendedProps: {
                            cliente: ag.cliente_nome,
                            veiculo: ag.veiculo_info,
                            status: ag.status_agendamento,
                            servicoCompleto: ag.servico_solicitado,
                            observacoes: ag.observacoes,
                            mecanico: ag.mecanico_nome,
                            // Passar os dados originais do agendamento para o modal, se necessário
                            cliente_id_original: ag.cliente,
                            veiculo_id_original: ag.veiculo,
                            mecanico_id_original: ag.mecanico_atribuido
                        }
                    };
                });
                successCallback(eventosFormatados);
            } catch (error) {
                console.error("Erro ao buscar agendamentos para o calendário:", error);
                failureCallback(error);
            }
        },
        eventClick: function(info) {
            // console.log('Agendamento clicado:', info.event);
            if(info.event.id) {
                // Usar getAgendamentoById para pegar os dados mais recentes e completos para o modal
                // já que extendedProps pode não ter todos os IDs de FK (cliente, veiculo) que configurarModalAgendamento espera
                // ou podemos passar os IDs via extendedProps se o serializer já os tiver.
                // Por simplicidade e para garantir dados frescos, vamos chamar abrirModalEditarAgendamento
                // que internamente já faz o getAgendamentoById.
                abrirModalEditarAgendamento(info.event.id);
            }
        }
    });

    calendar.render();
    console.log("Calendário de agendamentos inicializado e renderizado com eventos e cores.");
    return calendar;
}

export async function abrirModalNovoAgendamento() {
    await configurarModalAgendamento('novo');
}

export async function abrirModalEditarAgendamento(id) {
    try {
        const agendamento = await getAgendamentoById(id); // Pega os dados mais recentes
        if (!agendamento) { alert(`Agendamento com ID ${id} não encontrado.`); return; }
        // Passa todos os dados do agendamento para configurar o modal
        await configurarModalAgendamento('editar', agendamento);
    } catch (error) {
        console.error('Erro ao carregar agendamento para edição:', error);
        alert(`Erro ao carregar dados do agendamento: ${error.message}`);
    }
}

export async function handleVerDetalhesAgendamento(id) { // Esta função pode não ser mais necessária se eventClick abre para edição
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

        if (window.fullCalendarInstance) {
            window.fullCalendarInstance.refetchEvents();
        } else {
            console.warn("Instância do FullCalendar não encontrada para recarregar eventos após salvar.");
        }

    } catch (error) {
        console.error('Erro ao salvar agendamento:', error);
        alert(`Erro ao salvar agendamento: ${error.message}`);
    }
}

export async function handleDeletarAgendamento(id) {
    if (confirm(`Tem certeza que deseja deletar o agendamento com ID: ${id}?`)) {
        try {
            await deleteAgendamentoAPI(id);
            alert('Agendamento deletado com sucesso!');
            if (window.fullCalendarInstance) {
                window.fullCalendarInstance.refetchEvents();
            } else {
                console.warn("Instância do FullCalendar não encontrada para recarregar eventos após deletar.");
            }
        } catch (error) {
            console.error('Erro ao deletar agendamento:', error);
            alert(`Erro ao deletar agendamento: ${error.message}`);
        }
    }
}