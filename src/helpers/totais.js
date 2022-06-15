module.exports = {
  configurar: async(hbs) => {
    hbs.registerHelper('totais', function (linguagens) {
      let tamanho = linguagens.length;
      let resultado = [];
      for(let i = 0; i < tamanho; i++)
        resultado.push(linguagens[i].numVotos);
      return resultado;
    });  
  }
}
