const DIR = "src";

const server = require(`../${DIR}/server.js`);
const db = require(`../${DIR}/database/db.js`);
const { createUser, getUserByEmail } = require(`../${DIR}/model/user.js`);
const { getSession, createSession } = require(`../${DIR}/model/session.js`);
const { listConfessions } = require(`../${DIR}/model/confessions.js`);

function reset() {
  db.exec(/*sql*/ `
    DELETE FROM confessions;
    DELETE FROM sessions;
    DELETE FROM users;
    DELETE FROM sqlite_sequence WHERE name IN ('confessions', 'sessions', 'users');
  `);
}

async function request(pathname, options = {}) {
  const app = server.listen(0);
  const { port } = app.address();
  const url = new URL(pathname, `http://localhost:${port}`);
  const response = await fetch(url, options);
  app.close();
  const body = await response.text();
  const headers = Object.fromEntries(response.headers);
  return { status: response.status, body, headers };
}

function get_sid(headers) {
  const [sid_cookie] = headers["set-cookie"].split(".");
  const encoded_sid = sid_cookie.replace("sid=s%3A", "");
  return decodeURIComponent(encoded_sid);
}

module.exports = {
  reset,
  db,
  createUser,
  getUserByEmail,
  getSession,
  createSession,
  listConfessions,
  request,
  get_sid,
};
