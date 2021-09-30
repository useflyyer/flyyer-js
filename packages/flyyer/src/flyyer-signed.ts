import { Flyyer as FlyyerBase, FlyyerParams, FlyyerVariables, invariant } from "@flyyer/flyyer-lite";

import { CREATE_JWT_TOKEN, SIGN_JWT_TOKEN, SIGN_HMAC_DATA } from "./jwt";

export class Flyyer<T extends FlyyerVariables = FlyyerVariables> extends FlyyerBase<T> {
  public static signHMAC(data: string, secret: string): string {
    const LENGTH = 16; // We only compare the first 16 chars.
    return SIGN_HMAC_DATA(data, secret).slice(0, LENGTH);
  }
  public static signJWT(data: Record<any, any>, secret: string): string {
    const token = CREATE_JWT_TOKEN(data);
    return SIGN_JWT_TOKEN(token, secret);
  }
  public static sign<T>(
    project: FlyyerParams<T>["project"],
    path: string, // normalized
    params: string,
    strategy: FlyyerParams<T>["strategy"],
    secret: FlyyerParams<T>["secret"],
  ): string {
    if (!strategy && !secret) return "_";
    invariant(
      secret,
      "Missing `secret`. You can find it in your project in Advanced settings: https://flyyer.io/dashboard/_/projects/_/advanced",
    );
    invariant(strategy, "Missing `strategy`. Valid options are `HMAC` or `JWT`.");

    const str = strategy.toUpperCase();
    if (str === "HMAC") {
      const data = `${project}/${path}${params}`;
      return Flyyer.signHMAC(data, secret);
    }
    if (str === "JWT") {
      return Flyyer.signJWT({ path, params }, secret);
    }
    invariant(false, "Invalid `strategy`. Valid options are `HMAC` or `JWT`.");
  }
  public sign(
    project: FlyyerParams<T>["project"],
    path: string, // normalized
    params: string,
    strategy: FlyyerParams<T>["strategy"],
    secret: FlyyerParams<T>["secret"],
  ): string {
    return Flyyer.sign(project, path, params, strategy, secret);
  }
}
