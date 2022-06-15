const seo = require("./src/seo.json");
const data = require("./src/data.json");
const db = require("./src/" + data.database);

var servidor;

module.exports = {
  configurar: async(srv) => {
    servidor = srv;
    // Apresenta os logs da votação caso o path seja /logs e a requisição seja get
    servidor.get("/times", module.exports.visualizarVotos);
  },
  
  visualizarVotos: async (request, reply) => {
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
    
    // obtem a lista de votos
    params.votos = await db.obterTimes();

    // Recuperando a mensagem de erro, caso tenha ocorrido algo
    params.error = params.votos ? null : data.msgErro;

    // Se a requisição veio com o parâmetro 'raw', devolvo o JSON com o conteúdo dos votos.
    // Se não, solicito a renderização da página admin.hbs
    request.query.raw
      ? reply.send(params)
      : reply.view("/src/pages/admin.hbs", params);
  }
};
