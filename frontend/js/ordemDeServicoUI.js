// frontend/js/ordemDeServicoUI.js
import {
    getOrdensDeServico, createOrdemDeServico, getOrdemDeServicoById,
    updateOrdemDeServico, deleteOrdemDeServicoAPI
} from './ordemDeServicoService.js';
import { getClientes } from './clienteService.js';
import { getVeiculos } from './veiculoService.js';
import {
    createItemOsPeca, getItemOsPecaById, updateItemOsPeca, deleteItemOsPecaAPI
} from './itemOsPecaService.js';
import {
    createItemOsServico, getItemOsServicoById, updateItemOsServico, deleteItemOsServicoAPI
} from './itemOsServicoService.js';

// IDs OS Principal
const listaOrdensServicoUI = document.getElementById('lista-ordens-servico');
const formOS = document.getElementById('formOS');
const osIdInput = document.getElementById('osId');
const osClienteSelect = document.getElementById('osCliente');
const osVeiculoSelect = document.getElementById('osVeiculo');
const osMecanicoSelect = document.getElementById('osMecanicoResponsavel');
const osModalLabel = document.getElementById('osModalLabel');
const osModal = $('#osModal');
const btnSalvarOSModal = document.getElementById('btnSalvarOS');

// IDs Modal Item Peça
const itemPecaModalElement = $('#itemPecaModal');
const itemPecaModalLabelElement = document.getElementById('itemPecaModalLabel');
const formItemPeca = document.getElementById('formItemPeca');
const itemPecaOsIdInput = document.getElementById('itemPecaOsId');
const itemPecaIdInput = document.getElementById('itemPecaId');

// IDs Modal Item Serviço
const itemServicoModalElement = $('#itemServicoModal');
const itemServicoModalLabelElement = document.getElementById('itemServicoModalLabel');
const formItemServico = document.getElementById('formItemServico');
const itemServicoOsIdInput = document.getElementById('itemServicoOsId');
const itemServicoIdInput = document.getElementById('itemServicoId');

let osAtualIdParaItens = null; // Guarda o ID da OS ativa no modal de detalhes

export async function populateClientesParaOS(selectedClienteId = null) {
    if (!osClienteSelect) { return; }
    try {
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
        }
    } catch (error) { console.error('Erro ao popular clientes para OS:', error); osClienteSelect.innerHTML = '<option value="">Erro ao carregar</option>';}
}

export async function populateVeiculosParaOS(clienteId, selectedVeiculoId = null) {
    if (!osVeiculoSelect) { return; }
    osVeiculoSelect.innerHTML = '<option value="">Carregando...</option>';
    if (!clienteId) { osVeiculoSelect.innerHTML = '<option value="">Selecione cliente</option>'; return; }
    try {
        const todosVeiculos = await getVeiculos();
        osVeiculoSelect.innerHTML = '<option value="">Selecione Veículo...</option>';
        if (Array.isArray(todosVeiculos) && todosVeiculos.length > 0) {
            const veiculosDoCliente = todosVeiculos.filter(v => v.cliente === parseInt(clienteId));
            if (veiculosDoCliente.length > 0) {
                veiculosDoCliente.forEach(veiculo => {
                    const option = document.createElement('option');
                    option.value = veiculo.id;
                    option.textContent = `${veiculo.marca} ${veiculo.modelo} (${veiculo.placa})`;
                    if (selectedVeiculoId && veiculo.id === parseInt(selectedVeiculoId)) {
                        option.selected = true;
                    }
                    osVeiculoSelect.appendChild(option);
                });
            } else { osVeiculoSelect.innerHTML = '<option value="">Cliente sem veículos</option>'; }
        } else { osVeiculoSelect.innerHTML = '<option value="">Nenhum veículo</option>';}
    } catch (error) { console.error('Erro ao popular veículos para OS:', error); osVeiculoSelect.innerHTML = '<option value="">Erro ao carregar</option>';}
}

async function configurarModalOS(modo, osData = null) {
    if (!formOS || !osIdInput || !osModalLabel || !osModal.length || !btnSalvarOSModal) {
        console.error("Elementos do modal OS principal não foram encontrados."); return;
    }
    formOS.reset();
    osIdInput.value = osData ? osData.id : '';
    const camposForm = formOS.elements;
    let tituloModal = '';

    if (modo === 'novo') {
        tituloModal = 'Adicionar Nova Ordem de Serviço';
        await populateClientesParaOS();
        if(osVeiculoSelect) osVeiculoSelect.innerHTML = '<option value="">Selecione cliente</option>';
    } else if (modo === 'editar') {
        tituloModal = 'Editar Ordem de Serviço';
        if (osData) {
            await populateClientesParaOS(osData.cliente);
            await populateVeiculosParaOS(osData.cliente, osData.veiculo);
            if(document.getElementById('osNumeroOs')) document.getElementById('osNumeroOs').value = osData.numero_os || '';
            if(document.getElementById('osMecanicoResponsavel')) document.getElementById('osMecanicoResponsavel').value = osData.mecanico_responsavel || "";
            if(document.getElementById('osDataSaidaPrevista')) document.getElementById('osDataSaidaPrevista').value = osData.data_saida_prevista || '';
            if(document.getElementById('osDescricaoProblemaCliente')) document.getElementById('osDescricaoProblemaCliente').value = osData.descricao_problema_cliente || '';
            if(document.getElementById('osDiagnosticoMecanico')) document.getElementById('osDiagnosticoMecanico').value = osData.diagnostico_mecanico || '';
            if(document.getElementById('osServicosExecutadosObs')) document.getElementById('osServicosExecutadosObs').value = osData.servicos_executados_obs || '';
            if(document.getElementById('osValorDesconto')) document.getElementById('osValorDesconto').value = parseFloat(osData.valor_desconto || 0).toFixed(2);
            if(document.getElementById('osStatus')) document.getElementById('osStatus').value = osData.status_os || 'Aberta';
            if(document.getElementById('osObservacoesInternas')) document.getElementById('osObservacoesInternas').value = osData.observacoes_internas || '';
        }
    }
    for (let campo of camposForm) { if (campo.type !== 'hidden' && campo.type !== 'button') campo.disabled = false; }
    if (osClienteSelect) osClienteSelect.disabled = false;
    if (osVeiculoSelect) osVeiculoSelect.disabled = false;
    btnSalvarOSModal.style.display = 'inline-block';
    osModalLabel.textContent = tituloModal;
    osModal.modal('show');
}

export async function renderOrdensDeServico() {
    if (!listaOrdensServicoUI) { console.warn("Elemento #lista-ordens-servico não encontrado."); return; }
    listaOrdensServicoUI.innerHTML = '<li class="list-group-item">Carregando OSs...</li>';
    try {
        const ordens = await getOrdensDeServico();
        listaOrdensServicoUI.innerHTML = '';
        if (Array.isArray(ordens) && ordens.length > 0) {
            ordens.forEach(os => {
                const item = document.createElement('li');
                item.className = 'list-group-item';
                const dataEntradaF = os.data_entrada ? new Date(os.data_entrada).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A';
                const numPecas = os.itens_pecas ? os.itens_pecas.length : 0;
                const numServicos = os.itens_servicos ? os.itens_servicos.length : 0;
                const valorTotalOS = parseFloat(os.valor_total_os || 0).toFixed(2);
                item.innerHTML = `
                    <div>
                        <strong>OS Nº: ${os.numero_os}</strong> - Cliente: ${os.cliente_nome || 'N/A'}<br>
                        <small>Veículo: ${os.veiculo_info || 'N/A'} | Entrada: ${dataEntradaF}</small><br>
                        <small>Status: ${os.status_os} | Total: R$ ${valorTotalOS}</small><br>
                        <small>Peças: ${numPecas} item(s) | Serviços: ${numServicos} item(s)</small>
                    </div>
                    <div class="mt-2">
                        <button class="btn btn-sm btn-info mr-2 btn-detalhes-os" data-id="${os.id}">Detalhes/Itens</button>
                        <button class="btn btn-sm btn-warning mr-2 btn-editar-os" data-id="${os.id}">Editar OS</button>
                        <button class="btn btn-sm btn-danger btn-deletar-os" data-id="${os.id}">Deletar OS</button>
                    </div>`;
                listaOrdensServicoUI.appendChild(item);
            });
        } else { listaOrdensServicoUI.innerHTML = '<li class="list-group-item">Nenhuma OS encontrada.</li>'; }
    } catch (error) { console.error('Erro ao renderizar OSs:', error); listaOrdensServicoUI.innerHTML = `<li class="list-group-item text-danger">Erro: ${error.message}</li>`; }
}

export async function abrirModalNovaOS() { await configurarModalOS('novo'); }
export async function abrirModalEditarOS(id) {
    try {
        const os = await getOrdemDeServicoById(id);
        if (!os) { alert(`OS ID ${id} não encontrada.`); return; }
        await configurarModalOS('editar', os);
    } catch (error) { console.error('Erro ao carregar OS para edição:', error); alert(`Erro: ${error.message}`); }
}
export async function handleSalvarOS() {
    if (!formOS || !osIdInput) return;
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
        alert('Campos obrigatórios da OS não preenchidos!'); return;
    }
    try {
        if (id) { await updateOrdemDeServico(id, dadosOS); alert('OS atualizada!'); }
        else { await createOrdemDeServico(dadosOS); alert('OS criada!'); }
        if(osModal.length) osModal.modal('hide');
        renderOrdensDeServico();
    } catch (error) { console.error('Erro ao salvar OS:', error); alert(`Erro: ${error.message}`); }
}
export async function handleDeletarOS(id) {
    if (confirm(`Deletar OS ID: ${id}? Itens também serão deletados.`)) {
        try {
            await deleteOrdemDeServicoAPI(id); alert('OS deletada!'); renderOrdensDeServico();
        } catch (error) { console.error('Erro ao deletar OS:', error); alert(`Erro: ${error.message}`); }
    }
}

// --- GERENCIAMENTO DE ITENS DE PEÇA ---
export function abrirModalAdicionarPeca(osId) {
    if (!formItemPeca || !itemPecaOsIdInput || !itemPecaIdInput || !itemPecaModalLabelElement || !itemPecaModalElement.length) { console.error("Elementos do modal Item Peça não encontrados."); return; }
    formItemPeca.reset();
    itemPecaOsIdInput.value = osId;
    itemPecaIdInput.value = '';
    itemPecaModalLabelElement.textContent = `Adicionar Peça à OS Nº ${osId}`;
    const camposForm = formItemPeca.elements;
    for (let campo of camposForm) { if (campo.type !== 'hidden' && campo.type !== 'button') campo.disabled = false; }
    const btnSalvar = document.getElementById('btnSalvarItemPeca'); if(btnSalvar) btnSalvar.style.display = 'inline-block';
    itemPecaModalElement.modal('show');
}

export async function abrirModalEditarItemPeca(osId, itemId) {
    if (!formItemPeca || !itemPecaOsIdInput || !itemPecaIdInput || !itemPecaModalLabelElement || !itemPecaModalElement.length) { console.error("Elementos do modal Item Peça não encontrados."); return; }
    formItemPeca.reset();
    try {
        const item = await getItemOsPecaById(osId, itemId);
        if (!item) { alert(`Peça ID ${itemId} não encontrada.`); return; }
        itemPecaOsIdInput.value = osId;
        itemPecaIdInput.value = item.id;
        itemPecaModalLabelElement.textContent = `Editar Peça da OS Nº ${osId}`;
        if(document.getElementById('itemPecaDescricao')) document.getElementById('itemPecaDescricao').value = item.descricao_peca || '';
        if(document.getElementById('itemPecaQuantidade')) document.getElementById('itemPecaQuantidade').value = item.quantidade || 0;
        if(document.getElementById('itemPecaValorUnitario')) document.getElementById('itemPecaValorUnitario').value = item.valor_unitario || 0;
        const camposForm = formItemPeca.elements;
        for (let campo of camposForm) { if (campo.type !== 'hidden' && campo.type !== 'button') campo.disabled = false; }
        const btnSalvar = document.getElementById('btnSalvarItemPeca'); if(btnSalvar) btnSalvar.style.display = 'inline-block';
        itemPecaModalElement.modal('show');
    } catch (e) { console.error('Erro ao carregar peça para edição:', e); alert(`Erro: ${e.message}`); }
}

export async function handleSalvarItemPeca() {
    if (!formItemPeca || !itemPecaOsIdInput) return;
    const osId = itemPecaOsIdInput.value;
    const itemId = itemPecaIdInput.value;
    const dados = {
        descricao_peca: document.getElementById('itemPecaDescricao')?.value,
        quantidade: Number(document.getElementById('itemPecaQuantidade')?.value),
        valor_unitario: Number(document.getElementById('itemPecaValorUnitario')?.value)
    };
    if (!osId || !dados.descricao_peca || isNaN(dados.quantidade) || dados.quantidade <= 0 || isNaN(dados.valor_unitario) || dados.valor_unitario < 0) {
        alert('Todos os campos da peça são obrigatórios!'); return;
    }
    try {
        if (itemId) { await updateItemOsPeca(osId, itemId, dados); alert('Peça atualizada!'); }
        else { await createItemOsPeca(osId, dados); alert('Peça adicionada!'); }
        if(itemPecaModalElement.length) itemPecaModalElement.modal('hide');
        if (osAtualIdParaItens) await handleVerDetalhesOS(osAtualIdParaItens); // Usa a variável de módulo
        await renderOrdensDeServico();
    } catch (e) { console.error('Erro ao salvar peça:', e); alert(`Erro: ${e.message}`); }
}

export async function handleDeletarItemPeca(osId, itemId) {
    if (confirm(`Deletar peça ID: ${itemId} da OS Nº ${osId}?`)) {
        try {
            await deleteItemOsPecaAPI(osId, itemId); alert('Peça deletada!');
            if (osAtualIdParaItens) await handleVerDetalhesOS(osAtualIdParaItens); // Usa a variável de módulo
            await renderOrdensDeServico();
        } catch (e) { console.error('Erro ao deletar peça:', e); alert(`Erro: ${e.message}`); }
    }
}

// --- FUNÇÕES PARA GERENCIAR ITENS DE SERVIÇO ---
export function abrirModalAdicionarServico(osId) {
    if (!formItemServico || !itemServicoOsIdInput || !itemServicoIdInput || !itemServicoModalLabelElement || !itemServicoModalElement.length) { return; }
    formItemServico.reset();
    itemServicoOsIdInput.value = osId;
    itemServicoIdInput.value = '';
    itemServicoModalLabelElement.textContent = `Adicionar Serviço à OS Nº ${osId}`;
    const camposForm = formItemServico.elements;
    for (let campo of camposForm) { if (campo.type !== 'hidden' && campo.type !== 'button') campo.disabled = false; }
    const btnSalvar = document.getElementById('btnSalvarItemServico'); if(btnSalvar) btnSalvar.style.display = 'inline-block';
    itemServicoModalElement.modal('show');
}

export async function abrirModalEditarItemServico(osId, itemId) {
    if (!formItemServico || !itemServicoOsIdInput || !itemServicoIdInput || !itemServicoModalLabelElement || !itemServicoModalElement.length) { return; }
    formItemServico.reset();
    try {
        const item = await getItemOsServicoById(osId, itemId);
        if(!item) { alert(`Serviço ID ${itemId} da OS ${osId} não encontrado.`); return; }
        itemServicoOsIdInput.value = osId;
        itemServicoIdInput.value = item.id;
        itemServicoModalLabelElement.textContent = `Editar Serviço da OS Nº ${osId}`;
        if(document.getElementById('itemServicoDescricao')) document.getElementById('itemServicoDescricao').value = item.descricao_servico || '';
        if(document.getElementById('itemServicoValor')) document.getElementById('itemServicoValor').value = item.valor_servico || 0;
        const camposForm = formItemServico.elements;
        for (let campo of camposForm) { if (campo.type !== 'hidden' && campo.type !== 'button') campo.disabled = false; }
        const btnSalvar = document.getElementById('btnSalvarItemServico'); if(btnSalvar) btnSalvar.style.display = 'inline-block';
        itemServicoModalElement.modal('show');
    } catch (e) { console.error('Erro ao carregar serviço para edição:', e); alert(`Erro: ${e.message}`); }
}

export async function handleSalvarItemServico() {
    if (!formItemServico || !itemServicoOsIdInput) return;
    const osId = itemServicoOsIdInput.value;
    const itemId = itemServicoIdInput.value;
    const dados = {
        descricao_servico: document.getElementById('itemServicoDescricao')?.value,
        valor_servico: Number(document.getElementById('itemServicoValor')?.value)
    };
    if (!osId || !dados.descricao_servico || isNaN(dados.valor_servico) || dados.valor_servico < 0) {
        alert('Todos os campos do serviço são obrigatórios!'); return;
    }
    try {
        if (itemId) { await updateItemOsServico(osId, itemId, dados); alert('Serviço atualizado!'); }
        else { await createItemOsServico(osId, dados); alert('Serviço adicionado!'); }
        if(itemServicoModalElement.length) itemServicoModalElement.modal('hide');
        if (osAtualIdParaItens) await handleVerDetalhesOS(osAtualIdParaItens); // Usa a variável de módulo
        await renderOrdensDeServico();
    } catch (e) { console.error('Erro ao salvar serviço:', e); alert(`Erro: ${e.message}`); }
}

export async function handleDeletarItemServico(osId, itemId) {
    if (confirm(`Deletar serviço ID: ${itemId} da OS Nº ${osId}?`)) {
        try {
            await deleteItemOsServicoAPI(osId, itemId); alert('Serviço deletado!');
            if (osAtualIdParaItens) await handleVerDetalhesOS(osAtualIdParaItens); // Usa a variável de módulo
            await renderOrdensDeServico();
        } catch (e) { console.error('Erro ao deletar serviço:', e); alert(`Erro: ${e.message}`); }
    }
}

// --- FUNÇÃO HANDLEVERDETALHESOS ---
export async function handleVerDetalhesOS(id) {
    console.log('[ordemDeServicoUI.js] -> handleVerDetalhesOS - ID recebido:', id);

    // Define as constantes dos elementos do modal de detalhes AQUI DENTRO
    const osDetalhesModalElem = $('#osDetalhesItensModal');
    const osDetalhesConteudoElem = document.getElementById('osDetalhesConteudo');
    const osDetalhesItensPecasElem = document.getElementById('osDetalhesItensPecas');
    const osDetalhesItensServicosElem = document.getElementById('osDetalhesItensServicos');
    const osDetalhesModalLabelElem = document.getElementById('osDetalhesItensModalLabel');

    if (!osDetalhesConteudoElem || !osDetalhesItensPecasElem || !osDetalhesItensServicosElem || !osDetalhesModalElem.length || !osDetalhesModalLabelElem) {
        alert("Elementos do modal de detalhes da OS não encontrados no HTML. Verifique os IDs.");
        console.error("Elementos do modal de detalhes da OS não encontrados. Verifique os IDs no HTML.");
        return;
    }
    osAtualIdParaItens = id;
    try {
        const os = await getOrdemDeServicoById(id);
        if (!os) { alert(`Ordem de Serviço com ID ${id} não encontrada.`); return; }
        osDetalhesConteudoElem.innerHTML = 'Carregando...';
        osDetalhesItensPecasElem.innerHTML = '<h6>Peças:</h6>';
        osDetalhesItensServicosElem.innerHTML = '<h6>Serviços:</h6>';

        const dataEntradaF = os.data_entrada ? new Date(os.data_entrada).toLocaleString('pt-BR', {dateStyle: 'short', timeStyle: 'short'}) : 'N/A';
        const dataSaidaF = os.data_saida_prevista ? new Date(os.data_saida_prevista+'T00:00:00').toLocaleDateString('pt-BR') : 'N/A';
        const dataConclusaoF = os.data_conclusao ? new Date(os.data_conclusao).toLocaleString('pt-BR', {dateStyle: 'short', timeStyle: 'short'}) : 'N/A';
        const valorTotalOS = parseFloat(os.valor_total_os || 0).toFixed(2);

        osDetalhesConteudoElem.innerHTML = `
            <p><strong>Cliente:</strong> ${os.cliente_nome || os.cliente}</p>
            <p><strong>Veículo:</strong> ${os.veiculo_info || os.veiculo}</p>
            <p><strong>Mecânico:</strong> ${os.mecanico_nome || 'Não atribuído'}</p>
            <hr>
            <p><strong>Data de Entrada:</strong> ${dataEntradaF}</p>
            <p><strong>Data de Saída Prevista:</strong> ${dataSaidaF}</p>
            <p><strong>Data de Conclusão:</strong> ${dataConclusaoF || 'Pendente'}</p>
            <hr>
            <p><strong>Problema Relatado:</strong></p>
            <p><pre>${os.descricao_problema_cliente || ''}</pre></p>
            <p><strong>Diagnóstico do Mecânico:</strong></p>
            <p><pre>${os.diagnostico_mecanico || 'N/A'}</pre></p>
            <p><strong>Observações de Serviços Executados:</strong></p>
            <p><pre>${os.servicos_executados_obs || 'N/A'}</pre></p>
            <hr>
            <p><strong>Status:</strong> <span class="badge badge-info">${os.status_os}</span></p>
            <p><strong>Subtotal Peças:</strong> R$ ${parseFloat(os.valor_total_pecas || 0).toFixed(2)}</p>
            <p><strong>Subtotal Serviços:</strong> R$ ${parseFloat(os.valor_total_servicos || 0).toFixed(2)}</p>
            <p><strong>Desconto:</strong> R$ ${parseFloat(os.valor_desconto || 0).toFixed(2)}</p>
            <h4><strong>Valor Total OS:</strong> R$ ${valorTotalOS}</h4>
            <p><strong>Observações Internas:</strong></p>
            <p><pre>${os.observacoes_internas || 'N/A'}</pre></p>
        `;

        const btnAdicionarPecaOS = document.getElementById('btnAbrirModalAdicionarPecaOS');
        if (btnAdicionarPecaOS) btnAdicionarPecaOS.dataset.osId = id;
        const btnAdicionarServicoOS = document.getElementById('btnAbrirModalAdicionarServicoOS');
        if (btnAdicionarServicoOS) btnAdicionarServicoOS.dataset.osId = id;

        if (os.itens_pecas && os.itens_pecas.length > 0) {
            os.itens_pecas.forEach(peca => {
                const li = document.createElement('li');
                li.className = 'list-group-item d-flex justify-content-between align-items-center';
                li.innerHTML = `
                    <span>${peca.quantidade}x ${peca.descricao_peca} - R$ ${parseFloat(peca.valor_unitario).toFixed(2)} (Total: R$ ${parseFloat(peca.valor_total_item).toFixed(2)})</span>
                    <div>
                        <button class="btn btn-sm btn-outline-warning btn-editar-item-peca" data-os-id="${os.id}" data-item-id="${peca.id}">Editar</button>
                        <button class="btn btn-sm btn-outline-danger btn-deletar-item-peca" data-os-id="${os.id}" data-item-id="${peca.id}">Deletar</button>
                    </div>
                `;
                osDetalhesItensPecasElem.appendChild(li);
            });
        } else { osDetalhesItensPecasElem.innerHTML += '<li class="list-group-item">Nenhuma peça adicionada.</li>'; }

        if (os.itens_servicos && os.itens_servicos.length > 0) {
            os.itens_servicos.forEach(servico => {
                const li = document.createElement('li');
                li.className = 'list-group-item d-flex justify-content-between align-items-center';
                li.innerHTML = `
                    <span>${servico.descricao_servico} - R$ ${parseFloat(servico.valor_servico).toFixed(2)}</span>
                    <div>
                        <button class="btn btn-sm btn-outline-warning btn-editar-item-servico" data-os-id="${os.id}" data-item-id="${servico.id}">Editar</button>
                        <button class="btn btn-sm btn-outline-danger btn-deletar-item-servico" data-os-id="${os.id}" data-item-id="${servico.id}">Deletar</button>
                    </div>
                `;
                osDetalhesItensServicosElem.appendChild(li);
            });
        } else { osDetalhesItensServicosElem.innerHTML += '<li class="list-group-item">Nenhum serviço adicionado.</li>'; }

        if (osDetalhesModalLabelElem) osDetalhesModalLabelElem.textContent = `Detalhes da OS Nº: ${os.numero_os}`;
        osDetalhesModalElem.modal('show');
    } catch (error) {
        console.error('Erro ao carregar detalhes da Ordem de Serviço:', error);
        alert(`Erro ao carregar detalhes da OS: ${error.message}`);
    }
}