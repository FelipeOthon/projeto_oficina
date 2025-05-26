// frontend/js/ordemDeServicoUI.js
import { getOrdensDeServico, createOrdemDeServico, getOrdemDeServicoById /*, updateOrdemDeServico, deleteOrdemDeServicoAPI */ } from './ordemDeServicoService.js';
import { getClientes } from './clienteService.js';
import { getVeiculos } from './veiculoService.js';
// Se for usar mecânicos: import { getUsuariosPorTipo } from './usuarioService.js'; // Supondo que exista

// IDs dos elementos HTML - VERIFIQUE SE CORRESPONDEM AO SEU index.html
const listaOrdensServicoUI = document.getElementById('lista-ordens-servico');
const formOS = document.getElementById('formOS');
const osIdInput = document.getElementById('osId');
const osClienteSelect = document.getElementById('osCliente');
const osVeiculoSelect = document.getElementById('osVeiculo');
const osMecanicoSelect = document.getElementById('osMecanicoResponsavel');
const osModalLabel = document.getElementById('osModalLabel');
const osModal = $('#osModal');
const btnSalvarOSModal = document.getElementById('btnSalvarOS');

// --- Funções para Popular Selects (Dropdowns) no Modal de OS ---
// EXPORTANDO esta função
export async function populateClientesParaOS(selectedClienteId = null) {
    if (!osClienteSelect) {
        console.warn("Elemento #osCliente não encontrado no DOM.");
        return;
    }
    try {
        console.log("[ordemDeServicoUI.js] Buscando clientes para OS dropdown...");
        const clientes = await getClientes();
        osClienteSelect.innerHTML = '<option value="">Selecione um Cliente...</option>';
        if (Array.isArray(clientes) && clientes.length > 0) {
            clientes.forEach(cliente => {
                const option = document.createElement('option');
                option.value = cliente.id;
                option.textContent = cliente.nome_completo;
                if (selectedClienteId && cliente.id === parseInt(selectedClienteId)) {
                    option.selected = true;
                }
                osClienteSelect.appendChild(option);
            });
            console.log("[ordemDeServicoUI.js] Dropdown de clientes para OS populado.");
        } else {
            console.log("[ordemDeServicoUI.js] Nenhum cliente encontrado para popular dropdown de OS.");
        }
    } catch (error) {
        console.error('Erro ao popular dropdown de clientes para OS:', error);
        osClienteSelect.innerHTML = '<option value="">Erro ao carregar clientes</option>';
    }
}

// EXPORTANDO esta função
export async function populateVeiculosParaOS(clienteId, selectedVeiculoId = null) {
    console.log('[ordemDeServicoUI.js] populateVeiculosParaOS chamado com clienteId:', clienteId);
    if (!osVeiculoSelect) {
        console.warn("Elemento #osVeiculo não encontrado no DOM.");
        return;
    }
    osVeiculoSelect.innerHTML = '<option value="">Carregando veículos...</option>';
    if (!clienteId || clienteId === "") {
        osVeiculoSelect.innerHTML = '<option value="">Selecione um cliente primeiro...</option>';
        return;
    }
    try {
        const todosVeiculos = await getVeiculos();
        console.log('[ordemDeServicoUI.js] Todos os veículos buscados para OS:', todosVeiculos);
        osVeiculoSelect.innerHTML = '<option value="">Selecione um Veículo...</option>';
        if (Array.isArray(todosVeiculos) && todosVeiculos.length > 0) {
            const veiculosDoCliente = todosVeiculos.filter(v => v.cliente === parseInt(clienteId));
            console.log('[ordemDeServicoUI.js] Veículos filtrados para OS do cliente:', veiculosDoCliente);
            if (veiculosDoCliente.length > 0) {
                veiculosDoCliente.forEach(veiculo => {
                    const option = document.createElement('option');
                    option.value = veiculo.id;
                    option.textContent = `${veiculo.marca} ${veiculo.modelo} (${veiculo.placa})`;
                    if (selectedVeiculoId && veiculo.id === parseInt(selectedVeiculoId)) {
                        option.selected = true;
                    }
                    osVeiculoSelect.appendChild(option);
                    console.log('[ordemDeServicoUI.js] Adicionada opção de veículo ao select:', option.textContent);
                });
            } else {
                 osVeiculoSelect.innerHTML = '<option value="">Nenhum veículo cadastrado para este cliente</option>';
            }
        } else {
            osVeiculoSelect.innerHTML = '<option value="">Nenhum veículo encontrado no sistema</option>';
        }
    } catch (error) {
        console.error('Erro ao popular dropdown de veículos para OS:', error);
        osVeiculoSelect.innerHTML = '<option value="">Erro ao carregar veículos</option>';
    }
}

// async function populateMecanicosParaOS(selectedMecanicoId = null) { ... } // TODO se necessário

export async function renderOrdensDeServico() {
    // ... (código existente, sem alterações aqui)
    if (!listaOrdensServicoUI) {
        console.warn("Elemento #lista-ordens-servico não encontrado no DOM.");
        return;
    }
    listaOrdensServicoUI.innerHTML = '<li class="list-group-item">Carregando Ordens de Serviço...</li>';
    try {
        const ordens = await getOrdensDeServico();
        listaOrdensServicoUI.innerHTML = '';
        if (Array.isArray(ordens) && ordens.length > 0) {
            ordens.forEach(os => {
                const item = document.createElement('li');
                item.className = 'list-group-item';
                const dataEntradaFormatada = os.data_entrada ? new Date(os.data_entrada).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A';
                const numPecas = os.itens_pecas ? os.itens_pecas.length : 0;
                const numServicos = os.itens_servicos ? os.itens_servicos.length : 0;
                const valorTotalOS = parseFloat(os.valor_total_os_calculado || os.valor_total_os || 0).toFixed(2);

                item.innerHTML = `
                    <div>
                        <strong>OS Nº: ${os.numero_os}</strong> - Cliente: ${os.cliente_nome || 'N/A'}<br>
                        <small>Veículo: ${os.veiculo_info || 'N/A'} | Entrada: ${dataEntradaFormatada}</small><br>
                        <small>Status: ${os.status_os} | Total: R$ ${valorTotalOS}</small><br>
                        <small>Peças: ${numPecas} item(s) | Serviços: ${numServicos} item(s)</small>
                    </div>
                    <div class="mt-2">
                        <button class="btn btn-sm btn-info mr-2 btn-detalhes-os" data-id="${os.id}">Detalhes/Itens</button>
                        <button class="btn btn-sm btn-warning mr-2 btn-editar-os" data-id="${os.id}">Editar OS</button>
                        <button class="btn btn-sm btn-danger btn-deletar-os" data-id="${os.id}">Deletar OS</button>
                    </div>
                `;
                listaOrdensServicoUI.appendChild(item);
            });
        } else {
            listaOrdensServicoUI.innerHTML = '<li class="list-group-item">Nenhuma Ordem de Serviço encontrada.</li>';
        }
    } catch (error) {
        console.error('Erro ao renderizar Ordens de Serviço:', error);
        listaOrdensServicoUI.innerHTML = `<li class="list-group-item text-danger">Erro ao carregar Ordens de Serviço: ${error.message}</li>`;
    }
}

export async function abrirModalNovaOS() {
    if (!formOS) { console.error("Formulário de OS (#formOS) não encontrado."); return; }
    formOS.reset();
    if (osIdInput) osIdInput.value = '';
    if (osModalLabel) osModalLabel.textContent = 'Adicionar Nova Ordem de Serviço';

    await populateClientesParaOS(); // Popula clientes
    if (osVeiculoSelect) osVeiculoSelect.innerHTML = '<option value="">Selecione um cliente primeiro...</option>'; // Reseta veículos

    const camposFormulario = formOS.elements;
    for (let campo of camposFormulario) {
        if (campo.type !== 'hidden' && campo.type !== 'button') campo.disabled = false;
    }
    if (osClienteSelect) osClienteSelect.disabled = false;
    if (osVeiculoSelect) osVeiculoSelect.disabled = false;
    if (btnSalvarOSModal) btnSalvarOSModal.style.display = 'inline-block';

    if (osModal.length) osModal.modal('show');
}

export async function handleSalvarOS() {
    // ... (código existente, como te passei antes) ...
    if (!formOS || !osIdInput) { console.error("Formulário de OS ou campo de ID não encontrado(s)."); return; }
    const id = osIdInput.value;
    const dadosOS = {
        numero_os: document.getElementById('osNumeroOs')?.value,
        cliente: document.getElementById('osCliente')?.value,
        veiculo: document.getElementById('osVeiculo')?.value,
        mecanico_responsavel: document.getElementById('osMecanicoResponsavel')?.value || null,
        data_saida_prevista: document.getElementById('osDataSaidaPrevista')?.value || null,
        descricao_problema_cliente: document.getElementById('osDescricaoProblemaCliente')?.value,
        diagnostico_mecanico: document.getElementById('osDiagnosticoMecanico')?.value || null,
        servicos_executados_obs: document.getElementById('osServicosExecutadosObs')?.value || null,
        valor_desconto: parseFloat(document.getElementById('osValorDesconto')?.value || 0).toFixed(2),
        status_os: document.getElementById('osStatus')?.value,
        observacoes_internas: document.getElementById('osObservacoesInternas')?.value || null,
    };

    if (!dadosOS.numero_os || !dadosOS.cliente || !dadosOS.veiculo || !dadosOS.descricao_problema_cliente || !dadosOS.status_os) {
        alert('Número da OS, Cliente, Veículo, Descrição do Problema e Status são obrigatórios!');
        return;
    }
    if (dadosOS.data_saida_prevista === "") dadosOS.data_saida_prevista = null;

    try {
        let osSalva;
        if (id) {
            alert('Funcionalidade de Editar OS principal a ser implementada.'); return;
        } else {
            osSalva = await createOrdemDeServico(dadosOS);
            alert('Ordem de Serviço criada com sucesso!');
        }
        if (osModal.length) osModal.modal('hide');
        renderOrdensDeServico();
    } catch (error) {
        console.error('Erro ao salvar Ordem de Serviço:', error);
        alert(`Erro ao salvar Ordem de Serviço: ${error.message}`);
    }
}

// Placeholders para as próximas funções
export async function abrirModalEditarOS(id) {
    alert(`Abrir modal para editar OS ID: ${id} (a ser implementado)`);
}
export async function handleDeletarOS(id) {
    alert(`Deletar OS ID: ${id} (a ser implementado)`);
}
export async function handleVerDetalhesOS(id) {
    alert(`Ver detalhes/itens da OS ID: ${id} (a ser implementado)`);
}