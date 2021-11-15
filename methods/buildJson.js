// ---Dependencies
const fs = require("fs");

function buildJson(buildPath, jsObject, filename) {
  const newFileName = filename || 'withOutName'
  fs.writeFile(`${buildPath}/${newFileName}.json`,JSON.stringify(jsObject),(err) => {
    if (err) {
      console.error(`Error building JSON ❌\n-> ${err}`);
    } else {
      console.log(
        `> ✔️ JSON successfully generated :) at ${buildPath}/${newFileName}.json`
      );
    }} )
}

module.exports = buildJson;