const { Layout } = require("../templates.js");

function get(req, res) {
  const sid = req.signedCookies.sid; //Reads session ID from cookie
  const session = getSession(sid); //Gets session from DB
  const title = "Confess your secrets!";
  const content = /*html*/ `
    <div class="Cover">
      <h1>${title}</h1>
      ${
        session
          ? /*html*/ `<form method="POST" action="/log-out"><button class="Button">Log out</button></form>` //If the session exists render a log out form, this also submits a request to `POST /log-out`
          : /*html*/ `<nav><a href="/sign-up">Sign up</a> or <a href="/log-in">log in</a></nav>` //Else render the sign up/log in links
      }
    </div>
  `;

  const body = Layout({ title, content });
  res.send(body);
}

module.exports = { get };
