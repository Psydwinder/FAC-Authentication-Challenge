const bcrypt = require("bcryptjs");
const { createUser } = require("../model/user.js");
const { createSession } = require("../model/session.js");
const { Layout } = require("../templates.js");

function get(req, res) {
  const title = "Create an account";
  const content = /*html*/ `
    <div class="Cover">
      <h1>${title}</h1>
      <form method="POST" class="Row">
        <div class="Stack" style="--gap: 0.25rem">
          <label for="email">email</label>
          <input type="email" id="email" name="email" required>
        </div>
        <div class="Stack" style="--gap: 0.25rem">
          <label for="password">password</label>
          <input type="password" id="password" name="password" required>
        </div>
        <button class="Button">Sign up</button>
      </form>
    </div>
  `;
  const body = Layout({ title, content });
  res.send(body);
}

function post(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).send("Bad input");
  } else {
    bcrypt.hash(password, 12).then((hash) => {
      const user = createUser(email, hash);
      const session_id = createSession(user.id);
      res.cookie("sid", session_id, {
        signed: true,
        maxAge: 1000 * 60,
        sameSite: "lax",
        httpOnly: true,
      });
      res.redirect(`/confessions/${user.id}`);
    });
  }
}

module.exports = { get, post };
