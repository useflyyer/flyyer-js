import { FlyyerRender as FlyyerBase, toQuery } from "@flyyer/flyyer-lite";
import type { IStringifyOptions } from "qs";

import { CREATE_JWT_TOKEN, SIGN_JWT_TOKEN, SIGN_HMAC_DATA } from "./jwt";
import { __V } from "./v";

export class FlyyerRender extends FlyyerBase {
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
      if (this.strategy.toLowerCase() === "hmac") {
        const data = [
          this.deck,
          this.template,
          this.version || "",
          this.extension || "",
          toQuery(Object.assign(defaultsWithoutV, this.variables, extra), options),
        ].join("#");
        const __hmac = FlyyerRender.signHMAC(data, this.secret);
        return toQuery(Object.assign(defaultV, defaultsWithoutV, this.variables, extra, { __hmac }));
      } else if (this.strategy.toLowerCase() === "jwt") {
        const jwtDefaults = {
          i: this.meta.id,
          w: this.meta.width,
          h: this.meta.height,
          r: this.meta.resolution,
          u: this.meta.agent,
          l: this.meta.locale,
          var: this.variables,
        };
        const data = {
          d: this.deck,
          t: this.template,
          v: this.version,
          e: this.extension,
          ...jwtDefaults,
        };
        const __jwt = FlyyerRender.signJWT(data, this.secret);
        return toQuery(Object.assign({ __jwt, ...defaultV }));
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
    if (this.strategy && this.strategy.toLowerCase() != "hmac" && this.strategy.toLowerCase() != "jwt")
      throw new Error("Invalid `strategy`. Valid options are `HMAC` or `JWT`.");
    if (this.strategy && !this.secret)
      throw new Error("Missing `secret`. You can find it in your project in Advanced settings.");
    if (this.secret && !this.strategy)
      throw new Error("Got `secret` but missing `strategy`. Valid options are `HMAC` or `JWT`.");

    const base = "https://cdn.flyyer.io/r/v2";
    const query = this.querystring(undefined, { addQueryPrefix: true });

    if (this.strategy && this.strategy.toLowerCase() === "jwt") {
      return `${base}/${this.tenant}${query}`;
    }
    let finalHref = `${base}/${this.tenant}/${this.deck}/${this.template}`;
    if (this.version) finalHref += `.${this.version}`;
    if (this.extension) finalHref += `.${this.extension}`;
    return `${finalHref}${query}`;
  }
}
