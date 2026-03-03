const crypto = require('crypto');

function generateId() {
  return `img_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
}

module.exports = { generateId };
