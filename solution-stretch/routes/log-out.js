const { removeSession } = require("../model/session.js");

function post(req, res) {
  removeSession(req.session.id);
  res.clearCookie("sid");
  res.redirect("/");
}

module.exports = { post };
