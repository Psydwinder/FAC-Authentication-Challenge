const db = require("../database/db.js");

const select_confessions = db.prepare(/*sql*/ `
  SELECT content, created_at FROM confessions WHERE user_id = ?
  ORDER BY created_at DESC
`);

function listConfessions(user_id) {
  return select_confessions.all(user_id);
}

const insert_confession = db.prepare(/*sql*/ `
  INSERT INTO confessions (content, user_id) VALUES ($content, $user_id)
  RETURNING id, content, created_at
`);

function createConfession(content, user_id) {
  return insert_confession.get({ content, user_id });
}

module.exports = { listConfessions, createConfession };
