import type { IStringifyOptions } from "qs";

import { FlyyerCommonParams } from "./common";
import { FlyyerExtension } from "./ext";
import { FlyyerMetaVariables, isEqualFlyyerMeta } from "./meta";
import { toQuery } from "./query";
import { isUndefined } from "./utils";
import { __V } from "./v";
import { FlyyerVariables, isEqualFlyyerVariables } from "./variables";

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
 * Compare two FlyyerRender instances. Ignores `__v` param.
 */
export function isEqualFlyyerRender(
  a: FlyyerRender,
  b: FlyyerRender,
  variablesCompareFn = isEqualFlyyerVariables,
): boolean {
  if (a === b) return true;
  const attrs = ["tenant", "deck", "template", "version", "extension", "strategy", "secret"] as const;
  for (const attr of attrs) {
    if (a[attr] !== b[attr]) {
      return false;
    }
  }
  return isEqualFlyyerMeta(a.meta, b.meta) && variablesCompareFn(a.variables, b.variables);
}
