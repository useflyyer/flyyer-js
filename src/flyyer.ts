import HmacSHA256 from "crypto-js/hmac-sha256";
import type { IStringifyOptions } from "qs";

import { FlyyerCommonParams } from "./common";
import { FlyyerExtension } from "./ext";
import { CREATE_JWT_TOKEN, SIGN_JWT_TOKEN } from "./jwt";
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
      const v = __V(this.meta.v);
      if (v) {
        return `${base}/${project}/jwt-${signature}?__v=${v}`;
      } else {
        return `${base}/${project}/jwt-${signature}`;
      }
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
