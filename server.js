import pkg from "pg";
import dotenv from "dotenv";
import express from "express";      // Requisição do pacote do express
const app = express();              // Instancia o Express
const port = 3000;                  // Define a porta

dotenv.config();        // Carrega e processa o arquivo .env
const { Pool } = pkg;   // Obtém o construtor Pool do pacote pg para gerenciar conexões com o banco de dados PostgreSQL
let pool = null; // Variável para armazenar o pool de conexões com o banco de dados

// Função para obter uma conexão com o banco de dados
function conectarBD() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.URL_BD,
    });
  }
  return pool;
}

app.get("/", async (req, res) => {      // Cria endpoint na rota da raiz do projeto
  console.log("Rota GET / solicitada");

  const db = conectarBD(); // Cria uma nova instância do Pool para gerenciar conexões com o banco de dados

  let dbStatus = "ok";
  try {
    await db.query("SELECT 1");
  } catch (e) {
    dbStatus = e.message;
  }

  res.json({
    message: "API para atividade",      // Substitua pelo conteúdo da sua API
    author: "Eduardo Portugal Souza Rocha",     // Substitua pelo seu nome
    statusBD: dbStatus
  });
});

// Rota para retornar todas as questões cadastradas
app.get("/questoes", async (req, res) => {
	console.log("Rota GET /questoes solicitada"); // Log no terminal para indicar que a rota foi acessada

  const db = conectarBD(); // Cria uma nova instância do Pool para gerenciar conexões com o banco de dados

  try {
    const resultado = await db.query("SELECT * FROM questoes"); // Executa uma consulta SQL para selecionar todas as questões
    const dados = resultado.rows; // Obtém as linhas retornadas pela consulta
    res.json(dados); // Retorna o resultado da consulta como JSON
  } catch (e) {
    console.error("Erro ao buscar questões:", e); // Log do erro no servidor
    res.status(500).json({
      erro: "Erro interno do servidor",
      mensagem: "Não foi possível buscar as questões",
    });
  }
});



app.listen(port, () => {            // Um socket para "escutar" as requisições
  console.log(`Serviço rodando na porta:  ${port}`);
});

