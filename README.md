<img src="./.github/assets/hero.jpg">

## 👋 Welcome to scarlett

A strongly typed, TypeScript powered, with zero dependencies, rest client library based on Fetch API.

Checkout the [documentation](https://github.com/Micene09/scarlett/wiki/Wiki-Home).

## 💎 Key features

* [Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) & [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) based rest client
* Class style
* Zero dependencies to ensure the smallest bundle
* TypeScript powered, primary goal >> *strongly-typed*
* Centralized config (via constructor) with optional local overrides on http methods
* Advanced options override tecniques
* Rest Client Builder (RestOptions API)
* Response body auto-parser/converter, based on fetch's [Body](https://developer.mozilla.org/en-US/docs/Web/API/Body)
* Query-string utilities
* Built-in cache system (optional) to improve performance on recurring requests
* Response and Error object's intellisense, even with different interfaces
* Throw errors (optional) on request failures
* Catch/filters to handle expected errors even when throw gloval error is enabled
* Support for timeout
* Easy request repeater