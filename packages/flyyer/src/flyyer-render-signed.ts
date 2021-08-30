import { FlyyerRender as FlyyerBase, FlyyerVariables, toQuery } from "@flyyer/flyyer-lite";
import type { IStringifyOptions } from "qs";

import { CREATE_JWT_TOKEN, SIGN_JWT_TOKEN, SIGN_HMAC_DATA } from "./jwt";
import { __V } from "./v";

export class FlyyerRender<T extends FlyyerVariables = FlyyerVariables> extends FlyyerBase<T> {
  public static signHMAC(data: string, secret: string): string {
    const LENGTH = 16; // We only compare the first 16 chars.
    return SIGN_HMAC_DATA(data, secret).slice(0, LENGTH);
  }
  public static signJWT(data: Record<any, any>, secret: string): string {
    const token = CREATE_JWT_TOKEN(data);
    return SIGN_JWT_TOKEN(token, secret);
  }

  public querystring(extra?: any, options?: IStringifyOptions): string {
    const defaultV = { __v: __V(this.meta.v) };
    const defaultsWithoutV = {
      __id: this.meta.id,
      _w: this.meta.width,
      _h: this.meta.height,
      _res: this.meta.resolution,
      _ua: this.meta.agent,
      _loc: this.meta.locale,
    };
    if (this.strategy && this.secret) {
      const strategy = this.strategy.toUpperCase();
      if (strategy === "HMAC") {
        const data = [
          this.deck,
          this.template,
          this.version || "",
          this.extension || "",
          toQuery(Object.assign(defaultsWithoutV, this.variables, extra), options),
        ];
        const __hmac = FlyyerRender.signHMAC(data.join("#"), this.secret);
        return toQuery(Object.assign(defaultV, defaultsWithoutV, this.variables, extra, { __hmac }), options);
      } else if (strategy === "JWT") {
        const data = {
          d: this.deck,
          t: this.template,
          v: this.version,
          e: this.extension,
          // jwt defaults
          i: this.meta.id,
          w: this.meta.width,
          h: this.meta.height,
          r: this.meta.resolution,
          u: this.meta.agent,
          l: this.meta.locale,
          var: this.variables,
        };
        const __jwt = FlyyerRender.signJWT(data, this.secret);
        return toQuery(Object.assign({ __jwt }, defaultV, extra), options);
      }
    }
    return toQuery(Object.assign(defaultV, defaultsWithoutV, this.variables, extra), options);
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
    if (!this.tenant) throw new Error("Missing 'tenant' property");
    if (!this.deck) throw new Error("Missing 'deck' property");
    if (!this.template) throw new Error("Missing 'template' property");

    const strategy = this.strategy && this.strategy.toUpperCase();
    if (strategy && strategy !== "HMAC" && strategy !== "JWT")
      throw new Error("Invalid `strategy`. Valid options are `HMAC` or `JWT`.");
    if (strategy && !this.secret)
      throw new Error("Missing `secret`. You can find it in your project in Advanced settings.");
    if (this.secret && !strategy)
      throw new Error("Got `secret` but missing `strategy`. Valid options are `HMAC` or `JWT`.");
    const base = "https://cdn.flyyer.io/r/v2";
    const query = this.querystring(undefined, { addQueryPrefix: true });

    if (strategy && strategy === "JWT") return `${base}/${this.tenant}${query}`;
    let finalHref = `${base}/${this.tenant}/${this.deck}/${this.template}`;
    if (this.version) finalHref += `.${this.version}`;
    if (this.extension) finalHref += `.${this.extension}`;
    return `${finalHref}${query}`;
  }
}
