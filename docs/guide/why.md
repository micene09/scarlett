# Why

It was about 2019 Q1 and I was coding in three very large and complex Frontend repositories for my company, trying to deal with popular XHR or early Fetch based libraries, but...more than one thing was missing to me.

The idea behind scarlett was based on needs that initially appeared so obvious to me, but soon I realized that, while most of the Open Source focus was just about settings customizations, no libraries was covering all the needs that me and my team was facing.

## 📕 Main principles

Speaking with colleagues of mine and digging deeper on the web, me and my team found a list of principles that a rest client library, in our opinion, should absolutely respect.

### 1. Keep it fully typed

Of course there was many good Typescript projects out there, but usually in real life complex scenarios, Backend developers in large companies provide implicitly two API contracts, the response for the API you are calling and a generic one for all the domain's API errors.

With scarlett you have full control over typed body response for both success and error, [checkout this guide](/api/response-object) about the response object type inference.

### 2. Control the throw mechanism

Fetch promises only reject with a `TypeError` when a network error occurs, since `4xx` or `5xx` are not network errors you will never have a blocking `throw` error. Some libraries had (and still) settings to activate the auto-throw error when the [Response.ok](https://developer.mozilla.org/en-US/docs/Web/API/Response/ok) property is `false`...but even today it sounds like an "*all-in or all-out*" choice, this is not enough for a complex web app.

In a real world high complexity web app, there are two kind of errors:
* Fatal Errors
* Handled Errors

Most of the `5xx` HTTP Status Codes from the server can be considered Fatal Error that should be thrown in the main thread, "blocking" the UX with a proper message for the user. When a Fatal error occurs means that the user, you and your team are experiencing an unexpected error, not handled by any logic on both client and server, basically a bug.

But not all `4xx` or `5xx` can be considered Fatal errors, think about the following examples of Handled Errors:
* [503 Service Unavailable](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/503), if you are integrating with a third party API, you can easily expect that the service could be temporary unavailable, a smart move is considering it as an expected response, that if occurs can be handled with a proper UX.
* [404 Not Found](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/404), think about an e-commerce, in which you are trying to resume a Cart using your cached Cart Id, but the Cart expired and API is returning `404`, it doesn't need be a Fatal Error, you should handle it providing a friendly UX with a message for the user like "*Sorry, your cart expired, please continue shopping with us...*".

In scarlett you have the following options:
1. Throw always an error when [Response.ok](https://developer.mozilla.org/en-US/docs/Web/API/Response/ok) is `false` or a network error occurs
2. Never throw error
3. Throw error when [Response.ok](https://developer.mozilla.org/en-US/docs/Web/API/Response/ok) is `false`, a network error occurs...but exclude from throwing with custom local options or custom callbacks on the response context, checking for status codes or details on the (typed) error body

Check out [the documentation](/api/rest-client-options#throwexcluding) for more details about it.

### 3. Allow specializations

It's a common practice to have global/common options for every rest client initialized in your web app, but supposing that you have a collection of business rest methods for CRUD operations, what if you have just a few specializations in one or two?

In scarlett you will have two layers of rest options:
* The global layer, that will be shared to every request method defined in your rest client
* The local layer, a specific context in your request method that will override one or more rest options from the global layer

Another key mechanism is the override strategy, in which you can define how to override props on rest options object, on global or local layer.

Check out [override strategy guide](/api/rest-client-options#overridestrategy) for more details about it.

## 😬 Why this name?

Yeah, I'm a huge fan of that beautiful American actress...
