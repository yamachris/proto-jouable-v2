const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Serveur en marche!');
});

app.listen(3001, () => {
  console.log('Serveur démarré sur http://localhost:3001');
});