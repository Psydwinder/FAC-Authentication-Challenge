const express = require("express");
const cookieParser = require("cookie-parser");
const home = require("./routes/home.js");
const signup = require("./routes/sign-up.js");
const login = require("./routes/log-in.js");
const logout = require("./routes/log-out.js");
const confessions = require("./routes/confessions.js");
const { getSession, removeSession } = require("./model/session.js");

const body = express.urlencoded({ extended: false });
const cookies = cookieParser(process.env.COOKIE_SECRET);

const server = express();

server.use((req, res, next) => {
  const time = new Date().toLocaleTimeString("en-GB");
  console.log(`${time} ${req.method} ${req.url}`);
  next();
});
server.use(cookies);
server.use(sessions);
server.get("/", home.get);
server.get("/sign-up", signup.get);
server.post("/sign-up", body, signup.post);
server.get("/log-in", login.get);
server.post("/log-in", body, login.post);
server.post("/log-out", logout.post);
server.get("/confessions/:user_id", confessions.get);
server.post("/confessions/:user_id", body, confessions.post);

function sessions(req, res, next) {
  const sid = req.signedCookies.sid;
  const session = getSession(sid);
  if (session) {
    const expiry = new Date(session.expires_at);
    const today = new Date();
    if (expiry < today) {
      removeSession(sid);
      res.clearCookie("sid");
    } else {
      req.session = session;
    }
  }
  next();
}

module.exports = server;
