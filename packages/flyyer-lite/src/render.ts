import type { IStringifyOptions } from "qs";

import type { FlyyerCommonParams } from "./common";
import type { FlyyerExtension } from "./ext";
import { invariant } from "./invariant";
import type { FlyyerMetaVariables } from "./meta";
import { toQuery } from "./query";
import { CDN, isUndefined } from "./utils";
import { __V } from "./v";
import type { FlyyerVariables } from "./variables";

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
  public version?: string | number | undefined | null;
  public extension?: FlyyerExtension | undefined | null;
  public variables: T;
  public meta: FlyyerMetaVariables;
  public secret?: string | undefined | null;
  public strategy?: "JWT" | "HMAC" | undefined | null;

  public constructor(args: FlyyerRenderParams<T>) {
    invariant(args, "FlyyerRender constructor must not be empty");

    this.tenant = args.tenant;
    this.deck = args.deck;
    this.template = args.template;
    this.version = args.version;
    this.extension = args.extension;
    this.variables = args.variables || ({} as T);
    this.meta = args.meta || {};
    this.secret = args.secret;
    this.strategy = args.strategy;
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
  ): string | undefined | void {}

  public querystring(extra?: any, options?: IStringifyOptions): string {
    const meta = this.meta;
    const defaults = {
      __v: __V(meta.v),
      __id: meta.id,
      _w: meta.width,
      _h: meta.height,
      _res: meta.resolution,
      _ua: meta.agent,
      _loc: meta.locale,
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
    const { tenant, deck, template, strategy, secret, version, extension, variables, meta } = this;
    invariant(!isUndefined(tenant), "Missing 'tenant' property");
    invariant(!isUndefined(deck), "Missing 'deck' property");
    invariant(!isUndefined(template), "Missing 'template' property");

    const signature = this.sign(deck, template, version, extension, variables, meta, strategy, secret);

    if (strategy && strategy.toUpperCase() === "JWT") {
      const __v = __V(meta.v);
      const query = toQuery({ __jwt: signature, __v }, { addQueryPrefix: true });
      return `${CDN}/r/v2/${tenant}${query}`;
    } else {
      const query = this.querystring({ __hmac: signature }, { addQueryPrefix: true });
      const base = `${CDN}/r/v2/${tenant}/${deck}/${template}`;
      if (version && extension) {
        return `${base}.${version}.${extension}${query}`;
      } else if (version) {
        return `${base}.${version}${query}`;
      } else if (extension) {
        return `${base}.${extension}${query}`;
      } else {
        return `${base}${query}`;
      }
    }
  }

  /**
   * Alias of `.href()`
   */
  public toString() {
    return this.href();
  }
}
