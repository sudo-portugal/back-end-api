import pkg from "pg";
import dotenv from "dotenv";
import express from "express";      // Requisição do pacote do express
const app = express();              // Instancia o Express
app.use(express.json());            // Permite receber dados em formato JSON (necessário para POST e PUT)
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

//server.js
app.get("/questoes/:id", async (req, res) => {
  console.log("Rota GET /questoes/:id solicitada"); // Log no terminal para indicar que a rota foi acessada

  try {
    const id = req.params.id; // Obtém o ID da questão a partir dos parâmetros da URL
    const db = conectarBD(); // Conecta ao banco de dados
    const consulta = "SELECT * FROM questoes WHERE id = $1"; // Consulta SQL para selecionar a questão pelo ID
    const resultado = await db.query(consulta, [id]); // Executa a consulta SQL com o ID fornecido
    const dados = resultado.rows; // Obtém as linhas retornadas pela consulta

    // Verifica se a questão foi encontrada
    if (dados.length === 0) {
      return res.status(404).json({ mensagem: "Questão não encontrada" }); // Retorna erro 404 se a questão não for encontrada
    }

    res.json(dados); // Retorna o resultado da consulta como JSON
  } catch (e) {
    console.error("Erro ao buscar questão:", e); // Log do erro no servidor
    res.status(500).json({
      erro: "Erro interno do servidor"
    });
  }
});

//server.js
app.delete("/questoes/:id", async (req, res) => {
  console.log("Rota DELETE /questoes/:id solicitada"); // Log no terminal para indicar que a rota foi acessada

  try {
    const id = req.params.id; // Obtém o ID da questão a partir dos parâmetros da URL
    const db = conectarBD(); // Conecta ao banco de dados
    let consulta = "SELECT * FROM questoes WHERE id = $1"; // Consulta SQL para selecionar a questão pelo ID
    let resultado = await db.query(consulta, [id]); // Executa a consulta SQL com o ID fornecido
    let dados = resultado.rows; // Obtém as linhas retornadas pela consulta

    // Verifica se a questão foi encontrada
    if (dados.length === 0) {
      return res.status(404).json({ mensagem: "Questão não encontrada" }); // Retorna erro 404 se a questão não for encontrada
    }

    consulta = "DELETE FROM questoes WHERE id = $1"; // Consulta SQL para deletar a questão pelo ID
    resultado = await db.query(consulta, [id]); // Executa a consulta SQL com o ID fornecido
    res.status(200).json({ mensagem: "Questão excluida com sucesso!!" }); // Retorna o resultado da consulta como JSON
  } catch (e) {
    console.error("Erro ao excluir questão:", e); // Log do erro no servidor
    res.status(500).json({
      erro: "Erro interno do servidor"
    });
  }
});

//server.js
app.post("/questoes", async (req, res) => {
  console.log("Rota POST /questoes solicitada");

  try {
    const data = req.body;

    // Verifica se todos os campos obrigatórios foram enviados
    if (!data.enunciado || !data.disciplina || !data.tema || !data.nivel) {
      return res.status(400).json({
        erro: "Dados inválidos",
        mensagem: "Todos os campos (enunciado, disciplina, tema, nivel) são obrigatórios.",
      });
    }

    const db = conectarBD();
    const consulta = "INSERT INTO questoes (enunciado, disciplina, tema, nivel) VALUES ($1, $2, $3, $4)";
    await db.query(consulta, [data.enunciado, data.disciplina, data.tema, data.nivel]);

    res.status(201).json({ mensagem: "Questão criada com sucesso!" });
  } catch (e) {
    console.error("Erro ao inserir questão:", e);
    res.status(500).json({ erro: "Erro interno do servidor" });
  }
});

app.put("/questoes/:id", async (req, res) => {
  console.log("Rota PUT /questoes/:id solicitada");

  try {
    const id = req.params.id;
    const db = conectarBD();

    // Verifica se a questão existe
    let consulta = "SELECT * FROM questoes WHERE id = $1";
    let resultado = await db.query(consulta, [id]);
    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensagem: "Questão não encontrada" });
    }

    const questaoAtual = resultado.rows[0];
    const data = req.body;

    // Usa o valor novo se enviado, senão mantém o antigo
    const enunciado = data.enunciado || questaoAtual.enunciado;
    const disciplina = data.disciplina || questaoAtual.disciplina;
    const tema = data.tema || questaoAtual.tema;
    const nivel = data.nivel || questaoAtual.nivel;

    consulta = "UPDATE questoes SET enunciado = $1, disciplina = $2, tema = $3, nivel = $4 WHERE id = $5";
    await db.query(consulta, [enunciado, disciplina, tema, nivel, id]);

    res.status(200).json({ mensagem: "Questão atualizada com sucesso!" });
  } catch (e) {
    console.error("Erro ao atualizar questão:", e);
    res.status(500).json({ erro: "Erro interno do servidor" });
  }
});



app.listen(port, () => {            // Um socket para "escutar" as requisições
  console.log(`Serviço rodando na porta:  ${port}`);
});

