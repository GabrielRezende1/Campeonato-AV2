module.exports = {
  configurar: async(hbs) => {
    hbs.registerHelper('nomes', function (linguagens) {
      let tamanho = linguagens.length;
      let resultado = [];
      for(let i = 0; i < tamanho; i++)
        resultado.push(linguagens[i].nome);
      return resultado;
    });
  }
}