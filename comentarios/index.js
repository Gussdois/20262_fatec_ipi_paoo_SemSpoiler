const axios = require('axios')
const express = require('express')
const { v4: uuidv4 } = require('uuid')
const app = express()
app.use(express.json())

/*
{
  1: [
    {
      id: '596ec099-34cd-4ab8-ab70-2ee94ea8592a',
      texto: 'Que abertura linda',
      serieId: '1'
    }
  ],
  2: [
    {}
  ]
}
*/
const comentariosPorSerieId = {}

const funcoes = {
  ComentarioModerado: (comentario) => {
    const comentariosDaSerie = comentariosPorSerieId[comentario.serieId]
    const comentarioParaAtualizar = comentariosDaSerie.find(c => c.id === comentario.id)
    comentarioParaAtualizar.status = comentario.status
    axios.post('http://localhost:10000/eventos', {
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

//POST /series/1/comentarios
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
  //emitir o evento de criação de comentário
  await axios.post('http://localhost:10000/eventos', {
    tipo: 'ComentarioCriado',
    dados: comentario
  })
  res.status(201).json(comentariosDaSerie)
})

//GET /series/1/comentarios
app.get('/series/:id/comentarios', function(req, res){
  res.json(comentariosPorSerieId[req.params.id] || [])
})

//PUT /series/1/comentarios/596ec099-34cd-4ab8-ab70-2ee94ea8592a
app.put('/series/:id/comentarios/:idComentario', async (req, res) => {
  const { texto } = req.body
  const comentariosDaSerie = comentariosPorSerieId[req.params.id] || []
  const comentario = comentariosDaSerie.find(c => c.id === req.params.idComentario)
  if (!comentario) {
    return res.status(404).json({ erro: 'comentário não encontrado' })
  }
  comentario.texto = texto
  comentario.status = 'pendente'
  //emitir o evento de edição de comentário
  await axios.post('http://localhost:10000/eventos', {
    tipo: 'ComentarioEditado',
    dados: comentario
  })
  res.status(200).json(comentario)
})

//POST /eventos
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
