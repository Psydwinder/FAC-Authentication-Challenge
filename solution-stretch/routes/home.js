const { Layout } = require("../templates.js");

function get(req, res) {
  const title = "Confess your secrets!";
  const content = /*html*/ `
    <div class="Cover">
      <h1>${title}</h1>
      ${
        req.session
          ? /*html*/ `<form method="POST" action="/log-out"><button class="Button">Log out</button></form>`
          : /*html*/ `<nav><a href="/sign-up">Sign up</a> or <a href="/log-in">log in</a></nav>`
      }
    </div>
  `;
  const body = Layout({ title, content });
  res.send(body);
}

module.exports = { get };
