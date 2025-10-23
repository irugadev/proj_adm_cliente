const API_URL = 'http://localhost:3000'
const viewHome = document.getElementById('view-home')
const viewCadastro = document.getElementById('view-cadastro')
const viewListagem = document.getElementById('view-listagem')
const viewRelatorios = document.getElementById('view-relatorios')

const navHome = document.getElementById('nav-home')
const navCadastro = document.getElementById('nav-cadastro')
const navListagem = document.getElementById('nav-listagem')
const navRelatorios = document.getElementById('nav-relatorios')

const cardNavCadastro = document.getElementById('card-nav-cadastro')
const cardNavListagem = document.getElementById('card-nav-listagem')
const cardNavRelatorios = document.getElementById('card-nav-relatorios')

const formCliente = document.getElementById('form-cliente')
const inputId = document.getElementById('cliente-id')
const inputNome = document.getElementById('nome')
const inputCpf = document.getElementById('cpf')
const inputDataNascimento = document.getElementById('data-nascimento')
const inputDataCadastro = document.getElementById('data-cadastro')
const inputRenda = document.getElementById('renda')
const cpfFeedback = document.getElementById('cpf-feedback')
const btnSalvar = document.getElementById('btn-salvar')
const btnCancelar = document.getElementById('btn-cancelar')

const inputPesquisa = document.getElementById('input-pesquisa')
const tabelaClientesCorpo = document.getElementById('tabela-clientes-corpo')

const filtroPeriodo = document.getElementById('filtro-periodo')
const cardRendaMedia = document.getElementById('card-renda-media')
const cardClasseA = document.getElementById('card-classe-a')
const cardClasseB = document.getElementById('card-classe-b')
const cardClasseC = document.getElementById('card-classe-c')

function getHojeFormatado() {
    return new Date().toISOString().slice(0, 10)
}

// >>>>>>>> Esta funçao foi aproveitada do codigo gerado pela IA <<<<<<<<
function validarCPF(cpf) {
    cpf = cpf.replace(/[^\d]+/g, '') 
    if (cpf === '' || cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
        return false 
    }
    let soma = 0
    let resto
    for (let i = 1; i <= 9; i++) {
        soma += parseInt(cpf.substring(i - 1, i)) * (11 - i)
    }
    resto = (soma * 10) % 11
    if (resto === 10 || resto === 11) resto = 0
    if (resto !== parseInt(cpf.substring(9, 10))) return false
    soma = 0
    for (let i = 1; i <= 10; i++) {
        soma += parseInt(cpf.substring(i - 1, i)) * (12 - i)
    }
    resto = (soma * 10) % 11
    if (resto === 10 || resto === 11) resto = 0
    if (resto !== parseInt(cpf.substring(10, 11))) return false
    return true 
}

function formatarMoeda(valor) {
    if (valor === null || valor === undefined) return 'N/A';
    const numero = parseFloat(valor)
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0 
    }).format(numero)
}
function getClassRenda(renda) {
    if (renda === null || renda === undefined) return ''
    const numero = parseFloat(renda)
    if (numero <= 980) return 'renda-a'
    if (numero >= 980.01 && numero <= 2500) return 'renda-b'
    if (numero > 2500) return 'renda-c'
    return ''
}
function calcularIdade(dataNascimento) {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento)
    let idade = hoje.getFullYear() - nascimento.getFullYear()
    const m = hoje.getMonth() - nascimento.getMonth()
    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
        idade
    }
    return idade
}
async function getClientesDB() {
    try {
        const response = await fetch(`${API_URL}/clientes`)
        if (!response.ok) {
            throw new Error('Falha ao buscar clientes da API.')
        }
        const clientes = await response.json()
        return clientes
    } catch (error) {
        console.error(error)
        alert('Erro: Não foi possível carregar os clientes. O backend (Node.js) está rodando?')
        return []
    }
}
function navegarPara(aba) {
    viewHome.style.display = 'none'
    viewCadastro.style.display = 'none'
    viewListagem.style.display = 'none'
    viewRelatorios.style.display = 'none'

    navHome.classList.remove('active')
    navCadastro.classList.remove('active')
    navListagem.classList.remove('active')
    navRelatorios.classList.remove('active')
    if (aba === 'home') {
        viewHome.style.display = 'block'
        navHome.classList.add('active')
    } else if (aba === 'cadastro') {
        viewCadastro.style.display = 'block'
        navCadastro.classList.add('active')
    } else if (aba === 'listagem') {
        viewListagem.style.display = 'block'
        navListagem.classList.add('active')
        renderizarTabelaClientes()
    } else if (aba === 'relatorios') {
        viewRelatorios.style.display = 'block'
        navRelatorios.classList.add('active')
        renderizarRelatorios('mes')
    }
}
function prepararFormularioNovo() {
    inputId.value = ''
    formCliente.reset()
    inputDataCadastro.value = getHojeFormatado()
    inputDataCadastro.disabled = true
    
    formCliente.classList.remove('was-validated')
    cpfFeedback.textContent = 'Por favor, informe um CPF válido de 11 dígitos.'
    inputCpf.classList.remove('is-invalid')
    btnSalvar.textContent = 'Salvar Cliente'
}
async function carregarClienteParaEdicao(id) {
    const clientes = await getClientesDB() 
    const cliente = clientes.find(c => c.id == id)

    if (cliente) {
        inputId.value = cliente.id
        inputNome.value = cliente.nome
        inputCpf.value = cliente.cpf

        inputDataNascimento.value = cliente.datanascimento.split('T')[0]
        inputDataCadastro.value = cliente.datacadastro.split('T')[0]
        
        inputRenda.value = cliente.renda;
        btnSalvar.textContent = 'Atualizar Cliente'
        
        navegarPara('cadastro')
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }
}

async function excluirCliente(id) {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
        try {
            const response = await fetch(`${API_URL}/clientes/${id}`, {
                method: 'DELETE'
            })

            if (!response.ok) {
                const erro = await response.json()
                throw new Error(erro.message)
            }
            renderizarTabelaClientes()
        } catch (error) {
            console.error(error)
            alert(`Erro ao excluir: ${error.message}`)
        }
    }
}

async function salvarCliente() {
    const id = inputId.value
    const nome = inputNome.value
    const cpf = inputCpf.value.replace(/[^\d]+/g, '')
    const dataNascimento = inputDataNascimento.value
    const renda = inputRenda.value ? parseFloat(inputRenda.value) : null
    
    const clienteId = id || Date.now().toString()
    const dataCadastro = id ? inputDataCadastro.value : getHojeFormatado()

    if (!validarCPF(cpf)) {
        inputCpf.classList.add('is-invalid')
        cpfFeedback.textContent = 'CPF inválido. Verifique os dígitos.'
        return;
    }
    inputCpf.classList.remove('is-invalid')
    cpfFeedback.textContent = 'Por favor, informe um CPF válido de 11 dígitos.'
    const cliente = {
        id: clienteId,
        nome,
        cpf,
        dataNascimento,
        dataCadastro,
        renda
    }

    try {
        let response;
        if (id) {
            response = await fetch(`${API_URL}/clientes/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cliente) 
            })
        } else {
            response = await fetch(`${API_URL}/clientes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cliente)
            })
        }
        if (!response.ok) {
            const erro = await response.json()
            if (response.status === 409) {
                inputCpf.classList.add('is-invalid')
                cpfFeedback.textContent = erro.message
            } else {
                alert(`Erro: ${erro.message}`)
            }
            throw new Error(erro.message)
        }
        prepararFormularioNovo()
        navegarPara('listagem')

    } catch (error) {
        console.error("Falha ao salvar cliente:", error)
    }
}

async function renderizarTabelaClientes() {
    const clientes = await getClientesDB()
    const termoPesquisa = inputPesquisa.value.toLowerCase()
    
    tabelaClientesCorpo.innerHTML = ''

    const clientesFiltrados = clientes.filter(cliente => 
        cliente.nome.toLowerCase().includes(termoPesquisa)
    )

    if (clientesFiltrados.length === 0) {
        tabelaClientesCorpo.innerHTML = 
            '<tr><td colspan="3" class="text-center">Nenhum cliente encontrado.</td></tr>'
        return
    }
    clientesFiltrados.forEach(cliente => {
        const rendaFormatada = formatarMoeda(cliente.renda)
        const classeRenda = getClassRenda(cliente.renda)
        tabelaClientesCorpo.insertAdjacentHTML('beforeend', `
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
        `)
    })
}

async function renderizarRelatorios(periodo = 'mes') {
    const todosClientes = await getClientesDB()
    
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    
    let dataInicioFiltro
    if (periodo === 'hoje') {
        dataInicioFiltro = new Date(hoje)
    } else if (periodo === 'semana') {
        dataInicioFiltro = new Date(hoje);
        dataInicioFiltro.setDate(hoje.getDate() - hoje.getDay())
    } else { 
        dataInicioFiltro = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
    }
    const clientesFiltrados = todosClientes.filter(cliente => {
        const dataCadastro = new Date(cliente.datacadastro)
        return dataCadastro >= dataInicioFiltro
    })
    const clientesComRenda = todosClientes.filter(c => c.renda !== null && parseFloat(c.renda) > 0)
    const somaRendaGeral = clientesComRenda.reduce((acc, c) => acc + parseFloat(c.renda), 0)
    const rendaMediaGeral = clientesComRenda.length > 0 ? (somaRendaGeral / clientesComRenda.length) : 0

    const clientesRendaAcimaMedia = clientesFiltrados.filter(c => 
        calcularIdade(c.datanascimento) >= 18 && 
        parseFloat(c.renda) > rendaMediaGeral
    ).length

    let countClasseA = 0, countClasseB = 0, countClasseC = 0
    clientesFiltrados.forEach(c => {
        const classe = getClassRenda(c.renda)
        if (classe === 'renda-a') countClasseA++
        if (classe === 'renda-b') countClasseB++
        if (classe === 'renda-c') countClasseC++
    })

    cardRendaMedia.textContent = clientesRendaAcimaMedia
    cardClasseA.textContent = countClasseA
    cardClasseB.textContent = countClasseB
    cardClasseC.textContent = countClasseC
    
    // Atualiza o estilo dos botões de filtro
    filtroPeriodo.querySelectorAll('.btn').forEach(btn => {
        btn.classList.remove('btn-primary', 'active')
        btn.classList.add('btn-outline-primary')
    })
    const btnAtivo = filtroPeriodo.querySelector(`[data-periodo="${periodo}"]`)
    if (btnAtivo) {
        btnAtivo.classList.remove('btn-outline-primary')
        btnAtivo.classList.add('btn-primary', 'active')
    }
}

navHome.addEventListener('click', (e) => { e.preventDefault(); navegarPara('home') })
navCadastro.addEventListener('click', (e) => { e.preventDefault(); navegarPara('cadastro') })
navListagem.addEventListener('click', (e) => { e.preventDefault(); navegarPara('listagem') })
navRelatorios.addEventListener('click', (e) => { e.preventDefault(); navegarPara('relatorios')})

cardNavCadastro.addEventListener('click', () => navegarPara('cadastro'))
cardNavListagem.addEventListener('click', () => navegarPara('listagem'))
cardNavRelatorios.addEventListener('click', () => navegarPara('relatorios'))

formCliente.addEventListener('submit', async (e) => {
    e.stopPropagation()

    formCliente.classList.add('was-validated')

    if (formCliente.checkValidity() === true) {
        await salvarCliente()
    }
})

btnCancelar.addEventListener('click', () => {
    prepararFormularioNovo()
})

inputPesquisa.addEventListener('keyup', () => {
    renderizarTabelaClientes()
})
// >>>>>>>>>>>>>>>>>>>>> CONFIGURAÇAO PARA bOTOES EDITAR E EXCLUIR <<<<<<<<<<<<<<<<<<<<<<<<<<<<
tabelaClientesCorpo.addEventListener('click', async (e) => {
    const elementoClicado = e.target

    // >>>>>> Se o clique foi em um botão de editar <<<<<<<
    if (elementoClicado.classList.contains('btn-editar')) {
        const id = elementoClicado.closest('tr').dataset.id
        await carregarClienteParaEdicao(id)
    }
    
    // >>>>>>>>>> Se o clique foi em um botão de excluir <<<<<<<<<<<<<<
    if (elementoClicado.classList.contains('btn-excluir')) {
        const id = elementoClicado.closest('tr').dataset.id;
        await excluirCliente(id)
    }
})
filtroPeriodo.addEventListener('click', (e) => {
    const periodo = e.target.dataset.periodo
    if (periodo) {
        renderizarRelatorios(periodo)
    }
})
inputDataNascimento.setAttribute('max', getHojeFormatado())
prepararFormularioNovo()
navegarPara('home')