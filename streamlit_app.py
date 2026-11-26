"""Streamlit wrapper for the static email-name generator.

index.html, styles.css and script.js are the app; this file inlines the CSS and
JS into the page so there is one copy to maintain, then embeds it.
"""

from pathlib import Path

import streamlit as st

HERE = Path(__file__).resolve().parent

html = (HERE / "index.html").read_text(encoding="utf-8")
html = html.replace(
    '<link rel="stylesheet" href="styles.css" />',
    f"<style>\n{(HERE / 'styles.css').read_text(encoding='utf-8')}\n</style>",
).replace(
    '<script src="script.js"></script>',
    f"<script>\n{(HERE / 'script.js').read_text(encoding='utf-8')}\n</script>",
)

st.set_page_config(page_title="Handle Forge — email name generator")

# Darken the app around the iframe; the page's own background is dark.
st.markdown(
    "<style>.stApp { background-color: #07080a; }"
    ".block-container { padding-top: 1.5rem; padding-bottom: 1.5rem; }</style>",
    unsafe_allow_html=True,
)

st.iframe(html, height=900)
