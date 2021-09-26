const isProduction: boolean = process.env.NODE_ENV === "production";
const base = "Flyyer invariant failed";

export function invariant(condition: any, message?: string): asserts condition {
  if (condition) return;
  if (isProduction) {
    throw new Error(base);
  }
  throw new Error(`${base}: ${message || ""}`);
}
