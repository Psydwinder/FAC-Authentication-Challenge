module.exports = { Layout };

function Layout({ title, content }) {
  return /*html*/ `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <style>${styles}</style>
      </head>
      <body>
          <main>
            ${content}
          </main>
        </div>
      </body>
    </html>
  `;
}

const styles = /*css*/ `
  html {
    --hue: 330;
    --text-dark: hsl(var(--hue), 10%, 15%);
    --text-light: hsl(var(--hue), 10%, 96%);
    --bg-dark: hsl(var(--hue), 25%, 12%);
    --bg-light: hsl(var(--hue), 25%, 98%);
    --bg-dim: hsl(var(--hue), 10%, 95%);
    --accent: hsl(var(--hue), 50%, 50%);
    accent-color: var(--accent);
    font-size: 125%;
  }

  body {
    margin: 0;
    font-family: ui-serif, serif;
    line-height: 1.6;
    color: var(--text);
    background-color: var(--bg-light);
  }

  button,
  label,
  input,
  textarea {
    font: inherit;
    color: inherit;
  }

  nav a {
    color: var(--accent);
  }

  label {
    text-transform: capitalize;
    font-weight: bold;
  }

  .Button {
    border: 0;
    border-radius: 0.5rem;
    padding: 0.5rem 1rem;
    color: var(--text-light);
    background-color: var(--accent);
    font-weight: bold;
  }

  .Stack {
    display: grid;
    gap: var(--gap, 1rem);
  }

  .Row {
    display: flex;
    gap: var(--gap, 1rem);
  }

  .Cover {
    min-block-size: 100vh;
    display: grid;
    place-content: center;
    place-items: center;
  }

  .Center {
    max-inline-size: var(--size, 40rem);
    margin-inline: auto;
  }

`;
