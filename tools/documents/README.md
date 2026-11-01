# Documents

Sources of the app's legal documents and the script that builds them in the Apex Performance
branding (Michroma, Lato, brand blue, logo; fonts embedded, so every page is one file).

- `src/privacy-<lang>.html` – privacy policy (hr, en, it, de)
- `src/rules-<lang>.html` – cooperation rules for individual trainings (hr is binding; it, de are translations)

Build (needs Python 3 and Node with Playwright):

```
npm i --no-save --prefix /tmp/apex-fonts @fontsource/lato @fontsource/michroma
python3 tools/documents/build.py /tmp/apex-fonts/node_modules/@fontsource src/assets/images/logo_light.svg /tmp/apex-docs
node tools/documents/pdf.js /tmp/apex-docs/web/privacy_policy_it.html src/assets/documents/privacy_policy_it.pdf privacy
node tools/documents/pdf.js /tmp/apex-docs/rules/rules-it.print.html src/assets/documents/pravila-individualni-treninzi-v1.1-it.pdf
```

`/tmp/apex-docs/web/*.html` go to `src/assets/documents/`, `/tmp/apex-docs/android/*.html` to
`play-store/privacy-policy/` in apex-performance-android.

A new version of the rules gets a new file name and `RulesDocuments` version in the API, so
clients accept it again. The accepted Croatian v1.1 PDF is left as it is.
