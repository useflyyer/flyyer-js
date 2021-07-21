import { stringify, IStringifyOptions } from "qs";

/**
 * Internally used to convert an object to querystring.
 */
export function toQuery(variables: any, options?: IStringifyOptions) {
  return stringify(variables, Object.assign({ addQueryPrefix: false, format: "RFC1738" }, options));
}
