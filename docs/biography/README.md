# Chart of Biography

An interactive digital recreation of Joseph Priestley's *Chart of Biography* (1765), part of [Chronographics: The Time Charts of Joseph Priestley](https://github.com/InfoGraphicsUO/Chronographics). Priestley's chart registers the lives of roughly 2,500 notable figures across nearly 3,000 years (1200 BCE–1765 CE), grouped into six categories of achievement. This project digitizes that chart so readers can explore lifespans, filter by profession and region, and read biographies,alongside Priestley's original engraving and his 1765 *Description*.

## Quick start

The site is static HTML, CSS, and JavaScript. Serve the `docs/` directory from a local web server (required for loading data). It is recommended to use the "Live Server" plugin available for VSCode. To view the Chart of Biography, open `chartofBiography.html` with Live Server.

## Main pages


| Page                         | Description                                                                                                          |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `docs/chartofBiography.html` | Primary Chart of Biography page: guided tour, original chart, side-by-side comparison, and interactive visualization |
| `docs/about.html`            | Project background, team, and sources                                                                                |
| `docs/sandbox.html`          | Overview of the digitizing and data pipeline                                                                         |


## Project structure

```
docs/
├── chartofBiography.html        # Main Chart of Biography page
├── js/compareBio.js             # Side-by-side original vs. digital chart
└── biography/ 
    ├── js/                      # Chart visualization logic
    │   ├── defines.js           # Layout, colors, and date parsing
    │   ├── globals.js           # Shared state
    │   ├── chart-layout.js      # SVG container and axes
    │   ├── data-load.js         # CSV fetch, schema validation, and parsing
    │   ├── draw-lines.js        # Lifeline rendering
    │   ├── filter-model.js      # Filter state and logic
    │   ├── filter-controls.js   # Filter UI bindings
    │   ├── display-selection.js # Hover, click, and selection
    │   ├── lookups-menus.js     # Search and dropdown menus
    │   ├── sliders.js           # Age, alive, and zoom sliders
    │   ├── zoom-pan.js          # Pan and zoom behavior
    │   ├── static-chart.js      # Background grid and category rows
    │   └── clear-drag-resize.js # Window resize and chart reset
    ├── csv/                     # Spreadsheet exports (source data)
    ├── scripts/                 # Python utilities for data prep
    │   ├── ExcelToCSV_May2026.py
    │   ├── calculate_approx_dates.py
    │   └── audit_unplotted_biographies.py
    ├── text/
    │   ├── full.pdf             # Priestley's *Description* (1765 ed.)
    │   └── namePage.csv         # Index name-to-page lookup
    └── archive/                 # Older data exports and prototypes
```

## Data

Biography data is maintained in a spreadsheet with one row per person. Columns include names, birth and death dates (with precision codes), profession categories, line styles, biographical text, and geographic metadata. The interactive chart loads this data live from a published Google Sheet; local CSV and Excel copies in `csv/` are used for offline development and scripting.  
Line symbology follows Priestley's index conventions: solid lines indicate known dates, while dots and ellipses represent varying degrees of uncertainty in birth, death, or lifespan.

Other scripts:

- `calculate_approx_dates.py` - derive approximate birth/death years from the "Birth and Death Dates" sheet
- `audit_unplotted_biographies.py` - report spreadsheet rows not drawn on the chart See `docs/sandbox.html` for a walkthrough of the digitizing process.

## Technology

- [D3.js v4](https://d3js.org/) for SVG rendering and interaction
- [noUiSlider](https://refreshless.com/nouislider/) for age, alive, and zoom controls
- Bootstrap (Rapid theme) for page layout
- Live CSV data from Google Sheets  
No build step or package manager is required to run the site. Python scripts require `pandas` (and `openpyxl` for Excel export).

## Original source

Joseph Priestley, *A Chart of Biography* (Warrington, 1765). The interactive chart is based on the copy held by the [Library Company of Philadelphia](http://pacscl.exlibrisgroup.com:48992/F?func=direct&doc_number=000193714).
Priestley's accompanying text is included at `text/full.pdf`.

## Credits

Developed by the [University of Oregon InfoGraphics Lab](https://infographics.uoregon.edu/) as part of *Chronographics*, led by Daniel Rosenberg. Funded in part by an NEH Digital Humanities Advancement Grant.
For issues, see the [project issue tracker](https://github.com/cartosattva/chronographics/issues).