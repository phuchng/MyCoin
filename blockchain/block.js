const SHA256 = require('crypto-js/sha256');
const { GENESIS_DATA } = require('../config');

class Block {
  constructor({ timestamp, lastHash, hash, data }) {
    this.timestamp = timestamp;
    this.lastHash = lastHash;
    this.hash = hash;
    this.data = data;
  }

  static genesis() {
    return new this(GENESIS_DATA);
  }

  static mineBlock({ lastBlock, data }) {
    const timestamp = Date.now();
    const lastHash = lastBlock.hash;
    const hash = Block.hash(timestamp, lastHash, data);

    return new this({
      timestamp,
      lastHash,
      hash,
      data
    });
  }

  static hash(timestamp, lastHash, data) {
    return SHA256(JSON.stringify({ timestamp, lastHash, data })).toString();
  }
}

module.exports = Block;