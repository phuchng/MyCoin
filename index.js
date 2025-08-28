const express = require('express');

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to MyCoin Blockchain API' });
});

const HTTP_PORT = process.env.HTTP_PORT || 3001;

app.listen(HTTP_PORT, () => {
  console.log(`Server listening on port ${HTTP_PORT}`);
});
