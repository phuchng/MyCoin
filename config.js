const MINE_RATE = 1000; // 1 giây
const INITIAL_DIFFICULTY = 3;
const INITIAL_BALANCE = 1000;

const GENESIS_DATA = {
  timestamp: 1,
  lastHash: '-----',
  hash: 'genesis-hash',
  difficulty: INITIAL_DIFFICULTY,
  nonce: 0,
  data: []
};

module.exports = { 
  GENESIS_DATA, 
  MINE_RATE,
  INITIAL_BALANCE 
};