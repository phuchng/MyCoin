const express = require('express');
const Blockchain = require('./blockchain');
const P2pServer = require('./p2p-server');

const app = express();
const blockchain = new Blockchain();
const p2pServer = new P2pServer(blockchain);

app.use(express.json());

app.get('/api/blocks', (req, res) => {
  res.json(blockchain.chain);
});

app.post('/api/mine', (req, res) => {
  const { data } = req.body;

  blockchain.addBlock({ data });

  p2pServer.syncChains();

  console.log('A new block has been added.');
  res.redirect('/api/blocks');
});

const HTTP_PORT = process.env.HTTP_PORT || 3001;

app.listen(HTTP_PORT, () => {
  console.log(`Server listening on port ${HTTP_PORT}`);
});

p2pServer.listen();