// ---Dependencies
const fs = require("fs");
const babelParser = require("@babel/parser");
// const buildJson = require("./buildJson")

/** check for file type (typescript/javascript) */
function getFileType(fileName) {
  const typescriptCheck = /\.(tsx|ts)$/;
  const javascriptCheck = /\.(jsx|js)$/;
  if (fileName === undefined) {
    return {
      error: true,
      data: {
        message: 'Invalid file extension',
        errorData: null
      }
    }
  }
  else if (typescriptCheck.exec(fileName)) {
    return {
      error: false,
      data: "tsx"
    }
  }
  else if (javascriptCheck.exec(fileName)) {
    return {
      error: false,
      data: "jsx"
    }
  }
  return {
    error: true,
    data: {
      message: 'Invalid file extension',
      errorData: null
    }
  }
}

/** build an array for plugin in babel parser configuration */
function getPlugin(fileType) {
  if(fileType === "jsx"){
    return {
      error: false,
      data: ["jsx", "classProperties"]
    }
  }
  else if (fileType === "tsx") {
    return {
      error: false,
      data: ["jsx", "classProperties", "typescript"]
    }
  }
  return {
    error: true,
    data: {
      message: `No plugins for filetype: ${fileType}`,
      errorData: null
    }
  }
}

/** Read and convert to strong a specific file */
function getFileInString(fileName) {
  try {
    const data = fs.readFileSync(fileName, "utf8");
    return {
      error: false,
      data
    }
  } catch (err) {
    return {
      error: true,
      data: {
        message: `Error reading the file: ${fileName}`,
        errorData: err
      }
    }
  }
 
}

/** Standar error logs for stevedevops librarys */
function logErrors(errorTypeObj) {
  console.error(`Error ❌: (react-sitemap-stevedevops)`)
  console.error(errorTypeObj.data.message)
  if(errorTypeObj.data.errorData){
    console.error(errorTypeObj.data.errorData)
  }
}

/** Get the babel parsed object from Routes file */
function getObjParsedJSX(file, plugins) {
  try {
    const dataString =  JSON.stringify(
      babelParser.parse(file, {
        sourceType: "unambiguous",
        plugins,
      })
    )
    const data = JSON.parse(dataString);
    
    return {
      error: false,
      data: addDeclarationToBodyElements(data)
    }
  } catch (err) {
    return {
      error: true,
      data: {
        message: `Error generating de babel parsed obj`,
        errorData: err
      }
    }
  }
}

/** Add declaration object to body elements if not exists */
function addDeclarationToBodyElements(data) {
  const body = data.program.body.map( element => {
    if(element.declaration === undefined){
      return {...element, declaration: { type: ""} }
    }
    return element
  })
  return { ...data, program: {...data.program, body} }
}

/** Build an array of elements in the react class or function component */
function getFunctionOrClassElements(data) {
  const functionObj = [];
  const classObj = [];
  data.program.body.forEach((item) => {
    if (
      item.declaration.type === "FunctionDeclaration" ||
      item.type === "FunctionDeclaration"
    ) {
      functionObj.push(item);
    }
    if (
      item.declaration.type === "ClassDeclaration" ||
      item.type === "ClassDeclaration"
    ) {
      classObj.push(item);
    }
    if (
      item.type === "VariableDeclaration" &&
      item.declarations[0].init.type === "ArrowFunctionExpression"
    ) {
      functionObj.push(item.declarations[0].init);
    }
  });
  if (functionObj.length > 0){
    return {
      error: false,
      data: {
        type: 'functionObj',
        elements: functionObj
      }
    }
  }
  if (classObj.length > 0){
    return {
      error: false,
      data: {
        type: 'classObj',
        elements: classObj
      }
    }
  }
  return {
    error: true,
    data: {
      message: `There is no function declaration in this file: Perhaps it is not a React Component?`
    }
  }
  
}

/** Build and array of arguments that is data about de return of the component */
function buildArgumentsArray(data) {
  const {type, elements} = data
  const renderJson = [];
  if (type === 'functionObj') {
    elements.forEach((obj) => {
      if (obj.type === "ArrowFunctionExpression") {
        if (obj.body.body === undefined) {
          return;
        }
        obj.body.body.forEach((item) => {
          if (item.type === "ReturnStatement") {
            renderJson.push(item.argument);
          }
        });
        return;
      }
      if (obj.declaration.type === "FunctionDeclaration") {
        obj.declaration.body.body.forEach((item) => {
          if (item.type === "ReturnStatement") {
            renderJson.push(item.argument);
          }
        });
      }
      if (obj.type === "FunctionDeclaration") {
        obj.body.body.forEach((item) => {
          if (item.type === "ReturnStatement") {
            renderJson.push(item.argument);
          }
        });
      }
    });
  }
  if (type === 'classObj') {
    elements.forEach((obj) => {
      let renderIndex;
      if (obj.declaration.type === "ClassDeclaration") {
        obj.declaration.body.body.forEach((item, index) => {
          if (item.key.name === "render") {
            renderIndex = index;
          }
        });
        if (renderIndex !== undefined) {
          obj.declaration.body.body[renderIndex].body.body.forEach((item) => {
            if (item.type === "ReturnStatement") {
              returnObj.push(item.argument);
            }
          });
        }
      }
      if (obj.type === "ClassDeclaration") {
        obj.body.body.forEach((item, index) => {
          if (item.key.name === "render") {
            renderIndex = index;
          }
        });
        if (renderIndex !== undefined) {
          obj.body.body[renderIndex].body.body.forEach((item) => {
            if (item.type === "ReturnStatement") {
              returnObj.push(item.argument);
            }
          });
        }
      }
    });
  }
  if (renderJson.length === 0) {
    return {
      error: true,
      data: {
        message: `There is no return statement in this js/ts file: Have you written any JSX?`
      }
    }
  }
  return {
    error: false,
    data: renderJson
  }
}

/** Find the 'router', 'browserrouter', or 'switch' element*/
function getRoutes(json) {
  let router = [];
  json.forEach((item) => {
    if (item.type === "ConditionalExpression") {
      if (item.consequent.type === "JSXFragment") {
        const children = item.consequent.children.filter(
          (x) => x.type === "JSX Element" || x.type === "JSXFragment"
        );
        getRoutes(children);
      } else {
        // check for router in the item name.
        if (
          item.consequent.openingElement.name.name !== undefined &&
          (item.consequent.openingElement.name.name === "Router" ||
            item.consequent.openingElement.name.name === "BrowserRouter" ||
            item.consequent.openingElement.name.name === "Switch")
        ) {
          //if it exsits, filter it for only elements that are routes and return it.
          router = item.consequent.children.filter(
            (child) =>
              child.type === "JSXElement" &&
              child.openingElement.name.name === "Route"
          );
        }
      }
      //if it doesn't, check for children
      if (
        router === undefined &&
        item.consequent.children &&
        item.consequent.children.length > 0
      ) {
        //if it has children, rerun the function on the children that are actually elements
        const children = item.consequent.children.filter(
          (x) => x.type === "JSXElement" || x.type === "JSXFragment"
        );
        getRoutes(children);
      }
    } else {
      if (item.type === "JSXFragment") {
        const children = item.children.filter(
          (x) => x.type === "JSX Element" || x.type === "JSXFragment"
        );
        getRoutes(children);
      } else {
        // console.log('------------entra item: ', item);
        // buildJson('./', item, 'itemRote')
        //check for router in the item name.
        if (
          item.openingElement.name.name !== undefined &&
          (item.openingElement.name.name === "Router" ||
            item.openingElement.name.name === "BrowserRouter" ||
            item.openingElement.name.name === "Switch" ||
            item.openingElement.name.name === "Fragment")
        ) {
          
          let routesFather = [];
          item.children.forEach( element => {
            const isJsxFather = 
              element.type === 'JSXElement' &&
              element.openingElement && 
              element.openingElement.name && (
                element.openingElement.name.name === "Router" ||
                element.openingElement.name.name === "BrowserRouter" ||
                element.openingElement.name.name === "Switch")
            if(isJsxFather){
              routesFather = element.children
            }
          })

          // if it exsits, filter it for only elements that are routes and return it.
          router = routesFather.filter(
            (child) =>
              child.type === "JSXElement" &&
              child.openingElement.name.name === "Route"
          );
        }
      }
      //if it doesn't, check for children
      if (router === undefined && item.children && item.children.length > 0) {
        //if it has children, rerun the function on the children that are actually elements
        const children = item.children.filter(
          (x) => x.type === "JSXElement" || x.type === "JSXFragment"
        );
        getRoutes(children);
      }
    }
  });
  
  if (router.length === 0) {
    return {
      error: true,
      data: {
        message: `There is no 'router', 'browserrouter', or 'switch' element: Have you written a router file?`
      }
    }
  }
  return router
}

exports.buildArgumentsArray = buildArgumentsArray;
exports.getRoutes = getRoutes;
exports.getFunctionOrClassElements = getFunctionOrClassElements;
exports.getPlugin = getPlugin;
exports.getFileType = getFileType;
exports.getFileInString = getFileInString;
exports.logErrors = logErrors;
exports.getObjParsedJSX = getObjParsedJSX;