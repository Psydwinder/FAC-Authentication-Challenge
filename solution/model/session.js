const crypto = require("node:crypto");
const db = require("../database/db.js");

const insert_session = db.prepare(/*sql*/ `
  INSERT INTO sessions (id, user_id, expires_at)
  VALUES ($id, $user_id, DATE('now', '+7 days'))
`);

function createSession(user_id) {
  // quick way to generate a random string in Node
  const id = crypto.randomBytes(18).toString("base64");
  insert_session.run({ id, user_id });
  // return the generated ID so we can store in a cookie
  return id;
}

const select_session = db.prepare(/*sql*/ `
  SELECT id, user_id, expires_at
  FROM sessions WHERE id = ?
`);

function getSession(sid) {
  return select_session.get(sid);
}

const delete_session = db.prepare(/*sql*/ `
  DELETE FROM sessions WHERE id = ?
`);

function removeSession(sid) {
  return delete_session.run(sid);
}

module.exports = { createSession, getSession, removeSession };
