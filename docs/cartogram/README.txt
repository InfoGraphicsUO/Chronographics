Cartogram local development
============================

Serve the docs folder over HTTP (required for d3.csv / d3.text and iframe embeds).
Opening HTML via file:// will fail with cross-origin errors in most browsers.

From the repository root:

  python -m http.server 8080 --directory docs

Then open:

  http://localhost:8080/CartDist_History.html   (full section with iframes)
  http://localhost:8080/cartogram.html          (interactive chart + distort map)
  http://localhost:8080/cartogram_4panels.html  (four-panel comparison)

Assets live under docs/cartogram/ (csv/, img/, json/). carto.js, carto2.js, and
carto4.js load them via the CARTOGRAM = "cartogram/" prefix (relative to docs/).
