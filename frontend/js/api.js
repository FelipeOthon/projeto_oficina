// Arquivo: js/api.js

import { apiUrlBase } from './apiConfig.js';

// Função para renovar o token
async function refreshToken() {
    const refresh = localStorage.getItem('refresh_token');
    if (!refresh) {
        throw new Error('Refresh token não encontrado.');
    }

    try {
        const response = await fetch(`${apiUrlBase}/token/refresh/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: refresh }),
        });

        const data = await response.json();
        if (!response.ok) {
            // Se a renovação falhar (ex: refresh token também expirou), limpa tudo
            throw new Error(data.detail || 'Falha ao renovar o token.');
        }

        localStorage.setItem('access_token', data.access);
        return data.access; // Retorna o novo token de acesso

    } catch (error) {
        console.error("Erro na renovação do token:", error);
        // Limpa o storage e força o logout se a renovação falhar
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_type');
        localStorage.removeItem('username');
        window.location.href = 'index.html'; // Redireciona para login
        return null;
    }
}

// O nosso novo "fetch" inteligente
export async function fetchWithAuth(url, options = {}) {
    let accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
        console.warn("Nenhum token de acesso encontrado, redirecionando para login.");
        window.location.href = 'index.html';
        return; // Interrompe a execução
    }

    // Configura os headers de autenticação
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        ...options.headers,
    };

    let response = await fetch(url, { ...options, headers });

    // Se a resposta for 401 (Não Autorizado), o token provavelmente expirou
    if (response.status === 401) {
        console.log("Token expirado, tentando renovar...");
        try {
            const newAccessToken = await refreshToken();
            if (newAccessToken) {
                // Tenta a requisição original novamente com o novo token
                headers['Authorization'] = `Bearer ${newAccessToken}`;
                console.log("Token renovado. Tentando a requisição novamente...");
                response = await fetch(url, { ...options, headers });
            }
        } catch (error) {
            // Se a renovação falhar, o refreshToken() já terá lidado com o logout.
            // Apenas retornamos a resposta de erro original.
            return response;
        }
    }

    return response;
}