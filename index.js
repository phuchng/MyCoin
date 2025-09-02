const express = require('express');
const Blockchain = require('./blockchain');
const P2pServer = require('./p2p-server');
const Wallet = require('./wallet');
const TransactionPool = require('./wallet/transaction-pool');
const TransactionMiner = require('./app/transaction-miner');

const app = express();
const blockchain = new Blockchain();
const wallet = new Wallet();
const transactionPool = new TransactionPool();
const p2pServer = new P2pServer(blockchain, transactionPool);
const transactionMiner = new TransactionMiner({ blockchain, transactionPool, wallet, p2pServer });

app.use(express.json());

app.get('/api/blocks', (req, res) => {
  res.json(blockchain.chain);
});

app.get('/api/transactions', (req, res) => {
  res.json(transactionPool.transactionMap);
});

app.post('/api/transact', (req, res) => {
  const { amount, recipient } = req.body;
  let transaction = transactionPool.existingTransaction({ inputAddress: wallet.publicKey });

  try {
    if (transaction) {
      transaction.update({ senderWallet: wallet, recipient, amount });
    } else {
      transaction = wallet.createTransaction({ recipient, amount });
    }
  } catch (error) {
    return res.status(400).json({ type: 'error', message: error.message });
  }

  transactionPool.setTransaction(transaction);
  p2pServer.broadcastTransaction(transaction);

  res.json({ type: 'success', transaction });
});

app.get('/api/mine-transactions', (req, res) => {
  transactionMiner.mineTransactions();
  res.redirect('/api/blocks');
});

const HTTP_PORT = process.env.HTTP_PORT || 3001;

app.listen(HTTP_PORT, () => {
  console.log(`Server listening on port ${HTTP_PORT}`);
});

p2pServer.listen();