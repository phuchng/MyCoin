require('dotenv').config();
const express = require('express');
const path = require('path');
const redis = require('redis');
const Blockchain = require('./blockchain');
const P2pServer = require('./p2p-server');
const Wallet = require('./wallet');
const TransactionPool = require('./wallet/transaction-pool');
const TransactionMiner = require('./app/transaction-miner');
const Transaction = require('./wallet/transaction');
const { FAUCET_AMOUNT, REWARD_INPUT, FAUCET_PUBLIC_KEY } = require('./config');

const app = express();

const HTTP_PORT = process.env.HTTP_PORT || 3001;
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const redisClient = redis.createClient({ url: REDIS_URL });

let blockchain;
let transactionPool;
let minerWallet;
let p2pServer;
let transactionMiner;

const BLOCKS_PER_PAGE = 10;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'client/dist')));

app.get('/api/info', (req, res) => {
  res.json({
    faucetAddress: FAUCET_PUBLIC_KEY,
    chainLength: blockchain.chain.length
  });
});

app.get('/api/blocks', (req, res) => {
  res.json(blockchain.chain);
});

app.get('/api/blocks/length', (req, res) => {
  res.json(blockchain.chain.length);
});

app.get('/api/blocks/:page', (req, res) => {
  const { page } = req.params;
  const { length } = blockchain.chain;

  const blocksReversed = blockchain.chain.slice().reverse();

  let startIndex = page * BLOCKS_PER_PAGE;
  let endIndex = (page * BLOCKS_PER_PAGE) + BLOCKS_PER_PAGE;

  startIndex = startIndex < length ? startIndex : length;
  endIndex = endIndex < length ? endIndex : length;

  res.json(blocksReversed.slice(startIndex, endIndex));
});

app.get('/api/transactions', async (req, res) => {
  res.json(await transactionPool.getTransactionMap());
});

app.post('/api/transact', async (req, res) => {
  const transactionData = req.body;

  if (!transactionData || !transactionData.id || !transactionData.input || !transactionData.outputMap) {
      return res.status(400).json({ type: 'error', message: 'Malformed transaction' });
  }

  const transaction = new Transaction(transactionData);

  try {
    if (!Transaction.validTransaction(transaction)) {
      throw new Error('Invalid transaction signature or output.');
    }

    const transactionMap = await transactionPool.getTransactionMap();
    if (transactionMap[transaction.id]) {
      throw new Error('Transaction already in pool.');
    }

    await transactionPool.setTransaction(transaction);
    p2pServer.broadcastTransaction(transaction);
  
    res.json({ type: 'success', transaction });
  } catch (error) {
    return res.status(400).json({ type: 'error', message: error.message });
  }
});

app.post('/api/faucet-transact', async (req, res) => {
  const { recipient } = req.body;
  const amount = FAUCET_AMOUNT;
  
  try {
    const transaction = minerWallet.createTransaction({
      recipient,
      amount,
      chain: blockchain.chain
    });

    await transactionPool.setTransaction(transaction);
    p2pServer.broadcastTransaction(transaction);
    
    res.json({ type: 'success', transaction });
  } catch (error) {
    return res.status(400).json({ type: 'error', message: error.message });
  }
});

app.get('/api/mine-transactions', async (req, res) => {
  await transactionMiner.mineTransactions();
  res.redirect('/api/blocks');
});

app.get('/api/miner-info', (req, res) => {
    const address = minerWallet.publicKey;
    res.json({
      address,
      balance: Wallet.calculateBalance({ chain: blockchain.chain, address })
    });
});

app.get('/api/wallet/create', (req, res) => {
    const wallet = new Wallet();
    res.json({
        privateKey: wallet.keyPair.getPrivate('hex'),
        publicKey: wallet.publicKey,
        balance: wallet.balance
    });
});

app.get('/api/address/:address', (req, res) => {
  const { address } = req.params;
  const balance = Wallet.calculateBalance({ chain: blockchain.chain, address });
  const transactions = [];

  for (let block of blockchain.chain) {
    for (let transaction of block.data) {
      if (transaction.input.address === address || transaction.outputMap[address]) {
        transactions.push(transaction);
      }
    }
  }

  res.json({
    address,
    balance,
    transactions: transactions.reverse()
  });
});

app.get('/api/known-addresses', (req, res) => {
    const addressMap = {};
    for (const block of blockchain.chain) {
      for (const transaction of block.data) {
        Object.keys(transaction.outputMap).forEach(address => addressMap[address] = true);
        if (transaction.input.address !== REWARD_INPUT.address && transaction.input.address !== '*genesis-block-pre-mine*') {
            addressMap[transaction.input.address] = true;
        }
      }
    }
    res.json(Object.keys(addressMap));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

const main = async () => {
  await redisClient.connect();
  console.log('Connected to Redis.');

  blockchain = await Blockchain.create({ redisClient });
  transactionPool = new TransactionPool({ redisClient });
  minerWallet = new Wallet({ privateKey: process.env.FAUCET_PRIVATE_KEY });
  p2pServer = new P2pServer(blockchain, transactionPool);
  transactionMiner = new TransactionMiner({ blockchain, transactionPool, wallet: minerWallet, p2pServer });

  console.log(`Faucet/Miner Wallet Address: ${minerWallet.publicKey}`);

  app.listen(HTTP_PORT, () => {
    console.log(`Server listening on port ${HTTP_PORT}`);
  });

  p2pServer.listen();
};

main().catch(err => {
  console.error('Failed to start server:', err);
  redisClient.quit();
  process.exit(1);
});