const axios = require('axios')
const express = require('express')
const app = express()
app.use(express.json())

//POST /eventos
app.post('/eventos', async (req, res) => {
  //pegar o corpo da requisição
  const evento = req.body
  console.log(evento)
  //enviar via post para todos os mss
  try{
    await axios.post('http://localhost:4000/eventos', evento)
  }catch(e){}
  try{
    await axios.post('http://localhost:4100/eventos', evento)
  }catch(e){}
  try{
    await axios.post('http://localhost:4200/eventos', evento)
  }catch(e){}
  res.end()
})

//colocar o barramento para operar na porta 10000
const port = 10000
app.listen(port, () => console.log(`Barramento. Porta ${port}.`))
