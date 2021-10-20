import type { IStringifyOptions } from "qs";

import type { FlyyerCommonParams } from "./common";
import type { FlyyerExtension } from "./ext";
import { invariant } from "./invariant";
import type { FlyyerMetaVariables } from "./meta";
import { FlyyerPath, normalizePath } from "./paths";
import { toQuery } from "./query";
import { CDN, isUndefined } from "./utils";
import { __V } from "./v";
import type { FlyyerVariables } from "./variables";

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
   * Preferred way of declaring the default social image to use along with Flyyer. It will be available as `{{ page.image }}` and `{{ flyyer.default }}`. **Use an absolute URL**, but relative URLs are also supported.
   *
   * Alternatively you can set a custom meta-tag but it was worst performance: `<meta property="flyyer:default" content="" />`.
   *
   * Values defined here takes precedence over `flyyer:default` meta-tag.
   */
  default?: string | undefined | null;

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
  public default?: string | undefined | null;
  public path?: FlyyerPath;
  public extension?: FlyyerExtension | undefined | null;
  public variables: T;
  public meta: FlyyerMetaVariables;
  public secret?: string | undefined | null;
  public strategy?: "JWT" | "HMAC" | undefined | null;

  public constructor(args: FlyyerParams<T>) {
    invariant(args, "Flyyer constructor must not be empty. Expected object with 'project' property.");

    this.project = args.project;
    this.path = args.path;
    this.default = args.default;
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
    project: FlyyerParams<T>["project"],
    path: string, // normalized
    params: string | Record<any, any>,
    strategy: FlyyerParams<T>["strategy"],
    secret: FlyyerParams<T>["secret"],
  ): string | undefined | void {}

  public params(extra?: any, options?: IStringifyOptions): string | Record<any, any> {
    const meta = this.meta;
    if (this.strategy && this.strategy.toLowerCase() === "jwt") {
      const jwtDefaults = {
        i: meta.id,
        w: meta.width,
        h: meta.height,
        r: meta.resolution,
        u: meta.agent,
        e: this.extension,
        def: this.default,
        var: Object.assign(this.variables, extra),
      };
      return jwtDefaults;
    } else {
      const defaults = {
        __v: __V(meta.v),
        __id: meta.id,
        _w: meta.width,
        _h: meta.height,
        _res: meta.resolution,
        _ua: meta.agent,
        _def: this.default,
        _ext: this.extension,
      };
      return toQuery(Object.assign(defaults, this.variables, extra), options);
    }
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

    const params = this.params() || "_";
    if (strategy && strategy.toUpperCase() === "JWT") {
      const __v = __V(this.meta.v);
      const query = toQuery({ __v }, { addQueryPrefix: true });
      return `${CDN}/v2/${project}/jwt-${signature}${query}`;
    } else {
      return `${CDN}/v2/${project}/${signature || "_"}/${params}/${path}`;
    }
  }

  /**
   * Alias of `.href()`
   */
  public toString() {
    return this.href();
  }
}
