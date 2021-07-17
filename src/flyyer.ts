import Base64 from "crypto-js/enc-base64";
import Utf8 from "crypto-js/enc-utf8";
import HmacSHA256 from "crypto-js/hmac-sha256";
import { stringify, IStringifyOptions } from "qs";

/**
 * Meta variables usually have values assigned by Flyyer depending on how and where images are rendered.
 *
 * You can force these values here.
 * @example
 * const meta: FlyyerMetaVariables ={
 *   width: 1080, // in pixels
 *   height: 1080, // in pixels
 *   v: null, // disable cache-burst
 *   id: "my-id", // analytics id
 * }
 * const flyyerRender = new FlyyerRender({ meta });
 * const flyyer = new Flyyer({ meta });
 * @example
 * `https://cdn.flyyer.io/render/v2/flyyer/default/main.jpeg?__v=disabled`
 * `https://cdn.flyyer.io/render/v2/flyyer/default/main.jpeg?_w=1080&_h=1080`
 * `https://cdn.flyyer.io/v2/flyyer-com/_/_/?__v=disabled`
 * `https://cdn.flyyer.io/v2/flyyer-com/_/_w=1080&_h=1080/marketplace`
 */
export interface FlyyerMetaVariables {
  /**
   * Force crawler user agent.
   * Converted to `_ua=` on `flyyer.href()` if set.
   *
   * Full list at https://docs.flyyer.io/docs/features/agent-detection
   * @example
   * "whatsapp" // _ua=whatsapp
   * "facebook" // _ua=facebook
   * "twitter" // _ua=twitter
   * "instagram" // _ua=instagram
   */
  agent?: string | null;
  /*
   * Force language instead of using the viewer's locale.
   * This is useful when you have your website with international routes (eg: `example.com/de` or `de.example.com`)
   * Converted to `_loc=` on `flyyer.href()` if set.
   */
  locale?: string | null;
  /**
   * Pixels (integer value).
   * Converted to `_w=` on `flyyer.href()` if set.
   * @example
   * 1200 // _w=1200 // default value most of the time
   * 1080 // _w=1080
   * @example
   * `https://cdn.flyyer.io/render/v2/flyyer/default/main.jpeg?_w=1080&_h=1080`
   * `https://cdn.flyyer.io/v2/flyyer-com/_/_w=1080&_h=1080/jobs`
   */
  width?: string | number | null;
  /**
   * Pixels (integer value).
   * Converted to `_h=` on `flyyer.href()` if set.
   * @example
   * 1200 // _h=630 // default value most of the time
   * 1080 // _h=1080
   * 1080 // _h=1920
   * @example
   * `https://cdn.flyyer.io/render/v2/flyyer/default/main.jpeg?_w=1080&_h=1080`
   * `https://cdn.flyyer.io/v2/flyyer-com/_/_w=1080&_h=1080/jobs`
   */
  height?: string | number | null;
  /**
   * Range from [0.0, 1.0]
   * Converted to `_res=` on `flyyer.href()` if set.
   */
  resolution?: string | number | null;
  /**
   * To identify your links on the analytics report
   * Converted to `__id=` on `flyyer.href()` if set.
   */
  id?: string | number | null;
  /**
   * Cache invalidator, set to `null` or empty string `""` to disable it.
   * Converted to `__v=` on `flyyer.href()` if set.
   *
   * **If you are using Flyyer inside your website for to render images we recommend disabling it to use browser's cache.**
   * @example
   * const flyyer = new FlyyerRender({ meta: { v: null } }); // disabled
   * @example
   * __v=null // disabled
   * __v="1" // constant
   * __v=undefined // `__v=123123` a timestamp will be used.
   * @example
   * `https://cdn.flyyer.io/render/v2/flyyer/default/main.jpeg?title=Hello&__v=123123` // by default is a timestamp
   * `https://cdn.flyyer.io/render/v2/flyyer/default/main.jpeg?title=Hello&__v=` // disabled to use browser's cache
   */
  v?: string | number | null;
}

/**
 * Any possible object. **Remember: keys and values must be serializable.**
 */
export type FlyyerVariables =
  | {
      [key: string]: any;
    }
  | Record<any, any>;

/**
 * Supported extensions
 * @example
 */
export type FlyyerExtension = "jpeg" | "jpg" | "png" | "webp";

export interface FlyyerCommonParams<T extends FlyyerVariables> {
  /**
   * Optional. Leave empty `""` or as `_` to always grab the latest version.
   */
  version?: number | null;

  /**
   * Supported extensions are: `"jpeg" | "jpg" | "png" | "webp"`
   */
  extension?: FlyyerExtension | null;

  /**
   * JS serializable variables.
   * @example
   * const flyyerRender = new FlyyerRender({ variables: { title: "Hello world", image: "https://example.com/logo.png" } })
   * console.log(flyyerRender.href())
   * // https://cdn.flyyer.io/render/v2/TENANT/DECK/TEMPLATE.jpeg?title=Hello+world&image=https%3A%2F%2Fexample.com%2Flogo.png
   * @example
   * const flyyer = new Flyyer({ variables: { title: "Hello world", image: "https://example.com/logo.png" } })
   * console.log(flyyer.href())
   * // https://cdn.flyyer.io/v2/flyyer-com/_/title=Hello+world&image=https%3A%2F%2Fexample.com%2Flogo.png/
   */
  variables?: T | null;

  /**
   * Meta variables usually have values assigned by Flyyer depending on how and where images are rendered.
   *
   * You can force these values here.
   * @example
   * const meta: FlyyerMetaVariables ={
   *   width: 1080, // in pixels
   *   height: 1080, // in pixels
   *   v: null, // disable cache-burst
   *   id: "my-id", // analytics id
   * }
   * const flyyerRender = new FlyyerRender({ meta });
   * const flyyer = new Flyyer({ meta });
   * @example
   * `https://cdn.flyyer.io/render/v2/flyyer/default/main.jpeg?__v=disabled`
   * `https://cdn.flyyer.io/render/v2/flyyer/default/main.jpeg?_w=1080&_h=1080`
   * `https://cdn.flyyer.io/v2/flyyer-com/_/_/?__v=disabled`
   * `https://cdn.flyyer.io/v2/flyyer-com/_/_w=1080&_h=1080/marketplace`
   */
  meta?: FlyyerMetaVariables | null;

  secret?: string | undefined | null;
  strategy?: "JWT" | "HMAC" | undefined | null;
}

/**
 * These are the parameters required (some are optional) to create an URL that will render Flyyer images.
 *
 * Required is: `tenant`, `deck`, `template`.
 *
 * Set and override the variables of the template by using the `variables` object.
 *
 * Example: https://cdn.flyyer.io/render/v2/flyyer/default/main.jpeg?title=Thanks+for+reading+this
 * @example
 * const flyyer = new FlyyerRender({
 *   tenant: "flyyer",
 *   deck: "default",
 *   template: "main",
 *   variables: { title: "Thanks for reading this" },
 *  });
 *  console.log(flyyer.href())
 * // https://cdn.flyyer.io/render/v2/flyyer/default/main.jpeg?title=Thanks+for+reading+this
 */
export interface FlyyerRenderParams<T extends FlyyerVariables> extends FlyyerCommonParams<T> {
  /**
   * Your tenant's `slug`. Lowercase and no spaces.
   * Visit https://flyyer.io/dashboard to get this value for your project
   */
  tenant: string;

  /**
   * Your deck's `slug`. Lowercase and no spaces.
   * Visit https://flyyer.io/dashboard to get this value for your project
   */
  deck: string;

  /**
   * Your template's `slug`. Lowercase and no spaces.
   * Visit https://flyyer.io/dashboard to get this value for your project
   */
  template: string;
}

/**
 * This class helps you creating URLs that will render Flyyer images.
 *
 * Required is: `tenant`, `deck`, `template`.
 *
 * Set and override the variables of the template by using the `variables` object.
 *
 * Example: https://cdn.flyyer.io/render/v2/flyyer/default/main.jpeg?title=Thanks+for+reading+this
 * @example
 * const flyyer = new FlyyerRender({
 *   tenant: "flyyer",
 *   deck: "default",
 *   template: "main",
 *   variables: { title: "Thanks for reading this" },
 *  });
 *  console.log(flyyer.href())
 * // https://cdn.flyyer.io/render/v2/flyyer/default/main.jpeg?title=Thanks+for+reading+this
 */
export class FlyyerRender<T extends FlyyerVariables = FlyyerVariables> implements FlyyerRenderParams<T> {
  public tenant: string;
  public deck: string;
  public template: string;
  public version: number | null;
  public extension: FlyyerExtension;
  public variables: T;
  public meta: FlyyerMetaVariables;
  public secret: string | null;
  public strategy: "JWT" | "HMAC" | null;

  constructor(args: FlyyerRenderParams<T>) {
    if (!args) throw new TypeError("FlyyerRender constructor must not be empty");

    this.tenant = args.tenant;
    this.deck = args.deck;
    this.template = args.template;
    this.version = args.version || null;
    this.extension = args.extension || "jpeg";
    this.variables = args.variables || ({} as T);
    this.meta = args.meta || {};
    this.secret = args.secret || null;
    this.strategy = args.strategy || null;
  }

  /**
   * Returns a new instance. Values are shallow cloned with the exception of 'meta' which is shallow cloned at its level.
   * **Be aware `variables` are shallow cloned.**
   */
  clone<K extends FlyyerVariables = T>(args?: Partial<FlyyerRenderParams<K>>): FlyyerRender<K> {
    const next = new FlyyerRender<K>(Object.assign({}, this, { meta: Object.assign({}, this.meta) }, args));
    return next;
  }

  querystring(extra?: any, options?: IStringifyOptions): string {
    const defaults = {
      __v: __V(this.meta.v),
      __id: this.meta.id,
      _w: this.meta.width,
      _h: this.meta.height,
      _res: this.meta.resolution,
      _ua: this.meta.agent,
      _loc: this.meta.locale,
    };
    return toQuery(Object.assign(defaults, this.variables, extra), options);
  }

  /**
   * Generate final URL you can use in your og:images.
   * @example
   * <meta property="og:image" content={flyyer.href()} />
   * @example
   * const flyyer = new FlyyerRender({ meta: { v: null } });
   * <img src={flyyer.href()} />
   */
  href(): string {
    if (isUndefined(this.tenant)) throw new Error("Missing 'tenant' property");
    if (isUndefined(this.deck)) throw new Error("Missing 'deck' property");
    if (isUndefined(this.template)) throw new Error("Missing 'template' property");

    const base = "https://cdn.flyyer.io/render/v2";
    const query = this.querystring(undefined, { addQueryPrefix: true });
    if (this.version) {
      return `${base}/${this.tenant}/${this.deck}/${this.template}.${this.version}.${this.extension}${query}`;
    }
    return `${base}/${this.tenant}/${this.deck}/${this.template}.${this.extension}${query}`;
  }

  /**
   * Alias of `.href()`
   */
  toString() {
    return this.href();
  }
}

/**
 * This class helps you creating URLs that will render Flyyer images.
 *
 * Required is: `project`.
 *
 * Set default variables by using the `variables` object.
 *
 * Example: https://cdn.flyyer.io/v2/flyyer-com/_/_/marketplace/simple-fade
 * @example
 * const flyyer = new Flyyer({
 *   project: "flyyer-com",
 *   route: "simple-fade",
 *  });
 *  console.log(flyyer.href())
 * // https://cdn.flyyer.io/v2/flyyer-com/_/_/marketplace/templates/simple-fade
 */
export interface FlyyerParams<T extends FlyyerVariables> extends FlyyerCommonParams<T> {
  /**
   * Your project's `slug`. Lowercase and no spaces.
   * Visit https://flyyer.io/dashboard to get this value for your project
   */
  project: string;

  /**
   * Current page path we will use in conjunction with the base URL defined in the Flyyer's Dashboard of your project.
   * @example
   * const flyyer = new Flyyer({ path: "/" });
   * @example
   * const flyyer = new Flyyer({ path: "/about" });
   * @example
   * const flyyer = new Flyyer({ path: "/products/1" });
   * @example
   * const flyyer = new Flyyer({ path: ["products", "1"] });
   * @example
   * const flyyer = new Flyyer({ path: "/page?id=1" });
   */
  path?: FlyyerPath;
}

export type FlyyerPath = string | number | null | undefined | (string | number | null | undefined)[];

export class Flyyer<T extends FlyyerVariables = FlyyerVariables> implements FlyyerParams<T> {
  public project: string;
  public path?: FlyyerPath;
  public extension: FlyyerExtension;
  public variables: T;
  public meta: FlyyerMetaVariables;
  public secret: string | null;
  public strategy: "JWT" | "HMAC" | null;

  constructor(args: FlyyerParams<T>) {
    if (!args) throw new TypeError("Flyyer constructor must not be empty");

    this.project = args.project;
    this.path = args.path;
    this.extension = args.extension || "jpeg";
    this.variables = args.variables || ({} as T);
    this.meta = args.meta || {};
    this.secret = args.secret || null;
    this.strategy = args.strategy || null;
  }

  /**
   * Returns a new instance. Values are shallow cloned with the exception of 'meta' which is shallow cloned at its level.
   * **Be aware `variables` are shallow cloned.**
   */
  clone<K extends FlyyerVariables = T>(args?: Partial<FlyyerParams<K>>): Flyyer<K> {
    const next = new Flyyer<K>(Object.assign({}, this, { meta: Object.assign({}, this.meta) }, args));
    return next;
  }

  params(extra?: any, options?: IStringifyOptions): string {
    const defaults = {
      __v: __V(this.meta.v),
      __id: this.meta.id,
      _w: this.meta.width,
      _h: this.meta.height,
      _res: this.meta.resolution,
      _ua: this.meta.agent,
    };
    return toQuery(Object.assign(defaults, this.variables, extra), options);
  }

  static signHMAC(data: string, secret: string): string {
    return HmacSHA256(data, secret).toString().slice(0, 16);
  }
  static signJWT(data: any, secret: string): string {
    const token = CREATE_JWT_TOKEN(data);
    return SIGN_JWT_TOKEN(token, secret!);
  }
  static sign(project: string, path: string, params: string, strategy?: string | null, secret?: string | null): string {
    if (!strategy && !secret) {
      return "_";
    }
    if (strategy && !secret) {
      throw new Error(
        "Got `strategy` but missing `secret`. You can find it in your project in Advanced settings: https://flyyer.io/dashboard/_/projects/_/advanced",
      );
    }
    if (!strategy && secret) {
      throw new Error("Got `secret` but missing `strategy`. Valid options are `HMAC` or `JWT`.");
    }

    if (strategy!.toUpperCase() === "HMAC") {
      const data = `${project}/${path}${params}`;
      return Flyyer.signHMAC(data, secret!);
    }
    if (strategy!.toUpperCase() === "JWT") {
      return Flyyer.signJWT({ path, params }, secret!);
    }
    throw new Error("Invalid `strategy`. Valid options are `HMAC` or `JWT`.");
  }

  /**
   * Generate final URL you can use in your og:images.
   * @example
   * <meta property="og:image" content={flyyer.href()} />
   * @example
   * const flyyer = new Flyyer({ meta: { v: null } });
   * <img src={flyyer.href()} />
   */
  href(): string {
    const project = this.project;
    if (isUndefined(project)) throw new Error("Missing 'project' property");

    const path = normalizePath(this.path);

    const strategy = this.strategy;
    const secret = this.secret;
    const signature = Flyyer.sign(project, path, this.params({ __v: undefined }), strategy, secret);

    const base = "https://cdn.flyyer.io/v2";
    const params = this.params() || "_";
    if (strategy && strategy.toUpperCase() === "JWT") {
      return `${base}/${project}/jwt-${signature}`;
    } else {
      return `${base}/${project}/${signature}/${params}/${path}`;
    }
  }

  /**
   * Alias of `.href()`
   */
  toString() {
    return this.href();
  }
}

/**
 * @deprecated Import `Flyyer` or `FlyyerRender` instead of `FlyyerAI`.
 */
export const FlyyerAI = Flyyer;

/**
 * @deprecated Import `FlyyerRender` or `Flyyer` instead of `FlyyerIO`.
 */
export const FlyyerIO = FlyyerRender;

/**
 * Internally used to convert an object to querystring.
 */
export function toQuery(variables: any, options?: IStringifyOptions) {
  return stringify(variables, Object.assign({ addQueryPrefix: false, format: "RFC1738" }, options));
}

/**
 * Convert path or array of path parts to a string.
 */
function normalizePath(path?: Flyyer["path"]) {
  return []
    .concat(path as any) // force array
    .filter((part: any) => part || part === 0) // filter falsy values
    .map((part: string) => String(part).replace(/^\/+/, "").replace(/\/+$/, "")) // remove leading and trailing slashes
    .join("/"); // compose URL
}

/**
 * Set `__v` variable for cache invalidation
 */
export function __V(v?: FlyyerMetaVariables["v"]) {
  // return isUndefined(v) ? (new Date().getTime() / 1000).toFixed(0) : v;
  if (isUndefined(v)) {
    return (new Date().getTime() / 1000).toFixed(0);
  }
  if (v === null) {
    return undefined; // gets removed from querystring
  }
  return v; // keep wanted constant value
}

function isUndefined(value: any): boolean {
  return typeof value === "undefined";
}

/**
 * Fast shallow compare of objects.
 */
export function isEqualFlyyerVariables<T extends FlyyerVariables = FlyyerVariables>(a: T, b: T): boolean {
  if (a === b) return true;
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) {
    return false;
  }
  for (let i = 0, l = aKeys.length; i < l; i++) {
    const key = aKeys[i];
    // @ts-expect-error Expect it
    // eslint-disable-next-line no-prototype-builtins
    if (!b.hasOwnProperty(aKeys[i])) {
      return false;
    }

    // @ts-expect-error Expect it
    const aValue = a[key];
    // @ts-expect-error Expect it
    const bValue = b[key];
    if (aValue !== bValue) {
      return false;
    }
  }
  return true;
}

/**
 * Compare two `FlyyerMetaVariables` object. Ignores `__v` param.
 */
export function isEqualFlyyerMeta(ameta: FlyyerMetaVariables, bmeta: FlyyerMetaVariables): boolean {
  const metas = ["width", "height", "agent", "id", "locale", "resolution"] as const;
  for (const meta of metas) {
    if (ameta[meta] !== bmeta[meta]) {
      return false;
    }
  }
  return true;
}

/**
 * Compare two FlyyerRender instances. Ignores `__v` param.
 */
export function isEqualFlyyerRender(
  a: FlyyerRender,
  b: FlyyerRender,
  variablesCompareFn = isEqualFlyyerVariables,
): boolean {
  if (a === b) return true;
  const attrs = ["tenant", "deck", "template", "version", "extension"] as const;
  for (const attr of attrs) {
    if (a[attr] !== b[attr]) {
      return false;
    }
  }
  return isEqualFlyyerMeta(a.meta, b.meta) && variablesCompareFn(a.variables, b.variables);
}

/**
 * Compare two Flyyer instances. Ignores `__v` param.
 */
export function isEqualFlyyer(a: Flyyer, b: Flyyer, variablesCompareFn = isEqualFlyyerVariables): boolean {
  if (a === b) return true;
  if (a.project !== b.project || a.extension !== b.extension || normalizePath(a.path) !== normalizePath(b.path)) {
    return false;
  }
  return isEqualFlyyerMeta(a.meta, b.meta) && variablesCompareFn(a.variables, b.variables);
}

function BASE64_URL(source: Parameters<typeof Base64.stringify>[0]): string {
  // Encode in classical base64
  let encodedSource = Base64.stringify(source);
  // Remove padding equal characters
  encodedSource = encodedSource.replace(/=+$/, "");
  // Replace characters according to base64url specifications
  encodedSource = encodedSource.replace(/\+/g, "-");
  encodedSource = encodedSource.replace(/\//g, "_");
  return encodedSource;
}

function CREATE_JWT_TOKEN(data: any): string {
  // https://www.jonathan-petitcolas.com/2014/11/27/creating-json-web-token-in-javascript.html
  const header = {
    alg: "HS256",
    typ: "JWT",
  };

  const stringifiedHeader = Utf8.parse(JSON.stringify(header));
  const encodedHeader = BASE64_URL(stringifiedHeader);
  const stringifiedData = Utf8.parse(JSON.stringify(data));
  const encodedData = BASE64_URL(stringifiedData);

  const token = encodedHeader + "." + encodedData;
  return token;
}

function SIGN_JWT_TOKEN(token: string, secret: string): string {
  const sha = HmacSHA256(token, secret);
  const signature = BASE64_URL(sha);
  const signed = token + "." + signature;
  return signed;
}
