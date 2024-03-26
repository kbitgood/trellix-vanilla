export function hasProp<Prop extends string>(
  prop: Prop,
  obj: unknown,
): obj is { [K in Prop]: string } {
  return obj !== null && typeof obj === "object" && prop in obj;
}
