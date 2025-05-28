// frontend/js/adminPanelUI.js
import {
    getAdminUsuarios,
    getAdminUsuarioById,
    createAdminUsuario,
    updateAdminUsuario,
    deleteAdminUsuarioAPI, // Usado para DESATIVAR (backend faz soft delete)
    mecanicoChangeOwnPassword
} from './adminPanelService.js';

const listaUsuariosAdminUI = document.getElementById('lista-usuarios-admin');
const formAdminUsuario = document.getElementById('formAdminUsuario');
const adminUsuarioIdInput = document.getElementById('adminUsuarioId');
const adminUsuarioModalLabel = document.getElementById('adminUsuarioModalLabel');
const adminUsuarioModal = $('#adminUsuarioModal');
// const btnSalvarAdminUsuarioModal = document.getElementById('btnSalvarAdminUsuario'); // Não usado diretamente aqui

const formMecanicoChangePassword = document.getElementById('formMecanicoChangePassword');
const mecanicoChangePasswordModal = $('#mecanicoChangePasswordModal');
const changePasswordErrorDiv = document.getElementById('changePasswordError');


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
                const statusDisplay = user.is_active ? '<span class="badge badge-success">Ativo</span>' : '<span class="badge badge-secondary">Inativo</span>';

                let displayNameHTML = `<strong>${user.username}</strong>`;
                const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ").trim();
                if (fullName) {
                    displayNameHTML += ` (${fullName})`;
                }

                const isActive = user.is_active;
                const actionButtonText = isActive ? 'Desativar' : 'Ativar';
                const actionButtonClass = isActive ? 'btn-outline-danger' : 'btn-outline-success';

                const disableActionButton = user.is_superuser && isActive;
                const buttonDisabledAttribute = disableActionButton ? 'disabled title="Superusuários ativos não podem ser desativados por esta interface."' : '';

                item.innerHTML = `
                    <div>
                        ${displayNameHTML}<br>
                        <small>Email: ${user.email || 'N/A'} | Tipo: ${tipoDisplay} | Status: ${statusDisplay}</small>
                    </div>
                    <div>
                        <button class="btn btn-sm btn-warning mr-2 btn-editar-admin-usuario" data-id="${user.id}">Editar</button>
                        <button 
                            class="btn btn-sm ${actionButtonClass} btn-toggle-status-admin-usuario" 
                            data-id="${user.id}" 
                            data-current-is-active="${isActive}"
                            ${buttonDisabledAttribute}>
                            ${actionButtonText}
                        </button>
                    </div>
                `;
                listaUsuariosAdminUI.appendChild(item);
            });
        } else {
            listaUsuariosAdminUI.innerHTML = `<li class="list-group-item">${searchTerm ? 'Nenhum usuário encontrado para o termo informado.' : 'Nenhum usuário cadastrado.'}</li>`;
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

    const passwordInput = document.getElementById('adminUsuarioPassword');
    const passwordHelp = document.getElementById('passwordHelp');
    const usernameInput = document.getElementById('adminUsuarioUsername');
    const tipoUsuarioSelect = document.getElementById('adminUsuarioTipo');
    const isActiveCheckbox = document.getElementById('adminUsuarioIsActive');

    if (modo === 'novo') {
        adminUsuarioModalLabel.textContent = 'Adicionar Novo Usuário';
        if (tipoUsuarioSelect) tipoUsuarioSelect.value = 'mecanico';
        if (isActiveCheckbox) isActiveCheckbox.checked = true;
        if (passwordInput) passwordInput.required = true;
        if (passwordHelp) passwordHelp.textContent = 'Obrigatório ao criar.';
        if (usernameInput) usernameInput.disabled = false;
        if (tipoUsuarioSelect) tipoUsuarioSelect.disabled = false;

    } else if (modo === 'editar') {
        adminUsuarioModalLabel.textContent = `Editar Usuário: ${userData ? userData.username : ''}`;
        if (passwordInput) passwordInput.required = false;
        if (passwordHelp) passwordHelp.textContent = 'Deixe em branco para não alterar a senha.';

        if (userData) {
            if (usernameInput) usernameInput.value = userData.username || '';
            document.getElementById('adminUsuarioFirstName').value = userData.first_name || '';
            document.getElementById('adminUsuarioLastName').value = userData.last_name || '';
            document.getElementById('adminUsuarioEmail').value = userData.email || '';
            if (tipoUsuarioSelect) tipoUsuarioSelect.value = userData.tipo_usuario || 'mecanico';
            if (isActiveCheckbox) isActiveCheckbox.checked = userData.is_active;

            if (usernameInput) usernameInput.disabled = true;

            const loggedInUsername = localStorage.getItem('username');

            if (userData.is_superuser && userData.username === loggedInUsername) {
                if (tipoUsuarioSelect) tipoUsuarioSelect.disabled = true;
                // Se você quiser impedir que o admin desative a si mesmo pelo modal de edição:
                // if (isActiveCheckbox) isActiveCheckbox.disabled = true;
            } else if (userData.is_superuser) {
                 if (tipoUsuarioSelect) tipoUsuarioSelect.disabled = true; // Não pode mudar tipo de outros superusers
            } else {
                if (tipoUsuarioSelect) tipoUsuarioSelect.disabled = false;
            }
        }
    }
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
        first_name: document.getElementById('adminUsuarioFirstName').value.trim() || "",
        last_name: document.getElementById('adminUsuarioLastName').value.trim() || "",
        email: document.getElementById('adminUsuarioEmail').value.trim() || "",
        tipo_usuario: document.getElementById('adminUsuarioTipo').value,
        is_active: document.getElementById('adminUsuarioIsActive').checked,
    };

    if (!id) {
        dadosUsuario.username = document.getElementById('adminUsuarioUsername').value;
        if (!dadosUsuario.username) {
            alert('Username é obrigatório para criar um novo usuário!');
            return;
        }
        if (!password || password.trim() === "") {
            alert('Senha é obrigatória para criar um novo usuário.');
            return;
        }
        dadosUsuario.password = password;
    } else {
        if (password && password.trim() !== "") {
            dadosUsuario.password = password;
        }
        // Username não é incluído nos dados de atualização se não pode ser alterado
        // delete dadosUsuario.username; // O serializer DRF cuida disso se username for read-only na atualização
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
        renderAdminUsuarios();
    } catch (errorData) {
        console.error('Erro ao salvar usuário (admin):', errorData);
        let errorMessage = "Erro ao salvar usuário.";
        if (errorData && typeof errorData === 'object') {
            const detailedMessages = [];
            for (const field in errorData) {
                // Adiciona formatação para o nome do campo ser mais legível
                const fieldName = field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                detailedMessages.push(`${fieldName}: ${Array.isArray(errorData[field]) ? errorData[field].join(', ') : errorData[field]}`);
            }
            if (detailedMessages.length > 0) {
                errorMessage = `Por favor, corrija os seguintes erros:\n${detailedMessages.join('\n')}`;
            } else if (errorData.detail) {
                errorMessage = errorData.detail;
            }
        }
        alert(errorMessage);
    }
}

export async function handleToggleUserActiveStateAdmin(userId, currentIsActiveString) {
    const isActiveCurrently = (currentIsActiveString === 'true');

    let userToToggle;
    try {
        userToToggle = await getAdminUsuarioById(userId);
    } catch (e) {
        alert(`Erro ao buscar dados do usuário: ${e.message}`);
        return;
    }

    if (!userToToggle) {
        alert("Usuário não encontrado.");
        return;
    }

    const actionText = isActiveCurrently ? "desativar" : "ativar";
    const confirmMessage = `Tem certeza que deseja ${actionText} o usuário "${userToToggle.username}"?`;

    if (userToToggle.is_superuser && isActiveCurrently) {
        alert("Superusuários ativos não podem ser desativados diretamente por esta interface para prevenir bloqueio do sistema. Utilize o painel Django Admin se necessário.");
        return;
    }

    if (confirm(confirmMessage)) {
        try {
            if (isActiveCurrently) {
                await deleteAdminUsuarioAPI(userId);
                alert('Usuário desativado com sucesso!');
            } else {
                await updateAdminUsuario(userId, { is_active: true }); // Envia PATCH com is_active: true
                alert('Usuário ativado com sucesso!');
            }
            renderAdminUsuarios();
        } catch (errorData) { // errorData pode ser o objeto JSON do DRF ou um Error com message
            console.error(`Erro ao ${actionText} usuário (admin):`, errorData);
            let alertMessage = `Erro ao ${actionText} usuário.`;
            if (errorData instanceof Error) { // Se for um objeto Error padrão
                alertMessage = errorData.message;
            } else if (errorData && typeof errorData === 'object') { // Se for um objeto (provavelmente do DRF)
                const messages = [];
                 if (errorData.detail) {
                    messages.push(errorData.detail);
                } else {
                    for (const key in errorData) {
                        messages.push(`${key}: ${Array.isArray(errorData[key]) ? errorData[key].join(', ') : errorData[key]}`);
                    }
                }
                if (messages.length > 0) {
                    alertMessage = `Erro ao ${actionText} usuário:\n${messages.join('\n')}`;
                }
            }
            alert(alertMessage);
        }
    }
}

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
    if (newPassword.length < 8) {
        if (changePasswordErrorDiv) {
            changePasswordErrorDiv.textContent = 'A nova senha deve ter pelo menos 8 caracteres.';
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
    } catch (errorData) {
        console.error('Erro ao alterar senha:', errorData);
        let errorMessage = "Erro desconhecido ao alterar senha.";
         if (errorData && typeof errorData === 'object') {
            const errorMessages = [];
            if (errorData.detail) {
                 errorMessages.push(errorData.detail);
            } else if (errorData.non_field_errors) { // Erro comum do DRF para Serializer.validate()
                errorMessages.push(errorData.non_field_errors.join(', '));
            } else {
                for (const key in errorData) {
                    // Formata o nome do campo para ser mais legível
                    const fieldName = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    errorMessages.push(`${fieldName}: ${Array.isArray(errorData[key]) ? errorData[key].join(', ') : errorData[key]}`);
                }
            }
            errorMessage = errorMessages.join('\n');
            if (!errorMessage) errorMessage = "Não foi possível alterar a senha. Verifique os dados.";

        } else if (typeof errorData === 'string') {
            errorMessage = errorData;
        }
        if (changePasswordErrorDiv) {
            changePasswordErrorDiv.textContent = errorMessage;
            changePasswordErrorDiv.style.display = 'block';
        }
    }
}