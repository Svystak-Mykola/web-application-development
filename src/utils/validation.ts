export function validateCustomerInput(input: unknown): string {
  if (typeof input !== "string") {
    throw new TypeError(`Expected string, got ${typeof input}`);
  }

  const trimmed = input.trim();

  if (trimmed.length === 0) {
    throw new Error("Input cannot be empty");
  }
  if (!trimmed.includes("@")) {
    throw new Error("Invalid email format: missing \"@\"");
  }

  return trimmed;
}
