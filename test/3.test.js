const test = require("node:test");
const assert = require("node:assert");
const bcrypt = require("bcryptjs");
const {
  reset,
  request,
  createUser,
  getSession,
  get_sid,
} = require("./helpers.js");

test("POST /log-in creates new session", async () => {
  reset();
  const hash = await bcrypt.hash("abc", 12);
  createUser("x@test.com", hash);

  const { status, headers } = await request("/log-in", {
    method: "POST",
    body: "email=x@test.com&password=abc",
    redirect: "manual",
    headers: { "content-type": "application/x-www-form-urlencoded" },
  });

  assert.equal(
    status,
    302,
    `Expected log in to redirect, but got status: ${status}`
  );
  assert.equal(
    headers.location,
    "/confessions/1",
    `Expected log in to redirect to new user's confession page, but got location header: ${headers.location}`
  );
  assert.ok(
    headers["set-cookie"]?.startsWith("sid="),
    `Expected log in to set cookie named 'sid', but set-cookie header was: ${headers["set-cookie"]}`
  );

  const sid = get_sid(headers);
  const session = getSession(sid);
  assert.ok(
    session,
    `Expected log in to create a new session created in the DB`
  );
  assert.equal(
    session.user_id,
    1,
    `Expected session to contain user_id 1, but got ${session.user_id}`
  );
});

test("POST /log-in with wrong email returns error", async () => {
  reset();
  const hash = await bcrypt.hash("abc", 12);
  createUser("x@test.com", hash);

  const { status } = await request("/log-in", {
    method: "POST",
    body: "email=x@test.com&password=incorrect",
    redirect: "manual",
    headers: { "content-type": "application/x-www-form-urlencoded" },
  });

  assert.equal(
    status,
    400,
    `Expected log in with wrong email to return 400 status, but got: ${status}`
  );
});

test("POST /log-in with incorrect password returns error", async () => {
  reset();
  const hash = await bcrypt.hash("abc", 12);
  createUser("x@test.com", hash);

  const { status } = await request("/log-in", {
    method: "POST",
    body: "email=x@test.com&password=incorrect",
    redirect: "manual",
    headers: { "content-type": "application/x-www-form-urlencoded" },
  });

  assert.equal(
    status,
    400,
    `Expected log in with wrong pw to return 400 status, but got: ${status}`
  );
});
