# API Styles

Scarlett comes with two styles, functional and class based.

## What style to use

There are no limitation on choosing an API style, just go for the best fit to your project.

Use for example the Class API if you are on an Angular project, to stay close to the Angular's Class based API, or Functional API if you are on a Vue.js or React project.

Keep in mind the following considerations:

### Class API

```typescript
const client = new RestClient({
	host: `https://server.com`,
	responseType: `text`
})
const response = await client.get<string>(`path`)
```
 * Constructor logics and patterns
 * :warning: Every standard request method is just public, so will be exposed when extending the `RestClient` class
 * :warning: Destructuring is not available due to `this` binding due to Class limitations

### Functional API

```typescript
const useRestClient =  createRestClient({
	host: `https://server.com`,
	responseType: `text`
})
const { post } = useRestClient()
```
 * Destructuring enabled
 * :warning: Needs a wrap methods pattern (`createRestClient` method that create the real initiator)
 * :warning: No `this` available

## The core

Internally, scarlett is based on Functional API because of its extreme modularity and flexibility.

The Class API is actually just a wrapper around the Functional API's methods.