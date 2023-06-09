# API Styles

Scarlett comes with two styles, functional and class based.

## What style to use

There are no limitation on choosing an API style, just go for the best fit to your project.

Use for example the Class API if you are on an Angular project, to stay close to the Angular's Class based API, or Functional API if you are on a Vue.js or React project.

Keep reading the page to understand the PROs and CONs of every API style.

### Class API

```typescript
const client = new RestClient({
	host: `https://server.com`,
	responseType: `text`
})
const response = await client.get<string>(`path`)
```
 * ✓ Constructor logics and patterns
 * ✓ Very close to Class-Based projects
 * ⚠️ Every standard request method is just public, so will be exposed when extending the `RestClient` class
 * ⚠️ Destructuring is not available due to `this` binding due to Class limitations

For more details, visit the [Class API](/api/class) section.

### Functional API

```typescript
const useRestClient =  createRestClient({
	host: `https://server.com`,
	responseType: `text`
})
const { post } = useRestClient()
```
 * ✓ Destructuring enabled
 * ✓ Very close to Functional-Based projects like Vue or React
 * ⚠️ Needs a wrap methods pattern (`createRestClient` method that create the real initiator)
 * ⚠️ No `this` available

For more details, visit the [Functional API](/api/functional) section.

## The core

Internally, scarlett is based on Functional API because of its extreme modularity and flexibility.

The Class API is actually just a wrapper around the Functional API's methods.