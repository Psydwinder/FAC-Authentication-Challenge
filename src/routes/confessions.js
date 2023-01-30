const {
  listConfessions,
  createConfession,
} = require("../model/confessions.js");
const { Layout } = require("../templates.js");

/**
   * Currently any user can view any other user's private confessions!
   * We need to ensure only the logged in user can see their page.*/
function get(req, res) {
  const sid = req.signedCookies.sid; //Get the session ID from the cookie
  const session = getSession(sid); //Get the session from the DB
  const current_user = session && session.user_id; //Get the logged in user's ID from the session
  const page_owner = Number(req.params.user_id); //Get the page owner from the URL params
  if (current_user !== page_owner) {
    return res.status(401).send("<h1>You aren't allowed to see that</h1>"); //If the logged in user is not the page owner send a 401 response
  }
  
  const confessions = listConfessions(req.params.user_id);
  const title = "Your secrets";
  const content = /*html*/ `
    <div class="Cover">
      <h1>${title}</h1>
      <form method="POST" class="Stack" style="--gap: 0.5rem">
        <textarea name="content" aria-label="your confession" rows="4" cols="30" style="resize: vertical"></textarea>
        <button class="Button">Confess 🤫</button>
      </form>
      <ul class="Center Stack">
        ${confessions
          .map(
            (entry) => `
            <li>
              <h2>${entry.created_at}</h2>
              <p>${entry.content}</p>
            </li>
            `
          )
          .join("")}
      </ul>
    </div>
  `;
  const body = Layout({ title, content });
  res.send(body);
}

/**
   * Currently any user can POST to any other user's confessions (this is bad!)
   * We can't rely on the URL params. We can only trust the cookie.
   */
  function post(req, res) {
    const sid = req.signedCookies.sid; //Gets the session ID from the cookie
    const session = getSession(sid); //Gets the session from the DB
    const current_user = session && session.user_id; //Gets the logged in user's ID from the session
    if (!req.body.content || !current_user) {
      return res.status(401).send("<h1>Confession failed</h1>");
    }
    createConfession(req.body.content, current_user); //Uses the user ID to create the confession in the DB
    res.redirect(`/confessions/${current_user}`); //Redirects back to the logged in user's confession page
  }
  
  const current_user = Number(req.params.user_id);
  createConfession(req.body.content, current_user);
  res.redirect(`/confessions/${current_user}`);


module.exports = { get, post };
