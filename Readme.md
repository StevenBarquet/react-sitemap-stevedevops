# React Build Sitemap
Can generate a sitemap.xml for react-router/react-router-dom in javascript or typescript files like the example in: https://github.com/SteveDevops-Academy/sitemap-files-examples



## The new way to build your sitemap from React Router

This library **should** replace `react-router-sitemap`. While `react-router-sitemap` has been useful, it has been abandoned for over two years, and Typescript support is tedious at best.

This library aims to take out some of the added hassle of generating your sitemap, by only requiring a few arguments to be sent to it, as opposed to having to write an entire file that involves also configuring `babel` to work. This cuts down your development time on the sitemap considerably.

### Features

- Autodetection of TypeScript and JavaScript.
- Autodetection of functional or class components.
- Ignores locked routes.
- Generates a quick and efficient `sitemap.xml` file for your project based on
your router.
- Typesafe: Will work in a TypeScript project.


### Future additions

- Add the ability to check for dynamic routes, and return all.

### Installation

NPM:

```
npm install react-sitemap-stevedevops --save-dev
```

Yarn:

```
yarn add react-sitemap-stevedevops --dev
```

### Usage

In whatever file you need to import this in, do the following:

```
import buildSitemap from 'react-sitemap-stevedevops'

buildSitemap('./path/to/component/Component.jsx', './build/path/for/sitemap', 'http://yoururl.com', [http://otherWeb1.com, http://otherWeb1.com])
```


**NOTE-1:** Do not put a `/` at the end of the buildPath or the url. These will be
handled by the library.

**NOTE-2:** The last array of websites is optional

**NOTE-3:** Remember you can add some script as the follows in your package.json:
{
  ...,
   "scripts": {
      ...,
      "build-sitemap": "node ./sitemap.js"
   }
}

