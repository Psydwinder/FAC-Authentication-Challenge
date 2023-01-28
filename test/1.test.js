const test = require("node:test");
const assert = require("node:assert");
const {
  reset,
  createUser,
  createSession,
  getSession,
} = require("./helpers.js");

test("createSession can insert a new session", async () => {
  reset();

  const user = createUser("x@test.com", "abc");
  const sid = createSession(user.id);
  assert.ok(
    sid,
    `Expected createSession to return the session ID, but got: ${sid}`
  );
  assert.ok(
    sid.length > 10,
    `Expected session ID to be long, but it was only ${sid.length} characters`
  );

  const session = getSession(sid);
  assert.equal(
    session.user_id,
    user.id,
    `Expected session to store the user ID, but session.user_id was: ${session.user_id}`
  );
});
