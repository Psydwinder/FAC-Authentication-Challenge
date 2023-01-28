const test = require("node:test");
const assert = require("node:assert");
const { reset, request, listConfessions } = require("./helpers.js");

test("Submitting confession while not logged in should fail", async () => {
  reset();
  const { status } = await request("/confessions/1", {
    method: "POST",
    redirect: "manual",
  });
  assert.equal(status, 401, `Expected 401 status, but got: ${status}`);
});

test("Submitted confession should always end up in your account", async () => {
  reset();

  const signup_res = await request("/sign-up", {
    method: "POST",
    body: "email=x@test.com&password=123",
    redirect: "manual",
    headers: { "content-type": "application/x-www-form-urlencoded" },
  });

  const { status, headers } = await request("/confessions/999", {
    method: "POST",
    body: "content=testing",
    redirect: "manual",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      cookie: signup_res.headers["set-cookie"],
    },
  });

  assert.equal(
    status,
    302,
    `Expected creating confession to redirect, but got status: ${status}`
  );
  assert.equal(
    headers.location,
    "/confessions/1",
    `Expected creating confession to redirect to logged in user's page, but got location header: ${headers.location}`
  );

  const confessions = listConfessions(1);
  assert.equal(
    confessions.length,
    1,
    `Expected user to have 1 new confession, but got: ${confessions}`
  );
});
