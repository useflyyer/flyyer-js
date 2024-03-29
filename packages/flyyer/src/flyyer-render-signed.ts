import {
  FlyyerRender as FlyyerBase,
  FlyyerRenderParams,
  FlyyerVariables,
  toQuery,
  invariant,
} from "@flyyer/flyyer-lite";

import { CREATE_JWT_TOKEN, SIGN_JWT_TOKEN, SIGN_HMAC_DATA } from "./jwt";

export class FlyyerRender<T extends FlyyerVariables = FlyyerVariables> extends FlyyerBase<T> {
  public static signHMAC(data: string, secret: string): string {
    const LENGTH = 16; // We only compare the first 16 chars.
    return SIGN_HMAC_DATA(data, secret).slice(0, LENGTH);
  }
  public static signJWT(data: Record<any, any>, secret: string): string {
    const token = CREATE_JWT_TOKEN(data);
    return SIGN_JWT_TOKEN(token, secret);
  }

  public static sign<T>(
    deck: FlyyerRenderParams<T>["deck"],
    template: FlyyerRenderParams<T>["template"],
    version: FlyyerRenderParams<T>["version"],
    extension: FlyyerRenderParams<T>["extension"],
    variables: FlyyerRenderParams<T>["variables"],
    meta: NonNullable<FlyyerRenderParams<T>["meta"]>,
    strategy: FlyyerRenderParams<T>["strategy"],
    secret: FlyyerRenderParams<T>["secret"],
  ): string | undefined {
    if (!strategy && !secret) return undefined;
    invariant(
      secret,
      "Missing `secret`. You can find it in your deck settings: https://flyyer.io/dashboard/_/library/_/latest/manage",
    );
    invariant(strategy, "Missing `strategy`. Valid options are `HMAC` or `JWT`.");

    const normalized = strategy.toUpperCase();
    if (normalized === "HMAC") {
      const defaults = {
        __id: meta.id,
        _w: meta.width,
        _h: meta.height,
        _res: meta.resolution,
        _ua: meta.agent,
        _loc: meta.locale,
      };
      const data = [deck, template, version || "", extension || "", toQuery(Object.assign(defaults, variables))];
      return FlyyerRender.signHMAC(data.join("#"), secret);
    }
    if (normalized === "JWT") {
      const data = {
        d: deck,
        t: template,
        v: version,
        e: extension,
        // jwt defaults
        i: meta.id,
        w: meta.width,
        h: meta.height,
        r: meta.resolution,
        u: meta.agent,
        l: meta.locale,
        var: variables,
      };
      return FlyyerRender.signJWT(data, secret);
    }
    invariant(false, "Invalid `strategy`. Valid options are `HMAC` or `JWT`.");
  }

  public sign(
    deck: FlyyerRenderParams<T>["deck"],
    template: FlyyerRenderParams<T>["template"],
    version: FlyyerRenderParams<T>["version"],
    extension: FlyyerRenderParams<T>["extension"],
    variables: FlyyerRenderParams<T>["variables"],
    meta: NonNullable<FlyyerRenderParams<T>["meta"]>,
    strategy: FlyyerRenderParams<T>["strategy"],
    secret: FlyyerRenderParams<T>["secret"],
  ): string | undefined {
    return FlyyerRender.sign(deck, template, version, extension, variables, meta, strategy, secret);
  }
}
