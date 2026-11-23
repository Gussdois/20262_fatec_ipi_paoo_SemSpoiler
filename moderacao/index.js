const axios = require('axios')
const express = require('express')
const app = express()
app.use(express.json())

//precisa tratar o evento ComentarioCriado
//se o texto do comentario contiver pelo menos uma das palavras proibidas, trocar o status para spoiler
//caso contrário, trocar para liberado
//emitir um evento do tipo ComentarioModerado
const palavrasProibidas = ["morre", "final", "assassino", "traidor"]

const moderar = (comentario) => {
  comentario.status =
    palavrasProibidas.find(palavra => comentario.texto.includes(palavra)) ? 'spoiler' : 'liberado'
  axios.post('http://localhost:10000/eventos', {
    tipo: 'ComentarioModerado',
    dados: {
      id: comentario.id,
      texto: comentario.texto,
      serieId: comentario.serieId,
      status: comentario.status
    }
  })
}

//ComentarioCriado e ComentarioEditado são tratados pela mesma função
//nunca tratar ComentarioAtualizado, senão a moderação aconteceria para sempre
const funcoes = {
  ComentarioCriado: moderar,
  ComentarioEditado: moderar
}

app.post('/eventos', (req, res) => {
  try{
    const evento = req.body
    console.log(evento)
    funcoes[evento.tipo](evento.dados)
  }
  catch(e){}
  res.end()
})

const port = 4300
app.listen(port, async () => {
  console.log(`Moderação. Porta ${port}.`)
  try{
    //buscar o histórico de eventos no barramento
    const resp = await axios.get('http://localhost:10000/eventos')
    //guardar o último evento de cada comentário, indexado pelo id do comentário
    const ultimoEventoPorComentarioId = {}
    resp.data.forEach((evento, indice, colecao) => {
      if (evento.tipo === 'ComentarioCriado' ||
          evento.tipo === 'ComentarioEditado' ||
          evento.tipo === 'ComentarioModerado') {
        ultimoEventoPorComentarioId[evento.dados.id] = evento
      }
    })
    //moderar apenas os comentários que ficaram para trás
    //se o último evento for ComentarioModerado, não há função no mapa e nada é feito
    resp.data.forEach((evento, indice, colecao) => {
      try{
        if (ultimoEventoPorComentarioId[evento.dados.id] === evento) {
          funcoes[evento.tipo](evento.dados)
        }
      }
      catch(e){}
    })
  }
  catch(e){
    console.log('Barramento indisponível')
  }
})
