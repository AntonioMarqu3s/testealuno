
export function checkPromoCode(code: string): boolean {
  // Convert to uppercase for case-insensitive comparison
  const normalizedCode = code.toUpperCase();
  return normalizedCode === "OFERTAMDF";
}
