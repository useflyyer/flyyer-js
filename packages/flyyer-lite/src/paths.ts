export type FlyyerPath = string | number | null | undefined | (string | number | null | undefined)[];

/**
 * Convert path or array of path parts to a string.
 */
export function normalizePath(path?: FlyyerPath) {
  return []
    .concat(path as any) // force array
    .filter((part: any) => part || part === 0) // filter falsy values
    .map((part: string) => String(part).replace(/^\/+/, "").replace(/\/+$/, "")) // remove leading and trailing slashes
    .join("/"); // compose URL
}
