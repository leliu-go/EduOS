import { pbkdf2, randomBytes, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const pbkdf2Async = promisify(pbkdf2);
const algorithm = "pbkdf2_sha256";
const digest = "sha256";
const iterations = 310_000;
const keyLength = 32;

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("base64url");
  const derivedKey = await pbkdf2Async(password, salt, iterations, keyLength, digest);

  return `${algorithm}$${iterations}$${salt}$${derivedKey.toString("base64url")}`;
}

export async function verifyPassword(password: string, storedHash: string) {
  const [storedAlgorithm, storedIterations, salt, hash] = storedHash.split("$");

  if (storedAlgorithm !== algorithm || !storedIterations || !salt || !hash) {
    return false;
  }

  const parsedIterations = Number.parseInt(storedIterations, 10);

  if (!Number.isFinite(parsedIterations) || parsedIterations < iterations) {
    return false;
  }

  const expected = Buffer.from(hash, "base64url");
  const actual = await pbkdf2Async(password, salt, parsedIterations, expected.length, digest);

  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
