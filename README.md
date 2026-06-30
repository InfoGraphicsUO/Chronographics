# Chronographics

**The Time Charts of Joseph Priestley**

In the 1760s, the English scientist and theologian Joseph Priestley published two of the most influential data visualizations in history - the *Chart of Biography* (1765) and the *New Chart of History* (1769). Together, they helped establish the timeline as a graphic form. This project reimagines both charts as interactive digital experiences, alongside Priestley's original engravings, accompanying texts, and scholarly essays.

Developed by the [University of Oregon InfoGraphics Lab](https://infographics.uoregon.edu/), led by Daniel Rosenberg. Funded in part by an NEH Digital Humanities Advancement Grant.

## Charts

Each chart has its own README with setup instructions, file structure, and data documentation:

- **[Chart of Biography](docs/biography/README.md)** - ~2,500 lifespans across six categories of achievement (1200 BCE–1765 CE). Open `[docs/chartofBiography.html](docs/chartofBiography.html)`.
- **[Chart of History](docs/HistoryInteractive/README.md)** - Rise and fall of empires across geographic regions (1200 BCE–1800 CE). Open `[docs/chartofHistory.html](docs/chartofHistory.html)`.

## Quick start

The site is static HTML, CSS, and JavaScript. Serve the `docs/` directory from a local web server (required for loading data). The VSCode **Live Server** extension works well. 

## Site overview


| Page                                                       | Description                                                |
| ---------------------------------------------------------- | ---------------------------------------------------------- |
| `[docs/about.html](docs/about.html)`                       | Project background, team, and sources                      |
| `[docs/chartofBiography.html](docs/chartofBiography.html)` | Chart of Biography — tour, original, and interactive chart |
| `[docs/chartofHistory.html](docs/chartofHistory.html)`     | Chart of History — tour, original, and interactive chart   |
| `[docs/essays.html](docs/essays.html)`                     | Scholarly essays and related artifacts                     |
| `[docs/sandbox.html](docs/sandbox.html)`                   | Digitizing process and data pipeline                       |




## Repository layout

```
docs/
├── about.html
├── chartofBiography.html
├── chartofHistory.html
├── biography/              # Chart of Biography code, data, and README
├── HistoryInteractive/     # Chart of History README and alternate viewer
├── js/                     # Chart of History visualization logic
├── json/conversion/        # Chart of History GeoJSON data
├── history/                # Priestley's *Description of a New Chart of History* (PDF)
├── img/                    # Shared images and assets
└── tour/                   # Scrolling tour scripts and images
```



## Issues

Report bugs and suggestions on the [project issue tracker](https://github.com/cartosattva/chronographics/issues).