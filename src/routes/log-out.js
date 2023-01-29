const {removeSession} = require("../model/session.js");

  function post(req, res) {
    const sid = req.signedCookies.sid; //Gets the session ID from the cookie
    removeSession(sid); //Removes that session from the DB
    res.clearCookie("sid"); //Removes the session cookie
    res.redirect("/"); //Redirects back home
  }


module.exports = { post };
