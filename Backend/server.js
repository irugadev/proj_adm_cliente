const express = require('express')
const { Pool } = require('pg')
const cors = require('cors')

const app = express()
const PORTA = 3000

app.use(cors())
app.use(express.json())

const pool = new Pool({
    host: 'https://niytkmvwhhldgxkzgvnk.supabase.co',
    database: 'postgres',
    user: 'postgres',
    password: 'adm_22.10.2025',
    port: 5432,
})

pool.connect((err, client, release) => {
    if (err) {
        return console.error('Erro ao conectar ao PostgreSQL', err.stack)
    }
    client.release()
    console.log('Backend conectado ao banco PostgreSQL com sucesso!')
});

app.get('/clientes', async (req, res) => {
    try {
        const { rows } = await pool.query("SELECT * FROM clientes ORDER BY nome");
        res.status(200).json(rows);
    } catch (error) {
        console.error("Erro ao buscar clientes:", error);
        res.status(500).json({ message: "Erro interno do servidor" });
    }
});

app.post('/clientes', async (req, res) => {
    const { id, nome, cpf, dataNascimento, dataCadastro, renda } = req.body;

    if (!nome || !cpf || !dataNascimento || !dataCadastro) {
        return res.status(400).json({ message: "Dados incompletos." });
    }

    try {
        const sql = "INSERT INTO clientes (id, nome, cpf, dataNascimento, dataCadastro, renda) VALUES ($1, $2, $3, $4, $5, $6)";
        const params = [id, nome, cpf, dataNascimento, dataCadastro, renda];
        
        await pool.query(sql, params);
        res.status(201).json({ message: "Cliente criado com sucesso!", id: id });
    
    } catch (error) {
        if (error.code === '23505') { 
            return res.status(409).json({ message: "Este CPF já está cadastrado." });
        }
        
        console.error("Erro ao inserir cliente:", error);
        res.status(500).json({ message: "Erro interno do servidor" });
    }
});

app.put('/clientes/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, cpf, dataNascimento, renda } = req.body;

    try {
        const sql = "UPDATE clientes SET nome = $1, cpf = $2, dataNascimento = $3, renda = $4 WHERE id = $5";
        const params = [nome, cpf, dataNascimento, renda, id];
        const { rowCount } = await pool.query(sql, params);
        if (rowCount === 0) {
            return res.status(404).json({ message: "Cliente não encontrado." });
        }
        res.status(200).json({ message: "Cliente atualizado com sucesso!" });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ message: "Este CPF já pertence a outro cliente." });
        }
        console.error("Erro ao atualizar cliente:", error);
        res.status(500).json({ message: "Erro interno do servidor" });
    }
});
app.delete('/clientes/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const sql = "DELETE FROM clientes WHERE id = $1";
        const { rowCount } = await pool.query(sql, [id]);

        if (rowCount === 0) {
            return res.status(404).json({ message: "Cliente não encontrado." });
        }

        res.status(200).json({ message: "Cliente excluído com sucesso!" });
    
    } catch (error) {
        console.error("Erro ao excluir cliente:", error);
        res.status(500).json({ message: "Erro interno do servidor" });
    }
});
app.listen(PORTA, () => {
    console.log(`Servidor backend (Node.js) rodando em http://localhost:${PORTA}`);
});