# AGENTS.md

Working notes for whoever (human or agent) picks this up next.

## What this is

A single-page, dependency-free email-name generator: a readable word pair plus a
two-digit number (`gardenkeeper05`). A heart button expands the name into its
family — the same pair with `01`…`25` — and a domain picker appends
`@outlook.com`, `@gmail.com` or `@protonmail.com` to the current name, the family
chips, Copy all and Export.

## Where we left off

Complete and verified, but **uncommitted**: the three site files plus
`README.md`, `AGENTS.md`, `streamlit_app.py`, `requirements.txt`. Nothing is
committed, pushed or deployed. `email-handle-generator.zip` holds the shippable
set; rebuild it after changes.

Never-requested follow-up:

- Recent chips stay bare names; the extension applies only to the current name
  and the family.

## Files

| File               | Role                                                                                  |
| ------------------ | ------------------------------------------------------------------------------------- |
| `index.html`       | Markup: `#handle`, `#copy`, `#like`, `#domain` + `#extend`, `#generate`, `.outlook`, `#recent`, `#family` |
| `styles.css`       | Everything visual; tokens first, media query last                                      |
| `script.js`        | All behaviour; classic script, no imports                                              |
| `streamlit_app.py` | Inlines the CSS and JS into the page and embeds it with `st.iframe`; no app logic       |
| `requirements.txt` | `streamlit` only                                                                       |

## Invariants — keep these true

1. **Name length** is 10–15 characters *for the name alone*, number included: the
   pair must be 8–13 (`BASE_MIN`/`BASE_MAX`) and the number is always two digits.
   The extension never counts toward length.
2. **State**: `currentName` is the bare name, `extension` is `""` or `@domain`,
   and rendering composes them; `familyBase = currentName.slice(0, -2)`. That
   split is what keeps families, Copy all and Export correct.
3. **Radii** come from three tokens: `--radius-lg` 16px (panel), `--radius` 12px
   (controls, chips, surfaces), `--radius-sm` 8px (`kbd`). Never hard-code one.
4. **Spacing**: `--gap` (24px) between blocks, 16px inside them, 8px between
   controls. Change the token, not individual rules.
5. **Chips are one tab stop per list**: exactly one chip has `tabindex="0"` (the
   current one), the rest `-1`; arrows/Home/End rove, Enter/Space copies.
6. **No external requests**: no CDN fonts, images or analytics; the favicon is
   `data:,` and the select arrow is a data-URI SVG. It has to work offline, on
   GitHub Pages and inside the Streamlit iframe.
7. **No dependencies or build step** for the web version; `streamlit` is only for
   the wrapper.

## How it behaves

- Generating clears the family but keeps an active extension; the heart toggles
  the 25-chip family; Space generates only while no control has focus.
- `Add extension` flips `aria-pressed` and its label to `Remove extension`;
  changing the select while active rewrites the name and the family live.
- Copy all and Export each write 25 newline-separated lines, extension included;
  the export file is named `<base><@domain>.txt` so domain families do not
  overwrite each other.

## Checks

- `node --check script.js`; `python3 -m py_compile streamlit_app.py`.
- `AppTest.from_file("streamlit_app.py").run()` should report no exceptions.
- Serve with `python3 -m http.server 3000 --bind 0.0.0.0` and probe with
  `curl -H "Host: <preview hostname>" http://127.0.0.1:3000/`.
- Browser spot checks: 25 family chips carrying the extension, Copy all and
  Export each yielding 25 lines, no horizontal overflow at 344px.

## Pitfalls (learned the hard way)

- `st.components.v1.html` is deprecated in favour of `st.iframe` (which arrived
  in Streamlit 1.56/1.57); `requirements.txt` pins `>=1.57` so no fallback is
  needed.
- Reading the clipboard hangs in this project's cloud browser. Stub
  `navigator.clipboard.writeText` to capture copies instead.
- Downloads cannot be read back via `download.path()`. Patch
  `URL.createObjectURL` and `HTMLAnchorElement.prototype.click` to capture the
  exported text and filename.
- `page.setViewportSize` fails here; use CDP
  `Emulation.setDeviceMetricsOverride` / `clearDeviceMetricsOverride`.
- The cloud preview hostname changes after the VM is idle. Restart the server and
  call the preview tool again rather than trusting an old URL.
