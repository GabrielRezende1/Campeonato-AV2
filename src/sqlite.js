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
          "CREATE TABLE Campeonato (id INTEGER PRIMARY KEY AUTOINCREMENT, nome VARCHAR[40])"
        );

        // Adiciono quais são os campeonatos
        await db.run(
          "INSERT INTO Campeonato (nome) VALUES ('CSGO'), ('LoL'), ('R6'), ('Valorant')"
        );

        // Criando a tabela Time
        await db.run(
          "CREATE TABLE Time(id INTEGER PRIMARY KEY AUTOINCREMENT, nome STRING, vitorias INTEGER, derrotas INTEGER, dataInclusao STRING, idCampeonato INTEGER, FOREIGN KEY (idCampeonato) REFERENCES Campeonato(id))"
        );
      } else {
        // Se já temos um banco de dados, lista os times processados
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

  obterTimes: async () => {
    try {
      return await db.all("SELECT * from Time");
    } catch (dbError) {
      console.error(dbError);
    }
  },
  
  obterCampeonatoEspecifico: async (idCampeonato) => {
    try {
      return await db.all("SELECT * FROM Campeonato WHERE id = ?", idCampeonato);
    } catch (dbError) {
      console.error(dbError);
    }
  },
  
  obterTimeEspecifico: async (idCampeonato) => {
    try {
      return await db.all("SELECT * FROM Time WHERE idCampeonato = ?", idCampeonato);
    } catch (dbError) {
      console.log("ERROR: sqlite.js ln:75");
      console.error(dbError);
    }
  },

  incluirTime: async (idCampeonato, nomeTime, vitoriasTime, derrotasTime) => {
    try {
      // verificando se o time é válido
      const resultado = await db.all("SELECT * from Campeonato WHERE id = ?", idCampeonato);
      if (resultado.length > 0) {
        await db.run("INSERT INTO Time (idCampeonato, nome, vitorias, derrotas, dataInclusao) VALUES (?, ?, ?, ?, ?)", 
                     [idCampeonato, nomeTime, vitoriasTime, derrotasTime, new Date().toISOString()]);
      }
      // Retorna o resultado atual da votação
      return await db.all("SELECT * from Campeonato");
    } catch (dbError) {
      console.error(dbError);
    }
  },

  //--- Inclui um novo campeonato na votação ---//
  incluirCampeonato: async (nome) => {
    try {
      await db.run("INSERT INTO Campeonato (nome) VALUES (?)", nome);
      return true;
    } catch (dbError) {
      console.error(dbError);
    }
  }, 
      
  //--- Ixcluir um novo campeonato na votação ---//
  excluirCampeonato: async (nome) => {
    try {
      await db.run("DELETE FROM Campeonato WHERE nome = ?", nome);
      return true;
    } catch (dbError) {
      console.error(dbError);
    }
  }
}
