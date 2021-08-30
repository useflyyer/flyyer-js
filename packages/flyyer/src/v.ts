import { FlyyerMetaVariables } from "@flyyer/flyyer-lite";

/**
 * Set `__v` variable for cache invalidation
 */
export function __V(v?: FlyyerMetaVariables["v"]) {
  // return isUndefined(v) ? (new Date().getTime() / 1000).toFixed(0) : v;
  if (v === undefined) {
    return (new Date().getTime() / 1000).toFixed(0);
  }
  if (v === null) {
    return undefined; // gets removed from querystring
  }
  return v; // keep wanted constant value
}
