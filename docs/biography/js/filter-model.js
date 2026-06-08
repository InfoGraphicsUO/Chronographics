//var allPeople = []; // don't reset. this is what we draw from, includes all rows with a line number, read in
var allPeople = {} // make "all people" a dictionary
// var watkinsDict = {} // make a dictionary for the watkins descriptions
// var alternateDict = {} // make a dictionary for the Aikin descriptions

// var noLineNumber = [];  // don't reset or we lose this count, has those without a line number
var people = [];
var unsure = [];
var visualPeople = [];

// which lines to draw by default or change manually
// not really needed any more since the drawing can also no be controlled in the font end, but this allows us to control it before hand.
//ALL
var case1 = 1; //solidLines
var case2 = 1; //threeBegin
var case3 = 1; //threeBeginTwoEnd
var case4 = 1; //oneBegin
var case5 = 1; //oneEndUnder
var case6 = 1; //"solid2" solid lines
var case7 = 1; // oneEnd
var case8 = 1; // threeBeginOneEnd //0
var case11 = 1; // oneEndUnder2
var case13= 1; //seven dots
var case14= 1; // oneEnd2
var case15= 1; // threeEnd

//Unused cases...
var case9 = 0; // unsure - no match //0
var case12= 0; // No line number //0
var case10 = 0; // unsure2 //0

////Sample
// var case1 = 0; //solidLines
// var case2 = 1; //threeBegin
// var case3 = 0; //threeBeginTwoEnd
// var case4 = 0; //oneBegin
// var case5 = 0; //oneEndUnder
// var case6 = 0; //"solid2" solid lines
// var case7 = 0; // oneEnd
// var case8 = 0; // threeBeginOneEnd //0
// var case11 = 0; // oneEndUnder2
// var case13= 0; //seven dots
// var case14= 0; // oneEnd2
// var case15= 1; // threeEnd



// array for testing which cases to draw to speed up development
boolCases=[0,case1,case2,case3,case4, case5, case6, case7, case8, case9, case10, case11, case12, case13, case14, case15]

// Priestley index uses a few alternate spellings for the same profession code
function normalizeProfessionCode(code) {
    if (code === 'HP Epic') return 'HP Ep';
    return code;
}

// filter comparisons are case/diacritic insensitive where possible
function normalizeFilterText(value) {
    return stripDiacritics(value || "").toLowerCase();
}

// blank, missing, and sheet placeholder values treated the same in filters
function normalizeNullableValue(value) {
    if (value === null || value === undefined) return "";
    var text = String(value).trim();
    return text === "0" ? "" : text;
}

// mapping workflow to get a continent from our region information for the continent filter
function deriveContinentFromRegion(region) {
    var normalizedRegion = normalizeNullableValue(region);
    if (normalizedRegion === "") return "";

    var regionToContinent = {
        "Africa": "Africa",
        "Arabia": "Asia",
        "China": "Asia",
        "Crim Tartary": "Asia",
        "France": "Europe",
        "Germany": "Europe",
        "Great Britain": "Europe",
        "India": "Asia",
        "Italy": "Europe",
        "Northern Crowns": "Europe",
        "Persia": "Asia",
        "Poland": "Europe",
        "Portugal": "Europe",
        "Prussia": "Europe",
        "Rome": "Europe",
        "Russia": "Europe",
        "Sicily": "Europe",
        "Spain": "Europe",
        "Switzerland": "Europe",
        "Turky in Asia": "Asia",
        "Turky in Europe": "Europe",
        "Western Tartary": "Asia"
    };

    return regionToContinent[normalizedRegion] || "";
}

function isUnknownFilterValue(value) {
    var text = normalizeNullableValue(value);
    return text === "" || text.toLowerCase() === "unknown";
}

function isFilterStateActive() {
    return !!(
        filterState.gender ||
        filterState.profession ||
        filterState.lineStyle ||
        filterState.age ||
        filterState.alive ||
        filterState.continent ||
        filterState.region ||
        filterState.varyingLineStyle ||
        filterState.text
    );
}

function resetTypedFilterState() {
    filterState.gender = null;
    filterState.profession = null;
    filterState.lineStyle = null;
    filterState.age = null;
    filterState.alive = null;
    filterState.continent = null;
    filterState.region = null;
    filterState.varyingLineStyle = false;
    filterState.text = "";
}

// caching strings and numbers used by filters so each dropdown does less work
function cachePersonFilterFields(person) {
    person._filterNameText = normalizeFilterText(person.Name);
    person._filterDisplayNameText = normalizeFilterText(person.DisplayName);
    person._filterBioNameText = normalizeFilterText(person.BioName);
    person._filterWikiText = normalizeFilterText(person.WikiLabel);
    person._filterBiographyText = normalizeFilterText(person.Biography);
    person._filterSearchText = [
        person._filterNameText,
        person._filterDisplayNameText,
        person._filterBioNameText,
        person._filterWikiText,
        person._filterBiographyText
    ].join(" ");

    person._filterProfession = normalizeNullableValue(person.profession);
    person._filterContinent = normalizeNullableValue(person.Continent);
    person._filterContinentText = normalizeFilterText(person._filterContinent);
    person._filterContinentUnknown = isUnknownFilterValue(person.Continent);
    person._filterRegion = normalizeNullableValue(person.Region);
    person._filterRegionText = normalizeFilterText(person._filterRegion);
    person._filterRegionUnknown = isUnknownFilterValue(person.Region);
    person._filterGender = normalizeFilterText(person.gender);
    person._filterBirth = getChartValue(person.AproxBirthDate, getChartValue(person.BirthDate, NaN));
    person._filterDeath = getChartValue(person.AproxDeathDate, getChartValue(person.DeathDate, NaN));
    person._filterLifeLength = getChartValue(person.LifeLength, NaN);
    person._filterApproxAge = getChartValue(person.AproxAge, NaN);
}

function matchesProfessionFilter(person, professionCode) {
    var profession = person._filterProfession;
    switch (professionCode) {
        case "NoIndexProfession":
            return person.noIndexProfession === true;
        case "HPAll":
            return profession.indexOf("HP") !== -1;
        case "HAL":
            return ["Ant", "Ch", "Geo", "H", "L", "Trav"].indexOf(profession) !== -1;
        case "OC":
            return ["Bel", "Cr", "Or"].indexOf(profession) !== -1;
        case "AP":
            return ["Act", "Ar", "Eng", "Engineer", "Mu", "P", "Pa", "Pr", "St"].indexOf(profession) !== -1;
        case "MP":
            return ["Chy", "M", "Ph"].indexOf(profession) !== -1;
        case "DM":
            return ["D", "F", "HP Sto", "J", "Met", "Moh", "Mor", "Po", "Pol", "HP", "HP Ac", "HP Cyn", "HP Cyr", "HP Eleack", "HP Eleat", "HP Ep", "HP Ion", "HP Ital", "HP Meg", "HP Per", "HP Scept", "HP Soc"].indexOf(profession) !== -1;
        case "Bel":
            return ["Bel", "Bell"].indexOf(profession) !== -1;
        default:
            return profession === professionCode;
    }
}

// Index and engraved chart line menus use different case codes
function matchesLineStyleFilter(person, lineStyle) {
    if (currentLineSystem === "visual") {
        return person.VisualCase === lineStyle;
    }
    if (lineStyle === 1 || lineStyle === "1") {
        return person.lineType === "case1" || person.lineType === "case6";
    }
    if (lineStyle === 5 || lineStyle === "5") {
        return person.lineType === "case5" || person.lineType === "case11";
    }
    if (lineStyle === 7 || lineStyle === "7") {
        return person.lineType === "case7" || person.lineType === "case14";
    }
    return person.lineType === "case" + lineStyle;
}

function matchesAgeFilter(person, ageFilter) {
    var minAge = ageFilter.min;
    var maxAge = ageFilter.max;
    var isCertainLifeSpan = person.lineType === "case1" || person.lineType === "case6";
    var exactMatch = isCertainLifeSpan && person._filterLifeLength >= minAge && person._filterLifeLength <= maxAge;
    if (ageFilter.exactOnly) {
        return exactMatch;
    }
    return exactMatch || (person._filterApproxAge >= minAge && person._filterApproxAge <= maxAge);
}

// "Alive during" means the person's lifespan overlaps the selected range
function matchesAliveFilter(person, aliveFilter) {
    var birth = person._filterBirth;
    var death = person._filterDeath;
    if (isNaN(birth) || isNaN(death)) return false;
    return birth <= aliveFilter.max && death >= aliveFilter.min;
}

function matchesContinentFilter(person, continent) {
    if (continent === "Unknown") {
        return person._filterContinentUnknown;
    }
    // America will return zero with current data, but keep the menu option for future rows if desired
    if (continent === "America") {
        return person._filterContinentText.indexOf("america") !== -1;
    }
    if (continent === "Asia") {
        return person._filterContinentText.indexOf("asia") !== -1 || person._filterContinentText.indexOf("eurasia") !== -1;
    }
    return person._filterContinentText.indexOf(normalizeFilterText(continent)) !== -1;
}

function matchesRegionFilter(person, region) {
    if (region === "Unknown") {
        return person._filterRegionUnknown;
    }
    return person._filterRegionText.indexOf(normalizeFilterText(region)) !== -1;
}

//  one predicate built  from all active filter controls
function buildFilterPredicate(state) {
    if (!isFilterStateActive()) return null;
    return function(person) {
        if (state.gender) {
            if (state.gender === "male" || state.gender === "female") {
                if (person._filterGender !== state.gender) return false;
            } else if (person._filterGender === "male" || person._filterGender === "female") {
                return false;
            }
        }
        if (state.profession && !matchesProfessionFilter(person, state.profession)) return false;
        if (state.lineStyle && !matchesLineStyleFilter(person, state.lineStyle)) return false;
        if (state.varyingLineStyle && !(person.VisualCase !== "" && person.ExpectedVisualCase !== "" && person.VisualCase !== person.ExpectedVisualCase)) return false;
        if (state.age && !matchesAgeFilter(person, state.age)) return false;
        if (state.alive && !matchesAliveFilter(person, state.alive)) return false;
        if (state.continent && !matchesContinentFilter(person, state.continent)) return false;
        if (state.region && !matchesRegionFilter(person, state.region)) return false;
        if (state.text && person._filterSearchText.indexOf(state.text) === -1) return false;
        return true;
    };
}

function buildCurrentFilterMatchSet() {
    var predicate = buildFilterPredicate(filterState);
    currentFilterMatchSet = predicate ? new Set() : null;
    if (!predicate) return null;

    for (var i = 0; i < personKeys.length; i++) {
        var key = personKeys[i];
        if (predicate(allPeople[key][0])) {
            currentFilterMatchSet.add(key);
        }
    }
    return currentFilterMatchSet;
}

// the sidebar list is built once so filters only toggle cached rows
function setFilterListRowVisible(id, visible) {
    var row = filterListRowsById[id];
    if (!row) return;
    row.classList.toggle("d-none", !visible);
    row.classList.toggle("d-block", visible);
    row.classList.toggle("hiddenGuy", !visible);
}

function setAllFilterListRowsVisible(visible) {
    for (var id in filterListRowsById) {
        if (Object.prototype.hasOwnProperty.call(filterListRowsById, id)) {
            setFilterListRowVisible(id, visible);
        }
    }
}

