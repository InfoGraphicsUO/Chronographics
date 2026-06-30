# Chart of History

An interactive digital recreation of Joseph Priestley's *New Chart of History* (1769), part of [Chronographics: The Time Charts of Joseph Priestley](https://github.com/InfoGraphicsUO/Chronographics).

Priestley's chart maps nearly 3,000 years of world history (1200 BCE–1800 CE), showing the rise and fall of empires across geographic regions. This project digitizes that chart so readers can explore regimes, places, and events interactively, alongside Priestley's original engraving and his 1786 *Description*.

## Quick start

The site is static HTML, CSS, and JavaScript. Serve the `docs/` directory from a local web server (required for loading JSON data). It is recommended to use the "Live Server" plugin available for VSCode. To view the chart of history, open `chartofHistory.html` with Live Server.

## Main pages


| Page                                 | Description                                                                                                        |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| `docs/chartofHistory.html`           | Primary Chart of History page: guided tour, original chart, side-by-side comparison, and interactive visualization |
| `docs/HistoryInteractive/chart.html` | Alternate interactive viewer (used in embedded contexts)                                                           |
| `docs/about.html`                    | Project background, team, and sources                                                                              |
| `docs/sandbox.html`                  | Overview of the digitizing and data pipeline                                                                       |


## Project structure

```
docs/
├── chartofHistory.html          # Main Chart of History page
├── js/                          # Chart visualization logic
│   ├── chart.js                 # D3 rendering (regions, regimes, events)
│   ├── compare.js               # Side-by-side original vs. digital chart
│   ├── variables.js             # Scales, colors, and shared state
│   ├── functions.js             # Data helpers and filters
│   ├── functionsAxis.js         # Axis and grid rendering
│   ├── functionsMouse.js        # Hover, click, and selection
│   ├── dropdown.js              # Filter controls
│   └── bar.js                   # Timeline bar chart
├── json/conversion/             # Chart data (GeoJSON exported from GIS pipeline)
│   ├── polyPowerJSON.json       # Regime polygons
│   ├── placePolyJSON.json       # Geographic place bands
│   ├── regionPolyJSON.json      # Continental regions
│   ├── eventLinesJSON.json      # Event markers
│   ├── powerLinesJSON.json      # Regime boundary lines
│   └── saracens/                # Alternate dataset for Saracen-era view
├── history/                     # Priestley's original *Description* (PDF)
└── img/                         # Chart images and assets
```

## Data

The underlying data is stored in a spreadsheet where each cell represents a territory (row) in a given year (column). Regime names and transition codes are converted to ASCII, processed in Esri ArcMap, cleaned with Python/ArcPy, and exported as GeoJSON for use in the browser.

The JSON files in `docs/json/conversion/` cover 178 territories across ~3,000 years. See `docs/sandbox.html` for a step-by-step walkthrough of the pipeline.

## Technology

- [D3.js v3](https://d3js.org/) for SVG rendering and interaction
- Bootstrap (Rapid theme) for page layout
- Static JSON/GeoJSON for chart geometry and metadata

No build step or package manager is required.

## Original source

Joseph Priestley, *A New Chart of History* (London, 1769). The interactive chart is based on the copy held by the [Library Company of Philadelphia](http://pacscl.exlibrisgroup.com:48992/F?func=direct&doc_number=000193715).

Priestley's accompanying text is included at `docs/history/Priestley Joseph Description of a New Chart of History 1786.pdf`.

## Credits

Developed by the [University of Oregon InfoGraphics Lab](https://infographics.uoregon.edu/) as part of *Chronographics*, led by Daniel Rosenberg. Funded in part by an NEH Digital Humanities Advancement Grant.

For issues, see the [project issue tracker](https://github.com/cartosattva/chronographics/issues).