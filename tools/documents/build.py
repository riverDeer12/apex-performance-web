"""Builds the Apex Performance documents from their sources (in this folder).

  privacy-<lang>.html  ->  web: privacy_policy[_<lang>].html, android: privacy-policy-<lang>.html
  rules-<lang>.html    ->  rules-<lang>.print.html (turned into a PDF by pdf.js)

Fonts (Michroma, Lato) and the logo are embedded so every page is one file.
Usage: python3 build.py <fonts dir: node_modules/@fontsource> <logo svg> <out dir>
"""
import base64, html, os, re, sys

HERE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "src")
FONTS, LOGO, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
LANGS = ['hr', 'en', 'it', 'de']
LANG_LABEL = {'hr': 'HR', 'en': 'EN', 'it': 'IT', 'de': 'DE'}
LANG_NAME = {'hr': 'Hrvatski', 'en': 'English', 'it': 'Italiano', 'de': 'Deutsch'}

LATIN = 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD'
LATIN_EXT = 'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF'


def face(family, weight, file, ranges):
    data = base64.b64encode(open(os.path.join(FONTS, file), 'rb').read()).decode()
    return (f"@font-face{{font-family:'{family}';font-style:normal;font-weight:{weight};font-display:swap;"
            f"src:url(data:font/woff2;base64,{data}) format('woff2');unicode-range:{ranges}}}")


FONT_CSS = '\n'.join([
    face('Michroma', 400, 'michroma/files/michroma-latin-400-normal.woff2', LATIN),
    face('Michroma', 400, 'michroma/files/michroma-latin-ext-400-normal.woff2', LATIN_EXT),
    face('Lato', 400, 'lato/files/lato-latin-400-normal.woff2', LATIN),
    face('Lato', 400, 'lato/files/lato-latin-ext-400-normal.woff2', LATIN_EXT),
    face('Lato', 700, 'lato/files/lato-latin-700-normal.woff2', LATIN),
    face('Lato', 700, 'lato/files/lato-latin-ext-700-normal.woff2', LATIN_EXT),
])


def logo_svg(width, height):
    s = open(LOGO, encoding='utf-8').read()
    s = re.sub(r'<\?xml[^>]*>\s*', '', s)
    s = re.sub(r'<metadata>.*?</metadata>', '', s, flags=re.S)
    s = re.sub(r'\s*xmlns:c2pa="[^"]*"', '', s)
    return re.sub(r'width="\d+" height="\d+"', f'width="{width}" height="{height}" aria-hidden="true"', s, count=1)


def read(name):
    return open(os.path.join(HERE, name), encoding='utf-8').read()


def write(path, text):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    open(path, 'w', encoding='utf-8').write(text)
    print(path, len(text))


# Privacy policy ---------------------------------------------------------------

PRIVACY = {
    'hr': ('Apex Performance · mobilna aplikacija', 'Aplikaciju razvija'),
    'en': ('Apex Performance · mobile app', 'App developed by'),
    'it': ('Apex Performance · app mobile', 'App sviluppata da'),
    'de': ('Apex Performance · mobile App', 'App entwickelt von'),
}


def privacy(lang, file_of):
    s = read(f'privacy-{lang}.html')
    title = re.search(r'<title>(.*?)</title>', s, re.S).group(1)
    main = re.search(r'<main>(.*?)</main>', s, re.S).group(1)
    h1 = re.search(r'\s*<h1>.*?</h1>', main, re.S)
    meta = re.search(r'\s*<p class="meta">.*?</p>', main, re.S)
    body = main.replace(h1.group(0), '', 1).replace(meta.group(0), '', 1).strip()
    # The language links live in the header now.
    meta_html = re.sub(r'\s*·\s*<a [^>]*>[^<]*</a>\s*(?=</p>)', '', meta.group(0).strip())

    def label(m):
        t = m.group(0)
        heads = [re.sub(r'<.*?>', '', h).strip() for h in re.findall(r'<th[^>]*>(.*?)</th>', t, re.S)]

        def row(r):
            i = iter(heads)
            return re.sub(r'<td>', lambda _: f'<td data-label="{next(i, "")}">', r.group(0))
        return f'<div class="table-wrap">{re.sub(r"<tr>.*?</tr>", row, t, flags=re.S)}</div>'
    body = re.sub(r'<table>.*?</table>', label, body, flags=re.S)

    links = ''.join(
        f'<a href="{file_of(l)}" hreflang="{l}" lang="{l}" title="{LANG_NAME[l]}"'
        + (' aria-current="page"' if l == lang else '') + f'>{LANG_LABEL[l]}</a>'
        for l in LANGS)
    alternates = '\n'.join(f'  <link rel="alternate" hreflang="{l}" href="{file_of(l)}">' for l in LANGS)
    eyebrow, developed = PRIVACY[lang]
    return f"""<!DOCTYPE html>
<html lang="{lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#0034C4">
  <title>{title}</title>
{alternates}
  <style>
{FONT_CSS}
{read('privacy_style.css').strip()}
  </style>
</head>
<body>
<header class="top">
  <div class="top-inner">
    <a class="brand" href="https://apex-performance.fit">{logo_svg(64, 28)}<span>APEX <b>PERFORMANCE</b></span></a>
    <nav class="lang" aria-label="Language">{links}</nav>
  </div>
</header>
<section class="hero">
  <div class="hero-inner">
    <p class="eyebrow">{eyebrow}</p>
    {h1.group(0).strip()}
    {meta_html}
  </div>
</section>
<main>
  <article class="doc">
  {body}
  </article>
</main>
<footer>
  <span>© 2026 Apex Performance</span><span>{developed} <a href="mailto:info@rdd.software">RDD Software</a></span>
</footer>
</body>
</html>
"""


# Cooperation rules (print only) ----------------------------------------------

def rules(lang):
    s = read(f'rules-{lang}.html')
    art = re.search(r'<article([^>]*)>(.*?)</article>', s, re.S)
    attrs = dict((k, html.unescape(v)) for k, v in re.findall(r'(data-[a-z]+)="([^"]*)"', art.group(1)))
    body = art.group(2).strip()
    esc = html.escape
    return f"""<!DOCTYPE html>
<html lang="{lang}">
<head>
<meta charset="utf-8">
<title>{esc(attrs['data-title'])}</title>
<meta name="footer" content="{esc(attrs['data-footer'])}">
<style>
{FONT_CSS}
{read('rules_style.css').strip()}
</style>
</head>
<body>
<header class="head">
  {logo_svg(66, 29)}
  <div class="running">{esc(attrs['data-running'])}<br>{esc(attrs['data-version'])}</div>
</header>
{body}
</body>
</html>
"""


web = lambda l: 'privacy_policy.html' if l == 'en' else f'privacy_policy_{l}.html'
android = lambda l: f'privacy-policy-{l}.html'
for lang in LANGS:
    if os.path.exists(os.path.join(HERE, f'privacy-{lang}.html')):
        write(os.path.join(OUT, 'web', web(lang)), privacy(lang, web))
        write(os.path.join(OUT, 'android', android(lang)), privacy(lang, android))
    if os.path.exists(os.path.join(HERE, f'rules-{lang}.html')):
        write(os.path.join(OUT, 'rules', f'rules-{lang}.print.html'), rules(lang))
