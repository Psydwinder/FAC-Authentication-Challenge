const db = require("../database/db.js");

const insert_user = db.prepare(/*sql*/ `
  INSERT INTO users (email, hash)
  VALUES ($email, $hash)
  RETURNING id
`);

function createUser(email, hash) {
  return insert_user.get({ email, hash });
}

const select_user_by_email = db.prepare(/*sql*/ `
  SELECT id, email, hash, created_at FROM users WHERE email = ?
`);

function getUserByEmail(email) {
  return select_user_by_email.get(email);
}

module.exports = { createUser, getUserByEmail };
