const SHA256 = require('crypto-js/sha256');

const cryptoHash = (...inputs) => {
  const sortedInputs = inputs.sort().join(' ');
  return SHA256(sortedInputs).toString();
};

module.exports = cryptoHash;