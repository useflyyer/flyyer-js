# flayyer-js

![npm-version](https://badgen.net/npm/v/@flayyer/flayyer) ![downloads](https://badgen.net/npm/dt/@flayyer/flayyer) ![size](https://badgen.net/bundlephobia/minzip/@flayyer/flayyer) ![tree-shake](https://badgen.net/bundlephobia/tree-shaking/@flayyer/flayyer)

Format URLs to generate social media images using Flayyer.com.

**To create templates with React.js or Vue.js use [create-flayyer-app](https://github.com/flayyer/create-flayyer-app) 👈**

![Flayyer live image](https://github.com/flayyer/create-flayyer-app/blob/master/.github/assets/website-to-preview.png?raw=true&v=1)

**This module is agnostic to any JS framework and has only one dependency: [qs](https://github.com/ljharb/qs).**

## Index

- [Get started (5 minutes)](#get-started-5-minutes)
- [Advanced usage](#advanced-usage)
- [Flayyer.io](#flayyerio)
- [Development](#development)
- [Test](#test)
- [FAQ](#faq)

## Get started (5 minutes)

### 1. Install module

This module supports Node.js, Browser and can be bundled with any tool such as Rollup, Webpack, etc and includes Typescript definitions.

```sh
yarn add @flayyer/flayyer

# or with npm:
npm install --save @flayyer/flayyer
```

### 2. Flayyer.ai smart image link

> Haven't registered your website yet? Go to [Flayyer.com](https://flayyer.com/get-started?ref=flayyer-js) and import your website to create a project (e.g. `website-com`).

For each of your routes, create an instance.

```tsx
import { FlayyerAI } from "@flayyer/flayyer";

const flayyer = new FlayyerAI({
  // Your project slug
  project: "website-com",
  // Relative path
  path: `/path/to/product`,
});

console.log(flayyer.href());
// > https://flayyer.ai/v2/website-com/_/__v=1618281823/path/to/product
```

#### 2.1 Next.js

Remember to dynamically get the current path for each page. If you are using [Next.js](https://nextjs.org/) you should probably do it like this:

```tsx
import { useRouter } from 'next/router'

function SEO() {
  const router = useRouter();
  const flayyer = new FlayyerAI({
    project: "my-project",
    path: router.asPath,
  });
  // ...
}
```

### 3. Setup `<head>` meta tags

You'll get the best results doing this:

```tsx
<meta property="og:image" content={flayyer.href()} />
<meta name="twitter:image" content={flayyer.href()} />
<meta name="twitter:card" content="summary_large_image" />
```

### 4. Manage rules

Login at [Flayyer.com](https://flayyer.com?ref=flayyer-js) > Go to your Dashboard > Manage rules and create a rule like the following:

[![Flayyer basic rule example](https://github.com/flayyer/create-flayyer-app/blob/master/.github/assets/rule-example.png?raw=true&v=1)](https://flayyer.com/dashboard/)

Voilà! **To create templates with React.js or Vue.js use [create-flayyer-app](https://github.com/flayyer/create-flayyer-app) 👈**

## Advanced usage

Advanced features include:

- Custom variables: additional information for your preview that is not present in your website. [Note: if you need customization you should take a look at [Flayyer.io](#flayyerio)]
- Custom metadata: set custom width, height, resolution, and more (see example).
- Signed URLs.

Here you have a detailed full example for project `website-com` and path `/path/to/product`.

```tsx
import { FlayyerAI } from "@flayyer/flayyer";

const flayyer = new FlayyerAI({
  // Project slug, find it in your dashboard https://flayyer.com/dashboard/.
  project: "website-com",
  // The current path of your website (by default it's `/`).
  path: "/path/to/product",

  // [Optional] In case you want to provide information that is not present in your page set it here.
  variables: {
    title: "Product name",
    img: "https://flayyer.com/img/marketplace/flayyer-banner.png",
  },
  // [Optional] Additional variables.
  meta: {
    id: "jeans-123", // stats identifier (e.g. product SKU), defaults to `path`.
    width: 1080, // force width (pixels).
    height: 1080, // force height (pixels).
    v: null, // cache-burst, to circumvent platforms' cache, default to a timestamp, null to disable.
  },
});
```

> Read more about integration guides here: https://docs.flayyer.com/guides

## Flayyer.io

* Flayyer.ai uses the [rules defined on your dashboard](https://flayyer.com/dashboard/_/projects) to decide how to handle every image based on path patterns. It fetches and analyse your website to obtain information and render a content-rich image. Let's say _"FlayyerAI renders images based on the content of this route"_.

* Flayyer.io instead requires you to explicitly declare template and variables for the images to render, **giving you more control for customization**. Let's say _"FlayyerIO renders an image using this template and these explicit variables"_.

```tsx
import { FlayyerIO } from "@flayyer/flayyer";
const flayyer = new FlayyerIO({
  tenant: "flayyer",
  deck: "default",
  template: "main",
  variables: { title: "try changing this" },
});
const url = flayyer.href()
// https://flayyer.io/v2/flayyer/default/main.jpeg?title=try+changing+this
```

[![Resultant flayyer live image](https://github.com/flayyer/create-flayyer-app/blob/master/.github/assets/result-1.png?raw=true&v=1)](https://flayyer.io/v2/flayyer/default/main.jpeg?title=try+changing+this)

After installing this module you can format URLs. Here is an example with React.js, but note this can be used with any framework:

```tsx
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

You can **set image dimensions**, note if your are planing to use this as `<img src={flayyer.href()} />` you should disable cache-bursting.

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
    v: null, // prevent cache-bursting in browsers
    width: 1080, // in pixels
    height: 1920, // in pixels
  }
});

<img src={flayyer.href()}>
```

[![Resultant flayyer live image](https://github.com/flayyer/create-flayyer-app/blob/master/.github/assets/result-2.png?raw=true&v=1)](https://flayyer.io/v2/flayyer/default/main.jpeg?title=awesome!+%F0%9F%98%83&description=Optional+description&_w=1080&_h=1920)

**To create templates with React.js or Vue.js use [create-flayyer-app](https://github.com/flayyer/create-flayyer-app) 👈**

---

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
