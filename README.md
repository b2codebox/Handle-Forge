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
