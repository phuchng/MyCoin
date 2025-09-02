const SHA256 = require('crypto-js/sha256');

const cryptoHash = (...inputs) => {
  const dataString = inputs.map(input => JSON.stringify(input)).sort().join(' ');
  return SHA256(dataString).toString();
};

module.exports = cryptoHash;