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

//POST /series/1/comentarios
app.post('/series/:id/comentarios', async (req, res) => {
  const idComentario = uuidv4()
  const { texto } = req.body
  const comentario = {
    id: idComentario,
    texto: texto,
    serieId: req.params.id
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

//POST /eventos
app.post('/eventos', (req, res) => {
  try{
    const evento = req.body
    console.log(evento.tipo)
  }
  catch(e){}
  res.end()
})

const port = 4100
app.listen(port, () => console.log(`Comentários. Porta ${port}.`))
