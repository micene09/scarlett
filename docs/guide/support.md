# ⚙️ Support

## Runtime Environments

The default ES Module build assumes the runtime used supports native [ES Modules](https://caniuse.com/es6-module) and [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API):

* Chrome >=87
* Edge >=88
* Firefox >=78
* Safari >=14
* Node.js >= 18

### Deno <Badge type="tip" text="COMING SOON" />

Needs extra effort to support this new shining environment, from `v2.x` there aren't any kind of blocking things.

Any help will be appreciated, feel free to submit a Pull Request.

## Required APIs

If you are not any of the above mentioned runtime environments, please make sure that yours supports:
* [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
* [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
* [AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)
* [FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData)
* [Headers](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#Headers)
* [URL](https://developer.mozilla.org/en-US/docs/Web/API/URL/URL)
* [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)