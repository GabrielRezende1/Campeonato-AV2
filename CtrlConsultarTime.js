//COMO SE FOSSE UM MANTER TIMES
const seo = require("./src/seo.json");
const data = require("./src/data.json");
const db = require("./src/" + data.database);

var servidor;

module.exports = {
  configurar: async(srv) => {
    servidor = srv;
    // Apresenta o resultado da votação caso o path seja / e a requisição seja post
    servidor.get("/organizacao", module.exports.apresentarResultados);
  },
  apresentarResultados: async (request, reply) => {
    // Se a requisição NÃO veio com o parâmetro 'raw', vamos repassar o objeto SEO
    // (Search Engine Optimization) que coloca dados nas tags META do arquivo hbs
    let params = request.query.raw ? {} : { seo: seo };

    // Verificando se ocorreu a autenticação
    let conta = request.cookies.conta;
    if(conta == null || conta == undefined) {
      params.error = "Usuário não autenticado!";
      reply.view("/src/pages/login.hbs", params);
      return;
    }
    
    // Indicamos que queremos ver os resultados.
    params.verResultados = true;
    // Recuperando os campeonatos do banco de dados.
    // Montamos uma lista com os campeonatos e número de times obtidos
    const campeonatos = await db.obterCampeonatos();
    if (campeonatos) 
      params.campeonatos = campeonatos;
    // Se não obteve os campeonatos, repassar a mensagem de erro.
    else params.error = data.msgErro;

    if (request.cookies.senha == "admin") 
      params.rodapeAdmin = true;
/*     else if (request.cookies.senha == "comum")
      params.rodapeComum = true; */

    // Se a requisição veio com o parâmetro 'raw', devolvo o JSON com o conteúdo dos times.
    // Se não, solicito a renderização da página index.hbs
    reply.view("/src/pages/index.hbs", params);
  },
};
