# flayyer-js

[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

This module is agnostic to any JS framework and has only one peer dependency: [qs](https://github.com/ljharb/qs)

To create a Flayyer template please refer to: [flayyer.com](https://flayyer.com?ref=flayyer-js)

## Installation

This module supports Node.js, Browser and can be bundled with any tool such as Rollup, Webpack, etc.

```sh
yarn add @flayyer/flayyer qs

# or with npm:
npm install --save @flayyer/flayyer qs
```

Types for [TypeScript](https://www.typescriptlang.org) are included, but if you have any issues try installing `qs` types:

```sh
yarn add --dev @types/qs

# or with npm:
npm install --save-dev @types/qs
```

## Usage

After installing this module you can format URLs just like this example:

```js
import Flayyer from "@flayyer/flayyer";

const flayyer = new Flayyer({
  tenant: "tenant",
  deck: "deck",
  template: "template",
  variables: {
    title: "Hello world!",
  },
});

// Use this image in your <head/> tags
const url = flayyer.href();
// > https://flayyer.io/v2/tenant/deck/template.jpeg?__v=1596906866&title=Hello+world%21
```

Variables can be complex arrays and objects.

```js
const flayyer = new Flayyer({
  // ...
  variables: {
    items: [
      { text: "Oranges", count: 12 },
      { text: "Apples", count: 14 },
    ],
  },
  meta {
    id: "slug-or-id", // To identify the resource in our analytics report
  }
});
```

**IMPORTANT: variables must be serializable.**

To decode the URL for debugging purposes:

```js
console.log(decodeURI(url));
// > https://flayyer.io/v2/tenant/deck/template.jpeg?title=Hello+world!&__v=123
```

### CommonJS

In plain Node.js you can import this module as:

```js
const Flayyer = require("@flayyer/flayyer").default;
```

> Please note the `.default` at the end fo the require statement

## Development

Prepare the local environment:

```sh
yarn install
```

To run tests:

```sh
yarn test
```

## Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/flayyer/flayyer-js.

## License

The module is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).
