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
app.listen(port, () => {
  console.log(`Moderação. Porta ${port}.`)
})
