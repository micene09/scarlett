# ⚙️ Support

## Runtime Environments

### Browsers

Any build provided assumes that the runtime supports native [ES Modules](https://caniuse.com/es6-module) and [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API), so the following browsers and versions are supported:

* Chrome >= `87`
* Edge >= `88`
* Firefox >= `78`
* Safari >= `14`

### Node.js

You are all set if using `v18+`.

If you are on a pre-`v18`:
1. Install [node-fetch](https://github.com/node-fetch/node-fetch) and [abort-controller](https://github.com/mysticatea/abort-controller) as dependencies
2. Set the following overrides:
	```ts
	import fetch from "node-fetch";
	import AbortController from "abort-controller"

	globalThis.fetch = fetch;
	globalThis.Headers = fetch.Headers;
	globalThis.AbortController = AbortController;
	```


### Deno <Badge type="tip" text="COMING SOON" />

Everything should work fine from `v1.28+`, additional tests needed.

### Bun <Badge type="tip" text="COMING SOON" />

Everything should work fine, additional tests needed.

## Different builds

Depending on your project's bundler you are using the import strategy could vary, for this reason the package provides different builds.

Once installed, the package includes different modules to ensure the best compatibility to your module bundler/importer, you need to choose the right one depending on your project setup.

Here is the list of modules included:

| Format                    | Filename                  |
|---------------------------|---------------------------|
| **ES Module** *(default)* | `lib/index.js`            |
| **UMD**                   | `lib/index.umd.js`        |
| **CommonJs**              | `lib/index.common.js`     |
| **CommonJs ES3**          | `lib/index.es3.common.js` |
| **CommonJs ES6**          | `lib/index.es6.common.js` |

## Required APIs

If you are not any of the above mentioned runtime environments, please make sure that yours supports:
* [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
* [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
* [AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)
* [FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData)
* [Headers](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#Headers)
* [URL](https://developer.mozilla.org/en-US/docs/Web/API/URL/URL)
* [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)