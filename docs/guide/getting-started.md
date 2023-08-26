# Getting Started

## Use in your project

Install Scarlett as a dependency using NPM:

```bash
npm i scarlett
```

or if you're using Yarn:

```bash
yarn add scarlett
```

then import it:

```typescript
import { createRestClient } from "scarlett"
```


## Use from CDN

You can use Scarlett from a CDN using a script tag:

```html
<script type src="https://unpkg.com/scarlett@2/lib/index.js"></script>
```

or just import it in a Javascript module file:

```js
import { createRestClient } from "https://unpkg.com/scarlett@2/lib/index.js"
```

## Importmap

Configure an alias in the script tag:

```html
<script type="importmap">
  {
    "imports": {
      "scarlett": "https://unpkg.com/scarlett@2/lib/index.js"
    }
  }
</script>
```
then import it in a Javascript module file:

```js
import { createRestClient } from "scarlett"
```

For more details about this feature, please visit the official [importmap](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap) documentation.

## Usage

Once installed, you can choose what API Style to use:

#### Using Functional API

```typescript
import { createRestClient } from `scarlett`

const useRestClient = createRestClient({
	host: `https://server.com`,
	responseType: `text`
})
const { get } = useRestClient()
const { data, status } = await get<string>(`path`)
console.log(data) // inferred as string or undefined
```
See the full [Functional API Usage](/guide/functional) guide.

#### Using Class API

```typescript
import { RestClient } from `scarlett`

const client = new RestClient({
	host: `https://server.com`,
	responseType: `text`
})
const response = await client.get<string>(`path`)
console.log(response.data) // inferred as string or undefined
```
See the full [Class API Usage](/guide/class) guide.

----

Visit the [API Styles](/api/styles) section to know more about it.
