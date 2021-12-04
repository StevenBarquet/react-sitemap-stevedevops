// ---Dependencys
const path = require('path');
const buildSitemap = require('./index');

// ---Config
const currentPath = path.resolve(__dirname);
const siteDomain = 'https://www.forgemytech.com'
const aditionalWebsites = [
  'https://web.whatsapp.com/',
  'https://babel.dev/docs/en/babel-parser',
  'https://www.tutorialkart.com/nodejs/create-file-in-nodejs-using-node-fs-module/'
]

// ---Script
buildSitemap(`${currentPath}/RoutesExample1.tsx`, currentPath, siteDomain, aditionalWebsites);