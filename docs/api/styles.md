# API Styles

This library comes with two styles, functional and class based, to better adapt to your project's needs and style.

## What style to use

There are no limitation on choosing an API style and both share the same [options](/api/rest-client-options).

It's highly recommended to go for the best fit for your project's code style, for example:
* Class API if you are on an [Angular](https://angular.io/) or [Nest](https://nestjs.com/) project, to stay aligned with his Class based API
* Functional API if you are on a [Vue](https://vuejs.org/) or [React](https://react.dev/) project.

Still don't know what to choose? Keep reading to know more about PROs and CONs.

## PROs and CONs

### Functional API

```typescript
const useRestClient =  createRestClient({
	host: `https://server.com`,
	responseType: `json`
})
const { get } = useRestClient()
function getCartItems() {
	return get("/cart/items")
}
```
 * ✓ Destructuring enabled
 * ✓ Very close to Functional-Based projects like [Vue](https://vuejs.org/) or [React](https://react.dev/)
 * ✓ Module bundler's Tree-Shaking friendly
 * ⚠️ Needs a wrap methods pattern (`createRestClient` >> `useRestClient`)
 * ⚠️ No `this` available

### Class API

```typescript
const client = new RestClient({
	host: `https://server.com`,
	responseType: `text`
})
const response = await client.get<string>(`path`)
```
 * ✓ Constructor logics and patterns
 * ✓ Very close to Class-Based projects like [Angular](https://angular.io/) or [Nest](https://nestjs.com/)
 * ⚠️ Class methods and props are not tree-shakable
 * ⚠️ Every standard request method is just public, so will be exposed when extending the `RestClient` class
 * ⚠️ Destructuring is not available because of `this` binding due to Class limitations

## The core

Internally, Scarlett is based on Functional API because of its extreme modularity and flexibility.

The Class API is actually a wrapper around the Functional API's methods.

## Next suggested readings

* Functional API [Usage](/guide/functional) and [API](/api/functional)
* Class API [Usage](/guide/class) and [API](/api/class)