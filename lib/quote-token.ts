import { createHash, randomBytes } from "node:crypto";

export function createQuoteToken() {
  return randomBytes(32).toString("hex");
}

export function hashQuoteToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
