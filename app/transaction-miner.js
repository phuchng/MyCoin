const Transaction = require('../wallet/transaction');

class TransactionMiner {
  constructor({ blockchain, transactionPool, wallet, p2pServer }) {
    this.blockchain = blockchain;
    this.transactionPool = transactionPool;
    this.wallet = wallet;
    this.p2pServer = p2pServer;
  }

  async mineTransactions() {
    const validTransactions = await this.transactionPool.validTransactions();

    if (validTransactions.length === 0) {
      console.log('No valid transactions to mine.');
      return;
    }

    const rewardTransaction = Transaction.rewardTransaction({ minerWallet: this.wallet });
    validTransactions.push(rewardTransaction);

    await this.blockchain.addBlock({ data: validTransactions });

    this.p2pServer.syncChains();

    await this.transactionPool.clear();

    this.p2pServer.broadcastClearTransactions();
  }
}

module.exports = TransactionMiner;