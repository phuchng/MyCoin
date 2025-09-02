const Transaction = require('../wallet/transaction');

class TransactionMiner {
  constructor({ blockchain, transactionPool, wallet, p2pServer }) {
    this.blockchain = blockchain;
    this.transactionPool = transactionPool;
    this.wallet = wallet;
    this.p2pServer = p2pServer;
  }

  mineTransactions() {
    const validTransactions = this.transactionPool.validTransactions();

    const rewardTransaction = Transaction.rewardTransaction({ minerWallet: this.wallet });
    validTransactions.push(rewardTransaction);

    this.blockchain.addBlock({ data: validTransactions });

    this.p2pServer.syncChains();

    this.transactionPool.clear();
  }
}

module.exports = TransactionMiner;