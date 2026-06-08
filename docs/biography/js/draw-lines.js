// draw the grey names first these won't be redrawn
// % % % % % Index chart drawing (config + shared renderer) % % % % %
// getIndexCaseConfig() describes each index case; renderTimelinePerson() draws lines, dots, and names.
// drawIndexChartPasses() runs one foreground pass when unfiltered, or background (grey) + foreground when a filter is active.

// optional line colors when showColors is on (development / debugging)
var INDEX_CASE_HIGHLIGHT_COLORS = {
    2: "Gold",
    3: "Chartreuse",
    4: "Plum",
    5: "Cyan",
    7: "Green",
    8: "Blue"
};

// pull the numeric case out of spreadsheet lineType, e.g. "case3" -> 3
function parseIndexCaseNumber(someGuy) {
    var match = String(someGuy.lineType || "").match(/\d+/);
    return match ? parseInt(match[0], 10) : null;
}

// respect the case1, case2, ... toggles at the top of the file (boolCases)
function isIndexCaseDrawable(caseNumber) {
    return !!(caseNumber && boolCases[caseNumber]);
}

function getIndexCaseHighlightColor(caseNumber) {
    return INDEX_CASE_HIGHLIGHT_COLORS[caseNumber] || null;
}

// foreground stroke: black by default, or a highlight color when showColors is on
function getIndexStrokeColor(caseNumber) {
    if (!showColors) {
        return "black";
    }
    if (caseNumber === 6 || caseNumber === 15) {
        return notBlack;
    }
    return getIndexCaseHighlightColor(caseNumber) || "black";
}

// format a year for index tooltips (BC dates use "n BC." like the old drawCase functions)
function formatDeathYear(value) {
    var numericValue = getChartValue(value, null);
    if (numericValue === null) {
        return "";
    }
    if (numericValue > 0) {
        return String(numericValue);
    }
    return Math.abs(numericValue) + " BC.";
}

function formatBirthYear(value) {
    return formatDeathYear(value);
}

// index cases use the raw spreadsheet dates (no Aprox* fallbacks like engraved chart)
function getIndexDates(someGuy) {
    var birthDate = getChartValue(someGuy.BirthDate, 0);
    var deathDate = getChartValue(someGuy.DeathDate, 0);
    var aliveDate = getChartValue(someGuy.AliveDate, 0);
    var lifeLength = getChartValue(someGuy.LifeLength, 0);
    return {
        birthDate: birthDate,
        deathDate: deathDate,
        aliveDate: aliveDate,
        lifeLength: lifeLength,
        aproxDeathDate: getChartValue(someGuy.AproxDeathDate, deathDate)
    };
}

// place the name label at the midpoint of the life line (or the dot span when there is no line)
function getFixedDotDate(someGuy, anchorField, offset) {
    var anchorValue = getChartValue(someGuy[anchorField], 0);
    return anchorValue + offset;
}

function collectOnLineMarkerDates(config, someGuy) {
    var dates = [];

    if (config.drawLine !== false) {
        dates.push(config.lineStart, config.lineEnd);
    }

    (config.startDots || []).forEach(function(offset) {
        dates.push(config.lineStart + offset);
    });

    (config.endDots || []).forEach(function(offset) {
        dates.push(config.lineEnd + offset);
    });

    (config.afterDots || []).forEach(function(offset) {
        dates.push(config.lineEnd + offset);
    });

    (config.fixedDots || []).forEach(function(dotGroup) {
        (dotGroup.offsets || []).forEach(function(offset) {
            dates.push(getFixedDotDate(someGuy, dotGroup.field, offset));
        });
    });

    if (config.underStart !== null) {
        dates.push(config.lineStart + config.underStart);
    }

    if (config.underEnd !== null) {
        dates.push(config.lineEnd - config.underEnd);
    }

    return dates;
}

var MOUSE_BAND_BUFFER = 2; // buffer so mouse hover activates +- the amount of years set here

// transparent hit band for tooltips/clicks. full line + dot span +- buffer
function applyMouseBandFromLine(config, someGuy) {
    var markerDates = collectOnLineMarkerDates(config, someGuy);

    if (markerDates.length > 0) {
        config.mouseStart = Math.min.apply(null, markerDates) - MOUSE_BAND_BUFFER;
        config.mouseEnd = Math.max.apply(null, markerDates) + MOUSE_BAND_BUFFER;
        return;
    }

    config.mouseStart = Math.min(config.lineStart, config.lineEnd) - MOUSE_BAND_BUFFER;
    config.mouseEnd = Math.max(config.lineStart, config.lineEnd) + MOUSE_BAND_BUFFER;
}

function getTooltipSpan(config, someGuy) {
    var markerDates = collectOnLineMarkerDates(config, someGuy);
    if (markerDates.length > 0) {
        return {
            start: Math.min.apply(null, markerDates),
            end: Math.max.apply(null, markerDates)
        };
    }

    return {
        start: Math.min(config.lineStart, config.lineEnd),
        end: Math.max(config.lineStart, config.lineEnd)
    };
}

function applyCenteredLabelX(config, someGuy) {
    if (config.drawLine !== false) {
        config.textX = (config.lineStart + config.lineEnd) / 2;
        return;
    }

    // seven dots case center on the dots, not the wider mouse band
    var markerDates = collectOnLineMarkerDates(config, someGuy);
    if (markerDates.length > 0) {
        config.textX = (Math.min.apply(null, markerDates) + Math.max.apply(null, markerDates)) / 2;
        return;
    }

    if (config.mouseStart !== null && config.mouseEnd !== null) {
        config.textX = (config.mouseStart + config.mouseEnd) / 2;
        return;
    }

    config.textX = config.lineStart;
}

// build a draw config for one person on the index chart
function getIndexCaseConfig(someGuy) {
    var dates = getIndexDates(someGuy);
    var birthDate = dates.birthDate;
    var deathDate = dates.deathDate;
    var aliveDate = dates.aliveDate;
    var lifeLength = dates.lifeLength;
    var caseNumber = parseIndexCaseNumber(someGuy);
    // defaults; each case below overrides line span, dots, label position, and tooltip
    var config = {
        caseNumber: caseNumber,
        drawLine: true,
        lineStart: deathDate - lifeLength,
        lineEnd: deathDate,
        startDots: [],
        endDots: [],
        fixedDots: [],
        underStart: null,
        underEnd: null,
        afterDots: [],
        tooltipLabel: someGuy.DisplayName,
        highlightColor: getIndexCaseHighlightColor(caseNumber),
        strokeColor: getIndexStrokeColor(caseNumber)
    };

    switch (caseNumber) {
        case 1: // solid line | Death year and life span; unknown birth, exact death date, certain life length (engraved ~C)
            config.lineStart = deathDate - lifeLength;
            config.lineEnd = deathDate;
            config.tooltipLabel = "d. " + formatDeathYear(deathDate) + ". " + lifeLength;
            break;
        case 2: // 3 dots solid line | Death year; unknown birth, exact death date (engraved ~D)
            // three dots before death, then a shorter line into the death year
            config.lineStart = deathDate - 45;
            config.lineEnd = deathDate;
            config.fixedDots = [{ field: "DeathDate", offsets: [-60, -55, -50] }];
            config.tooltipLabel = "d." + formatDeathYear(deathDate);
            break;
        case 3: // 3 dots line 2 dots | Flourished year; unknown birth, unknown death, exact flourished date (engraved ~A)
            config.lineStart = aliveDate - 25;
            config.lineEnd = aliveDate + 10;
            config.startDots = [-15, -10, -5];
            config.endDots = [5, 10];
            config.tooltipLabel = (someGuy.AlivePrecision || "") + " " + (aliveDate > 0 ? aliveDate : Math.abs(aliveDate) + " BC.");
            break;
        case 4: // 1 dot under start solid line | Death year and approx life span; unknown birth, exact death date, approx life length (engraved ~H)
            config.lineStart = deathDate - lifeLength;
            config.lineEnd = deathDate;
            config.underStart = 2;
            config.tooltipLabel = "d. " + formatDeathYear(deathDate) + " " + (someGuy.LifePrecision || "") + " " + lifeLength;
            break;
        case 5: // solid line 1 dot under end | Approx death year & approx life span; unknown birth, approx death date, approx life length (engraved ~I)
            config.lineStart = deathDate - lifeLength;
            config.lineEnd = deathDate;
            config.underEnd = 2;
            config.tooltipLabel = "d. ab. " + formatDeathYear(deathDate) + " ab. " + lifeLength;
            break;
        case 6: // solid line | same menu filter as case 1; unknown birth, approx death date, certain life length (engraved ~G)
            config.lineStart = deathDate;
            config.lineEnd = deathDate - lifeLength;
            config.tooltipLabel = "d. ab. " + formatDeathYear(deathDate) + ". " + lifeLength;
            break;
        case 7: // solid line 1 dot after end | Birth year and approx death year; exact birth date, unknown death (filter also includes case14)
            config.lineStart = birthDate;
            config.lineEnd = deathDate;
            config.afterDots = [2];
            config.tooltipLabel = birthDate > 0
                ? "b. " + birthDate + " d. af. " + deathDate
                : "b. " + Math.abs(birthDate) + " BC. d. af. " + deathDate;
            break;
        case 8: // 3 dots solid line 1 dot after end | Approx death year; unknown birth, died after (engraved ~F)
            config.lineStart = deathDate - 45;
            config.lineEnd = deathDate;
            config.fixedDots = [{ field: "DeathDate", offsets: [-60, -55, -50, 5] }];
            config.tooltipLabel = "d. af. " + formatDeathYear(deathDate);
            break;
        case 11: // solid line 1 dot under end | same menu filter as case 5; exact birth date, unknown death, approx life length (engraved ~G)
            config.lineStart = birthDate + lifeLength;
            config.lineEnd = birthDate;
            config.underEnd = 2;
            config.tooltipLabel = birthDate > 0
                ? "b. " + birthDate + " " + (someGuy.LifePrecision || "") + " " + lifeLength
                : "b. " + Math.abs(birthDate) + " BC. " + (someGuy.LifePrecision || "") + " " + lifeLength;
            break;
        case 13: // 7 dots | Approx flourished year; unknown birth, unknown death, approx flourished date (engraved ~B)
            config.drawLine = false;
            config.fixedDots = [{ field: "AliveDate", offsets: [-32, -22, -12, -2, 8, 18, 28] }];
            config.tooltipLabel = "fl. ab. " + (aliveDate > 0 ? aliveDate : Math.abs(aliveDate) + " BC.");
            break;
        case 14: // solid line 1 dot after end | same menu filter as case 7; exact birth date, unknown death, alive after (engraved ~M)
            config.lineStart = birthDate;
            config.lineEnd = aliveDate;
            config.afterDots = [3];
            config.tooltipLabel = birthDate > 0
                ? "b. " + birthDate + " " + (someGuy.AlivePrecision || "") + " " + aliveDate
                : "b. " + Math.abs(birthDate) + " BC. " + (someGuy.AlivePrecision || "") + " " + Math.abs(aliveDate) + " BC.";
            break;
        case 15: // solid line 3 dots after | Birth year; exact birth date, unknown death (engraved ~L)
            // mirror of case D: 45-year line from birth, three dots after the line end
            config.lineStart = birthDate;
            config.lineEnd = birthDate + 45;
            config.afterDots = [5, 10, 15];
            config.tooltipLabel = "b. " + formatBirthYear(birthDate);
            config.strokeColor = notBlack;
            config.lineWidth = backgroundLineWidths;
            break;
        default:
            // case 9, 10, 12, etc. not drawn on the index chart
            return null;
    }

    applyMouseBandFromLine(config, someGuy);
    applyCenteredLabelX(config, someGuy);
    return config;
}

// shared SVG draw for index (background or foreground) and engraved chart (foreground only)
// renderOptions: { layer: "background"|"foreground", interactive: bool, nameHalo: bool }
function renderTimelinePerson(key, config, renderOptions) {
    var someGuy = allPeople[key][0];
    var layer = renderOptions.layer || "foreground";
    var interactive = renderOptions.interactive !== false;
    var isBackground = layer === "background";
    var lineClass = isBackground ? "people-lines-background" : "people-lines";
    var circleClass = isBackground ? "circles-background" : "circles";
    var textClass = isBackground ? "timeline-text-background" : "timeline-text";
    var lineColor = isBackground ? backgroundLineColor : config.strokeColor;
    var lineWidth = isBackground ? backgroundLineWidths : (config.lineWidth || lineWidths);
    var fillColor = isBackground ? backgroundLineColor : notBlack;

    function showTooltip(element) {
        var tooltipSpan = getTooltipSpan(config, someGuy);
        mouseOverChartPeople(element, key, tooltipSpan.start, tooltipSpan.end, config.tooltipLabel);
    }

    // life line (skipped for dot-only cases such as 13)
    if (config.drawLine) {
        peopleGroup.append("line")
            .datum(key)
            .attr("class", lineClass)
            .attr("id", key)
            .attr("x1", chartX(config.lineStart))
            .attr("y1", yScale(someGuy.LineNumber))
            .attr("x2", chartX(config.lineEnd))
            .attr("y2", yScale(someGuy.LineNumber))
            .attr("stroke", lineColor)
            .attr("stroke-width", lineWidth);
    }

    if (drawNames) {
        if (!isBackground && renderOptions.nameHalo) {
            peopleGroup.append("text")
                .datum(key)
                .attr("class", "timeline-text-background")
                .attr("id", key)
                .attr("text-anchor", "middle")
                .text(function() { return someGuy.DisplayName; })
                .attr("x", chartX(config.textX))
                .attr("y", yScale(someGuy.LineNumber) - lineOffset)
                .style("fill", backgroundLineColor);
        }

        var label = peopleGroup.append("text")
            .datum(key)
            .attr("class", textClass)
            .attr("id", key)
            .attr("text-anchor", "middle")
            .text(function() { return someGuy.DisplayName; })
            .attr("x", chartX(config.textX))
            .attr("y", yScale(someGuy.LineNumber) - lineOffset);

        if (isBackground) {
            label.style("fill", backgroundLineColor);
        } else if (config.caseNumber === 15) {
            label.style("fill", notBlack);
        }

        if (interactive) {
            label.on("click", function() {
                selectPerson(key);
            })
            .on("mouseover", function() {
                showTooltip(this);
            })
            .on("mouseout", mouseOut);
        }
    }

    function appendDot(cxDate, cyOffset) {
        peopleGroup.append("circle")
            .datum(key)
            .attr("class", circleClass)
            .attr("id", key)
            .attr("cx", chartX(cxDate))
            .attr("cy", yScale(someGuy.LineNumber) + (cyOffset || 0))
            .attr("r", dotSize)
            .attr("stroke-width", isBackground ? "0.4px" : lineWidths)
            .style("fill", fillColor);
    }

    // dots on the line (offsets from lineStart / lineEnd)
    (config.startDots || []).forEach(function(offset) {
        appendDot(config.lineStart + offset, 0);
    });

    (config.endDots || []).forEach(function(offset) {
        appendDot(config.lineEnd + offset, 0);
    });

    (config.afterDots || []).forEach(function(offset) {
        appendDot(config.lineEnd + offset, 0);
    });

    // index-only: dots at fixed years from a spreadsheet column
    (config.fixedDots || []).forEach(function(dotGroup) {
        (dotGroup.offsets || []).forEach(function(offset) {
            appendDot(getFixedDotDate(someGuy, dotGroup.field, offset), 0);
        });
    });

    // dots drawn below the line (approx / uncertain dates)
    if (config.underStart !== null) {
        appendDot(config.lineStart + config.underStart, lineOffset * 1.2);
    }

    if (config.underEnd !== null) {
        appendDot(config.lineEnd - config.underEnd, lineOffset * 1.2);
    }

    // wide transparent hit area for tooltip and selectPerson (foreground / engraved only)
    if (interactive && config.mouseStart !== null && config.mouseEnd !== null) {
        peopleGroup.append("line")
            .datum(key)
            .attr("class", "mouse-lines")
            .attr("id", key)
            .attr("x1", chartX(config.mouseStart))
            .attr("y1", yScale(someGuy.LineNumber))
            .attr("x2", chartX(config.mouseEnd))
            .attr("y2", yScale(someGuy.LineNumber))
            .attr("stroke", "transparent")
            .attr("stroke-width", "6px")
            .on("click", function() {
                selectPerson(key);
            })
            .on("mouseover", function() {
                showTooltip(this);
            })
            .on("mouseout", mouseOut);
    }
}

// draw one person on the index chart (grey background pass or interactive foreground pass)
function drawIndexPerson(key, layer) {
    var someGuy = allPeople[key][0];
    // _caseNumber and _indexDrawConfig are set at load (precomputeIndexDrawConfigs / CSV read)
    var caseNumber = someGuy._caseNumber;
    if (caseNumber === undefined || caseNumber === null) {
        caseNumber = parseIndexCaseNumber(someGuy);
        someGuy._caseNumber = caseNumber;
    }
    if (!isIndexCaseDrawable(caseNumber)) {
        return;
    }

    var config = someGuy._indexDrawConfig || getIndexCaseConfig(someGuy);
    if (!config) {
        return;
    }
    if (!someGuy._indexDrawConfig) {
        someGuy._indexDrawConfig = config;
    }

    renderTimelinePerson(key, config, {
        layer: layer,
        interactive: layer === "foreground",
        nameHalo: false
    });
}

// % % % Case background: grey lines and names for everyone on the chart % % %
function drawBackgroundIndexPeople() {
    people.forEach(function(key) {
        drawIndexPerson(key, "background");
    });
}

// who gets a foreground (non-grey) draw matches currentFilterMatchSet when a filter is active
function getIndexForegroundKeys() {
    if (currentFilterMatchSet) {
        return Array.from(currentFilterMatchSet);
    }
    return people;
}

// % % % Case foreground: lines and names for the current filter only % % %
function drawForegroundIndexPeople() {
    getIndexForegroundKeys().forEach(function(key) {
        drawIndexPerson(key, "foreground");
    });
}

function drawBackgroundLines() {
    drawBackgroundIndexPeople();
}

function drawIndexPeople() {
    drawForegroundIndexPeople();
}

// parse a numeric year/span from the sheet; used by index and engraved configs
function getChartValue(value, fallback) {
    var numericValue = parseFloat(value);
    if (isNaN(numericValue)) {
        return fallback;
    }
    return numericValue;
}

function getVisualCaseConfig(someGuy) {
    var birthDate = getChartValue(someGuy.BirthDate, getChartValue(someGuy.AproxBirthDate, getChartValue(someGuy.AliveDate, 0)));
    var deathDate = getChartValue(someGuy.DeathDate, getChartValue(someGuy.AproxDeathDate, getChartValue(someGuy.AliveDate, 0)));
    var aliveDate = getChartValue(someGuy.AliveDate, getChartValue(someGuy.AproxBirthDate, birthDate + 40));
    var lifeLength = getChartValue(someGuy.LifeLength, Math.max(0, deathDate - birthDate));
    var lineEnd = getChartValue(someGuy.AliveDate, getChartValue(someGuy.AproxDeathDate, getChartValue(someGuy.DeathDate, birthDate + lifeLength)));
    var visualCase = someGuy.VisualCase || "C";

    var config = {
        drawLine: true,
        lineStart: birthDate,
        lineEnd: deathDate,
        textY: null,
        startDots: [],
        endDots: [],
        fixedDots: [],
        underStart: null,
        underEnd: null,
        afterDots: [],
        tooltipLabel: someGuy.DisplayName
    };

    switch (visualCase) {
        case "A": // 3 dots line 2 dots | unknown birth, unknown death, exact flourished date; exact alive date; flourished after; exact flourished date, certain life length; unknown birth, unknown death
            // start and end dots bracket the same span for the visual case
            config.lineStart = aliveDate - 25;
            config.lineEnd = aliveDate + 10;
            config.startDots = [-15, -10, -5];
            config.endDots = [5, 10];
            config.tooltipLabel = "fl. " + aliveDate;
            break;
        case "B": // 7 dots | unknown birth, unknown death, approx flourished date; unknown birth, unknown death, alive after
            config.drawLine = false;
            config.fixedDots = [{ field: "AliveDate", offsets: [-32, -22, -12, -2, 8, 18, 28] }];
            config.tooltipLabel = "fl. ab. " + aliveDate;
            break;
        case "C": // solid line | unknown birth, exact death date, certain life length
            config.lineStart = deathDate - lifeLength;
            config.lineEnd = deathDate;
            config.tooltipLabel = "d. " + deathDate + ". " + lifeLength;
            break;
        case "D": // 3 dots solid line | unknown birth, exact death date; unknown birth, exact death date (?)
            // three dots at the start then the line to death
            config.lineStart = deathDate - 45;
            config.lineEnd = deathDate;
            config.startDots = [-15, -10, -5];
            config.tooltipLabel = "d. " + deathDate;
            break;
        case "E": // 3 dots solid line 1 dot under end | unknown birth, approx death date
            config.lineStart = deathDate - 45;
            config.lineEnd = deathDate;
            config.startDots = [-15, -10, -5];
            config.underEnd = 0;
            config.tooltipLabel = "d. " + deathDate;
            break;
        case "F": // 3 dots solid line 1 dot after end | unknown birth, died after
            config.lineStart = deathDate - 45;
            config.lineEnd = deathDate;
            config.startDots = [-15, -10, -5];
            config.afterDots = [5];
            config.tooltipLabel = "d. " + deathDate;
            break;
        case "G": // solid line 1 dot under end | unknown birth, approx death date, certain life length; exact birth date, unknown death, approx life length
            config.lineStart = birthDate;
            config.lineEnd = deathDate;
            config.underEnd = 0;
            config.tooltipLabel = "d. " + deathDate + ". " + lifeLength;
            break;
        case "H": // 1 dot under start solid line | unknown birth, exact death date, approx life length
            config.lineStart = birthDate;
            config.lineEnd = deathDate;
            config.underStart = 0;
            config.tooltipLabel = "d. " + deathDate + ". " + lifeLength;
            break;
        case "I": // 1 dot under start solid line 1 dot under end | unknown birth, approx death date, approx life length
            config.lineStart = birthDate;
            config.lineEnd = deathDate;
            config.underStart = 0;
            config.underEnd = 0;
            config.tooltipLabel = "d. " + deathDate + ". " + lifeLength;
            break;
        case "J": // 1 dot under start solid line 1 dot after end | unknown birth, died after, approx life length
            config.lineStart = birthDate;
            config.lineEnd = deathDate;
            config.underStart = 0;
            config.afterDots = [5];
            config.tooltipLabel = "d. " + deathDate + ". " + lifeLength;
            break;
        case "K": // solid line 1 dot after end | exact birth date, unknown death, approx life length; exact birth date, died after
            config.lineStart = birthDate;
            config.lineEnd = lineEnd;
            config.afterDots = [5];
            config.tooltipLabel = "b. " + birthDate + " d. af. " + deathDate;
            break;
        case "L": // solid line 3 dots after | exact birth date, unknown death
            // mirror of case D: 45-year line from birth, three dots after the line end
            config.lineStart = birthDate;
            config.lineEnd = birthDate + 45;
            config.afterDots = [5, 10, 15];
            config.tooltipLabel = "b. " + birthDate;
            break;
        case "M": // solid line 1 dot after end | exact birth date, unknown death, alive after
            config.lineStart = birthDate;
            config.lineEnd = lineEnd;
            config.afterDots = [5];
            config.tooltipLabel = "b. " + birthDate + " d. af. " + deathDate;
            break;
        case "N": // one dot under before solid line 3 dots after | approx birth date, unknown death
            config.lineStart = birthDate;
            config.lineEnd = birthDate + 5;
            config.underStart = 0;
            config.afterDots = [10, 15, 20];
            config.tooltipLabel = "b. " + birthDate;
            break;
        default:
            config.lineStart = deathDate - lifeLength;
            config.lineEnd = deathDate;
            config.tooltipLabel = someGuy.DisplayName;
            break;
    }

    applyMouseBandFromLine(config, someGuy);
    applyCenteredLabelX(config, someGuy);

    return config;
}

// engraved chart: single pass, always notBlack, name halo behind the label
function drawVisualPerson(key) {
    var config = getVisualCaseConfig(allPeople[key][0]);
    config.strokeColor = notBlack;
    renderTimelinePerson(key, config, {
        layer: "foreground",
        interactive: true,
        nameHalo: true
    });
}

function drawVisualPeople() {
    people.forEach(function(key) {
        drawVisualPerson(key);
    });
}

// index chart draw: one or two SVG passes depending on whether a filter is active
// no filter = foreground only (full chart, ~half the DOM vs background+foreground)
// filter active = grey everyone (background), then black for matches (foreground); filterPeople() hides non-matches
function drawIndexChartPasses(peopleFilter) {
    if (isPeopleFilterActive(peopleFilter)) {
        drawBackgroundLines();
    }
    drawForegroundIndexPeople();
}

function drawLines(){
    mouseOut(); // if a tooltip was open, close it
    if (currentLineSystem === "visual") {
        drawVisualPeople();
        return;
    }
    drawIndexChartPasses(true); // initial / unfiltered draw: single foreground pass
    var now = new Date();
    // console.log(now.toUTCString()+ " end of drawLines()");
    document.addEventListener("DOMContentLoaded", function(event) { 
      //do work
        // console.log(now.toUTCString()+ " READY!")
    });
//    document.getElementById("loader").style.display = "none"; // turn OFF the loader every time something is drawn
    

}

function setLoadingUI(){
    document.body.classList.add('waiting');
    document.getElementById("loader").style.display = "block";
    mouseOut(); // close the tooltip
    document.getElementById("numPeople").innerHTML =  "<span 'style=direction: ltr'><i>loading people...</i></span>"; 
    setFilterControlsEnabled(false);
}

