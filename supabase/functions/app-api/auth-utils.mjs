const encoder = new TextEncoder();

export function equalSecret(left, right) {
  const leftBytes = encoder.encode(String(left));
  const rightBytes = encoder.encode(String(right));
  const length = Math.max(leftBytes.length, rightBytes.length);
  let difference = leftBytes.length ^ rightBytes.length;

  for (let index = 0; index < length; index += 1) {
    difference |= (leftBytes[index] ?? 0) ^ (rightBytes[index] ?? 0);
  }

  return difference === 0;
}

export function bytesToHex(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function randomHex(byteLength = 32) {
  if (!Number.isInteger(byteLength) || byteLength < 1 || byteLength > 1024) {
    throw new RangeError("Invalid random byte length.");
  }
  const bytes = globalThis.crypto.getRandomValues(new Uint8Array(byteLength));
  return bytesToHex(bytes);
}

export async function derivePinHash(pin, saltHex, iterations) {
  if (typeof pin !== "string") throw new TypeError("PIN must be a string.");
  if (!/^(?:[0-9a-f]{2})+$/i.test(saltHex)) throw new TypeError("Invalid salt.");
  if (!Number.isInteger(iterations) || iterations < 100_000 || iterations > 1_000_000) {
    throw new RangeError("Invalid PBKDF2 iteration count.");
  }

  const salt = new Uint8Array(saltHex.match(/.{2}/g).map((pair) => parseInt(pair, 16)));
  const key = await globalThis.crypto.subtle.importKey(
    "raw",
    encoder.encode(pin),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await globalThis.crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations },
    key,
    256,
  );
  return bytesToHex(new Uint8Array(bits));
}
