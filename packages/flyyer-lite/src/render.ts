import type { IStringifyOptions } from "qs";

import { FlyyerCommonParams } from "./common";
import { FlyyerExtension } from "./ext";
import { invariant } from "./invariant";
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
 * Example: https://cdn.flyyer.io/r/v2/flyyer/default/main.jpeg?title=Thanks+for+reading+this
 * @example
 * const flyyer = new FlyyerRender({
 *   tenant: "flyyer",
 *   deck: "default",
 *   template: "main",
 *   variables: { title: "Thanks for reading this" },
 *  });
 *  console.log(flyyer.href())
 * // https://cdn.flyyer.io/r/v2/flyyer/default/main.jpeg?title=Thanks+for+reading+this
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
 * Example: https://cdn.flyyer.io/r/v2/flyyer/default/main.jpeg?title=Thanks+for+reading+this
 * @example
 * const flyyer = new FlyyerRender({
 *   tenant: "flyyer",
 *   deck: "default",
 *   template: "main",
 *   variables: { title: "Thanks for reading this" },
 *  });
 *  console.log(flyyer.href())
 * // https://cdn.flyyer.io/r/v2/flyyer/default/main.jpeg?title=Thanks+for+reading+this
 */
export class FlyyerRender<T extends FlyyerVariables = FlyyerVariables> implements FlyyerRenderParams<T> {
  public tenant: string;
  public deck: string;
  public template: string;
  public version: string | number | undefined | null;
  public extension: FlyyerExtension;
  public variables: T;
  public meta: FlyyerMetaVariables;
  public secret: string | undefined | null;
  public strategy: "JWT" | "HMAC" | undefined | null;

  public constructor(args: FlyyerRenderParams<T>) {
    invariant(args, "FlyyerRender constructor must not be empty");

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
  public clone<K extends FlyyerVariables = T>(args?: Partial<FlyyerRenderParams<K>>): FlyyerRender<K> {
    // @ts-expect-error Constructor
    const next = new this.constructor<K>(Object.assign({}, this, { meta: Object.assign({}, this.meta) }, args));
    return next;
  }

  /**
   * Override this method to implement signatures. Must be synchronous (no `Promise` allowed).
   */
  public sign(
    deck: FlyyerRenderParams<T>["deck"],
    template: FlyyerRenderParams<T>["template"],
    version: FlyyerRenderParams<T>["version"],
    extension: FlyyerRenderParams<T>["extension"],
    variables: FlyyerRenderParams<T>["variables"],
    meta: NonNullable<FlyyerRenderParams<T>["meta"]>,
    strategy: FlyyerRenderParams<T>["strategy"],
    secret: FlyyerRenderParams<T>["secret"],
  ): string {
    return "";
  }

  public querystring(extra?: any, options?: IStringifyOptions): string {
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
  public href(): string {
    invariant(!isUndefined(this.tenant), "Missing 'tenant' property");
    invariant(!isUndefined(this.deck), "Missing 'deck' property");
    invariant(!isUndefined(this.template), "Missing 'template' property");

    const strategy = this.strategy;
    const secret = this.secret;
    const base = "https://cdn.flyyer.io/r/v2";
    const signature = this.sign(
      this.deck,
      this.template,
      this.version,
      this.extension,
      this.variables,
      this.meta,
      strategy,
      secret,
    );

    if (strategy && strategy.toUpperCase() === "JWT") {
      const __v = __V(this.meta.v);
      const query = toQuery({ __jwt: signature, __v }, { addQueryPrefix: true });
      return `${base}/${this.tenant}${query}`;
    } else {
      const query = this.querystring({ __hmac: signature || undefined }, { addQueryPrefix: true });
      if (this.version) {
        return `${base}/${this.tenant}/${this.deck}/${this.template}.${this.version}.${this.extension}${query}`;
      }
      return `${base}/${this.tenant}/${this.deck}/${this.template}.${this.extension}${query}`;
    }
  }

  /**
   * Alias of `.href()`
   */
  public toString() {
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
