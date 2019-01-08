export function parseBoolean(v: string | boolean) {
  if (typeof v === "string") {
    v = v.toLowerCase();
    return v === "on" || v === "true" || v === "yes" || v === "y";
  }
  return !!v;
}
