// Função para pegar a data atual no formato YYYY-MM-DD (necessário para inputs type="date")
function getHojeFormatado() {
    return new Date().toISOString().slice(0, 10);
}

// =================================================================
// FUNÇÕES DE VALIDAÇÃO (Requisitos de Negócio)
// =================================================================

function validarCPF(cpf) {
    cpf = cpf.replace(/[^\d]+/g, ''); 
    if (cpf === '' || cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
        return false; 
    }
    let soma = 0;
    let resto;
    for (let i = 1; i <= 9; i++) {
        soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;
    soma = 0;
    for (let i = 1; i <= 10; i++) {
        soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11))) return false;
    return true; 
}

// =================================================================
// FUNÇÕES DE FORMATAÇÃO (Helpers)
// =================================================================

function formatarMoeda(valor) {
    if (valor === null || valor === undefined) return 'N/A';
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0 
    }).format(valor);
}

function getClassRenda(renda) {
    if (renda === null || renda === undefined) return '';
    if (renda <= 980) return 'renda-a';
    if (renda >= 980.01 && renda <= 2500) return 'renda-b';
    if (renda > 2500) return 'renda-c';
    return '';
}

// =================================================================
// FUNÇÕES DE RELATÓRIO (Helpers - PARTE 4)
// =================================================================

/**
 * Calcula a idade com base na data de nascimento (string YYYY-MM-DD).
 * @param {string} dataNascimento - Data de nascimento.
 * @returns {number} - Idade.
 */
function calcularIdade(dataNascimento) {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const m = hoje.getMonth() - nascimento.getMonth();
    // Ajusta a idade se o aniversário ainda não ocorreu este ano
    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
        idade--;
    }
    return idade;
}

// =================================================================
// SIMULAÇÃO DO BANCO DE DADOS (LocalStorage)
// =================================================================
const DB_KEY = 'clientes';

function getClientesDB() {
    return JSON.parse(localStorage.getItem(DB_KEY)) || [];
}

function saveClientesDB(clientes) {
    localStorage.setItem(DB_KEY, JSON.stringify(clientes));
}

// =================================================================
// LÓGICA DO CRUD (CREATE, READ, UPDATE, DELETE)
// =================================================================

function prepararFormularioNovo() {
    $('#cliente-id').val(''); 
    $('#form-cliente')[0].reset(); 
    $('#data-cadastro').val(getHojeFormatado()).prop('disabled', true);
    $('#form-cliente').removeClass('was-validated');
    $('#cpf-feedback').text('Por favor, informe um CPF válido de 11 dígitos.');
    $('#cpf').removeClass('is-invalid');
    $('#btn-salvar').text('Salvar Cliente');
}

function carregarClienteParaEdicao(id) {
    const clientes = getClientesDB();
    const cliente = clientes.find(c => c.id == id);

    if (cliente) {
        $('#cliente-id').val(cliente.id);
        $('#nome').val(cliente.nome);
        $('#cpf').val(cliente.cpf);
        $('#data-nascimento').val(cliente.dataNascimento);
        $('#data-cadastro').val(cliente.dataCadastro);
        $('#renda').val(cliente.renda);
        
        $('#btn-salvar').text('Atualizar Cliente');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function excluirCliente(id) {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
        let clientes = getClientesDB();
        clientes = clientes.filter(c => c.id != id);
        saveClientesDB(clientes);
        renderizarTabelaClientes();
        renderizarRelatorios(); // Atualiza relatórios se um cliente for excluído
    }
}

function salvarCliente() {
    const id = $('#cliente-id').val();
    const nome = $('#nome').val();
    const cpf = $('#cpf').val().replace(/[^\d]+/g, '');
    const dataNascimento = $('#data-nascimento').val();
    const renda = $('#renda').val() ? parseFloat($('#renda').val()) : null;
    const dataCadastro = id ? $('#data-cadastro').val() : getHojeFormatado();

    if (!validarCPF(cpf)) {
        $('#cpf').addClass('is-invalid');
        $('#cpf-feedback').text('CPF inválido. Verifique os dígitos.');
        return; 
    }

    const clientes = getClientesDB();
    const cpfDuplicado = clientes.some(cliente => 
        cliente.cpf === cpf && cliente.id != id 
    );

    if (cpfDuplicado) {
        $('#cpf').addClass('is-invalid');
        $('#cpf-feedback').text('Este CPF já está cadastrado.');
        return;
    }

    $('#cpf').removeClass('is-invalid');
    $('#cpf-feedback').text('Por favor, informe um CPF válido de 11 dígitos.');

    const cliente = {
        id: id || Date.now().toString(), 
        nome,
        cpf,
        dataNascimento,
        dataCadastro,
        renda
    };

    if (id) {
        const index = clientes.findIndex(c => c.id == id);
        clientes[index] = cliente;
    } else {
        clientes.push(cliente);
    }

    saveClientesDB(clientes); 
    prepararFormularioNovo(); 
    renderizarTabelaClientes();
    renderizarRelatorios(); // Atualiza relatórios ao salvar
}


// =================================================================
// FUNÇÃO DE RENDERIZAÇÃO (LISTAGEM)
// =================================================================

function renderizarTabelaClientes() {
    const clientes = getClientesDB();
    const termoPesquisa = $('#input-pesquisa').val().toLowerCase();
    const $tbody = $('#tabela-clientes-corpo');
    
    $tbody.empty(); 

    const clientesFiltrados = clientes.filter(cliente => 
        cliente.nome.toLowerCase().includes(termoPesquisa)
    );

    if (clientesFiltrados.length === 0) {
        $tbody.append(
            '<tr><td colspan="3" class="text-center">Nenhum cliente encontrado.</td></tr>'
        );
        return;
    }

    clientesFiltrados.forEach(cliente => {
        const rendaFormatada = formatarMoeda(cliente.renda);
        const classeRenda = getClassRenda(cliente.renda);
        
        const linhaHtml = `
            <tr data-id="${cliente.id}">
                <td>${cliente.nome}</td>
                <td>
                    <span class="renda-badge ${classeRenda}">${rendaFormatada}</span>
                </td>
                <td class="text-end">
                    <button class="btn btn-sm btn-info btn-editar" title="Editar">Editar</button>
                    <button class="btn btn-sm btn-danger btn-excluir ms-1" title="Excluir">Excluir</button>
                </td>
            </tr>
        `;
        $tbody.append(linhaHtml);
    });
}

// =================================================================
// FUNÇÃO DE RENDERIZAÇÃO (RELATÓRIOS - PARTE 4)
// =================================================================

/**
 * Renderiza os cards de relatório com base no filtro de período.
 * @param {string} [periodo='mes'] - O filtro ('hoje', 'semana', 'mes').
 */
function renderizarRelatorios(periodo = 'mes') {
    const todosClientes = getClientesDB();
    
    // --- Lógica de Datas ---
    const hoje = new Date();
    // Zera o horário para comparar apenas datas
    hoje.setHours(0, 0, 0, 0); 
    
    let dataInicioFiltro;

    if (periodo === 'hoje') {
        dataInicioFiltro = new Date(hoje);
    } else if (periodo === 'semana') {
        dataInicioFiltro = new Date(hoje);
        // dataInicioFiltro = (data de hoje) - (dia da semana atual)
        dataInicioFiltro.setDate(hoje.getDate() - hoje.getDay()); 
    } else { // 'mes'
        dataInicioFiltro = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    }

    // Filtra clientes cadastrados DENTRO do período selecionado
    const clientesFiltrados = todosClientes.filter(cliente => {
        // Converte a data de cadastro (string) para Date
        const dataCadastro = new Date(cliente.dataCadastro); 
        // Adiciona 1 dia à data de cadastro para corrigir fuso horário/UTC
        // (Input 'date' salva como YYYY-MM-DD, que o new Date() interpreta como T00:00:00Z (UTC))
        dataCadastro.setDate(dataCadastro.getDate() + 1); 
        
        return dataCadastro >= dataInicioFiltro;
    });

    // --- Cálculo das Métricas ---

    // 1. Renda Média (Requisito: Média de *TODOS* os clientes)
    const clientesComRenda = todosClientes.filter(c => c.renda !== null && c.renda > 0);
    const somaRendaGeral = clientesComRenda.reduce((acc, c) => acc + c.renda, 0);
    const rendaMediaGeral = clientesComRenda.length > 0 ? (somaRendaGeral / clientesComRenda.length) : 0;

    // 2. Métrica 1: >18 anos e Renda > Média
    // (Usa a lista FILTRADA pelo período)
    const clientesRendaAcimaMedia = clientesFiltrados.filter(c => 
        calcularIdade(c.dataNascimento) >= 18 && 
        c.renda > rendaMediaGeral
    ).length;

    // 3. Métricas 2: Classes A, B, C
    // (Usa a lista FILTRADA pelo período)
    let countClasseA = 0;
    let countClasseB = 0;
    let countClasseC = 0;

    clientesFiltrados.forEach(c => {
        const classe = getClassRenda(c.renda);
        if (classe === 'renda-a') countClasseA++;
        if (classe === 'renda-b') countClasseB++;
        if (classe === 'renda-c') countClasseC++;
    });

    // --- Atualização da Interface (Cards) ---
    $('#card-renda-media').text(clientesRendaAcimaMedia);
    $('#card-classe-a').text(countClasseA);
    $('#card-classe-b').text(countClasseB);
    $('#card-classe-c').text(countClasseC);
    
    // --- Atualização dos Botões (Estilo Ativo) ---
    $('#filtro-periodo .btn').removeClass('btn-primary active').addClass('btn-outline-primary');
    $(`#filtro-periodo .btn[data-periodo="${periodo}"]`).removeClass('btn-outline-primary').addClass('btn-primary active');
}


// =================================================================
// INICIALIZAÇÃO (jQuery)
// =================================================================

$(document).ready(function() {
    
    // --- LÓGICA DO FORMULÁRIO ---
    prepararFormularioNovo();
    $('#data-nascimento').attr('max', getHojeFormatado());

    const form = $('#form-cliente');
    form.on('submit', function(event) {
        event.preventDefault(); 
        event.stopPropagation(); 
        form.addClass('was-validated'); 
        if (form[0].checkValidity() === true) {
            salvarCliente();
        }
    });

    $('#btn-cancelar').click(function() {
        prepararFormularioNovo();
    });

    // --- LÓGICA DE NAVEGAÇÃO ---
    $('#nav-clientes').click(function(e) {
        e.preventDefault();
        $('#view-clientes').show();
        $('#view-relatorios').hide();
        $('.nav-link').removeClass('active');
        $(this).addClass('active');
    });

    $('#nav-relatorios').click(function(e) {
        e.preventDefault();
        $('#view-clientes').hide();
        $('#view-relatorios').show();
        $('.nav-link').removeClass('active');
        $(this).addClass('active');
        
        // Renderiza os relatórios (com filtro padrão 'mes') ao mudar para a aba
        renderizarRelatorios('mes');
    });

    // --- LÓGICA DA LISTAGEM (PARTE 3) ---
    $('#input-pesquisa').on('keyup', renderizarTabelaClientes);

    $('#tabela-clientes-corpo').on('click', '.btn-editar', function() {
        const id = $(this).closest('tr').data('id');
        carregarClienteParaEdicao(id);
    });

    $('#tabela-clientes-corpo').on('click', '.btn-excluir', function() {
        const id = $(this).closest('tr').data('id');
        excluirCliente(id);
    });

    // --- LÓGICA DOS RELATÓRIOS (PARTE 4) ---
    $('#filtro-periodo').on('click', '.btn', function() {
        const periodo = $(this).data('periodo');
        renderizarRelatorios(periodo);
    });


    // --- CARGA INICIAL ---
    renderizarTabelaClientes(); 
    // (Não renderiza os relatórios na carga inicial, apenas ao clicar na aba)
});