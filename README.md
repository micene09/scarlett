<img src="https://github.com/Micene09/scarlett/raw/main/docs/assets/hero.png">

[![build](https://github.com/Micene09/scarlett/actions/workflows/build.yml/badge.svg)](https://github.com/Micene09/scarlett/actions/workflows/build.yml)
[![tests](https://github.com/Micene09/scarlett/actions/workflows/tests.yml/badge.svg)](https://github.com/Micene09/scarlett/actions/workflows/tests.yml)
[![version](https://img.shields.io/npm/v/scarlett?label=version)](https://www.npmjs.com/package/scarlett)
[![downloads](https://img.shields.io/npm/dm/scarlett)](https://www.npmjs.com/package/scarlett)


## 👋 Welcome to scarlett

A strongly typed with zero dependencies, rest client library based on Fetch API.

Checkout the [documentation](https://micene09.github.io/scarlett).

## 💎 Key features

* [Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) & [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) based rest client
* Both Functional and Class API style
* Zero dependencies to ensure the smallest bundle
* TypeScript powered and strongly-typed
* Response body auto-parser/converter
* Fully typed response body for both success and failures
* Centralized config with optional local overrides on http methods
* Fetch standard [standard cache](https://developer.mozilla.org/en-US/docs/Web/API/Request/cache) system
* Built-in in-memory cache system (with auto expire logic)
* Requests can `throw` errors on failures
* Catch and filter expected errors preventing `throw`
* Timeout supported
* Request repeater
* Query-string utilities
* Rest Client Builder