import { Flyyer as FlyyerBase } from "@flyyer/flyyer-lite";
import HmacSHA256 from "crypto-js/hmac-sha256";

import { CREATE_JWT_TOKEN, SIGN_JWT_TOKEN } from "./jwt";

export class Flyyer extends FlyyerBase {
  public static signHMAC(data: string, secret: string): string {
    return HmacSHA256(data, secret).toString().slice(0, 16);
  }
  public static signJWT(data: Record<any, any>, secret: string): string {
    const token = CREATE_JWT_TOKEN(data);
    return SIGN_JWT_TOKEN(token, secret);
  }
  public sign(project: string, path: string, params: string, strategy?: string | null, secret?: string | null): string {
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
}
