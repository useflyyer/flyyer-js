import { stringify, IStringifyOptions } from "qs";

export type FlayyerVariables =
  | {
      [key: string]: any;
    }
  | Record<any, any>;

export type FlayyerExtension = "jpeg" | "jpg" | "png";

export type FlayyerParams<K extends FlayyerVariables> = {
  tenant: string;
  deck: string;
  template: string;
  version?: number | null;
  extension?: FlayyerExtension | null;
  variables?: K | null;
};

export default class Flayyer<T extends FlayyerVariables> {
  public tenant: string;
  public deck: string;
  public template: string;
  public version: number | null;
  public extension: FlayyerExtension;
  public variables: T;
  constructor(opts: FlayyerParams<T>) {
    if (!opts) throw new Error("Flayyer constructor must not be empty");

    this.tenant = opts.tenant;
    this.deck = opts.deck;
    this.template = opts.template;
    this.version = opts.version || null;
    this.extension = opts.extension || "jpeg";
    this.variables = opts.variables || ({} as T);
  }

  get querystring(): string {
    const defaults = {
      __v: (new Date().getTime() / 1000).toFixed(0),
    };
    return toQuery(Object.assign(defaults, this.variables));
  }

  get href(): string {
    if (isUndefined(this.tenant)) throw new Error("Missing 'tenant' property");
    if (isUndefined(this.deck)) throw new Error("Missing 'deck' property");
    if (isUndefined(this.template)) throw new Error("Missing 'template' property");

    if (this.version) {
      return `https://flayyer.host/v2/${this.tenant}/${this.deck}/${this.template}.${this.version}.${this.extension}?${this.querystring}`;
    }
    return `https://flayyer.host/v2/${this.tenant}/${this.deck}/${this.template}.${this.extension}?${this.querystring}`;
  }
}

export function toQuery(variables: any, options: IStringifyOptions = { addQueryPrefix: false, format: "RFC1738" }) {
  return stringify(variables, options);
}

function isUndefined(value: any): boolean {
  return typeof value === "undefined";
}
