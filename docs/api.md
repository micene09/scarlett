# API Styles

Scarlett comes with two styles, functional and class based.

## What style to use

There are no limitation on choosing an API style, just go for the best fit to your project.

Use for example the Class API if you are on an Angular project, to stay close to the Angular's Class based API, or Functional API if you are on a Vue.js or React project.

Keep in mind the following considerations:

Class API
 * Constructor logics and patterns
 * Every standard request method is just public, so will be exposed when extending the `RestClient` class
 * Destructuring is not available due to `this` binding (class limitations)

Functional API
 * Needs a wrap methods pattern (`createRestClient()` method that create a base method named `useRestClient()`)
 * Destructuring enabled (via `useRestClient()`)
 * No `this` available

## The core

Internally, scarlett is based on Functional API because of its extreme modularity and flexibility.

The Class API is just a wrapper around the Functional API's methods.