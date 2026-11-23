const axios = require('axios')
const express = require('express')
const app = express()
//middleware
app.use(express.json())
/*
{
  1: {
    id: 1,
    titulo: 'Ruptura',
    plataforma: 'Apple TV'
  },
  2: {
    id: 2,
    titulo: 'Dark',
    plataforma: 'Netflix'
  }
}
*/
let id = 1
const series = {}

//GET /series
app.get('/series', function(req, res){
  res.json(series)
})

//POST /series
app.post('/series', async (req, res) => {
  // { titulo: "Ruptura", plataforma: "Apple TV" }
  const { titulo, plataforma } = req.body
  if (!titulo || !plataforma) {
    return res.status(400).json({ erro: 'titulo e plataforma são obrigatórios' })
  }
  const serie = {
    id: id,
    titulo: titulo,
    plataforma: plataforma
  }
  series[id] = serie
  id++
  //emitir o evento de criação de série
  await axios.post('http://localhost:10000/eventos', {
    tipo: 'SerieCriada',
    dados: serie
  })
  res.status(201).json(serie)
})

//POST /eventos
//exibir o tipo do evento no log
//encerrar a requisição, não deixando o barramento esperando
app.post('/eventos', (req, res) => {
  try{
    const evento = req.body
    console.log(evento.tipo)
  }
  catch(e){}
  res.end()
})

const port = 4000
app.listen(port, () => console.log(`Séries. Porta ${port}.`))
