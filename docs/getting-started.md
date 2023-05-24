## Installation

`npm i scarlett`

or

`yarn add scarlett`

### Required Polyfills

As `tsconfig.json`, sources are compiled to`ES2021`, keep in mind that **polyfills are not included**.

Scarlett will require the following APIs:

* [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
* [Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
* [AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)
* [FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData)
* [Headers](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#Headers)
* [URL](https://developer.mozilla.org/en-US/docs/Web/API/URL/URL)
* [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)

### Different builds

In the `lib/` folder of the package you will find different build files:

| Format                    | Filename              |
| ------------------------- | --------------------- |
| **ES Module** *(default)* | `index.js`            |
| **UMD**                   | `index.umd.js`        |
| **CommonJs**              | `index.common.js`     |
| **CommonJs ES3**          | `index.es3.common.js` |
| **CommonJs ES6**          | `index.es6.common.js` |
