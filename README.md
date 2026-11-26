# Handle Forge

A dependency-free static page that forges readable word-pair email names (`gardenkeeper05`), expands any name into a family of 25 siblings, and can append `@outlook.com`, `@gmail.com` or `@protonmail.com`.

## Files

| File               | Purpose                                             |
| ------------------ | --------------------------------------------------- |
| `index.html`       | Markup                                              |
| `styles.css`       | Styling: tokens, dithered monochrome theme          |
| `script.js`        | Generator, family, copy, export, extension logic    |
| `streamlit_app.py` | Streamlit wrapper that embeds the same page         |
| `requirements.txt` | The wrapper's only dependency                       |
| `AGENTS.md`        | Notes for future contributors and agents            |

No build step, no bundler, no external requests.

## Run locally

```bash
python3 -m http.server 3000
```

Then open <http://localhost:3000>. Opening `index.html` directly works too.

## Deploy to GitHub Pages

1. Push the site files to a GitHub repository, with `index.html`, `styles.css` and `script.js` at the **repository root** (not inside a subfolder):

   ```bash
   git init
   git add -A
   git commit -m "Add email name generator"
   git branch -M main
   git remote add origin https://github.com/<your-user>/<your-repo>.git
   git push -u origin main
   ```

2. In the repository, open **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to `Deploy from a branch`.
4. Set **Branch** to `main` and the folder to `/ (root)`, then click **Save**.
5. Wait for the green "Your site is live" banner (usually under a minute) and open `https://<your-user>.github.io/<your-repo>/`.

Commit and push to `main` to redeploy; Pages publishes the new commit automatically.

## Run with Streamlit

```bash
pip install -r requirements.txt
streamlit run streamlit_app.py
```

`streamlit_app.py` inlines `styles.css` and `script.js` into `index.html` and embeds the result with `st.iframe`, so the three site files stay the single source of truth. On Streamlit Community Cloud, point the app at `streamlit_app.py` and it installs `requirements.txt` itself.
