// ---Dependencys
const path = require('path');
const buildSitemap = require('./index');

// ---Config
const currentPath = path.resolve(__dirname);
const siteDomain = 'https://www.forgemytech.com'

// ---Script
buildSitemap(`${currentPath}/RoutesExample.tsx`, currentPath, siteDomain);