import { stringify, IStringifyOptions } from "qs";

export type FlayyerMetaVariables = {
  /**
   * Force crawler user agent
   */
  agent?: string | null;
  width?: string | number | null;
  height?: string | number | null;
  /**
   * Range from [0.0, 1.0]
   */
  resolution?: string | number | null;
  /**
   * To identify your links on the analytics report
   */
  id?: string | number | null;
  /**
   * Cache invalidator
   */
  v?: string | number | null;
};

export type FlayyerVariables =
  | {
      [key: string]: any;
    }
  | Record<any, any>;

export type FlayyerExtension = "jpeg" | "jpg" | "png" | "webp";

export type FlayyerIOParams<T extends FlayyerVariables> = {
  /**
   * Visit https://app.flayyer.com to get this value for your project
   */
  tenant: string;

  /**
   * Visit https://app.flayyer.com to get this value for your project
   */
  deck: string;

  /**
   * Visit https://app.flayyer.com to get this value for your project
   */
  template: string;

  /**
   * Optional. Leave empty to always grab the latest version.
   */
  version?: number | null;

  extension?: FlayyerExtension | null;

  /**
   * JS serializable variables.
   */
  variables?: T | null;

  /**
   * Extra parameters that adds data for analytics or changes meta-information of the rendered images such as width and height.
   */
  meta?: FlayyerMetaVariables | null;
};

export class FlayyerIO<T extends FlayyerVariables = FlayyerVariables> {
  public tenant: string;
  public deck: string;
  public template: string;
  public version: number | null;
  public extension: FlayyerExtension;
  /**
   * JS serializable variables.
   */
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

  clone<K extends FlayyerVariables = T>(args?: Partial<FlayyerIOParams<K>>): FlayyerIO<K> {
    const next = new FlayyerIO<K>(Object.assign({}, this, args));
    return next;
  }

  querystring(): string {
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
   * @example <meta property="og:image" content={flayyer.href()} />
   */
  href(): string {
    if (isUndefined(this.tenant)) throw new Error("Missing 'tenant' property");
    if (isUndefined(this.deck)) throw new Error("Missing 'deck' property");
    if (isUndefined(this.template)) throw new Error("Missing 'template' property");

    const base = "https://flayyer.io/v2";
    const query = this.querystring();
    if (this.version) {
      return `${base}/${this.tenant}/${this.deck}/${this.template}.${this.version}.${this.extension}?${query}`;
    }
    return `${base}/${this.tenant}/${this.deck}/${this.template}.${this.extension}?${query}`;
  }

  /**
   * Generate final URL you can use in your og:images.
   * @example <meta property="og:image" content={flayyer.href()} />
   */
  toString() {
    return this.href();
  }
}

export type FlayyerAIParams<T extends FlayyerVariables> = {
  /**
   * Visit https://app.flayyer.com to get this value for your project
   */
  project: string;

  /**
   * Current page path we will use in conjunction with the base URL defined in the Flayyer's Dashboard of your project.
   */
  path?: FlayyerPath;

  /**
   * Optional. Leave empty to always grab the latest version.
   */
  version?: number | null;

  extension?: FlayyerExtension | null;

  /**
   * JS serializable variables.
   */
  variables?: T | null;

  /**
   * Extra parameters that adds data for analytics or changes meta-information of the rendered images such as width and height.
   */
  meta?: FlayyerMetaVariables | null;
};

export type FlayyerPath = string | number | null | undefined | (string | number | null | undefined)[];

export class FlayyerAI<T extends FlayyerVariables = FlayyerVariables> {
  public project: string;
  public path?: FlayyerPath;
  public extension: FlayyerExtension;
  /**
   * JS serializable variables.
   */
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
   * @example <meta property="og:image" content={flayyer.href()} />
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
   * Generate final URL you can use in your og:images.
   * @example <meta property="og:image" content={flayyer.href()} />
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

export function toQuery(variables: any, options: IStringifyOptions = { addQueryPrefix: false, format: "RFC1738" }) {
  return stringify(variables, options);
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
  return isUndefined(v) ? (new Date().getTime() / 1000).toFixed(0) : v;
}

function isUndefined(value: any): boolean {
  return typeof value === "undefined";
}
