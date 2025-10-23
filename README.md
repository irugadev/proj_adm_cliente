Projeto para aplicaçao de cadastro de Clientes:
A aplicação permite ao usuário Criar, Ler, Atualizar e Excluir (CRUD) registros de clientes, além de visualizar relatórios simples sobre os dados cadastrados.

Funcionalidades Principais:
    Página Inicial: Um dashboard com cards de navegação para as seções principais.
    Cadastro de Clientes: Formulário completo com validações de dados em tempo real (campos obrigatórios, formato de CPF, etc.) usando HTML5 e JavaScript.
    Listagem de Clientes: Exibição de todos os clientes em uma tabela, com funcionalidade de pesquisa por nome.
    Edição e Exclusão: Botões em cada linha da tabela para atualizar ou remover um cliente.
    Relatórios: Uma página que exibe estatísticas sobre os clientes cadastrados (ex: contagem por classe de renda, maiores de 18 anos) com filtros por período (Hoje, Semana, Mês).

Tecnologias Utilizadas
Este projeto é dividido em três partes principais:
    Frontend com HTML5/CSS3, Bootstrap e JavaScript (sem o uso de jQuery).
    Backend Node.js, Express e PostgreSQL. Utizei Supabase como "Banco de Dados como Serviço" (DBaaS), facilitando o acesso de qualquer lugar.

Como Configurar e Instalar o Projeto:

  Etapa 1: Configurar o Banco de Dados (Supabase)
    Crie uma Conta: Acesse supabase.com e crie uma conta gratuita.
    Crie um Novo Projeto: Dê um nome a ele (ex: gestor-clientes) e crie uma senha de banco de dados (guarde-a bem!).
    Crie a Tabela: No menu lateral, vá em SQL Editor -> + New query. Cole o script abaixo e clique em RUN:

    SQL
    CREATE TABLE IF NOT EXISTS clientes (
    id BIGINT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    cpf VARCHAR(11) NOT NULL,
    dataNascimento DATE NOT NULL,
    dataCadastro DATE NOT NULL,
    renda DECIMAL(10, 2) NULL,
    CONSTRAINT uq_cpf UNIQUE (cpf)
);

  Etapa 2: Configurar o Backend (Node.js)
    Verifique o Node.js: Abra seu terminal e digite node -v. Se você não tiver o Node.js instalado, baixe-o aqui (baixe a versão LTS).
    Crie a Pasta: Crie uma pasta chamada projeto-backend.
    Abra o Terminal: Navegue até a pasta projeto-backend pelo seu terminal.
    Inicie o Projeto: Digite npm init -y para criar o arquivo package.json.
    Instale as Dependências: Digite npm install express pg cors.
    Crie o Servidor: Crie o arquivo server.js (o código completo foi fornecido na conversa anterior).
    Configure a Conexão: No server.js, edite a seção new Pool({ ... }) com as suas credenciais do Supabase (Host, Senha, etc.) que você copiou na Etapa 1.

  Etapa 3: Configurar o Frontend (A Interface)
    Crie a Pasta: Crie uma outra pasta chamada projeto-frontend (separada do backend).
    Crie os Arquivos: Dentro dela, crie os três arquivos: index.html, style.css e app.js (os códigos completos foram fornecidos na conversa anterior).
    Verifique a API_URL: Abra o app.js e verifique se a primeira linha está correta, apontando para o seu backend:

O sistema foi arquitetado com tecnologias modernas, gratuitas e de fácil entendimento, separando claramente a interface do usuário (Frontend) da lógica de negócios e do banco de dados (Backend).
