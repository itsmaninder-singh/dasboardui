import crypto from "crypto";

/** Fast, deterministic hash for refresh tokens (not passwords — bcrypt is used for those).
 * We need equality lookups in the DB, so a keyed SHA-256 digest is appropriate here;
 * the raw JWT is never stored, only this hash. */
export function sha256Hex(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}
