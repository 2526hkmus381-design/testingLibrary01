const express = require('express')
const path = require('path')
const app = express()
const port = process.env.PORT || 8099

app.use(express.static(path.join(__dirname, '1')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '1', 'login.html'));
});

app.listen(port, () => {
  console.log(`*`)
})

