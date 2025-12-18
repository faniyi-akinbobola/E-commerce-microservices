const crypto = require('crypto');
global.crypto = crypto;

require('./dist/main');
