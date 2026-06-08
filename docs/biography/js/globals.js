// TOOL TIP
var toolTip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

    // fade out tooltip on mouse out
function mouseOut() {
    // console.log("close the tooltip");
    // clear tooltip
    if (!toolTip || toolTip.empty()) return;
    toolTip.interrupt();
    toolTip
        .style("opacity", 0)
        .style("pointer-events", "none"); // prevent tooltip from blocking mouse. 
}

//check the current page to determine what is needed
var path = window.location.pathname;
var page = path.split("/").pop();
//console.log(page)

var showColors = false;

var drawNames = true; //boolean for drawing text on chart of bio off by default//
var currentCase = "drawAllPeople";
var changeCase = false;
var currentProfession = "";
var currentLineSystem = "index"; // case mode for the chart line filter
var currentLineSelection = 0; // current selected line case in the active mode
var currentLineStyle = "";
var currentContinent = "";
var currentRegion = "";
var currentGender = "";
var currentZoom = 1.0;
var currentDragX = 0;
var currentDragY=0;
var flyToEnabled = true;
var flyToDurationMs = 1500;
var flyToMinZoom = 4; // 1 = 100% zoom, 2 = 200% zoom, etc.
var isZoomSliderSyncing = false;
var bioChartInteractionEnabled = false;


var globalFilterString = "";
var F_varyingLineStyle = "";
var clickList= [];
var currentFilterMatchSet = null; // cached set of ids that match the current filter string
var nameFilterTimeoutId = null;
var nameFilterDebounceMs = 250; // search name filter delay (in ms)
var filterListDomBuilt = false; // true once #filterResultsBox has clickable name rows (buildFilterResultsList)
var filterListBuildHandle = null; // requestAnimationFrame id when sidebar build is scheduled (scheduleFilterResultsListBuild)
var personKeys = []; // stable cache of all allPeople ids; avoids repeated Object.keys(allPeople)
var filterListRowsById = {}; // id -> sidebar row node, rebuilt when the list is rebuilt
// Keep the active filters as values, not strings that are evaluated.
// buildFilterPredicate() turns this into a function each time filters are applied.
var filterState = {
    gender: null,
    profession: null,
    lineStyle: null,
    age: null,
    alive: null,
    continent: null,
    region: null,
    varyingLineStyle: false,
    text: ""
};


