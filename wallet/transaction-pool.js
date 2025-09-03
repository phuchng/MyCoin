const Transaction = require('./transaction');

const TRANSACTION_POOL_KEY = 'transaction-pool';

class TransactionPool {
  constructor({ redisClient }) {
    this.redisClient = redisClient;
  }

  async setTransaction(transaction) {
    await this.redisClient.hSet(TRANSACTION_POOL_KEY, transaction.id, JSON.stringify(transaction));
  }

  async getTransactionMap() {
    const transactionMapJson = await this.redisClient.hGetAll(TRANSACTION_POOL_KEY);
    const transactionMap = {};
    for (const id in transactionMapJson) {
      transactionMap[id] = JSON.parse(transactionMapJson[id]);
    }
    return transactionMap;
  }

  async existingTransaction({ inputAddress }) {
    const transactions = Object.values(await this.getTransactionMap());
    return transactions.find(transaction => transaction.input.address === inputAddress);
  }

  async validTransactions() {
    const transactions = Object.values(await this.getTransactionMap());
    return transactions.filter(
      transaction => Transaction.validTransaction(transaction)
    );
  }

  async clear() {
    await this.redisClient.del(TRANSACTION_POOL_KEY);
  }

  async clearBlockchainTransactions({ chain }) {
    const transactionMap = await this.getTransactionMap();
    for (let i=1; i<chain.length; i++) {
      const block = chain[i];
      for (let transaction of block.data) {
        if (transactionMap[transaction.id]) {
          await this.redisClient.hDel(TRANSACTION_POOL_KEY, transaction.id);
        }
      }
    }
  }
}

module.exports = TransactionPool;