const MINE_RATE = 1000; // 1 giây
const INITIAL_DIFFICULTY = 3;
const INITIAL_BALANCE = 0;
const MINING_REWARD = 50;
const FAUCET_AMOUNT = 100;

const GENESIS_DATA = {
  timestamp: 1,
  lastHash: '-----',
  hash: 'genesis-hash',
  difficulty: INITIAL_DIFFICULTY,
  nonce: 0,
  data: []
};

const REWARD_INPUT = { address: '*authorized-reward*' };

module.exports = { 
  GENESIS_DATA, 
  MINE_RATE,
  INITIAL_BALANCE,
  MINING_REWARD,
  REWARD_INPUT,
  FAUCET_AMOUNT
};