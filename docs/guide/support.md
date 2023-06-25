# ⚙️ Support

## Runtime Environments

Any build provided assumes that the runtime supports native [ES Modules](https://caniuse.com/es6-module) and [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API):

* Chrome >=87
* Edge >=88
* Firefox >=78
* Safari >=14
* Node.js >= 18

### Deno <Badge type="tip" text="COMING SOON" />

Currently <u>not supported</u>, needs extra effort to support this new shining environment.

The good news is that from `v2.x` there aren't any kind of blocking things.

Any help will be appreciated, feel free to submit a Pull Request.

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