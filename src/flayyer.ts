import { stringify, IStringifyOptions } from "qs";

/**
 * Meta variables usually have values assigned by Flayyer depending on how and where images are rendered.
 *
 * You can force these values here.
 * @example
 * const meta: FlayyerMetaVariables ={
 *   width: 1080, // in pixels
 *   height: 1080, // in pixels
 *   v: null, // disable cache-burst
 *   id: "my-id", // analytics id
 * }
 * const flayyerIO = new FlayyerIO({ meta });
 * const flayyerAI = new FlayyerAI({ meta });
 * @example
 * `https://flayyer.io/v2/flayyer/default/main.jpeg?__v=disabled`
 * `https://flayyer.io/v2/flayyer/default/main.jpeg?_w=1080&_h=1080`
 * `https://flayyer.ai/v2/flayyer-com/_/_/?__v=disabled`
 * `https://flayyer.ai/v2/flayyer-com/_/_w=1080&_h=1080/marketplace`
 */
export interface FlayyerMetaVariables {
  /**
   * Force crawler user agent.
   * Converted to `_ua=` on `flayyer.href()` if set.
   *
   * Full list at https://docs.flayyer.com/docs/features/agent-detection
   * @example
   * "whatsapp" // _ua=whatsapp
   * "facebook" // _ua=facebook
   * "twitter" // _ua=twitter
   * "instagram" // _ua=instagram
   */
  agent?: string | null;
  /**
   * Pixels (integer value).
   * Converted to `_w=` on `flayyer.href()` if set.
   * @example
   * 1200 // _w=1200 // default value most of the time
   * 1080 // _w=1080
   * @example
   * `https://flayyer.io/v2/flayyer/default/main.jpeg?_w=1080&_h=1080`
   * `https://flayyer.ai/v2/flayyer-com/_/_w=1080&_h=1080/jobs`
   */
  width?: string | number | null;
  /**
   * Pixels (integer value).
   * Converted to `_h=` on `flayyer.href()` if set.
   * @example
   * 1200 // _h=630 // default value most of the time
   * 1080 // _h=1080
   * 1080 // _h=1920
   * @example
   * `https://flayyer.io/v2/flayyer/default/main.jpeg?_w=1080&_h=1080`
   * `https://flayyer.ai/v2/flayyer-com/_/_w=1080&_h=1080/jobs`
   */
  height?: string | number | null;
  /**
   * Range from [0.0, 1.0]
   * Converted to `_res=` on `flayyer.href()` if set.
   */
  resolution?: string | number | null;
  /**
   * To identify your links on the analytics report
   * Converted to `__id=` on `flayyer.href()` if set.
   */
  id?: string | number | null;
  /**
   * Cache invalidator, set to `null` or empty string `""` to disable it.
   * Converted to `__v=` on `flayyer.href()` if set.
   *
   * **If you are using Flayyer inside your website for to render images we recommend disabling it to use browser's cache.**
   * @example
   * const flayyer = new FlayyerIO({ meta: { v: null } }); // disabled
   * @example
   * __v=null // disabled
   * __v="1" // constant
   * __v=undefined // `__v=123123` a timestamp will be used.
   * @example
   * `https://flayyer.io/v2/flayyer/default/main.jpeg?title=Hello&__v=123123` // by default is a timestamp
   * `https://flayyer.io/v2/flayyer/default/main.jpeg?title=Hello&__v=` // disabled to use browser's cache
   */
  v?: string | number | null;
}

/**
 * Any possible object. **Remember: keys and values must be serializable.**
 */
export type FlayyerVariables =
  | {
      [key: string]: any;
    }
  | Record<any, any>;

/**
 * Supported extensions
 * @example
 */
export type FlayyerExtension = "jpeg" | "jpg" | "png" | "webp";

export interface FlayyerCommonParams<T extends FlayyerVariables> {
  /**
   * Optional. Leave empty `""` or as `_` to always grab the latest version.
   */
  version?: number | null;

  /**
   * Supported extensions are: `"jpeg" | "jpg" | "png" | "webp"`
   */
  extension?: FlayyerExtension | null;

  /**
   * JS serializable variables.
   * @example
   * const flayyerIO = new FlayyerIO({ variables: { title: "Hello world", image: "https://example.com/logo.png" } })
   * console.log(flayyerIO.href())
   * // https://flayyer.io/v2/TENANT/DECK/TEMPLATE.jpeg?title=Hello+world&image=https%3A%2F%2Fexample.com%2Flogo.png
   * @example
   * const flayyerAI = new FlayyerAI({ variables: { title: "Hello world", image: "https://example.com/logo.png" } })
   * console.log(flayyerAI.href())
   * // https://flayyer.ai/v2/flayyer-com/_/title=Hello+world&image=https%3A%2F%2Fexample.com%2Flogo.png/
   */
  variables?: T | null;

  /**
   * Meta variables usually have values assigned by Flayyer depending on how and where images are rendered.
   *
   * You can force these values here.
   * @example
   * const meta: FlayyerMetaVariables ={
   *   width: 1080, // in pixels
   *   height: 1080, // in pixels
   *   v: null, // disable cache-burst
   *   id: "my-id", // analytics id
   * }
   * const flayyerIO = new FlayyerIO({ meta });
   * const flayyerAI = new FlayyerAI({ meta });
   * @example
   * `https://flayyer.io/v2/flayyer/default/main.jpeg?__v=disabled`
   * `https://flayyer.io/v2/flayyer/default/main.jpeg?_w=1080&_h=1080`
   * `https://flayyer.ai/v2/flayyer-com/_/_/?__v=disabled`
   * `https://flayyer.ai/v2/flayyer-com/_/_w=1080&_h=1080/marketplace`
   */
  meta?: FlayyerMetaVariables | null;
}

/**
 * These are the parameters required (some are optional) to create an URL that will render Flayyer images.
 *
 * Required is: `tenant`, `deck`, `template`.
 *
 * Set and override the variables of the template by using the `variables` object.
 *
 * Example: https://flayyer.io/v2/flayyer/default/main.jpeg?title=Thanks+for+reading+this
 * @example
 * const flayyer = new FlayyerIO({
 *   tenant: "flayyer",
 *   deck: "default",
 *   template: "main",
 *   variables: { title: "Thanks for reading this" },
 *  });
 *  console.log(flayyer.href())
 * // https://flayyer.io/v2/flayyer/default/main.jpeg?title=Thanks+for+reading+this
 */
export interface FlayyerIOParams<T extends FlayyerVariables> extends FlayyerCommonParams<T> {
  /**
   * Your tenant's `slug`. Lowercase and no spaces.
   * Visit https://flayyer.com/dashboard to get this value for your project
   */
  tenant: string;

  /**
   * Your deck's `slug`. Lowercase and no spaces.
   * Visit https://flayyer.com/dashboard to get this value for your project
   */
  deck: string;

  /**
   * Your template's `slug`. Lowercase and no spaces.
   * Visit https://flayyer.com/dashboard to get this value for your project
   */
  template: string;
}

/**
 * This class helps you creating URLs that will render Flayyer images.
 *
 * Required is: `tenant`, `deck`, `template`.
 *
 * Set and override the variables of the template by using the `variables` object.
 *
 * Example: https://flayyer.io/v2/flayyer/default/main.jpeg?title=Thanks+for+reading+this
 * @example
 * const flayyer = new FlayyerIO({
 *   tenant: "flayyer",
 *   deck: "default",
 *   template: "main",
 *   variables: { title: "Thanks for reading this" },
 *  });
 *  console.log(flayyer.href())
 * // https://flayyer.io/v2/flayyer/default/main.jpeg?title=Thanks+for+reading+this
 */
export class FlayyerIO<T extends FlayyerVariables = FlayyerVariables> implements FlayyerIOParams<T> {
  public tenant: string;
  public deck: string;
  public template: string;
  public version: number | null;
  public extension: FlayyerExtension;
  public variables: T;
  public meta: FlayyerMetaVariables;

  constructor(args: FlayyerIOParams<T>) {
    if (!args) throw new TypeError("Flayyer constructor must not be empty");

    this.tenant = args.tenant;
    this.deck = args.deck;
    this.template = args.template;
    this.version = args.version || null;
    this.extension = args.extension || "jpeg";
    this.variables = args.variables || ({} as T);
    this.meta = args.meta || {};
  }

  /**
   * Returns a new instance. Values are shallow cloned.
   */
  clone<K extends FlayyerVariables = T>(args?: Partial<FlayyerIOParams<K>>): FlayyerIO<K> {
    const next = new FlayyerIO<K>(Object.assign({}, this, args));
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
    };
    return toQuery(Object.assign(defaults, this.variables, extra), options);
  }

  /**
   * Generate final URL you can use in your og:images.
   * @example
   * <meta property="og:image" content={flayyer.href()} />
   * @example
   * const flayyer = new FlayyerIO({ meta: { v: null } });
   * <img src={flayyer.href()} />
   */
  href(): string {
    if (isUndefined(this.tenant)) throw new Error("Missing 'tenant' property");
    if (isUndefined(this.deck)) throw new Error("Missing 'deck' property");
    if (isUndefined(this.template)) throw new Error("Missing 'template' property");

    const base = "https://flayyer.io/v2";
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
 * This class helps you creating URLs that will render Flayyer images.
 *
 * Required is: `project`.
 *
 * Set default variables by using the `variables` object.
 *
 * Example: https://flayyer.ai/v2/flayyer-com/_/_/marketplace/simple-fade
 * @example
 * const flayyer = new FlayyerAI({
 *   project: "flayyer-com",
 *   route: "simple-fade",
 *  });
 *  console.log(flayyer.href())
 * // https://flayyer.ai/v2/flayyer-com/_/_/marketplace/templates/simple-fade
 */
export interface FlayyerAIParams<T extends FlayyerVariables> extends FlayyerCommonParams<T> {
  /**
   * Your project's `slug`. Lowercase and no spaces.
   * Visit https://flayyer.com/dashboard to get this value for your project
   */
  project: string;

  /**
   * Current page path we will use in conjunction with the base URL defined in the Flayyer's Dashboard of your project.
   * @example
   * const flayyer = new FlayyerAI({ path: "/" });
   * @example
   * const flayyer = new FlayyerAI({ path: "/about" });
   * @example
   * const flayyer = new FlayyerAI({ path: "/products/1" });
   * @example
   * const flayyer = new FlayyerAI({ path: ["products", "1"] });
   * @example
   * const flayyer = new FlayyerAI({ path: "/page?id=1" });
   */
  path?: FlayyerPath;
}

export type FlayyerPath = string | number | null | undefined | (string | number | null | undefined)[];

export class FlayyerAI<T extends FlayyerVariables = FlayyerVariables> implements FlayyerAIParams<T> {
  public project: string;
  public path?: FlayyerPath;
  public extension: FlayyerExtension;
  public variables: T;
  public meta: FlayyerMetaVariables;

  constructor(args: FlayyerAIParams<T>) {
    if (!args) throw new TypeError("Flayyer constructor must not be empty");

    this.project = args.project;
    this.path = args.path;
    this.extension = args.extension || "jpeg";
    this.variables = args.variables || ({} as T);
    this.meta = args.meta || {};
  }

  /**
   * Returns a new instance. Values are shallow cloned.
   */
  clone<K extends FlayyerVariables = T>(args?: Partial<FlayyerAIParams<K>>): FlayyerAI<K> {
    const next = new FlayyerAI<K>(Object.assign({}, this, args));
    return next;
  }

  params(): string {
    const defaults = {
      __v: __V(this.meta.v),
      __id: this.meta.id,
      _w: this.meta.width,
      _h: this.meta.height,
      _res: this.meta.resolution,
      _ua: this.meta.agent,
    };
    return toQuery(Object.assign(defaults, this.variables));
  }

  /**
   * Generate final URL you can use in your og:images.
   * @example
   * <meta property="og:image" content={flayyer.href()} />
   * @example
   * const flayyer = new FlayyerAI({ meta: { v: null } });
   * <img src={flayyer.href()} />
   */
  href(): string {
    if (isUndefined(this.project)) throw new Error("Missing 'project' property");

    const base = "https://flayyer.ai/v2";
    const params = this.params() || "_";
    const signature = "_";
    const path = normalizePath(this.path);
    return `${base}/${this.project}/${signature}/${params}/${path}`;
  }

  /**
   * Alias of `.href()`
   */
  toString() {
    return this.href();
  }
}

/**
 * @deprecated Import `FlayyerIO` or `FlayyerAI` instead of `Flayyer`.
 */
export const Flayyer = FlayyerIO;

/**
 * @deprecated Import `FlayyerIO` or `FlayyerAI` instead.
 */
export default FlayyerIO;

/**
 * Internally used to convert an object to querystring.
 */
export function toQuery(variables: any, options?: IStringifyOptions) {
  return stringify(variables, Object.assign({ addQueryPrefix: false, format: "RFC1738" }, options));
}

/**
 * Convert path or array of path parts to a string.
 */
function normalizePath(path?: FlayyerAI["path"]) {
  return []
    .concat(path as any) // force array
    .filter((part: any) => part || part === 0) // filter falsy values
    .map((part: string) => String(part).replace(/^\/+/, "").replace(/\/+$/, "")) // remove leading and trailing slashes
    .join("/"); // compose URL
}

/**
 * Set `__v` variable for cache invalidation
 */
export function __V(v?: FlayyerMetaVariables["v"]) {
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
export function isEqualFlayyerVariables<T extends FlayyerVariables = FlayyerVariables>(a: T, b: T): boolean {
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
 * Compare two `FlayyerMetaVariables` object. Ignores `__v` param.
 */
export function isEqualFlayyerMeta(ameta: FlayyerMetaVariables, bmeta: FlayyerMetaVariables): boolean {
  const metas = ["width", "height", "agent", "id", "resolution"] as const;
  for (const meta of metas) {
    if (ameta[meta] !== bmeta[meta]) {
      return false;
    }
  }
  return true;
}

/**
 * Compare two FlayyerIO instances. Ignores `__v` param.
 */
export function isEqualFlayyerIO(a: FlayyerIO, b: FlayyerIO, variablesCompareFn = isEqualFlayyerVariables): boolean {
  if (a === b) return true;
  const attrs = ["tenant", "deck", "template", "version", "extension"] as const;
  for (const attr of attrs) {
    if (a[attr] !== b[attr]) {
      return false;
    }
  }
  return isEqualFlayyerMeta(a.meta, b.meta) && variablesCompareFn(a.variables, b.variables);
}

/**
 * Compare two FlayyerAI instances. Ignores `__v` param.
 */
export function isEqualFlayyerAI(a: FlayyerAI, b: FlayyerAI, variablesCompareFn = isEqualFlayyerVariables): boolean {
  if (a === b) return true;
  if (a.project !== b.project || a.extension !== b.extension || normalizePath(a.path) !== normalizePath(b.path)) {
    return false;
  }
  return isEqualFlayyerMeta(a.meta, b.meta) && variablesCompareFn(a.variables, b.variables);
}
