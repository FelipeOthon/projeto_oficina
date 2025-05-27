// frontend/js/adminPanelUI.js
import {
    getAdminUsuarios,
    getAdminUsuarioById,
    createAdminUsuario,
    updateAdminUsuario,
    deleteAdminUsuarioAPI,
    mecanicoChangeOwnPassword
} from './adminPanelService.js';

// Elementos do DOM para Gerenciamento de Usuários pelo Admin
const listaUsuariosAdminUI = document.getElementById('lista-usuarios-admin');
const formAdminUsuario = document.getElementById('formAdminUsuario');
const adminUsuarioIdInput = document.getElementById('adminUsuarioId');
const adminUsuarioModalLabel = document.getElementById('adminUsuarioModalLabel');
const adminUsuarioModal = $('#adminUsuarioModal');
const btnSalvarAdminUsuarioModal = document.getElementById('btnSalvarAdminUsuario');

// Elementos do DOM para Mecânico Alterar Senha
const formMecanicoChangePassword = document.getElementById('formMecanicoChangePassword');
const mecanicoChangePasswordModal = $('#mecanicoChangePasswordModal');
const changePasswordErrorDiv = document.getElementById('changePasswordError');


// --- Funções de UI para Gerenciamento de Usuários (Admin) ---

export async function renderAdminUsuarios(searchTerm = '') {
    if (!listaUsuariosAdminUI) {
        console.warn("Elemento #lista-usuarios-admin não encontrado.");
        return;
    }
    listaUsuariosAdminUI.innerHTML = '<li class="list-group-item">Carregando usuários...</li>';
    try {
        const usuarios = await getAdminUsuarios(searchTerm);
        listaUsuariosAdminUI.innerHTML = '';

        if (Array.isArray(usuarios) && usuarios.length > 0) {
            usuarios.forEach(user => {
                const item = document.createElement('li');
                item.className = 'list-group-item d-flex justify-content-between align-items-center';
                const tipoDisplay = user.tipo_usuario.charAt(0).toUpperCase() + user.tipo_usuario.slice(1);
                const statusDisplay = user.is_active ? '<span class="badge badge-success">Ativo</span>' : '<span class="badge badge-danger">Inativo</span>';
                item.innerHTML = `
                    <div>
                        <strong>${user.username}</strong> (${user.first_name || ''} ${user.last_name || ''})<br>
                        <small>Email: ${user.email || 'N/A'} | Tipo: ${tipoDisplay} | Status: ${statusDisplay}</small>
                    </div>
                    <div>
                        <button class="btn btn-sm btn-warning mr-2 btn-editar-admin-usuario" data-id="${user.id}">Editar</button>
                        <button class="btn btn-sm btn-danger btn-deletar-admin-usuario" data-id="${user.id}" ${user.is_superuser ? 'disabled title="Superusuários não podem ser deletados por aqui"' : ''}>Deletar</button>
                    </div>
                `;
                listaUsuariosAdminUI.appendChild(item);
            });
        } else {
            listaUsuariosAdminUI.innerHTML = `<li class="list-group-item">${searchTerm ? 'Nenhum usuário encontrado.' : 'Nenhum usuário cadastrado.'}</li>`;
        }
    } catch (error) {
        console.error('Erro ao renderizar usuários (admin):', error);
        listaUsuariosAdminUI.innerHTML = `<li class="list-group-item text-danger">Erro ao carregar usuários: ${error.message}</li>`;
    }
}

function configurarModalAdminUsuario(modo, userData = null) {
    if (!formAdminUsuario || !adminUsuarioIdInput || !adminUsuarioModalLabel || !adminUsuarioModal.length) return;
    formAdminUsuario.reset();
    adminUsuarioIdInput.value = userData ? userData.id : '';

    const camposFormulario = formAdminUsuario.elements;
    let tituloModal = '';

    const passwordInput = document.getElementById('adminUsuarioPassword');
    const passwordHelp = document.getElementById('passwordHelp');

    if (modo === 'novo') {
        tituloModal = 'Adicionar Novo Mecânico';
        document.getElementById('adminUsuarioTipo').value = 'mecanico'; // Default para mecânico
        document.getElementById('adminUsuarioIsActive').checked = true; // Default para ativo
        if (passwordInput) passwordInput.required = true;
        if (passwordHelp) passwordHelp.textContent = 'Obrigatório ao criar.';

    } else if (modo === 'editar') {
        tituloModal = `Editar Usuário: ${userData ? userData.username : ''}`;
        if (passwordInput) passwordInput.required = false; // Senha não é obrigatória na edição
        if (passwordHelp) passwordHelp.textContent = 'Deixe em branco para não alterar a senha.';

        if (userData) {
            document.getElementById('adminUsuarioUsername').value = userData.username || '';
            // Não preenchemos a senha por segurança
            document.getElementById('adminUsuarioFirstName').value = userData.first_name || '';
            document.getElementById('adminUsuarioLastName').value = userData.last_name || '';
            document.getElementById('adminUsuarioEmail').value = userData.email || '';
            document.getElementById('adminUsuarioTipo').value = userData.tipo_usuario || 'mecanico';
            document.getElementById('adminUsuarioIsActive').checked = userData.is_active;

            // Desabilitar edição de username e tipo para superusuários ou para o próprio admin (precisaria checar o id do user logado)
            // Por ora, vamos permitir, mas é um ponto de atenção para segurança.
             if (userData.is_superuser) {
                document.getElementById('adminUsuarioTipo').disabled = true;
            } else {
                document.getElementById('adminUsuarioTipo').disabled = false;
            }
        }
    }

    adminUsuarioModalLabel.textContent = tituloModal;
    adminUsuarioModal.modal('show');
}

export function abrirModalNovoAdminUsuario() {
    configurarModalAdminUsuario('novo');
}

export async function abrirModalEditarAdminUsuario(userId) {
    try {
        const user = await getAdminUsuarioById(userId);
        configurarModalAdminUsuario('editar', user);
    } catch (error) {
        console.error('Erro ao carregar usuário para edição (admin):', error);
        alert(`Erro ao carregar dados do usuário: ${error.message}`);
    }
}

export async function handleSalvarAdminUsuario() {
    if (!formAdminUsuario || !adminUsuarioIdInput) return;
    const id = adminUsuarioIdInput.value;
    const password = document.getElementById('adminUsuarioPassword').value;

    const dadosUsuario = {
        username: document.getElementById('adminUsuarioUsername').value,
        first_name: document.getElementById('adminUsuarioFirstName').value || null,
        last_name: document.getElementById('adminUsuarioLastName').value || null,
        email: document.getElementById('adminUsuarioEmail').value || null,
        tipo_usuario: document.getElementById('adminUsuarioTipo').value,
        is_active: document.getElementById('adminUsuarioIsActive').checked,
        // Incluir is_staff e is_superuser se quiser controlá-los (com cuidado)
        // is_staff: document.getElementById('adminUsuarioIsStaff') ? document.getElementById('adminUsuarioIsStaff').checked : false,
    };

    if (password && password.trim() !== "") {
        dadosUsuario.password = password;
    } else if (!id) { // Se é novo usuário e senha está vazia
        alert('Senha é obrigatória para criar um novo usuário.');
        return;
    }


    if (!dadosUsuario.username) {
        alert('Username é obrigatório!');
        return;
    }

    try {
        if (id) {
            await updateAdminUsuario(id, dadosUsuario);
            alert('Usuário atualizado com sucesso!');
        } else {
            await createAdminUsuario(dadosUsuario);
            alert('Usuário criado com sucesso!');
        }
        if(adminUsuarioModal.length) adminUsuarioModal.modal('hide');
        renderAdminUsuarios(); // Recarrega a lista
    } catch (error) {
        console.error('Erro ao salvar usuário (admin):', error);
        // Tenta exibir erros de validação do backend
        let errorMessage = `Erro ao salvar usuário: ${error.message}`;
        if (error.response && error.response.data) {
            const errors = error.response.data;
            Object.keys(errors).forEach(key => {
                errorMessage += `\n${key}: ${errors[key].join ? errors[key].join(', ') : errors[key]}`;
            });
        }
        alert(errorMessage);
    }
}

export async function handleDeletarAdminUsuario(userId) {
    const user = await getAdminUsuarioById(userId); // Para pegar o username para o confirm
    if (user && user.is_superuser) {
        alert("Superusuários não podem ser deletados através desta interface.");
        return;
    }
    if (confirm(`Tem certeza que deseja deletar o usuário "${user ? user.username : userId}"? Esta ação não pode ser desfeita.`)) {
        try {
            await deleteAdminUsuarioAPI(userId);
            alert('Usuário deletado com sucesso!');
            renderAdminUsuarios(); // Recarrega a lista
        } catch (error) {
            console.error('Erro ao deletar usuário (admin):', error);
            alert(`Erro ao deletar usuário: ${error.message}`);
        }
    }
}

// --- Funções de UI para Mecânico Alterar a Própria Senha ---

export async function handleMecanicoMudarSenha() {
    if (!formMecanicoChangePassword) return;
    if (changePasswordErrorDiv) changePasswordErrorDiv.style.display = 'none';

    const oldPassword = document.getElementById('mecanicoOldPassword').value;
    const newPassword = document.getElementById('mecanicoNewPassword').value;
    const newPasswordConfirm = document.getElementById('mecanicoNewPasswordConfirm').value;

    if (!oldPassword || !newPassword || !newPasswordConfirm) {
        if (changePasswordErrorDiv) {
            changePasswordErrorDiv.textContent = 'Todos os campos são obrigatórios.';
            changePasswordErrorDiv.style.display = 'block';
        }
        return;
    }

    if (newPassword !== newPasswordConfirm) {
        if (changePasswordErrorDiv) {
            changePasswordErrorDiv.textContent = 'As novas senhas não coincidem.';
            changePasswordErrorDiv.style.display = 'block';
        }
        return;
    }

    try {
        await mecanicoChangeOwnPassword({
            old_password: oldPassword,
            new_password: newPassword,
        });
        alert('Senha alterada com sucesso!');
        if(mecanicoChangePasswordModal.length) mecanicoChangePasswordModal.modal('hide');
        formMecanicoChangePassword.reset();
    } catch (error) { // error aqui deve ser o objeto de erro do DRF
        console.error('Erro ao alterar senha:', error);
        let errorMessage = "Erro desconhecido ao alterar senha.";
        if (error && typeof error === 'object') {
            errorMessage = Object.values(error).flat().join(' '); // Pega todas as mensagens de erro
        }
        if (changePasswordErrorDiv) {
            changePasswordErrorDiv.textContent = errorMessage;
            changePasswordErrorDiv.style.display = 'block';
        }
    }
}