# flayyer-js

![npm-version](https://badgen.net/npm/v/@flayyer/flayyer) ![downloads](https://badgen.net/npm/dt/@flayyer/flayyer) ![size](https://badgen.net/bundlephobia/minzip/@flayyer/flayyer) ![tree-shake](https://badgen.net/bundlephobia/tree-shaking/@flayyer/flayyer)

The AI-powered preview system built from your website (no effort required).

![Flayyer live image](https://github.com/flayyer/create-flayyer-app/blob/master/.github/assets/website-to-preview.png?raw=true&v=1)

**This gem is agnostic to any JS framework and has only one peer dependency: [qs](https://github.com/ljharb/qs).**
## Index

- [Get started (5 minutes)](#get-started-5-minutes)
- [Advanced usage](#advanced-usage)
- [Flayyer.io](#flayyerio)
- [Development](#development)
- [Test](#test)
- [FAQ](#faq)

## Get started (5 minutes)

Haven't registered your website yet? Go to [Flayyer.com](https://flayyer.com?ref=flayyer-ruby) and create a project (e.g. `website-com`).

### 1. Install the library

This module supports Node.js, Browser and can be bundled with any tool such as Rollup, Webpack, etc and includes Typescript definitions.

```sh
yarn add @flayyer/flayyer

# or with npm:
npm install --save @flayyer/flayyer
```

### 2. Get your Flayyer.ai smart image link

In your website code (e.g. your landing or product/post view file), set the following:

```jsx
import { FlayyerAI } from "@flayyer/flayyer";

const flayyer = new FlayyerAI({
  // Your project slug
  project: "website-com",
  // The current path of your website
  path: `/path/to/product`, // in Next.js you can use `useRouter().asPath`, remember to `import { useRouter } from next/router`
});

// Check:
console.log(flayyer.href());
// > https://flayyer.ai/v2/website-com/_/__v=1618281823/path/to/product
```

### 3. Put your smart image link in your `<head>` tags

You'll get the best results like this:

```jsx
<meta property="og:image" content={flayyer.href()} />
<meta name="twitter:image" content={flayyer.href()} />
<meta name="twitter:card" content="summary_large_image" />
```

### 4. Create a `rule` for your project

Login at [Flayyer.com](https://flayyer.com?ref=flayyer-ruby) > Go to your Dashboard > Manage rules and create a rule like the following:

[![Flayyer basic rule example](https://github.com/flayyer/create-flayyer-app/blob/master/.github/assets/rule-example.png?raw=true&v=1)](https://flayyer.com/dashboard)

Voilà!

## Advanced usage

Advanced features include:

- Custom variables: additional information for your preview that is not present in your website. [Note: if you need customization you should take a look at [Flayyer.io](#flayyerio)]
- Custom metadata: set custom width, height, resolution, and more (see example).
- Signed URLs.

Here you have a detailed full example for project `website-com` and path `/path/to/product`.

```tsx
import { FlayyerAI } from "@flayyer/flayyer";

const flayyer = new FlayyerAI({
  // [Required] Your project slug, find it in your dashboard https://flayyer.com/dashboard/.
  project: "website-com",
  // [Recommended] The current path of your website (by default it's `/`).
  path: "/path/to/product",
  // [Optional] In case you want to provide information that is not present in your page set it here.
  variables: {
    title: "Product name",
    img: "https://flayyer.com/img/marketplace/flayyer-banner.png",
  },
  // [Optional] Custom metadata for rendering the image. ID is recommended so we provide you with better statistics.
  meta: {
    id: "jeans-123", // recommended for better stats (e.g. product SKU)
    v: "12369420123", // specific handler version, by default it's a random number to circumvent platforms' cache,
    width: 1200,
    height: 600,
    resolution: 0.9, // from 0.0 to 1.0
    agent: "whatsapp", // force dimensions for specific platform
  },
});

// Use this image in your <head/> tags (og:image & twitter:image)
console.log(flayyer.href)
// > https://flayyer.ai/v2/website-com/_/__id=jeans-123&__v=1618281823&img=https%3A%2F%2Fflayyer.com%2Fimg%2Fmarketplace%2Fflayyer-banner.png&title=Product+name/path/to/product
```

> Read more about integration guides here: https://docs.flayyer.com/guides

### Flayyer.io

As you probably realized, Flayyer.ai uses the [rules defined on your dashboard](https://flayyer.com/dashboard/_/projects) to decide how to handle every image based on path patterns. It fetches and analyse your website to obtain information and rendering a content-rich image increasing the click-through-rate with no effort. Let's say _"FlayyerAI renders images based on the content of this route"_.

Flayyer.io instead requires you to explicitly declare template and variables for the images to render, **giving you more control for customization**. Let's say _"FlayyerIO renders an image using this template and these explicit variables"_.

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
      <meta name="twitter:card" content="summary_large_image" />
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

You can **resize the image** like the following:

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

## Development

Prepare the local environment:

```sh
yarn install
```

To decode an URL for debugging purposes:

```js
console.log(decodeURI(url));
// > https://flayyer.io/v2/tenant/deck/template.jpeg?title=Hello+world!&__v=123
```

Helpers to compare instances (ignores `__v` param and performs a shallow compare of `variables`).

```tsx
import {
  isEqualFlayyerIO,
  isEqualFlayyerAI,
  isEqualFlayyerMeta,
} from "@flayyer/flayyer";

const boolean = isEqualFlayyerIO(fio1, fio2);
```

## Test

To run tests:

```sh
yarn test
```

## FAQ

### What is the difference between Flayyer.ai and Flayyer.io?

**Flayyer.ai** uses the [rules defined on your dashboard](https://flayyer.com/dashboard/_/projects) to decide how to handle every image based on path patterns. It fetches and analyse your website for obtaining information and then **rendering a content-rich image increasing click-through-rate with no effort**. Let's say _"FlayyerAI renders images based on the content of this route"_.

**Flayyer.io** requires you to explicitly declare template and variables for the images to render, **giving you more control for customization**. Let's say _"FlayyerIO renders an image using this template and these explicit variables"_.

### Is it compatible with Nextjs, React, Vue, Express and other frameworks?

This is framework-agnostic, you can use this library on any framework on any platform.

### How to configure Flayyer.ai?

Visit your [project rules and settings](https://flayyer.com/dashboard/_/projects) on the Flayyer Dashboard.

### What is the `__v=` thing?

Most social networks caches images, we use this variable to invalidate their caches but we ignore it on our system to prevent unnecessary renders. **We strongly recommend it and its generated by default.**

Pass `meta: { v: null }` to disabled it (not recommended).