import type { IStringifyOptions } from "qs";

import { FlyyerCommonParams } from "./common";
import { FlyyerExtension } from "./ext";
import { invariant } from "./invariant";
import { FlyyerMetaVariables, isEqualFlyyerMeta } from "./meta";
import { FlyyerPath, normalizePath } from "./paths";
import { toQuery } from "./query";
import { isUndefined } from "./utils";
import { __V } from "./v";
import { FlyyerVariables, isEqualFlyyerVariables } from "./variables";

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
export class Flyyer<T extends FlyyerVariables = FlyyerVariables> implements FlyyerParams<T> {
  public project: string;
  public path?: FlyyerPath;
  public extension: FlyyerExtension;
  public variables: T;
  public meta: FlyyerMetaVariables;
  public secret: string | undefined | null;
  public strategy: "JWT" | "HMAC" | undefined | null;

  public constructor(args: FlyyerParams<T>) {
    invariant(args, "Flyyer constructor must not be empty. Expected object with 'project' property.");

    this.project = args.project;
    this.path = args.path;
    this.extension = args.extension || "jpeg";
    this.variables = args.variables || ({} as T);
    this.meta = args.meta || {};
    this.secret = args.secret || null;
    this.strategy = args.strategy || null;
  }

  /**
   * Override this method to implement signatures. Must be synchronous (no `Promise` allowed).
   */
  public sign(
    project: FlyyerParams<T>["project"],
    path: string, // normalized
    params: string,
    strategy: FlyyerParams<T>["strategy"],
    secret: FlyyerParams<T>["secret"],
  ): string {
    return "_";
  }

  /**
   * Returns a new instance. Values are shallow cloned with the exception of 'meta' which is shallow cloned at its level.
   * **Be aware `variables` are shallow cloned.**
   */
  public clone<K extends FlyyerVariables = T>(args?: Partial<FlyyerParams<K>>): Flyyer<K> {
    // @ts-expect-error Constructor
    const next = new this.constructor<K>(Object.assign({}, this, { meta: Object.assign({}, this.meta) }, args));
    return next;
  }

  public params(extra?: any, options?: IStringifyOptions): string {
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
   * <meta property="og:image" content={flyyer.href()} />
   * @example
   * const flyyer = new Flyyer({ meta: { v: null } });
   * <img src={flyyer.href()} />
   */
  public href(): string {
    const project = this.project;
    invariant(!isUndefined(project), "Missing 'project' property");

    const path = normalizePath(this.path);

    const strategy = this.strategy;
    const secret = this.secret;
    const signature = this.sign(project, path, this.params({ __v: undefined }), strategy, secret);

    const base = "https://cdn.flyyer.io/v2";
    const params = this.params() || "_";
    if (strategy && strategy.toUpperCase() === "JWT") {
      const __v = __V(this.meta.v);
      const query = toQuery({ __v }, { addQueryPrefix: true });
      return `${base}/${project}/jwt-${signature}${query}`;
    } else {
      return `${base}/${project}/${signature}/${params}/${path}`;
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
 * Compare two Flyyer instances. Ignores `__v` param.
 */
export function isEqualFlyyer(a: Flyyer, b: Flyyer, variablesCompareFn = isEqualFlyyerVariables): boolean {
  if (a === b) return true;
  if (
    a.project !== b.project ||
    a.extension !== b.extension ||
    a.strategy !== b.strategy ||
    a.secret !== b.secret ||
    normalizePath(a.path) !== normalizePath(b.path)
  ) {
    return false;
  }
  return isEqualFlyyerMeta(a.meta, b.meta) && variablesCompareFn(a.variables, b.variables);
}
