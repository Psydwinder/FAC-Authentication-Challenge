# Auth challenge

Practice setting up user accounts and authentication in a Node web app.

## Setup

Make sure you have Git and Node (v18) installed.

1. Clone this repo and `cd` into the directory
1. Run `npm install` to install all the dependencies
1. Run `npm run seed` to seed the database with some example data
1. Run `npm run dev` to start the server.  
   This uses the `nodemon` library to auto-restart the server when you save changes.

This app already has the routes and templates created. However the sign up/log in functionality is not implemented, and private pages are visible to anyone. You'll need to fix this.

## Checking your work

Each challenge has associated unit tests. You can either run all the tests with `npm test`, or each individual challenge's tests with `npm run test:1`, `npm run test:2` etc.

Make sure you read test failures carefully—the output can be noisy but the error message should provide useful information to help you.

## Database schema

This app let's users store their private confessions. It has tables for users, sessions and confessions. It's helpful to know the structure of the database before working with it. You can either read `database/schema.sql`, or expand the sections below.

<details>
<summary><code>users</code></summary>

| column     | type     | constraints               |
| ---------- | -------- | ------------------------- |
| id         | integer  | primary key autoincrement |
| email      | text     | unique                    |
| hash       | text     |                           |
| created_at | datetime | DEFAULT CURRENT_TIMESTAMP |

</details>

<details>
<summary><code>sessions</code></summary>

| column     | type     | constraints               |
| ---------- | -------- | ------------------------- |
| id         | integer  | primary key autoincrement |
| user_id    | integer  | references users(id)      |
| expires_at | datetime | not null                  |
| created_at | datetime | DEFAULT CURRENT_TIMESTAMP |

</details>

<details>
<summary><code>confessions</code></summary>

| column     | type     | constraints               |
| ---------- | -------- | ------------------------- |
| id         | integer  | primary key autoincrement |
| content    | text     |                           |
| user_id    | integer  | references users(id)      |
| created_at | datetime | DEFAULT CURRENT_TIMESTAMP |

</details>

## Challenge 1: create sessions

Before you start implementing features you need a way to create new sessions in the DB. Fill out the `createSession` function in `src/model/session.js`. It should:

1. Take the user's ID as an argument
1. Generate a strong, long, random string to use as the session ID
1. Insert a new session into the database (including the user ID)
1. Ensure the `expires_at` column is set to a time in the future
1. Return the generated ID (this will be needed to store in a cookie later)

<details>
<summary>Show solution</summary>

```js
const insert_session = db.prepare(/*sql*/ `
  INSERT INTO sessions (id, user_id, expires_at)
  VALUES ($id, $user_id, DATE('now', '+7 days'))
`);

function createSession(user_id) {
  const id = crypto.randomBytes(18).toString("base64");
  insert_session.run({ id, user_id });
  return id;
}
```

</details>

## Challenge 2: sign up

The app currently has no way to sign up for a new account. There is a sign up form at `GET /sign-up`, but you need to fill out the `POST /sign-up` handler to make this feature work.

1. Use the `bcryptjs` library to hash the password the user submitted
1. Use the `createUser` function from `model/user.js` to insert a new user into the DB
1. Use the `createSession` function you wrote to insert a new session into the DB
1. Set a signed `sid` cookie containing the session ID
1. Redirect to the new user's confession page (e.g. `/confessions/11`)

<details>
<summary>Show solution</summary>

```js
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
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
        sameSite: "lax",
        httpOnly: true,
      });
      res.redirect(`/confessions/${user.id}`);
    });
  }
}
```

</details>

## Challenge 3: log in

The app currently has no way to log in to an existing account. There is a log in form at `GET /log-in`, but you need to fill out the `POST /log-in` handler to make this feature work.

1. Use `getUserByEmail` from `model/user.js` to get the user who is trying to log in
1. If there's no user with that email send a `400` error response
1. Compare the submitted password to the stored user's hash
1. If they don't match send the same error response

   **Important:** don't say exactly what went wrong, otherwise you'll give attackers information like which emails have accounts in your app

1. If they match use the `createSession` function you wrote to insert a new session into the DB
1. Set a signed `sid` cookie containing the session ID
1. Redirect to the new user's confession page (e.g. `/confessions/11`)

<details>
<summary>Show solution</summary>

```js
function post(req, res) {
  const { email, password } = req.body;
  const user = getUserByEmail(email);
  if (!email || !password || !user) {
    return res.status(400).send("<h1>Login failed</h1>");
  }
  bcrypt.compare(password, user.hash).then((match) => {
    if (!match) {
      // Same error as above so attacker doesn't know if email exists or password is wrong
      return res.status(400).send("<h1>Login failed</h1>");
    } else {
      const session_id = createSession(user.id);
      res.cookie("sid", session_id, {
        signed: true,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
        sameSite: "lax",
        httpOnly: true,
      });
      res.redirect(`/confessions/${user.id}`);
    }
  });
}
```

</details>

## Challenge 4: log out button

This app stores sensitive user info, so it's important to let them log out. You'll need to add a log out button to the `GET /`, but only visible when they're logged in.

1. Read the session ID from the signed cookie
1. Get the session from the DB
1. If the session exists render a log out form that submits a request to `POST /log-out`
1. Else render the sign up/log in links

<details>
<summary>Show solution</summary>

```js
function get(req, res) {
  const sid = req.signedCookies.sid;
  const session = getSession(sid);
  const title = "Confess your secrets!";
  const content = /*html*/ `
    <div class="Cover">
      <h1>${title}</h1>
      ${
        session
          ? /*html*/ `<form method="POST" action="/log-out"><button class="Button">Log out</button></form>`
          : /*html*/ `<nav><a href="/sign-up">Sign up</a> or <a href="/log-in">log in</a></nav>`
      }
    </div>
  `;
  const body = Layout({ title, content });
  res.send(body);
}
```

</details>

Then you need to edit the `POST /log-out` handler to make this work.

1. Get the session ID from the signed cookie
1. Use the `removeSession` function from `model/session.js` to delete the session from the DB
1. Clear the `sid` cookie
1. Redirect back to the homepage

<details>
<summary>Show solution</summary>

```js
function post(req, res) {
  const sid = req.signedCookies.sid;
  removeSession(sid);
  res.clearCookie("sid");
  res.redirect("/");
}
```

</details>

## Challenge 5: hide confessions

Now that you've got user accounts working you need to make sure each user's confessions page is protected. Only the user who owns the page should be able to see it. Edit the `GET /confessions/:user_id` handler to make this work.

1. Get the session ID from the signed cookie
1. Use the `getSession` function from `model/session.js` to get the session from the DB
1. Get the logged in user's ID from the session
1. Get the page owner from the URL params
1. If the logged in user is not the page owner send a `401` error response

<details>
<summary>Show solution</summary>

```js
function get(req, res) {
  const sid = req.signedCookies.sid;
  const session = getSession(sid);
  const current_user = session && session.user_id;
  const page_owner = Number(req.params.user_id);
  if (current_user !== page_owner) {
    return res.status(401).send("<h1>You aren't allowed to see that</h1>");
  }
  // ...
}
```

</details>

## Challenge 6: protect confession submission

Currently anyone can send a request to e.g. `POST /confessions/8` to create confessions on that user's page. This is bad! We can't rely on the URL params for this—we can only trust the user ID in the cookie. Confessions should always submit to the logged in user's account.

1. Get the session ID from the signed cookie
1. Get the session from the DB
1. Get the logged in user's ID from the session
1. If there is no logged in user send a `401` error
1. Use this user ID to create the confession in the DB
1. Redirect back to the logged in user's confession page

<details>
<summary>Show solution</summary>

```js
function post(req, res) {
  const sid = req.signedCookies.sid;
  const session = getSession(sid);
  const current_user = session && session.user_id;
  if (!req.body.content || !current_user) {
    return res.status(401).send("<h1>Confession failed</h1>");
  }
  createConfession(req.body.content, current_user);
  res.redirect(`/confessions/${current_user}`);
}
```

</details>

## Challenge 7 (stretch goal): sessions middleware

Your app should now have quite a lot of repeated logic to access the current session. For example the `home.js`, `confessions.js` and `log-out.js` handlers all follow the same process (read the cookie, get the session). It would be nice to abstract this code into an Express middleware, so it can just happen once.

1. Write a new middleware function in `server.js`
1. It should take 3 arguments, `req`, `res` and `next`
1. Read the signed cookie to get the session ID
1. Get the session from the DB
1. If the session exists attach it to the `req` object
1. Always call the `next` function to pass the request on to the next handler in the queue
1. Tell Express to use the middleware before every request

<details>
<summary>Show solution</summary>

```js
server.use(sessions);

function sessions(req, res, next) {
  const sid = req.signedCookies.sid;
  const session = getSession(sid);
  if (session) {
    req.session = session;
  }
  next();
}
```

</details>

Now you can edit any handlers that access the session to use `req.session` instead of reading it from the cookie/DB themselves. E.g for `log-out.js`:

```js
function post(req, res) {
  removeSession(req.session.id);
  res.clearCookie("sid");
  res.redirect("/");
}
```

Ideally if a session has expired we want to remove the session and cookie. Centralising this logic also means you can handle expiry in one place, rather than having to copy it to everywhere you read the cookie.

1. Edit the middleware to check the sessions `expires_at` property
1. If this date is prior to the current date then remove the session from the DB and delete the cookie

<details>
<summary>Show solution</summary>

```js
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
```

</details>
