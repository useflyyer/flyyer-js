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

export type FlayyerParams<T extends FlayyerVariables> = {
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

export class Flayyer<T extends FlayyerVariables = FlayyerVariables> {
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

  constructor(args: FlayyerParams<T>) {
    if (!args) throw new Error("Flayyer constructor must not be empty");

    this.tenant = args.tenant;
    this.deck = args.deck;
    this.template = args.template;
    this.version = args.version || null;
    this.extension = args.extension || "jpeg";
    this.variables = args.variables || ({} as T);
    this.meta = args.meta || {};
  }

  clone<K extends FlayyerVariables = T>(args?: Partial<FlayyerParams<K>>): Flayyer<K> {
    const next = new Flayyer<K>(Object.assign({}, this, args));
    return next;
  }

  querystring(): string {
    const defaults = {
      __v: isUndefined(this.meta.v) ? (new Date().getTime() / 1000).toFixed(0) : this.meta.v,
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

export function toQuery(variables: any, options: IStringifyOptions = { addQueryPrefix: false, format: "RFC1738" }) {
  return stringify(variables, options);
}

function isUndefined(value: any): boolean {
  return typeof value === "undefined";
}

// Will deprecate default export.
export default Flayyer;
