const HOST = 'localhost'
const axios = require('axios')
const express = require('express')
const { v4: uuidv4 } = require('uuid')
const app = express()
app.use(express.json())

const comentariosPorSerieId ={}
const funcoes = {
  ComentarioModerado: (comentario) =>{
    const comentariosDaSerie = comentariosPorSerieId[comentario.serieId]
    const comentarioParaAtualizar = comentariosDaSerie.find(c => c.id === comentario.id)
    comentarioParaAtualizar.status = comentario.status
    axios.post(`http://${HOST}:10000/eventos`, {
      tipo: 'ComentarioAtualizado',
      dados: {
        id: comentarioParaAtualizar.id,
        texto: comentarioParaAtualizar.texto,
        serieId: comentarioParaAtualizar.serieId,
        status: comentarioParaAtualizar.status
      }
    })
  }
}
app.post('/series/:id/comentarios', async (req, res) => {
  const idComentario = uuidv4()
  const { texto } = req.body
  const comentario = {
    id: idComentario,
    texto: texto,
    serieId: req.params.id,
    status: 'pendente'
  }
  const comentariosDaSerie = comentariosPorSerieId[req.params.id] || []
  comentariosDaSerie.push(comentario)
  comentariosPorSerieId[req.params.id] = comentariosDaSerie

  await axios.post(`http://${HOST}:10000/eventos`, {
    tipo: 'ComentarioCriado',
    dados: comentario
  })
  res.status(201).json(comentariosDaSerie)
})

app.get('/series/:id/comentarios', function(req, res){
  res.json(comentariosPorSerieId[req.params.id] || [])
})
app.put('/series/:id/comentarios/:idComentario', async (req, res) => {
  const { texto } = req.body
  const comentariosDaSerie = comentariosPorSerieId[req.params.id] || []
  const comentario = comentariosDaSerie.find(c => c.id === req.params.idComentario)
  if (!comentario) {
    return res.status(404).json({ erro: 'comentário não encontrado' })
  }
  comentario.texto = texto
  comentario.status = 'pendente'
  await axios.post(`http://${HOST}:10000/eventos`, {
    tipo: 'ComentarioEditado',
    dados: comentario
  })
  res.status(200).json(comentario)
})

app.post('/eventos', (req, res) => {
  try{
    const evento = req.body
    console.log(evento.tipo)
    funcoes[evento.tipo](evento.dados)
  }
  catch(e){}
  res.end()
})
const port = 4100
app.listen(port, () => console.log(`Comentários. Porta ${port}.`))