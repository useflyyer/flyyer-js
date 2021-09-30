import { Flyyer, FlyyerMetaVariables, FlyyerRender, FlyyerVariables, normalizePath } from "@flyyer/flyyer-lite";

/**
 * Compare two `FlyyerMetaVariables` object. Ignores `__v` param.
 */
export function isEqualFlyyerMeta(ameta: FlyyerMetaVariables, bmeta: FlyyerMetaVariables): boolean {
  const metas = ["width", "height", "agent", "id", "locale", "resolution"] as const;
  for (const meta of metas) {
    if (ameta[meta] !== bmeta[meta]) {
      return false;
    }
  }
  return true;
}

/**
 * Compare two Flyyer instances. Ignores `__v` param. Required a variable compare function as third argument.
 * @example
 * import { dequal } from "dequal/lite";
 * const isEqual = isEqualFlyyer(f1, f2, dequal);
 */
export function isEqualFlyyer(
  a: Flyyer,
  b: Flyyer,
  variablesCompareFn: (a: FlyyerVariables, b: FlyyerVariables) => boolean,
): boolean {
  if (a === b) return true;
  if (
    a.project !== b.project ||
    a.default !== b.default ||
    a.extension !== b.extension ||
    a.strategy !== b.strategy ||
    a.secret !== b.secret ||
    normalizePath(a.path) !== normalizePath(b.path)
  ) {
    return false;
  }
  return isEqualFlyyerMeta(a.meta, b.meta) && variablesCompareFn(a.variables, b.variables);
}

/**
 * Compare two FlyyerRender instances. Ignores `__v` param.
 */
export function isEqualFlyyerRender(
  a: FlyyerRender,
  b: FlyyerRender,
  variablesCompareFn: (a: FlyyerVariables, b: FlyyerVariables) => boolean,
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
