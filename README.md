# flayyer-js

![npm-version](https://badgen.net/npm/v/@flayyer/flayyer)
![downloads](https://badgen.net/npm/dt/@flayyer/flayyer)
![size](https://badgen.net/bundlephobia/minzip/@flayyer/flayyer)
![tree-shake](https://badgen.net/bundlephobia/tree-shaking/@flayyer/flayyer)

This module is agnostic to any JS framework and has only one peer dependency: [qs](https://github.com/ljharb/qs)

To create a Flayyer template and an account please refer to: [flayyer.com](https://flayyer.com?ref=flayyer-js)

```tsx
import { FlayyerIO } from "@flayyer/flayyer";
const flayyer = new FlayyerIO({
  tenant: "tenant",
  deck: "default",
  template: "main",
  variables: { title: "try changing this" },
});
const url = flayyer.href()
// https://flayyer.io/v2/flayyer/default/main.jpeg?title=try+changing+this
```

[![Resultant flayyer live image](https://github.com/flayyer/create-flayyer-app/blob/master/.github/assets/result-1.png?raw=true&v=1)](https://flayyer.io/v2/flayyer/default/main.jpeg?title=try+changing+this)

## Installation

This module supports Node.js, Browser and can be bundled with any tool such as Rollup, Webpack, etc and includes Typescript definitions.

```sh
yarn add @flayyer/flayyer

# or with npm:
npm install --save @flayyer/flayyer
```

## Usage

The main difference between `Flayyer.io` and `Flayyer.ai` is:

* **Flayyer.io requires you to explicitly declare template and variables for the images to render**.
* **Flayyer.ai uses the [rules defined on your dashboard](https://flayyer.com/dashboard/_/projects) to decide how to handle every image**, then fetches and analyse the website for variables and information to render the image.

In simple words:

* Flayyer.io like saying _"render an image with using this template and these explicit variables."_
* Flayyer.ai like saying _"render images based on the content of this route."_

### Flayyer.ai

This is the easiest way to use Flayyer. The following snippet enables our platform to analyse the content of every page to extract relevant information and use it to generate image previews.

```jsx
import React from "react";
import { FlayyerAI } from "@flayyer/flayyer";

function Head() {
  const flayyer = new FlayyerAI({
    project: "my-project",
    path: `/products/1`,
  });
  const url = flayyer.href();
  // > https://flayyer.ai/v2/my-project/_/__v=1596906866/products/1

  return (
    <head>
      <meta property="og:image" content={url} />
      <meta name="twitter:image" content={url} />
      {/* Declare the original image so you can use it on your templates */}
      <meta property="flayyer:image" content="https://yoursite.com/image/products/1.png" />
    </head>
  );
}
```

Remember to dynamically get the current path for each page. If you are using [Next.js](https://nextjs.org/) you should probably do it like this:

```js
import { useRouter } from 'next/router'
import { FlayyerAI } from "@flayyer/flayyer";

function SEO() {
  const router = useRouter();
  const flayyer = new FlayyerAI({
    project: "my-project",
    path: router.asPath,
  });

  // ...
}
```

> Read more about integration guides here: https://docs.flayyer.com/guides

### Flayyer.io

After installing this module you can format URLs. Here is an example with React.js, but note this can be used with any framework:

```jsx
import React from "react";
import { FlayyerIO } from "@flayyer/flayyer";

function Head() {
  const flayyer = new FlayyerIO({
    tenant: "tenant",
    deck: "deck",
    template: "template",
    variables: {
      title: "Hello world!",
      image: "https://yoursite.com/image/products/1.png",
    },
  });
  const url = flayyer.href();
  // > https://flayyer.io/v2/tenant/deck/template.jpeg?__v=1596906866&title=Hello+world%21&image=...

  return (
    <head>
      <meta property="og:image" content={url} />
      <meta name="twitter:image" content={url} />
    </head>
  );
}
```

Variables can be complex arrays and objects.

```js
const flayyer = new FlayyerIO({
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

To decode an URL for debugging purposes:

```js
console.log(decodeURI(url));
// > https://flayyer.io/v2/tenant/deck/template.jpeg?title=Hello+world!&__v=123
```

### CommonJS

In plain Node.js you can import this module as:

```js
const { FlayyerIO, FlayyerAI } = require("@flayyer/flayyer");
```

## Render images

You can use the resulting URL to render images of different sizes.

Change the size using:

```tsx
const flayyer = new FlayyerIO({
    tenant: "tenant",
    deck: "default",
    template: "main",
    variables: {
      title: "Awesome 😃",
      description: "Optional description",
    },
    meta: {
      width: 1080, // in pixels
      height: 1920, // in pixels
    }
  });
```

[![Resultant flayyer live image](https://github.com/flayyer/create-flayyer-app/blob/master/.github/assets/result-2.png?raw=true&v=1)](https://flayyer.io/v2/flayyer/default/main.jpeg?title=awesome!+%F0%9F%98%83&description=Optional+description&_w=1080&_h=1920)

## FAQ

### What is the difference between Flayyer.ai and Flayyer.io?

See [Usage](#usage) 👆

### Is it compatible with Vue, Express and other frameworks?

This is framework-agnostic, you can use this library on any framework on any platform.

### How to configure Flayyer.ai?

Visit your [project rules and settings](https://flayyer.com/dashboard/_/projects) on the Flayyer Dashboard.

### What if the `__v=` thing?

Most social networks caches images, we use this variable to invalidate their caches but we ignore it on our system to prevent unnecessary renders. **We strongly recommend it and its generated by default.**

Pass `meta: { v: null }` to disabled it (not recommended).

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
