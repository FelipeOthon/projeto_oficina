// frontend/js/veiculoUI.js
import { getVeiculos, getVeiculoById, createVeiculo, updateVeiculo, deleteVeiculoAPI } from './veiculoService.js';
import { getClientes } from './clienteService.js'; // Precisamos buscar clientes para o dropdown

const listaVeiculosUI = document.getElementById('lista-veiculos');
const formVeiculo = document.getElementById('formVeiculo');
const veiculoIdInput = document.getElementById('veiculoId');
const veiculoClienteSelect = document.getElementById('veiculoCliente'); // O <select> de clientes no modal de veículo
const veiculoModalLabel = document.getElementById('veiculoModalLabel');
const veiculoModal = $('#veiculoModal'); // jQuery para o modal Bootstrap

// Função para popular o dropdown de clientes no modal de veículo
async function populateClientesDropdown(selectedClienteId = null) {
    try {
        const clientes = await getClientes();
        veiculoClienteSelect.innerHTML = '<option value="">Selecione um Cliente...</option>'; // Opção padrão
        if (Array.isArray(clientes) && clientes.length > 0) {
            clientes.forEach(cliente => {
                const option = document.createElement('option');
                option.value = cliente.id;
                option.textContent = cliente.nome_completo;
                // Converte selectedClienteId para número para comparação correta se vier de um data attribute
                if (selectedClienteId && cliente.id === parseInt(selectedClienteId)) {
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

// Função para renderizar a lista de veículos no HTML
export async function renderVeiculos() {
    listaVeiculosUI.innerHTML = '<li class="list-group-item">Carregando veículos...</li>';
    try {
        const veiculos = await getVeiculos(); // Chama a função do service
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
            listaVeiculosUI.innerHTML = '<li class="list-group-item">Nenhum veículo encontrado.</li>';
        }
    } catch (error) {
        console.error('Erro ao renderizar veículos:', error);
        listaVeiculosUI.innerHTML = `<li class="list-group-item text-danger">Erro ao carregar veículos: ${error.message}</li>`;
    }
}

// Função para abrir o modal para um novo veículo
export async function abrirModalNovoVeiculo() {
    formVeiculo.reset();
    veiculoIdInput.value = '';
    veiculoModalLabel.textContent = 'Adicionar Novo Veículo';
    await populateClientesDropdown(); // Popula o dropdown de clientes
    veiculoModal.modal('show');
}

// Função para abrir o modal para editar um veículo existente
export async function abrirModalEditarVeiculo(id) {
    formVeiculo.reset();
    veiculoModalLabel.textContent = 'Editar Veículo';
    try {
        // Popula o dropdown primeiro, depois seleciona o cliente do veículo
        // Isso garante que a lista de clientes esteja carregada.
        const veiculo = await getVeiculoById(id); // Chama a função do service
        await populateClientesDropdown(veiculo.cliente); // Passa o ID do cliente atual do veículo

        veiculoIdInput.value = veiculo.id;
        // O select de cliente já foi populado e o cliente correto selecionado por populateClientesDropdown
        document.getElementById('veiculoPlaca').value = veiculo.placa || '';
        document.getElementById('veiculoMarca').value = veiculo.marca || '';
        document.getElementById('veiculoModelo').value = veiculo.modelo || '';
        document.getElementById('veiculoAnoFabricacao').value = veiculo.ano_fabricacao || '';
        document.getElementById('veiculoAnoModelo').value = veiculo.ano_modelo || '';
        document.getElementById('veiculoCor').value = veiculo.cor || '';
        document.getElementById('veiculoChassi').value = veiculo.chassi || '';
        document.getElementById('veiculoObservacoes').value = veiculo.observacoes || '';

        veiculoModal.modal('show');
    } catch (error) {
        console.error('Erro ao carregar veículo para edição:', error);
        alert(`Erro ao carregar dados do veículo: ${error.message}`);
    }
}

// Função para lidar com o submit do formulário de veículo (criar ou atualizar)
export async function handleSalvarVeiculo() {
    const id = veiculoIdInput.value;
    const dadosVeiculo = {
        cliente: document.getElementById('veiculoCliente').value, // Pega o ID do cliente selecionado
        placa: document.getElementById('veiculoPlaca').value,
        marca: document.getElementById('veiculoMarca').value,
        modelo: document.getElementById('veiculoModelo').value,
        ano_fabricacao: document.getElementById('veiculoAnoFabricacao').value || null,
        ano_modelo: document.getElementById('veiculoAnoModelo').value || null,
        cor: document.getElementById('veiculoCor').value || null,
        chassi: document.getElementById('veiculoChassi').value || null,
        observacoes: document.getElementById('veiculoObservacoes').value || null,
    };

    if (!dadosVeiculo.cliente || !dadosVeiculo.placa || !dadosVeiculo.marca || !dadosVeiculo.modelo) {
        alert('Cliente, Placa, Marca e Modelo são obrigatórios!');
        return;
    }

    // Converte anos para inteiros se preenchidos, ou null se vazios/não numéricos
    const anoFab = parseInt(dadosVeiculo.ano_fabricacao);
    dadosVeiculo.ano_fabricacao = !isNaN(anoFab) ? anoFab : null;

    const anoMod = parseInt(dadosVeiculo.ano_modelo);
    dadosVeiculo.ano_modelo = !isNaN(anoMod) ? anoMod : null;

    try {
        if (id) { // Atualizar veículo existente
            await updateVeiculo(id, dadosVeiculo);
            alert('Veículo atualizado com sucesso!');
        } else { // Criar novo veículo
            await createVeiculo(dadosVeiculo);
            alert('Veículo criado com sucesso!');
        }
        veiculoModal.modal('hide');
        renderVeiculos(); // Re-renderiza a lista de veículos
    } catch (error) {
        console.error('Erro ao salvar veículo:', error);
        alert(`Erro ao salvar veículo: ${error.message}`);
    }
}

// Função para lidar com a deleção de um veículo
export async function handleDeletarVeiculo(id) {
    if (confirm(`Tem certeza que deseja deletar o veículo com ID: ${id}? Esta ação não pode ser desfeita.`)) {
        try {
            await deleteVeiculoAPI(id);
            alert('Veículo deletado com sucesso!');
            renderVeiculos();
        } catch (error) {
            console.error('Erro ao deletar veículo:', error);
            alert(`Erro ao deletar veículo: ${error.message}`);
        }
    }
}

// Placeholder para detalhes do veículo
export function handleVerDetalhesVeiculo(id) {
    alert(`Ver detalhes do veículo ID: ${id} (a ser implementado)`);
}