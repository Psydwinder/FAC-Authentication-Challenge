const test = require("node:test");
const assert = require("node:assert");
const { reset, request } = require("./helpers.js");

test("Viewing another user's confessions should fail", async () => {
  reset();
  const { status } = await request("/confessions/1");
  assert.equal(status, 401, `Expected status to be 401, but got: ${status}`);
});
