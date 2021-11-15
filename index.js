const fs = require("fs");
const PropTypes = require("prop-types");
// ---Methods
const { 
  getFileType, 
  getPlugin, 
  getFileInString,
  logErrors,
  getObjParsedJSX,
  getFunctionOrClassElements,
  buildArgumentsArray,
  getRoutes
} = require("./methods/general");

const buildSitemap = (fileName, buildPath, url, aditionalWebsites) => {
  const newSites = aditionalWebsites && aditionalWebsites.length>0 ? aditionalWebsites.map( website => `\t\n\n<url> <loc>${website}</loc> </url>` ) : []
  const sitemapElements = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"  xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">',
    ...newSites
  ];

  // check for file type (typescript/javascript)
  const fileType = getFileType(fileName);
  if(fileType.error){
    logErrors(fileType)
    return null;
  }

  const plugins = getPlugin(fileType.data)
  if(plugins.error){
    logErrors(plugins)
    return null;
  }

  const jsxFile = getFileInString(fileName)
  if(jsxFile.error){
    logErrors(jsxFile)
    return null;
  }

  const jsxObj = getObjParsedJSX(jsxFile.data, plugins.data);
  if(jsxObj.error){
    logErrors(jsxObj)
    return null;
  }

  const { data, error } = getFunctionOrClassElements(jsxObj.data);
  if(error){
    logErrors({ data, error })
    return null;
  }

  const argumentsArray = buildArgumentsArray(data)
  if(argumentsArray.error){
    logErrors(argumentsArray)
    return null;
  }
  const renderJson = argumentsArray.data

  // Find the 'router', 'browserrouter', or 'switch' element.
  let router = getRoutes(renderJson)
  if(router.error){
    logErrors(router)
    return null;
  }

  // if the above elements exist, map through all routes.
  if (router !== undefined) {
    router.forEach((item) => {
      const pathIndex = item.openingElement.attributes.findIndex(
        (x) => x.name.name === "path"
      );
      const newUrl = `\t\n<url><loc>${url}${item.openingElement.attributes[pathIndex].value.value}</loc></url>`;
      sitemapElements.push(newUrl);
    });
  }
  // if does not exist, throw an error saying it doesn't exist and skip running.
  if (router === undefined) {
    throw new Error(
      "The component you passed has no router to iterate through. Skipping."
    );
  }
  // generate xml file string.
  sitemapElements.push("</urlset>");
  const xml = sitemapElements.join("");
  // write sitemap.xml file to build path.
  fs.writeFile(`${buildPath}/sitemap.xml`, xml, (err) => {
    if (err) {
      console.error(`Error ❌: (react-build-sitemap) ${err}`);
    } else {
      console.log(
        `> ✔️ Sitemap successfully generated at ${buildPath}/sitemap.xml`
      );
    }
  });
};

buildSitemap.propTypes = {
  fileName: PropTypes.string,
  buildPath: PropTypes.string,
  url: PropTypes.string,
  aditionalWebsites: PropTypes.arrayOf(PropTypes.string)
};

module.exports =  buildSitemap;
