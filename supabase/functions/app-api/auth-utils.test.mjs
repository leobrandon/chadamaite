import assert from "node:assert/strict";
import test from "node:test";
import { derivePinHash, equalSecret } from "./auth-utils.mjs";

test("legacy PIN comparison accepts only the exact submitted value", () => {
  assert.equal(equalSecret("pin-de-teste", "pin-de-teste"), true);
  assert.equal(equalSecret("pin-de-teste", "pin-de-teste-alterado"), false);
  assert.equal(equalSecret("pin-de-teste", " pin-de-teste"), false);
});

test("PBKDF2 migration hash is stable for the same PIN and salt", async () => {
  const salt = "a".repeat(64);
  const first = await derivePinHash("pin-de-teste", salt, 100_000);
  const second = await derivePinHash("pin-de-teste", salt, 100_000);
  const differentPin = await derivePinHash("outro-pin-de-teste", salt, 100_000);

  assert.match(first, /^[0-9a-f]{64}$/);
  assert.equal(first, second);
  assert.notEqual(first, differentPin);
});
