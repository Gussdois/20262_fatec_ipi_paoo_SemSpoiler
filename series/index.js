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
app.post('/series', (req, res) => {
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
  res.status(201).json(serie)
})

const port = 4000
app.listen(port, () => console.log(`Séries. Porta ${port}.`))
