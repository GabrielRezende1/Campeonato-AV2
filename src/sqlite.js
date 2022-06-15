/**
 * Módulo para manipular o banco de dados SQLite do campeonato
 */

// Para acesso ao FileSystem
const fs = require("fs");

// Inicialização do Banco de Dados
const dbFile = "./.data/times.db";
const dbExiste = fs.existsSync(dbFile);
const sqlite3 = require("sqlite3").verbose();
const sqlite = require("sqlite");
let db;

// Solicitando a abertura do Banco de Dados
sqlite.open({ filename: dbFile, driver: sqlite3.Database})
  .then(async dBase => {
    db = dBase;
    try {
      if (!dbExiste) {
        // Se o banco de dados não existe, ele será criado. Criando a tabela Campeonato
        await db.run(
          "CREATE TABLE Campeonato (id INTEGER PRIMARY KEY AUTOINCREMENT, nome VARCHAR[40], numTimes INTEGER)"
        );

        // Adiciono quais são as linguagens da votação
        await db.run(
          "INSERT INTO Campeonato (nome, numTimes) VALUES ('CSGO', 0), ('LoL', 0), ('R6', 0), ('Valorant', 0)"
        );

        // Criando a tabela Voto
        await db.run(
          "CREATE TABLE Time(id INTEGER PRIMARY KEY AUTOINCREMENT, nome STRING, vitorias INTEGER, derrotas INTEGER, dataCriacao STRING, idCampeonato INTEGER, FOREIGN KEY (idCampeonato) REFERENCES Campeonato(id))"
        );
      } else {
        // Se já temos um banco de dados, lista os votos processados
        console.log(await db.all("SELECT * from Campeonato"));
      }
    } catch (dbError) {
      console.error(dbError);
    }
  });

module.exports = {
// Funções disponibilizadas pela exportação
  //--- Retorna o resultado atual da votação ---//
  obterCampeonatos: async () => {
    try {
      return await db.all("SELECT * from Campeonato");
    } catch (dbError) {
      console.error(dbError);
    }
  },

  //--- processar novo voto ---//
  processarTime: async (nomeCampeonato) => {
    try {
      // verificando se o time é válido
      const resultado = await db.all("SELECT * from Campeonato WHERE id = ?", nomeCampeonato);
      if (resultado.length > 0) {
        await db.run("INSERT INTO Time (idCampeonato, dataCriacao) VALUES (?, ?)", 
                     [nomeCampeonato, new Date().toISOString()]);
        await db.run(
          "UPDATE Campeonato SET numTime = numTime + 1 WHERE id = ?", nomeCampeonato);
      }
      // Retorna o resultado atual da votação
      return await db.all("SELECT * from Campeonato");
    } catch (dbError) {
      console.error(dbError);
    }
  },

  //--- Retorna os últimos times   ---//
  obterTimes: async () => {
    // Retorna os 30 times mais recentes
    try {
      return await db.all("SELECT c.id, t.dataCriacao, t.idCampeonato, c.nome from Campeonato c INNER JOIN Time t ON t.idCampeonato = c.id ORDER BY t.dataCriacao DESC LIMIT 30");
    } catch (dbError) {
      console.error(dbError);
    }
  },

  //--- Limpa e reset os times ---//
  limparTimes: async () => {
    try {
      await db.run("DELETE FROM Time");
      await db.run("DELETE FROM Campeonato");
      await db.run("INSERT INTO Campeonato (nome, numVotos) VALUES ('CSGO', 0), ('LoL', 0), ('R6', 0), ('Valorant', 0)");

      return [];
    } catch (dbError) {
      console.error(dbError);
    }
  },

  //--- Inclui uma nova linguagem na votação ---//
  incluirCampeonato: async (nome) => {
    try {
      await db.run("INSERT INTO Campeonato (nome, numTimes) VALUES (?, 0)", nome);
      return true;
    } catch (dbError) {
      console.error(dbError);
    }
  }, 
      
  //--- Inclui uma nova linguagem na votação ---//
  excluirCampeonato: async (nome) => {
    try {
      await db.run("DELETE FROM Campeonato WHERE nome = ?", nome);
      return true;
    } catch (dbError) {
      console.error(dbError);
    }
  }
}
