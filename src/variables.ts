/**
 * Any possible object. **Remember: keys and values must be serializable.**
 */
export type FlyyerVariables =
  | {
      [key: string]: any;
    }
  | Record<any, any>;

/**
 * Fast shallow compare of objects.
 */
export function isEqualFlyyerVariables<T extends FlyyerVariables = FlyyerVariables>(a: T, b: T): boolean {
  if (a === b) return true;
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) {
    return false;
  }
  for (let i = 0, l = aKeys.length; i < l; i++) {
    const key = aKeys[i];

    // eslint-disable-next-line no-prototype-builtins
    if (!b.hasOwnProperty(aKeys[i])) {
      return false;
    }

    const aValue = a[key];
    const bValue = b[key];
    if (aValue !== bValue) {
      return false;
    }
  }
  return true;
}
