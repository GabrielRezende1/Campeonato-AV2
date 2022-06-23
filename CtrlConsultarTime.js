//COMO SE FOSSE UM MANTER TIMES
const seo = require("./src/seo.json");
const data = require("./src/data.json");
const db = require("./src/" + data.database);

var servidor;

module.exports = {
  configurar: async(srv) => {
    servidor = srv;
    // Apresenta o resultado da votação caso o path seja / e a requisição seja post
    servidor.get("/times", module.exports.apresentarTimes);
    
  },
  apresentarTimes: async (request, reply) => {
    // Se a requisição NÃO veio com o parâmetro 'raw', vamos repassar o objeto SEO
    // (Search Engine Optimization) que coloca dados nas tags META do arquivo hbs
    let params = request.query.raw ? {} : { seo: seo };

    // Verificando se ocorreu a autenticação
    let conta = request.cookies.conta;
    let senha = request.cookies.senha;
    if(conta == null || conta == undefined) {
      params.error = "Usuário não autenticado!";
      reply.view("/src/pages/login.hbs", params);
      return;
    }
    
    // params que apareceram no index + rodape especifico de tipo de usuario.
    params.verCampeonatos = false;
    params.verTimes = true;
    if(senha == 'admin') {
      console.log("RODAPE ADMIN ATIVO");
      params.rodapeUsuario = false;
      params.rodapeAdmin = true;
    }else if(senha == 'usuario') {
      console.log("RODAPE USUARIO ATIVO");
      params.rodapeAdmin = false;
      params.rodapeUsuario = true;
    }
    // Recuperando os campeonatos e times do banco de dados.
    if (request.timesEspecificos) {
      params.times = request.timesEspecificos;
    }else {
      params.error = data.msgErro;
    }
    
    if(request.campEspecifico) {
      params.campeonato = request.campEspecifico
    }else{
      params.error = data.msgErro
    }

    // Se a requisição veio com o parâmetro 'raw', devolvo o JSON com o conteúdo dos times.
    // Se não, solicito a renderização da página index.hbs
    reply.view("/src/pages/index.hbs", params);
  },
  
};