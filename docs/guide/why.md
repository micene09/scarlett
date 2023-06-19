# Why

During the 2019 Q1, I was coding in two very large and complex Frontend repositories, trying to use popular XHR based or early Fetch based libraries, but...more than one thing was missing to me.

The idea behind Scarlett was based on needs that initially appeared so simple to me, but soon I realized that, while most of the Open Source focus was just about settings customizations, no libraries was covering all the needs that me and my team was facing.

## 📕 Main principles

Speaking with colleagues of mine and digging deeper on the web, me and my team found a list of principles that a rest client library, in our opinion, should absolutely respect.

### Fully Typed

Of course there was many good Typescript projects out there, but usually in real life complex scenarios, Backend developers in large companies provide implicitly two API contracts, the response for the API you are calling and a generic one for all the domain's API errors.

With Scarlett you have full control over typed body response for both success or error, [checkout the guide](/guide/functional).

### Advanced Throw Mechanism

A standard Fetch request never throws errors, some libraries had (and still) settings to activate the auto-throw error when the [Response.ok](https://developer.mozilla.org/en-US/docs/Web/API/Response/ok) property is `false`...but even today it sounds like "an all-in or all-out" choice, that for a complex web app is not enough.

In a real world web app, there are two kind of errors:
* Fatal Errors
* Handled Errors

Most of the `5xx` HTTP Status Codes from the server can be considered Fatal Error that should be thrown in the main thread, "blocking" the UX with a proper message for the user. When a Fatal error occurs, means that the user, you and your team are experiencing an unexpected error, not handled by any logic on both client and server, basically a bug.

Naturally, not all `4xx` or `5xx` can be considered Fatal errors, think about the following examples of Handled Errors:
* [503 Service Unavailable](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/503), if you are integrating with a third party API, you can easily expect that the service could be temporary unavailable, a smart move is considering it as an expected response, that if occurs can be handled with a proper UX.
* [404 Not Found](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/404), think about an e-commerce, in which you are trying to resume a Cart using your cached Cart Id, but the Cart expired and API is returning 404, it cannot be a Fatal error because for your app is an expected behavior, so it should be handled to provide a UX like "Sorry, your cart expired, please go to home and start again".

In Scarlett you have the following options:
1. Throw always an error when [Response.ok](https://developer.mozilla.org/en-US/docs/Web/API/Response/ok) is `false`
2. Never throw error
3. Throw error when [Response.ok](https://developer.mozilla.org/en-US/docs/Web/API/Response/ok) is `false` but exclude from throwing with custom local options or custom callbacks on the response context, checking for status codes or details on the (typed) error body

Check out [the documentation](/api/functional#throwexcluding) for more details about it.

### Customization Layers enabled

It's a common practice to have global and common settings for every rest client initialized in your web app, but what if you have just a few specializations in one or two request methods?

In Scarlett you will have two layers of settings:
* The global layer, that will be shared to every request method defined in your rest client
* The local layer, a specific context in your request method that will override one or more settings from the global layer

Another key mechanism is the override strategy, in which you can define how to override prop settings on global or local.

Check out [the documentation](/api/functional#overridestrategy) for more details about it.

## 💎 Key features

Here we are, with the lovely help of colleagues and friends, here is the full list of key features, extending the main principles.

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

## 🌟 Inspired by

* [axios](https://github.com/axios/axios)
* DotNet Core's [HttpClientFactory](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/http-requests#typed-clients)

## 😬 Why this name?

Yeah, I'm a huge fan of that beautiful American actress...