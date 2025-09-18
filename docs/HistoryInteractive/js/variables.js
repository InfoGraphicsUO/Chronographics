/* MAGIC NUMBERS
    x-coord for SELECT REGIME ON MAP
    y-coord
    map projection
    scale extents
    customAxis functions
    bounds
*/

//check the current page to determine what is needed
var path = window.location.pathname;
var page = path.split("/").pop();
//console.log(page)

// GLOBAL VARIABLES
var margin = {top: 10, right: 10, bottom: 10, left: 10};
var padding = 10;

// var visWidth  = 900;
// var visHeight = 740;

var visWidth  = 900;// match to viewbox width
var visHeight = 600; // match to viewbox height
//var svgViewBoxYShift = 150
var rowHeight =12; // use the number of m used for a single row height in the python script that created the data

var mapWidth = 400;
var mapHeight = mapWidth/2;

var coordinateSystemXoffset = 500000;


var mapLineWidth = 0.15;
var powerLineWidth = 0.5;

var tempRegime = ''; // store the regime hovered on (name)
var tempPlace = ''; // store the place hovered on (name)
var tempRegion = ''; // store the region hovered on
var tempID = ''; // store the place hovered on (ID)

var clickPlace = ''
var clickID = ''


// Colors are in order as mouseover fill, mouseout fill, mousedown fill,  
var notBlack = "#584821"//"#3F3418" 
var backgroundCol = "#f5f8fd"
var placeColors = ["#97525D", "transparent", "#570D9E"]; //rose, transparent, purple
var powerColors = ["#067806", notBlack, "transparent"]; // green, muddy brown, 
var lineColor = "#EA5400"; // orange
// Color order: background countries, unselected places, selected places
var mapLandColor = ["#E8D5B6",notBlack, "#570D9E", "#7F00FF"];  //cream, muddy brown, dark purple, bright purple
var selectedGuyColor = "rgba(255,140,26,0.8)"

// JSON variables
if (page != "twoCharts.html"){
    var regionVar = regions_json.features;
    var powerVar = powers_json.features;
    var powerLineVar = powerLines_json.features;
    var placeVar =  places_json.features;
    var eventVar = eventLines_json.features;
    var pointsVar = eventPoints_json.features;
    var bioVar = placePerson_json.features;
    
    
    // create a full extent year variable to reset the one used after zooming
    var fullStartYear = places_json_bounds.features[0].geometry.coordinates[0][1][0] - 500000;
    var fullEndYear = places_json_bounds.features[0].geometry.coordinates[0][0][0] - 500000;
}

var worldMapData = world_countries_json.features;
var samplePlaceData = sample_places_json.features;
if (page == "twoCharts.html"){
    var regionBioData = region_bio_map_json.features;
}
//var regionPlaceData = regionVar.features;

var startYear = fullStartYear;
var endYear = fullEndYear;
var mouseYear = fullStartYear;
var areaTotal = 37820429.046097; // km^2

// for setting if the region/ruler starts open or closed
//  (false = open; true = closed)
var eraToggled = true;	
var rulerToggled = true;
var timeAxisToggled = true; // not in use
// var bioToggled = true;

var pageNum = 1;
var ppDict = {}; // dict for bio people's page
var textDict = {}; // dict for descriptive text of places
var rulerDict = [];

// chart labels for place exploration
var selectedPlaces = [];

// alphabetical list of regimes
var regimes = [];
// alphabetical list of places
var places = [];


// for zooming the map on the places page 
var placeX = [], placeY = [];


if (page != "twoCharts.html"){
    var placeTicks = [];
    var placeTickLabels = [];


    for (i = 0; i < placeVar.length; i++) {
        placeTicks.push(placeVar[i].properties.INSIDE_Y);
        placeTickLabels.push(placeVar[i].properties.name)
    }

        // populate the region tick locations and labels
        // the first one is for the label (text)
        // the 2nd one is for the ticks (lines)
        // there is an offset in placement so they need to be separate
    var regionTicks = [];
    var regionTickLabels2 = [];
    var regionTicks2 = [];
    var regionTickLabels2 = [];
    for (i = 0; i < regionVar.length; i++) {
        regionTicks.push(regionVar[i].properties.INSIDE_Y);
        regionTickLabels2.push(regionVar[i].properties.name.toUpperCase())
        regionTicks2.push(Math.min(regionVar[i].geometry.coordinates[0][0][1], regionVar[i].geometry.coordinates[0][1][1]));
    }


    var rulerTicks = [];
    var rulerTickLabels = [];
    // grabs the ruler and year from the csv. handled similar to the regions.


//    d3.csv("./csv/rulers.csv", function(error, result) {
    // use full text location for preventing CORS error
 d3.csv("https://pages.uoregon.edu/infographics/timeline/pages/csv/rulers.csv", function(error, result) {
        for (var i = 0; i < result.length; i++)
        {
            rulerTicks.push(parseInt(result[i].startYear));
            rulerTickLabels.push(result[i].ruler);
        }
    })
    
}