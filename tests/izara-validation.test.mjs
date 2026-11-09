import assert from "node:assert/strict";
import { test } from "node:test";
import { parseTitle, parseOrder, validateFileDetails, MAX_DOCUMENT_BYTES } from "../src/lib/izara/validation.ts";
test("titles are trimmed and empty/oversized values rejected", () => {
  assert.equal(parseTitle("  Eğitim belgesi  "), "Eğitim belgesi");
  for (const value of [null, 3, " ", "x".repeat(101)]) assert.throws(() => parseTitle(value));
});
test("sorting rejects repeated IDs and invalid lists", () => {
  assert.deepEqual(parseOrder(["doc-1", "doc_2"]), ["doc-1", "doc_2"]);
  for (const value of [null, {}, ["a", "a"], ["../x"], [2], Array.from({ length: 51 }, (_, i) => `d${i}`)]) assert.throws(() => parseOrder(value));
});
test("file metadata only allows bounded photos", () => {
  for (const type of ["image/jpeg", "image/png", "image/webp"]) validateFileDetails(new File([new Uint8Array(16)], "photo", { type }));
  for (const file of [new File(["x"], "x.svg", { type: "image/svg+xml" }), new File([], "x.png", { type: "image/png" }), new File([new Uint8Array(MAX_DOCUMENT_BYTES + 1)], "x.jpg", { type: "image/jpeg" })]) assert.throws(() => validateFileDetails(file));
});
