const fs = require('fs');
const path = require('path');

const env = {
  API_URL: process.env.VITE_API_URL || process.env.REACT_APP_API_URL || process.env.API_URL || '' ,
  APP_NAME: process.env.APP_NAME || 'NES Properties',
  DEFAULT_LOCALE: process.env.DEFAULT_LOCALE || 'en'
};

const outFile = path.join(__dirname, '..', 'public', 'env-config.js');
const content = `window._env_ = ${JSON.stringify(env, null, 2)};\n`;

fs.writeFileSync(outFile, content, 'utf8');
console.log('Wrote runtime env to', outFile);
