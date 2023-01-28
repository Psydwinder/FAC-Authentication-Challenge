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

test("POST /log-out deletes session and clears cookie", async () => {
  reset();
  const hash = await bcrypt.hash("abc", 12);
  createUser("x@test.com", hash);

  const { status, headers } = await request("/log-out", {
    method: "POST",
    redirect: "manual",
  });

  assert.equal(
    status,
    302,
    `Expected log in to redirect, but got status: ${status}`
  );
  assert.equal(
    headers.location,
    "/",
    `Expected log in to redirect to new user's confession page, but got location header: ${headers.location}`
  );
  assert.ok(
    headers["set-cookie"]?.startsWith("sid=;"),
    `Expected log out to remove sid cookie, but set-cookie header was: ${headers["set-cookie"]}`
  );

  const sid = get_sid(headers);
  const session = getSession(sid);
  assert.equal(
    session,
    undefined,
    `Expected log out to remove session from DB, but session still exists: ${session}`
  );
});
