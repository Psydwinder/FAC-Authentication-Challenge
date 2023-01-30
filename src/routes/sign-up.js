const { createUser } = require("../model/user.js");
const { createSession } = require("../model/session.js");
const bcrypt = require("bcryptjs"); //Use the bcryptjs library to hash the password the user submitted

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
     bcrypt.hash(password, 12).then((hash) => { /*Hashes the password*/
      const user = createUser(email, hash); /*Creates the user in the DB*/
      const session_id = createSession(user.id); /*Creates the session with the new user's ID */
      res.cookie("sid", session_id, { /*Sets a cookie with the session ID*/
        signed: true,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
        sameSite: "lax",
        httpOnly: true,
        });
        res.redirect(`/confessions/${user.id}`); /*Redirect to the user's confession page (e.g. /confessions/3)*/
        });
        
  }
}

module.exports = { get, post };
