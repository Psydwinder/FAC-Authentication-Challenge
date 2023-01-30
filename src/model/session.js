const crypto = require("node:crypto");
const db = require("../database/db.js");

const insert_session = db.prepare(/*sql*/ `
  INSERT INTO sessions (id, user_id, expires_at) 
  VALUES ($id, $user_id, DATE('now', '+7 days')) 
`);

function createSession(user_id) { /*Takes the user's ID as an argument*/
  const id = crypto.randomBytes(18).toString("base64"); /*Generates a strong, long, random string to use as the session ID */
  insert_session.run({ id, user_id });/*Inserts a new session into the database (including the user ID). Also session.run expects a value and { id, user_id } is passed in as an object*/
  return id; /*Returns the generated ID (this will be needed to store in a cookie later)*/ 
}

const select_session = db.prepare(/*sql*/ `
  SELECT id, user_id, expires_at
  FROM sessions WHERE id = ?
`);

function getSession(sid) {
  return select_session.get(sid);
}

const delete_session = db.prepare(`
  DELETE FROM sessions WHERE id = ?
`);

function removeSession(sid) {
  return delete_session.run(sid);
}

module.exports = { createSession, getSession, removeSession };

