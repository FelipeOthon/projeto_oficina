# OficinaPRO - Sistema de Gestão para Oficinas Mecânicas

## 1. Proposta e Objetivos do Projeto

**Proposta:**

O projeto OficinaPRO visa desenvolver uma aplicação web simples, moderna e eficiente para a gestão de oficinas mecânicas de pequeno e médio porte. A proposta central é modernizar a administração dessas oficinas, substituindo controles manuais (papel, cadernos, WhatsApp) por um sistema digital que centraliza as informações de clientes, veículos, Ordens de Serviço (OS) e agendamentos.

**Objetivos Principais:**

* Otimizar o dia a dia da oficina, agilizando processos.
* Melhorar a organização interna, centralizando dados.
* Elevar a experiência do cliente com atendimento ágil e profissional.
* Facilitar a tomada de decisões com base em dados organizados.
* Digitalizar processos, substituindo controles informais.

## 2. Funcionalidades Implementadas

* **Gestão de Clientes:** Cadastro, edição, listagem e busca de clientes.
* **Gestão de Veículos:** Cadastro, edição, listagem e busca de veículos, associados a clientes.
* **Gestão de Agendamentos:**
    * Criação, edição e visualização de agendamentos.
    * Interface de calendário (FullCalendar) para visualização diária, semanal e mensal.
    * Atribuição de status e mecânico (opcional) aos agendamentos.
* **Gestão de Ordens de Serviço (OS):**
    * Criação e edição de OS detalhadas (problema, diagnóstico, observações).
    * Geração automática de número de OS.
    * Adição e gerenciamento de peças e serviços na OS.
    * Cálculo automático de totais (peças, serviços, desconto, total geral).
    * Controle de status da OS.
    * Geração de PDF individual da Ordem de Serviço.
* **Relatórios em PDF:**
    * Relatório de Ordens de Serviço Concluídas/Faturadas por período.
    * Relatório de Faturamento por período.
* **Autenticação e Autorização:**
    * Login seguro com JWT (JSON Web Tokens).
    * Diferenciação de perfis: Administrador e Mecânico.
* **Painel Administrativo (Básico):**
    * Administrador pode cadastrar, visualizar, editar e ativar/desativar usuários mecânicos.
    * Mecânicos podem alterar a própria senha.
* **Busca Global:** Funcionalidade de busca rápida para Clientes, Veículos e Ordens de Serviço.

## 3. Tecnologias e Ferramentas Utilizadas

* **Backend:**
    * **Linguagem:** Python 3.x
    * **Framework Web:** Django 5.2.1
    * **API:** Django REST Framework
    * **Autenticação:** Django REST Framework Simple JWT
    * **Geração de PDF:** xhtml2pdf
    * **Banco de Dados:** MySQL
    * **CORS:** `django-cors-headers`
* **Frontend:**
    * HTML5
    * CSS3 (com `estilos.css` customizado)
    * Bootstrap 4.5.2
    * JavaScript (Vanilla JS, modularizado)
    * **Calendário:** FullCalendar v5.11.5
    * **Requisições HTTP:** Fetch API
* **Banco de Dados (Servidor):**
    * MySQL Server (ex: versão 8.0)
* **Ambiente de Desenvolvimento:**
    * **IDE:** PyCharm (Professional Edition)
    * **Ambiente Virtual Python:** `venv`
    * **Servidor de Desenvolvimento Frontend:** Módulo `http.server` do Python
* **Versionamento de Código:**
    * Git
    * GitHub

## 4. Como Configurar e Rodar o Projeto (Para Desenvolvedores/Testadores)

Siga estas instruções para configurar o ambiente e rodar o projeto localmente.

### Pré-requisitos:

* Python 3.10 ou superior instalado.
* PIP (gerenciador de pacotes Python) instalado.
* Git instalado.
* MySQL Server instalado e rodando.

### Configuração do Backend e Banco de Dados:

1.  **Clone o Repositório:**
    ```bash
    git clone [https://github.com/FelipeOthon/projeto_oficina.git](https://github.com/FelipeOthon/projeto_oficina.git)
    cd projeto_oficina 
    ```
    *(Substitua `projeto_oficina` pelo nome exato da pasta se for diferente após o clone).*

2.  **Crie e Ative um Ambiente Virtual:**
    ```bash
    python -m venv .venv
    # No Windows:
    # .venv\Scripts\activate
    # No macOS/Linux:
    # source .venv/bin/activate
    ```

3.  **Instale as Dependências do Python:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Configure o Banco de Dados MySQL:**
    * Acesse seu servidor MySQL.
    * Crie um banco de dados chamado `oficina_db` (conforme definido em `settings.py`):
        ```sql
        CREATE DATABASE oficina_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
        ```
    * Certifique-se de que o usuário (`USER`) e senha (`PASSWORD`) definidos no arquivo `projeto_oficina/settings.py` (seção `DATABASES`) têm permissão para acessar e modificar este banco de dados. O padrão no seu `settings.py` é `USER: 'root'` e `PASSWORD: 'felipe2025'`. Se a sua configuração local do MySQL for diferente, ajuste essas credenciais no seu arquivo `settings.py` localmente (lembre-se de não commitar senhas pessoais se forem diferentes das do projeto compartilhado).

5.  **Aplique as Migrações do Django:**
    ```bash
    python manage.py migrate
    ```

6.  **(Opcional, mas Recomendado) Crie um Superusuário Django:**
    ```bash
    python manage.py createsuperuser
    ```

7.  **Rode o Servidor de Desenvolvimento Django (Backend):**
    ```bash
    python manage.py runserver
    ```
    O backend estará acessível em `http://127.0.0.1:8000/`.

### Configuração e Execução do Frontend:

1.  Abra um **novo terminal**.
2.  Navegue até a pasta `frontend` do projeto:
    ```bash
    cd frontend
    ```
3.  Inicie um servidor HTTP simples:
    ```bash
    python -m http.server 8080
    ```

4.  Acesse a aplicação no seu navegador: `http://localhost:8080/`