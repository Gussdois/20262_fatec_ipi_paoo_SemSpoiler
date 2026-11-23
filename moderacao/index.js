const axios = require('axios')
const express = require('express')
const app = express()
app.use(express.json())

const palavrasProibidas = ["morre", "final", "assassino", "traidor"]

const moderar = (comentario) =>{
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
const funcoes ={
  ComentarioCriado: moderar,
  ComentarioEditado: moderar
}

app.post('/eventos', (req,res) => {
  try{
    const evento = req.body
    console.log(evento)
    funcoes[evento.tipo](evento.dados)
  }
  catch(e){}
  res.end()
})

const port = 4300
app.listen(port, async () =>{
  console.log(`Moderação. Porta ${port}.`)
  try{
    const resp = await axios.get('http://localhost:10000/eventos')
    const ultimoEventoPorComentarioId = {}
    resp.data.forEach((evento, indice, colecao) => {
      if (evento.tipo === 'ComentarioCriado' ||
          evento.tipo === 'ComentarioEditado' ||
          evento.tipo === 'ComentarioModerado') {
        ultimoEventoPorComentarioId[evento.dados.id] = evento
      }
    })
    resp.data.forEach((evento,indice,colecao) =>{
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
