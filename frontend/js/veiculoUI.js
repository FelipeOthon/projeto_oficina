// frontend/js/veiculoUI.js
import { getVeiculos, getVeiculoById, createVeiculo, updateVeiculo, deleteVeiculoAPI } from './veiculoService.js';
import { getClientes } from './clienteService.js'; // Precisamos buscar clientes para o dropdown

const listaVeiculosUI = document.getElementById('lista-veiculos');
const formVeiculo = document.getElementById('formVeiculo');
const veiculoIdInput = document.getElementById('veiculoId');
const veiculoClienteSelect = document.getElementById('veiculoCliente');
const veiculoModalLabel = document.getElementById('veiculoModalLabel');
const veiculoModal = $('#veiculoModal'); // jQuery para o modal Bootstrap
const btnSalvarVeiculoModal = document.getElementById('btnSalvarVeiculo'); // Botão Salvar do modal de veículo

// Função auxiliar para configurar o modo do formulário e modal de Veículo
async function configurarModalVeiculo(modo, veiculoData = null, clienteIdParaNovo = null) {
    if (!formVeiculo) { console.error("Formulário de Veículo não encontrado."); return; }
    formVeiculo.reset();

    const camposFormulario = formVeiculo.elements;
    let tituloModal = '';
    let salvarVisivel = true;
    // let clientePreSelecionado = null; // Removido, pois populateClientesDropdown lida com a seleção

    if (modo === 'novo') {
        tituloModal = 'Adicionar Novo Veículo';
        for (let campo of camposFormulario) {
            if (campo.type !== 'hidden' && campo.type !== 'button') campo.disabled = false;
        }
        await populateClientesDropdown(clienteIdParaNovo);
    } else if (modo === 'editar') {
        tituloModal = 'Editar Veículo';
        if (veiculoData) {
            await populateClientesDropdown(veiculoData.cliente); // Popula e seleciona o cliente do veículo
            if(veiculoIdInput) veiculoIdInput.value = veiculoData.id;
            if(document.getElementById('veiculoPlaca')) document.getElementById('veiculoPlaca').value = veiculoData.placa || '';
            if(document.getElementById('veiculoMarca')) document.getElementById('veiculoMarca').value = veiculoData.marca || '';
            if(document.getElementById('veiculoModelo')) document.getElementById('veiculoModelo').value = veiculoData.modelo || '';
            if(document.getElementById('veiculoAnoFabricacao')) document.getElementById('veiculoAnoFabricacao').value = veiculoData.ano_fabricacao || '';
            if(document.getElementById('veiculoAnoModelo')) document.getElementById('veiculoAnoModelo').value = veiculoData.ano_modelo || '';
            if(document.getElementById('veiculoCor')) document.getElementById('veiculoCor').value = veiculoData.cor || '';
            if(document.getElementById('veiculoChassi')) document.getElementById('veiculoChassi').value = veiculoData.chassi || '';
            if(document.getElementById('veiculoObservacoes')) document.getElementById('veiculoObservacoes').value = veiculoData.observacoes || '';
        }
        for (let campo of camposFormulario) {
            if (campo.type !== 'hidden' && campo.type !== 'button') campo.disabled = false;
        }
    } else if (modo === 'detalhes') {
        tituloModal = 'Detalhes do Veículo';
        salvarVisivel = false; // Esconde o botão salvar
        if (veiculoData) {
            await populateClientesDropdown(veiculoData.cliente); // Popula e seleciona o cliente
            if(veiculoIdInput) veiculoIdInput.value = veiculoData.id;
            if(document.getElementById('veiculoPlaca')) document.getElementById('veiculoPlaca').value = veiculoData.placa || '';
            if(document.getElementById('veiculoMarca')) document.getElementById('veiculoMarca').value = veiculoData.marca || '';
            if(document.getElementById('veiculoModelo')) document.getElementById('veiculoModelo').value = veiculoData.modelo || '';
            if(document.getElementById('veiculoAnoFabricacao')) document.getElementById('veiculoAnoFabricacao').value = veiculoData.ano_fabricacao || '';
            if(document.getElementById('veiculoAnoModelo')) document.getElementById('veiculoAnoModelo').value = veiculoData.ano_modelo || '';
            if(document.getElementById('veiculoCor')) document.getElementById('veiculoCor').value = veiculoData.cor || '';
            if(document.getElementById('veiculoChassi')) document.getElementById('veiculoChassi').value = veiculoData.chassi || '';
            if(document.getElementById('veiculoObservacoes')) document.getElementById('veiculoObservacoes').value = veiculoData.observacoes || '';
        }
        for (let campo of camposFormulario) {
            if (campo.type !== 'hidden' && campo.type !== 'button') campo.disabled = true; // Desabilita campos
        }
    }

    if(veiculoModalLabel) veiculoModalLabel.textContent = tituloModal;
    if (btnSalvarVeiculoModal) {
        btnSalvarVeiculoModal.style.display = salvarVisivel ? 'inline-block' : 'none';
    }
    if(veiculoModal.length) veiculoModal.modal('show');
}


// Função para popular o dropdown de clientes no modal de veículo
async function populateClientesDropdown(selectedClienteId = null) {
    if (!veiculoClienteSelect) return;
    try {
        const clientes = await getClientes(); // Busca todos os clientes (sem filtro aqui)
        veiculoClienteSelect.innerHTML = '<option value="">Selecione um Cliente...</option>';
        if (Array.isArray(clientes) && clientes.length > 0) {
            clientes.forEach(cliente => {
                const option = document.createElement('option');
                option.value = cliente.id;
                option.textContent = cliente.nome_completo;
                // Verifica se o ID do cliente corresponde ao ID selecionado (convertido para string para comparação segura)
                if (selectedClienteId && String(cliente.id) === String(selectedClienteId)) {
                    option.selected = true;
                }
                veiculoClienteSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Erro ao popular dropdown de clientes:', error);
        veiculoClienteSelect.innerHTML = '<option value="">Erro ao carregar clientes</option>';
    }
}

// MODIFICADO para aceitar searchTerm
export async function renderVeiculos(searchTerm = '') {
    if (!listaVeiculosUI) return;
    listaVeiculosUI.innerHTML = '<li class="list-group-item">Carregando veículos...</li>';
    try {
        const veiculos = await getVeiculos(searchTerm); // Passa o searchTerm para getVeiculos
        listaVeiculosUI.innerHTML = '';
        if (Array.isArray(veiculos) && veiculos.length > 0) {
            veiculos.forEach(veiculo => {
                const item = document.createElement('li');
                item.className = 'list-group-item d-flex justify-content-between align-items-center';
                item.innerHTML = `
                    <div>
                        <strong>${veiculo.marca} ${veiculo.modelo} (${veiculo.placa})</strong><br>
                        <small>Cliente: ${veiculo.cliente_nome || 'N/A'} | Ano: ${veiculo.ano_modelo || 'N/A'}</small>
                    </div>
                    <div>
                        <button class="btn btn-sm btn-info mr-2 btn-detalhes-veiculo" data-id="${veiculo.id}">Detalhes</button>
                        <button class="btn btn-sm btn-warning mr-2 btn-editar-veiculo" data-id="${veiculo.id}">Editar</button>
                        <button class="btn btn-sm btn-danger btn-deletar-veiculo" data-id="${veiculo.id}">Deletar</button>
                    </div>
                `;
                listaVeiculosUI.appendChild(item);
            });
        } else {
            if (searchTerm) {
                listaVeiculosUI.innerHTML = `<li class="list-group-item">Nenhum veículo encontrado para "${searchTerm}".</li>`;
            } else {
                listaVeiculosUI.innerHTML = '<li class="list-group-item">Nenhum veículo cadastrado.</li>';
            }
        }
    } catch (error) {
        console.error('Erro ao renderizar veículos:', error);
        listaVeiculosUI.innerHTML = `<li class="list-group-item text-danger">Erro ao carregar veículos: ${error.message}</li>`;
    }
}

// Função para abrir o modal para um novo veículo
export async function abrirModalNovoVeiculo() {
    await configurarModalVeiculo('novo');
}

// Função para abrir o modal para editar um veículo existente
export async function abrirModalEditarVeiculo(id) {
    console.log('[veiculoUI.js] -> abrirModalEditarVeiculo - ID recebido:', id, '- Tipo:', typeof id);
    try {
        const veiculo = await getVeiculoById(id);
        await configurarModalVeiculo('editar', veiculo);
    } catch (error) {
        console.error('Erro ao carregar veículo para edição:', error);
        alert(`Erro ao carregar dados do veículo: ${error.message}`);
    }
}

export async function handleVerDetalhesVeiculo(id) {
    console.log('[veiculoUI.js] -> handleVerDetalhesVeiculo - ID recebido:', id, '- Tipo:', typeof id);
    try {
        const veiculo = await getVeiculoById(id);
        await configurarModalVeiculo('detalhes', veiculo);
    } catch (error) {
        console.error('Erro ao carregar detalhes do veículo:', error);
        alert(`Erro ao carregar detalhes do veículo: ${error.message}`);
    }
}

export async function handleSalvarVeiculo() {
    if (!formVeiculo || !veiculoIdInput) return;
    const id = veiculoIdInput.value;
    const dadosVeiculo = {
        cliente: document.getElementById('veiculoCliente')?.value,
        placa: document.getElementById('veiculoPlaca')?.value.toUpperCase(), // Placa em maiúsculas
        marca: document.getElementById('veiculoMarca')?.value,
        modelo: document.getElementById('veiculoModelo')?.value,
        ano_fabricacao: document.getElementById('veiculoAnoFabricacao')?.value || null,
        ano_modelo: document.getElementById('veiculoAnoModelo')?.value || null,
        cor: document.getElementById('veiculoCor')?.value || null,
        chassi: document.getElementById('veiculoChassi')?.value || null,
        observacoes: document.getElementById('veiculoObservacoes')?.value || null,
    };

    if (!dadosVeiculo.cliente || !dadosVeiculo.placa || !dadosVeiculo.marca || !dadosVeiculo.modelo) {
        alert('Cliente, Placa, Marca e Modelo são obrigatórios!');
        return;
    }

    const anoFab = parseInt(dadosVeiculo.ano_fabricacao);
    dadosVeiculo.ano_fabricacao = !isNaN(anoFab) ? anoFab : null;

    const anoMod = parseInt(dadosVeiculo.ano_modelo);
    dadosVeiculo.ano_modelo = !isNaN(anoMod) ? anoMod : null;

    try {
        let veiculoSalvo;
        if (id) {
            veiculoSalvo = await updateVeiculo(id, dadosVeiculo);
            alert('Veículo atualizado com sucesso!');
        } else {
            veiculoSalvo = await createVeiculo(dadosVeiculo);
            alert('Veículo criado com sucesso!');
        }
        if(veiculoModal.length) veiculoModal.modal('hide');
        // Ao salvar, renderiza a lista com o termo de busca atual do input global (se ele existir e estivermos usando)
        // Por enquanto, vamos assumir que ele deve recarregar a lista completa.
        // A lógica de qual termo usar será gerenciada pelo main.js com o novo filtro global.
        renderVeiculos(); // Ou renderVeiculos(termoDoFiltroGlobalAtual) se já implementado
    } catch (error) {
        console.error('Erro ao salvar veículo:', error);
        alert(`Erro ao salvar veículo: ${error.message}`);
    }
}

export async function handleDeletarVeiculo(id) {
    console.log('[veiculoUI.js] -> handleDeletarVeiculo - ID recebido:', id, '- Tipo:', typeof id);
    if (confirm(`Tem certeza que deseja deletar o veículo com ID: ${id}? Esta ação não pode ser desfeita.`)) {
        try {
            await deleteVeiculoAPI(id);
            alert('Veículo deletado com sucesso!');
            renderVeiculos(); // Ou renderVeiculos(termoDoFiltroGlobalAtual)
        } catch (error) {
            console.error('Erro ao deletar veículo:', error);
            alert(`Erro ao deletar veículo: ${error.message}`);
        }
    }
}