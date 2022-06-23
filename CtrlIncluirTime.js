const seo = require("./src/seo.json");
const data = require("./src/data.json");
const db = require("./src/" + data.database);

var servidor;
module.exports = {
  configurar: async(srv) => {
    // Guardando a referência para o servidor
    servidor = srv;
    
    // Apresenta o formulário caso o path seja / e requisição via get
    servidor.get("/escalacao", module.exports.apresentarFormulario);

    // Apresenta o resultado da votação caso o path seja / e a requisição seja post
    servidor.post("/escalacao", module.exports.incluirTime);
  },
  apresentarFormulario: async (request, reply) => {
    // Se a requisição NÃO veio com o parâmetro 'raw', vamos repassar o objeto SEO
    // (Search Engine Optimization) que coloca dados nas tags META do arquivo hbs
    let params = request.query.raw ? {} : { seo: seo };

    // Verificando se ocorreu a autenticação
    let conta = request.cookies.conta;
    let senha = request.cookies.senha;
    console.log("IncluirTime.js =>" + JSON.stringify(request.cookies));
    if(conta == null || conta == undefined || senha == 'usuario') {
      params.error = "* Usuário não autenticado!";
      reply.view("/src/pages/login.hbs", params);
      return;
    }
    
    ///### servidor.usuariosAtivos[conta] = { ultimaChamada : new Date()};
    console.log(servidor.usuariosAtivos);
    
    if(senha == 'admin') {
      console.log("RODAPE ADMIN ATIVO");
      params.rodapeUsuario = false;
      params.rodapeAdmin = true;
    }else if(senha == 'usuario') {
      console.log("RODAPE USUARIO ATIVO");
      params.rodapeAdmin = false;
      params.rodapeUsuario = true;
    }

    // Recuperando os times do banco de dados.
    // Montamos uma lista com os campeonatos e com os times obtidos
    const campeonatos = await db.obterCampeonatos();
    if (campeonatos) {
      params.campeonatos = campeonatos;
      if (campeonatos.length < 1) 
        params.setup = data.msgSetup;
    }
    // Se não obteve as campeonatos, repassar a mensagem de erro.
    else params.error = data.msgErro;

    // Se a requisição veio com o parâmetro 'raw', devolvo o JSON com o conteúdo dos votos.
    // Se não, solicito a renderização da página index.hbs
    request.query.raw
      ? reply.send(params)
      : reply.view("/src/pages/index.hbs", params);
  },

  incluirTime: async (request, reply) => {
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

    
    // Adicionando voto à linguagem indicada
    await db.incluirTime(request.body.idCampeonato, request.body.nomeTime, request.body.vitoriasTime, request.body.derrotasTime);
    
    console.log("Novo time incluído");
    const ctrlConsultarCampeonato = require("./CtrlConsultarCampeonato.js");
    await ctrlConsultarCampeonato.apresentarFormulario(request,reply);

  },

  //---------------------------------------------------------------------//
};
