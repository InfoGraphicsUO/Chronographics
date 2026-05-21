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


var globalFilterString = "";
var F_varyingLineStyle = "";
var clickList= [];
var currentFilterMatchSet = null; // cached set of ids that match the current filter string
var nameFilterTimeoutId = null;
var nameFilterDebounceMs = 250; // search name filter delay (in ms)


// ~ = ~ = ~ = ~ = ~ SVG elements ~ = ~ = ~ = ~ = ~ //

// The timeline SVG
var svg =  d3.select("#timeline")
    .append("svg")
    .attr("id", "svg-chart")
    .attr("width", "100%")
    .attr("height", "100%");
var chart = $("#svg-chart");
var container = chart.parent(),
    containerParent = container.parent();

// Math out the parts of the plot
outerWidth = container.width();
outerHeight = container.height()-70; // minus the header
var aspect = outerWidth/outerHeight;

// adjust aspect ratio to keep to timeline shape
// console.log("aspect:"+ aspect)
if (aspect > 1.8){
    aspect = 1.8
}
outerHeight = outerWidth/aspect

width = outerWidth - margin.left - margin.right;
height = outerHeight - margin.top - margin.bottom;
innerWidth = width - padding.left - padding.right;
innerHeight = height - padding.top - padding.bottom;
endX = startX + width;
endY = startY + height;
endInX = startInX + innerWidth;
endInY = startInY + innerHeight;    
categoryX = endInX + (margin.right/3.0);

var numRows = 164;




// *** AGE SLDIER ***
var ageSlider = document.getElementById('ageSlider');
noUiSlider.create(ageSlider, {
  start: [1,100],
  tooltips: [true, true],
  connect: true,
  // tooltips: [true],
  step: 1,
  range: {
    'min': 1,
    'max': 100
  },
  format: { //integer values only
    from: function(value) {
      return parseInt(value);
  },
    to: function(value) {
      return parseInt(value);
    }
  }
});

//mergeTooltips(slider, 15, ' - '); // not working

ageSlider.noUiSlider.on('end',function(values, handle){
  //document.getElementById("age_CB").checked = true;
  drawYoungPeople(values[0], values[1])
  // console.log("age range: " + values[0] + " to "+ values[1]);
});

mergeTooltips(ageSlider, 15, ' - ');

// *** END AGE SLIDER ***

// *** ALIVE DUIING SLDIER ***
var aliveSlider = document.getElementById('aliveSlider');
noUiSlider.create(aliveSlider, {
  start: [-1800,1800],
  tooltips: [true, true],
  connect: true,
  // tooltips: [true],
  step: 1,
  range: {
    'min': -1800,
    'max': 1800
  },
  format: { //integer values only
    from: function(value) {
      // 'from' the formatted value.
      // Receives a string, should return a number.
        
     if(value.includes(" BC")){
         // if negative, remove substring and change value to negative 
         var fromYear = -1 * (parseInt(value.split(" BC")[0]))
         // console.log
        return fromYear
     } else {
       // if positive, no change
       return parseInt(value)
     }
  },
    to: function(value) {
      // 'to' the formatted value. Receives a number.
        
        if (value > 0 ){
            // if positive, no change
            return parseInt(value)
        } else {
            // if negative, use BC
            return parseInt(Math.abs(value)) + ' BC'
        }
    }
  }
});
mergeTooltips(aliveSlider, 50, ' - ');

//mergeTooltips(slider, 15, ' - '); // not working

aliveSlider.noUiSlider.on('end',function(values, handle){
  //document.getElementById("alive_CB").checked = true;
    // console.log(values)
    var fromYear;
    if( typeof values[0] === 'string' && values[0].includes(" BC")){
         // if negative, remove substring and change value to negative 
         fromYear = -1 * (parseInt(values[0].split(" BC")[0]))
         // console.log(fromYear)
     } else {
       // if int/positive, no change
        fromYear = parseInt(values[0])
     }
    
    var toYear;
    if( typeof values[1] === 'string' && values[1].includes(" BC")){
         // if negative, remove substring and change value to negative 
         toYear = -1 * (parseInt(values[1].split(" BC")[0]))
         // console.log(toYear)
     } else {
       // if int/positive, no change
        toYear = parseInt(values[1])
     }
    
    
  drawAliveDuring(fromYear, toYear)
  // console.log("alive during: " + fromYear + " to "+ toYear);
});
// *** END ALIVE DUIING SLIDER ***

// *** ZOOM SLDIER ***
var zoomSlider = document.getElementById('zoomSlider');
    noUiSlider.create(zoomSlider, {
      start: [1.0],
      tooltips: [true],
      connect: true,
      // tooltips: [true],
      step: 0.1,
      range: {
        'min': 1,
        'max': 8
      },
      format: {
        // 'to' the formatted value. Receives a number.
        to: function (value) {
            return (value*100.0).toFixed(0)+('%');
        },
        // 'from' the formatted value.
        // Receives a string, should return a number.
        from: function (value) {
            val = (value.replace('%', ''))/100.0
            return Number(val);
        }
     },
});

//mergeTooltips(slider, 15, ' - '); // not working

zoomSlider.noUiSlider.on('slide',function(values, handle){
        if (isZoomSliderSyncing) return;
    var sliderZoom = values[0].replace('%', '')/100.0
    if (Math.abs(sliderZoom - currentZoom) < 0.0001) return;
    var viewport = getChartViewport();
    zoomChartTo(sliderZoom, viewport.wide / 2, viewport.high / 2)
  // console.log("slide currentZoom: " + currentZoom);
  // console.log("slide zoom factor: " + values[0]);
});

zoomSlider.noUiSlider.on('set',function(values, handle){
        if (isZoomSliderSyncing) return;
    var sliderZoom = values[0].replace('%', '')/100.0
    if (Math.abs(sliderZoom - currentZoom) < 0.0001) return;
    var viewport = getChartViewport();
    zoomChartTo(sliderZoom, viewport.wide / 2, viewport.high / 2)
  // console.log("set currentZoom: " + currentZoom);
  // console.log("set zoom factor: " + values[0]);
});
// *** END ZOOM SLIDER ***

// clear all checkboxes when script is loaded, after the slider is setup
clearCheckBoxes();
setTimeout(buildLineMenu, 0);

function getChartViewport() {
    var wide = container.width();
    var high = wide / aspect;

    if (high > container.height()){
        high = container.height();
        wide = high * aspect;
    }
    if (high > 685){
        high = 685;
        wide = high * aspect;
    }

    return {
        wide: wide,
        high: high
    };
}

// ~ ~ ~ Function to scale the main group ~  ~ ~
function applyChartTransform(scale) {
    // keep every chart layer on the same transform so zoom and pan stay aligned
    // scale is the current on screen zoom factor for the whole svg
    // currentdragx and currentdragy are the shared pan offsets in screen pixels
    var transformValue = "matrix(" + scale + ",0,0," + scale + "," + currentDragX + "," + currentDragY + ")";
    d3.select(".topGroup").attr("transform", transformValue);
    d3.select(".middleGroup").attr("transform", transformValue);
    d3.select(".bottomGroup").attr("transform", transformValue);
    d3.select(".peopleGroup").attr("transform", transformValue);
    d3.select(".categoryGroup").attr("transform", transformValue);
}

function clampPan(scale, viewport) {
    // keep the chart inside the visible frame so panning cannot drift past the edges
    // scale converts the chart size into screen space at the current zoom level
    var size = viewport || getChartViewport();
    var wide = size.wide;
    var high = size.high;

    var scaledWidth = outerWidth * scale;
    var scaledHeight = outerHeight * scale;

    // when the chart fits inside the viewport there is no legal pan range
    if (scaledWidth <= wide) {
        currentDragX = 0;
    } else {
        var minX = wide - scaledWidth;
        var maxX = 0;
        currentDragX = Math.max(minX, Math.min(maxX, currentDragX));
    }

    if (scaledHeight <= high) {
        currentDragY = 0;
    } else {
        var minY = high - scaledHeight;
        var maxY = 0;
        currentDragY = Math.max(minY, Math.min(maxY, currentDragY));
    }
}

function zoomChartTo(nextZoom, anchorX, anchorY) {
    // zoom around an anchor point so the chart stays under the cursor or centered slider
    // old scale is the current view before the zoom step and new scale is the target view
    var viewport = getChartViewport();
    var oldScale = (viewport.wide / outerWidth) * currentZoom;
    currentZoom = Math.max(1.0, Math.min(8.0, nextZoom));
    var newScale = (viewport.wide / outerWidth) * currentZoom;

    // anchor coordinates are in screen pixels so we convert them back into chart space
    if (oldScale > 0) {
        var anchorChartX = (anchorX - currentDragX) / oldScale;
        var anchorChartY = (anchorY - currentDragY) / oldScale;

        // move the chart so the same chart point stays under the same anchor after zoom
        currentDragX = anchorX - anchorChartX * newScale;
        currentDragY = anchorY - anchorChartY * newScale;
    }

    clampPan(newScale, viewport);
    sizeChange(currentZoom, viewport);
}

function sizeChange(factor, viewport) {
    // console.log("resizing")
    // console.log("x: " + currentDragX)
    // console.log("y: " + currentDragY)

    // Resize the timeline
    var size = viewport || getChartViewport();
    var wide = size.wide;
    var high = size.high;

    // factor is the user chosen zoom level and wide tracks the visible chart width
    // aspect keeps the chart shape stable instead of stretching to the container
    // scale converts the chart from its base size into the current viewport size
    var scale = (wide/outerWidth)*factor;
 //   var translateX = (wide*scale)/-2
//    d3.select(".topGroup").attr("transform", "scale(" + scale + ") translate(" + translateX + " 0)");
    clampPan(scale, size);
    applyChartTransform(scale);

    $("#svg-chart").height(high);


    // //get label locations
    // d3.selectAll(".label-text").each(function(d,i) {
    //     labelLeft = d3.select(this).style("left") // get the left value (it's a string)
    //     labelLeft = labelLeft.substring(0, labelLeft.length - 2); // trim the "px" off

    //     labelTop = d3.select(this).style("top") // get the left value (it's a string)
    //     labelTop = labelTop.substring(0, labelTop.length - 2); // trim the "px" off
    //     console.log(labelTop*(1.0/aspect))
    //    // console.log(labelLeft*scale)
    //     //d3.select(this).style("color","green")
    //     // d3.select(this).style("left", xScale(parseDate("1798")*scale)+"px")
    //     d3.select(this).style("left", wide-25+"px")
    //     //d3.select(this).style("top", labelTop*(1.0/aspect)+"px")
    //     console.log(wide-25)

    //     //d3.select('#timeline').selectAll("div").style(d3.select(this).style("left"),500)
    //    // d3.select(this).style("left") = d3.select(this).style("left")*scale 
    //    //d3.selectAll(".label-text").style("left",+ labelLeft*scale + "px")
    // })
   

    
}

function syncZoomSlider(zoomValue) {
    // keep the slider UI in sync when zoom is changed programmatically
    if (!zoomSlider || !zoomSlider.noUiSlider) return;
    // guard against slider handlers re-triggering zoom logic
    isZoomSliderSyncing = true;
    zoomSlider.noUiSlider.set([zoomValue * 100]);
    isZoomSliderSyncing = false;
}

function findFlyToNode(personId) {
    // find the main chart node that represents this person
    if (!peopleGroup) return null;
    return peopleGroup
    // prefer visible chart elements first, fall back to any matching node
        .selectAll(".people-lines, .mouse-lines, .timeline-text")
        .filter(function(d) { return d === personId; })
        .node();
}

function flyToChartPosition(chartX, chartY) {
    // animate pan/zoom so the given chart point lands in the center of the viewport
    if (!flyToEnabled) return;
    var viewport = getChartViewport();
    var targetZoom = Math.max(currentZoom, flyToMinZoom);
    var targetScale = (viewport.wide / outerWidth) * targetZoom;
    var targetDragX = (viewport.wide / 2) - (chartX * targetScale);
    var targetDragY = (viewport.high / 2) - (chartY * targetScale);

    // capture the current view so we can tween from the existing pan/zoom
    var startZoom = currentZoom;
    var startDragX = currentDragX;
    var startDragY = currentDragY;
    var startTime = Date.now();
    var durationMs = Math.max(0, flyToDurationMs || 0);

    if (durationMs === 0) {
        currentZoom = targetZoom;
        currentDragX = targetDragX;
        currentDragY = targetDragY;
        clampPan(targetScale, viewport);
        applyChartTransform(targetScale);
        syncZoomSlider(currentZoom);
        return;
    }

    var timer = d3.timer(function() {
        // ease out for a smoother finish
        var elapsed = Date.now() - startTime;
        var t = Math.min(1, elapsed / durationMs);
        var eased = 1 - Math.pow(1 - t, 3);

        // interpolate zoom and pan together so the chart doesn't "slip" during the move
        currentZoom = startZoom + (targetZoom - startZoom) * eased;
        currentDragX = startDragX + (targetDragX - startDragX) * eased;
        currentDragY = startDragY + (targetDragY - startDragY) * eased;

        // reapply transform at the new zoom and clamp if we overshoot
        var scale = (viewport.wide / outerWidth) * currentZoom;
        clampPan(scale, viewport);
        applyChartTransform(scale);
        syncZoomSlider(currentZoom);

        if (t >= 1) {
            timer.stop();
            // keep the slider aligned with the final zoom level
            syncZoomSlider(currentZoom);
            return true;
        }
        return false;
    });
}

function flyToPerson(personId) {
    // helper that centers the chart on the selected person
    if (!flyToEnabled) return;
    if (!personId) return;

    // get the rendered bounding box and target its center
    var node = findFlyToNode(personId);
    if (!node || !node.getBBox) return;

    var bbox = node.getBBox();
    if (!bbox || !isFinite(bbox.x) || !isFinite(bbox.y)) return;

    var centerX = bbox.x + (bbox.width / 2);
    var centerY = bbox.y + (bbox.height / 2);
    flyToChartPosition(centerX, centerY);
}


// The top-level group for the timeline
var topGroup = svg.append("g")
    .attr("class", "topGroup");
//    .attr("transform", "translate(0," + startInY +")");

var bottomGroup = svg.append("g")
    .attr("class", "bottomGroup");
//    .attr("transform", "translate(0," + endInY +")");;
var middleGroup = svg.append("g")
    .attr("class", "middleGroup");
var peopleGroup = svg.append("g")
    .attr("class", "peopleGroup");

// The category names
var categoryGroup = svg.append("g")
    .attr("class", "categoryGroup")


var categoryRight = categoryGroup.append("g")
    .attr("transform", "translate(" + categoryX + ")");

// The bottom x axis group
var axisGroupBottom = bottomGroup.append("g")
    .attr("class", "xaxis")
    .attr("transform", "translate(0," + endInY + ")");

// The top x axis group
var axisGroupTop = topGroup.append("g")
    .attr("class", "xaxis")
    .attr("transform", "translate(0," + startInY + ")");

var timelinesGroup = middleGroup.append("g")
    .attr("class", "timelines");




// ~ = ~ = ~ = ~ = ~ Data manipulations  ~ = ~ = ~ = ~ = ~ //

var linesArray = [-1200,-1100,-1000,-900,-800,-700, -600, -500, -400, -300, -200, -100, 0, 100,200,300,400,500,600,700,800,900,1000,1100,1200,1300,1400,1500,1600,1700,1800]; // where the vertical lines go
var linesLocations = [0, numRows+1]; // Sets the min/max lines
const sectionLines = [0,23,44,72,104,134,numRows]
var textLocations = [-1150,-1050,-950,-850,-750, -650,-550, -450, -350, -250, -150, -50,50,  150,250,350,450,550,650,750,850,950,1050,1150,1250,1350,1450,1550,1650,1750]; // where the little 50's go
var minMaxX = d3.extent(linesArray);
var minMaxY = d3.extent(linesLocations);
var timeArray = d3.range(-1200, 1800, 25); // locations for dots [start, end, separation]

// The scale for timeline dot radii, x and y axes
var xScale = d3.scaleTime()
    .range([startInX, endInX])
    .domain([parseDate(minMaxX[0].toString()), 
	     parseDate(minMaxX[1].toString())]);
var yScale = d3.scalePoint()
    .domain(d3.range(0, numRows))  // number of rows 
    .range([startInY, endInY]);


// text stamped on the right
// width: the difference between the row above and the row below
// row: should change to ...the section row above - 1/2 the section width
var sectionText = [  
    {label:"", section:0}, //
    {label:"Historians, Antiquaries, & Lawyers", section:1},
    {label:"Orators and Critics",section:2},
    {label:"Artists & Poets", section:3},
    {label:"Mathematicians and Physicians",section:4},
    {label:"Divines and Metaphysicians",section:5},
    {label:"Statesmen and Warriors", section:6}
];


// coloured rectangles 
var rectangle = middleGroup.append("rect")
                           .attr("id", sectionText[1].label.replace(/\s/g, "")) // name of section without spaces
                           .attr("x", startInX)
                           .attr("y", yScale(0))
                           .attr("width", xScale(parseDate("1800"))-xScale(parseDate("-1200")))
                           .attr("height", yScale(sectionLines[1])-yScale(sectionLines[0]))
                           .attr("fill", lookupColor("green"))
                           .attr("fill-opacity", 0.13)            
                            .on("mousemove", function(d){
                                 mouseOverChartSection(this, d, 1);
                               })
                           .on("mouseout", function(d){
                               mouseOutChartSection(this);
                            });

var rectangle = middleGroup.append("rect")
                           .attr("id", sectionText[2].label.replace(/\s/g, "")) // name of section without spaces
                           .attr("x", startInX)
                           .attr("y", yScale(sectionLines[1]))
                           .attr("width", xScale(parseDate("1800"))-xScale(parseDate("-1200")))
                           .attr("height", yScale(sectionLines[2])-yScale(sectionLines[1]))
                           .attr("fill", lookupColor("pink"))
                           .attr("fill-opacity", 0.1)            
                           .on("mousemove", function(d){
                                mouseOverChartSection(this, d, 2)
                               })
                           .on("mouseout", function(d){
                               mouseOutChartSection(this);
                            });

var rectangle = middleGroup.append("rect")
                           .attr("id", sectionText[3].label.replace(/\s/g, "")) // name of section without spaces
                           .attr("x", startInX)
                           .attr("y", yScale(sectionLines[2]))
                           .attr("width", xScale(parseDate("1800"))-xScale(parseDate("-1200")))
                           .attr("height", yScale(sectionLines[3])-yScale(sectionLines[2]))
                           .attr("fill", lookupColor("yellow"))
                           .attr("fill-opacity", 0.1)            
                           .on("mousemove", function(d){
                                 mouseOverChartSection(this, d, 3)
                               })
                           .on("mouseout", function(d){
                               mouseOutChartSection(this);
                            });

var rectangle = middleGroup.append("rect")
                           .attr("id", sectionText[4].label.replace(/\s/g, "")) // name of section without spaces
                           .attr("x", startInX)
                           .attr("y", yScale(sectionLines[3]))
                           .attr("width", xScale(parseDate("1800"))-xScale(parseDate("-1200")))
                           .attr("height", yScale(sectionLines[4])-yScale(sectionLines[3]))
                           .attr("fill", lookupColor("blue"))
                           .attr("fill-opacity", 0.13)            
                           .on("mousemove", function(d){
                                 mouseOverChartSection(this, d, 4)
                               })
                           .on("mouseout", function(d){
                               mouseOutChartSection(this);
                            });

var rectangle = middleGroup.append("rect")
                           .attr("id", sectionText[5].label.replace(/\s/g, "")) // name of section without spaces
                           .attr("x", startInX)
                           .attr("y", yScale(sectionLines[4]))
                           .attr("width", xScale(parseDate("1800"))-xScale(parseDate("-1200")))
                           .attr("height", yScale(sectionLines[5])-yScale(sectionLines[4]))
                           .attr("fill", lookupColor("pink"))
                           .attr("fill-opacity", 0.1)            
                           .on("mousemove", function(d){
                                 mouseOverChartSection(this, d, 5)
                               })
                           .on("mouseout", function(d){
                               mouseOutChartSection(this);
                            });

var rectangle = middleGroup.append("rect")
                           .attr("id", sectionText[6].label.replace(/\s/g, "")) // name of section without spaces
                           .attr("x", startInX)
                           .attr("y", yScale(sectionLines[5]))
                           .attr("width", xScale(parseDate("1800"))-xScale(parseDate("-1200")))
                           .attr("height", yScale(sectionLines[6]-1)-yScale(sectionLines[5]))
                           .attr("fill", lookupColor("yellow"))
                           .attr("fill-opacity", 0.1)            
                           .on("mouseover", function(d){
                                 mouseOverChartSection(this, d, 6)
                               })
                           .on("mouseout", function(d){
                               mouseOutChartSection(this);
                            });


// lines
var vertLines = middleGroup.selectAll("div") // internal vertical lines
    .data(linesArray)
    .enter()
    .append("line")
    .attr("class", "lines")
    .attr("x1", function(d){ return xScale(parseDate(d.toString())); })
    .attr("y1", yScale(minMaxY[0]))
    .attr("x2", function(d){ return xScale(parseDate(d.toString())); })
    .attr("y2", yScale(numRows-1))
    .style("stroke", notBlack)
    .style("stroke-width", "0.2px");


// lines
var lastVertLine = middleGroup.selectAll("div") // last vertical line
    .append("line")
    .attr("class", "lines")
    .attr("x1", xScale(parseDate("1800")))
    .attr("y1", 0)
    .attr("x2", xScale(parseDate("1800")))
    .attr("y2", yScale(numRows-1))
    .attr("stroke", "red")
    .attr("stroke-width", "0.3px");

var innerSectionLines = sectionLines.slice();// make a copy avoiding pointer to original array
innerSectionLines = innerSectionLines.splice(0,(innerSectionLines.length)-1); // drop off first and last elemnts
var horizontalLine = middleGroup.selectAll("g") //horizontal sections lines
    .data(innerSectionLines) // drop off the first array value)
    .enter()
    .append("line")
    .attr("class", "horizontalLine")
    .attr("x1", xScale(parseDate("-1200")))
    .attr("y1", function(d){ return yScale(d); }) // can't be a decimal.
    .attr("x2", xScale(parseDate("1850")))
    .attr("y2", function(d){ return yScale(d); })
    .attr("stroke", notBlack)
    .attr("stroke-width", "0.5px");


var bottomLine = middleGroup.selectAll("g") // horizontal bottom 
    .append("line")
    .attr("class", "horizontalLine")
    .attr("x1", xScale(parseDate("-1250"))-2)
    .attr("y1", yScale(numRows-1)+35)
    .attr("x2", xScale(parseDate("1850"))+2)
    .attr("y2", yScale(numRows-1)+35)
    .attr("stroke", notBlack)
    .attr("stroke-width", "2px")
    .attr("stroke-linecap", "square");

var topLine = middleGroup.selectAll("g") // top border
    .append("line")
    .attr("class", "horizontalLine")
    .attr("x1", xScale(parseDate("-1250"))-2)
    .attr("y1", yScale(0)-37)
    .attr("x2", xScale(parseDate("1850"))+2)
    .attr("y2", yScale(0)-37)
    .attr("stroke", notBlack)
    .attr("stroke-width", "2px")
    .attr("stroke-linecap", "square");

var leftLine = middleGroup.selectAll("g")  // left vertical border
    .append("line")
    .attr("class", "horizontalLine")
    .attr("x1", xScale(parseDate("-1250"))-2)
    .attr("y1", yScale(0)-35)
    .attr("x2", xScale(parseDate("-1250"))-2)
    .attr("y2", yScale(numRows-1)+35)
    .attr("stroke", notBlack)
    .attr("stroke-width", "2px")
    .attr("stroke-linecap", "square");

var rightLine = middleGroup.selectAll("g") // right vertical
    .append("line")
    .attr("class", "horizontalLine")
    .attr("x1", xScale(parseDate("1850"))+2)
    .attr("y1", yScale(0)-35-1)
    .attr("x2", xScale(parseDate("1850"))+2)
    .attr("y2", yScale(numRows-1)+35-1)
    .attr("stroke", notBlack)
    .attr("stroke-width", "2px")
    .attr("stroke-linecap", "square");


var top50sText = topGroup.selectAll("div") // 50s across the top
    .data(textLocations)
    .enter()
    .append("text")
    .attr("class", "text-top")
    .text("50")
    .attr("text-anchor", "middle")
    .style("writing-mode","vertical-rl")
    .attr("x", function(d){ return xScale(parseDate(d.toString())); })
    .attr("y", yScale(0)-13);

var bottom50sText = topGroup.selectAll("div") // 50s across the bottom
    .data(textLocations)
    .enter()
    .append("text")
    .attr("class", "text-top")
    .text("50")
    .attr("text-anchor", "middle")
    .style("writing-mode","vertical-rl")
    .attr("x", function(d){ return xScale(parseDate(d.toString())); })
    .attr("y", yScale(numRows-1)+14);

var fleurDeLis = topGroup.selectAll("div")
    .data("a") // need a single data element
    .enter()
    .append("text")
    .attr("class", "text-top")
    .html("&#x269C;") // fleur de lis HTML entity
    .style('fill', notBlack)
    .style("font-size", "1.3em")
    .attr("text-anchor", "middle")
    .attr("x", xScale(parseDate("0")))
    .attr("y", yScale(0)-22)



var categoryText = categoryRight.selectAll("div")
    .data(sectionText)
    .enter()
    .append("text") // div vs text to allow hover on background?
    .attr("class", "label-text old-looking-font")
    .html(function(d){
                    // console.log(d.label)
                    return d.label
                })
    .style("writing-mode","vertical-lr")
    .attr("y", function(d){
                   center = (yScale(sectionLines[d.section-1]+1)   + ((yScale(sectionLines[d.section]-1)) - yScale(sectionLines[d.section-1]))/2.0 ); // subtract last line 1 to keep bottom section in range
                   if (isNaN(center)) center = 0 // if the location is not a number just return 0.
                   return (center + "px") 
                })
    .attr("transform", function(d){
                   center = (yScale(sectionLines[d.section-1]+1)   + ((yScale(sectionLines[d.section]-1)) - yScale(sectionLines[d.section-1]))/2.0 ); // subtract last line 1 to keep bottom section in range
                   if (isNaN(center)) center = 0 // if the location is not a number just return 0.
                //    console.log(center)
                   return ("rotate(180,0,"+center+")")
                })
    .call(wrap, 85)  // hard codded value for max height, need a select each or similar instead of ".call" for this to be calculated based on row height
    .on("mouseover", function(d){
        // console.log(d.label)
             mouseOverSectionTitle(d)
     })
    .on("mouseout", function(d){
             mouseOutSectionTitle(d)
    });




/* wrapping long labels */
function wrap(text, width) {
  text.each(function() {
    var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 0.5, // ems
        x = 6, // was 0 in original code, using 6 and -2 for two line wraps in chart of bio
        y = text.attr("y"),
        dy = parseFloat(text.attr("dy")),
        tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", -2).attr("y", y).attr("dy", +lineNumber * lineHeight + dy + "em").text(word);
      }
    }
  });
}


var topDots = middleGroup.selectAll("div")
    .data(timeArray)
    .enter()
    .append("circle")
    .attr("class", "circles")
    .attr("cx", function(d){
	return xScale(parseDate(d.toString())); })
    .style("font-size", "larger")
    .attr("cy", yScale(0)-5)
    .attr("r", dotSize*2.5)
    .attr("stroke", notBlack);

var bottomDots = middleGroup.selectAll("div")
    .data(timeArray)
    .enter()
    .append("circle")
    .attr("class", "circles")
    .attr("cx", function(d){
	return xScale(parseDate(d.toString())); })
    .attr("cy", yScale(numRows-1)+5)
    .attr("r", dotSize*2.5)
    .attr("stroke", notBlack);

// Get an xval via the scale and date parser
//var xVal = function(d){ return xScale(parseDate(d.toString())); }; // not used

// The lower axis numbers (100s)
var xAxisBottom = d3.axisBottom()
    .scale(xScale)
    .tickSize(0, 0)
    .tickPadding(10)
    .ticks(d3.timeYear.every(100)) // frequency of labels
    .tickFormat(function(d){ 
        return (toYear(d) < 1800 ? toYear(d) : null)})

axisGroupBottom.call(xAxisBottom)   // v4 migrate
    .append("text")
    .attr("y", 15)
    .attr("x", 0)
    .attr("dy", ".35em")
    .style("text-anchor", "middle");


// The upper axis numbers (100s)
var xAxisTop =  d3.axisTop()
    .scale(xScale)
    .tickSize(0, 0)
    .tickPadding(10)
    .ticks(d3.timeYear.every(100)) // frequency of labels
    .tickFormat(function(d){ 
        return (toYear(d) < 1800 ? toYear(d) : null)})

axisGroupTop.call(xAxisTop)  // v4 migrate
    //.append("text")
    // .attr("y", -12)
    // .attr("x", 0)
    // .attr("dy", ".35em")
     .style("text-anchor", "middle");


// @ @ @ @ @ @ Start Control @ @ @ @ @ @ @ //

/*
var enter = middleGroup.selectAll("div")
    .data(linesLocations)
    .enter();
    enter.append("circle")
    .attr("class", "circles-test")
    .attr("cx", function(d){
	return xScale(parseDate("-350")); })
    .attr("cy", function(d){ return yScale(d); })
    .attr("r", 2)
    .attr("stroke", notBlack)
*/

//var allPeople = []; // don't reset. this is what we draw from, includes all rows with a line number, read in
var allPeople = {} // make "all people" a dictionary
var watkinsDict = {} // make a dictionary for the watkins descriptions
var alternateDict = {} // make a dictionary for the Aikin descriptions

var noLineNumber = [];  // don't reset or we lose this count, has those without a line number
var people = [];
var solidLines = [];
var threeBegin = [];
var threeBeginTwoEnd = [];
var oneBegin = [];
var oneEndUnder = [];
var oneEndUnder2 = [];
var oneEnd = [];
var oneEnd2 = [];
var threeBeginOneEnd = [];
var unsure = [];
var solid2 = [];
var unsure2 = [];
var sevenDots = []
var threeEnd = []
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

// console.log("A");

var dataSheet; // for data loaded via d3

function loadBioData(){
    //document.getElementById("loader").style.display = "block";
    setLoadingUI();
    
    document.getElementById("filterResultsBox").innerHTML =  ""; 
    // console.log("loading bio data");
    //document.getElementById("loader").style.display = "wait"; /* waiting mouse */
    //document.getElementById("loaderButton").style.display = "none";  /* turn off the button is reset in setLoadingUI function*/
 /* turn on the loader wheel*/
// //console.log(ds);
//     ds.fetch({
//         success : function() {
//             var now = new Date();
//             console.log(now.toUTCString()+ " success")
//             // Go through the data, create a json
//             this.each(function(d){
  //enable buttons
  document.getElementById("loaderButton").style.display = 'none';
  document.getElementById("drawName_CB").disabled = false;
  document.getElementById("userInput").disabled = false;
  document.getElementById("gender_label").disabled = false;
  document.getElementById("profession_label").disabled = false;
  document.getElementById("continent_label").disabled = false;
    document.getElementById("case_system_label").disabled = false;
  if($('#region_label').length > 0) {
      document.getElementById("region_label").disabled = false;
     }
  document.getElementById("line_label").disabled = false;
    if (document.getElementById("varyingLineStyle_CB")) {
            document.getElementById("varyingLineStyle_CB").disabled = false;
    }
  document.getElementById("ageAprox_CB").disabled = false;
//  document.getElementById("clearFiltersButton").disabled = false;
  document.getElementById("clearFiltersButton").classList.remove("disabled");
  document.getElementById("fullExtentButton").disabled = false;
  ageSlider.removeAttribute('disabled');
  aliveSlider.removeAttribute('disabled');
  zoomSlider.removeAttribute('disabled');

  // allow pointerevents (e.g. tooltips) on rectangles and data  
  $('.middleGroup').css('pointer-events', 'auto');

    // git
    d3.request("biography/csv/Chronographics Biographies(5_7_2026).csv") 
    //local dev
    //d3.request("https://pages.uoregon.edu/infographics/dev/timelineV2/pages/biography/csv/PriestleyBioData_Feb2_2023(2_20_2024).csv")
      .mimeType("text/csv")
      .response(function (xhr) { return d3.csvParse(xhr.responseText); })
      .get(function(data) {
          data.forEach(function(d){
                // check if this case is in the current MANUAL case filter
                // console.log(d["case"])
                var testCase="";
                if (d["case"] != "" && d["case"] != "none") {
                    testCase = parseInt(d["case"].match(/\d+/)[0]) // get the "case" as an integer
                } else {
                     testCase = false;
                    // while case is missing
                    // (d["case"]="case1")
                    // testCase = 1 // 
                }
                if(boolCases[testCase]){  

                    var someGuy = [] // dictionary for a single guy
                    
                    // If displayName and Name are null, this is a blank line. Skip it.
                    if(someGuy["DisplayName"] == "" && someGuy["Name"]== "") return false;
                    
                    // If Discrepancy is 1800, this person is only in the 1800 list, skip it.
                    if(someGuy["discrepancy"] == "1800") return false;
                
                    // store ID a couple ways
                    someGuy["UO_ID"] = "ID" + parseInt(d["UO_ID"]);
                    var thisID = someGuy["UO_ID"]
                    // someGuy["Watkins_ID"] = parseInt(d["Watkins_ID"]);
                    someGuy["BioName"] = d["Bio Name"];
                    someGuy["BioSource"] = d["BioSource"];
                    someGuy["Biography"] = d["Biography"];
                    someGuy["Alternate_Name"] = d["Alternate_name"];
                    someGuy["Alternate_ID"] = parseInt(d["Alternate_ID"]);
                    someGuy["DisplayName"] = d["NameOnChart"];
                    someGuy["Name"] = d["NameInIndex"]; 
                    // If displayName is null, get the name
                    if(someGuy["DisplayName"] == "") someGuy["DisplayName"]  = someGuy["Name"];     

                    someGuy["DeathPrecision"] = d["DeathPrecision"];
                    someGuy["BornPrecision"] = d["BornPrecision"]; 
                    someGuy["BirthDate"] = parseInt(d["BirthDate"]);
                    someGuy["AproxBirthDate"] = parseInt(d["aproxBirthDate"]);
                    someGuy["LifePrecision"] = d["LifeLength Precision"]; 
                    someGuy["LifeLength"] = parseInt(d["LifeLength"]); 
                    someGuy["AlivePrecision"] = d["Alive precision"];
                    someGuy["AliveDate"] = parseInt(d["AliveDate"]);
                    someGuy["Continent"] = d["continent"] // previously continentName
                    someGuy["OnChartCategory"] = d["OnChartCategory"]; // add the full text for profession
                    someGuy["DeathDate"] = parseInt(d["DeathDate"]);
                    someGuy["AproxDeathDate"] = parseInt(d["aproxDeathDate"]);
                    if(d["Sex or gender V2"] != "missing from OpenRefine results"){
                        someGuy["gender"] = d[ "Sex or gender V2"];  // previously gender, "sex or gender"
                    }
                    
                    // profession codes
                     if(d["Index Category 1"] != ""){
                       someGuy["profession"] = d["Index Category 1"].replace(/\.$/, ""); // remove periods  
                    }else if (d["OnChartCategory"] == "Statesmen and Warriors"){
                        someGuy["profession"] = "X"
                    }                   
                    
                    
                    //someGuy["lat"] = d["LAT BP"]; // previously LAT problem with |
                    //someGuy["lon"] = d["LON BP"]; //previously LON
                    if(d["continent"] != "0"){
                        someGuy["Continent"] = d["continent"] // previously continentName
                    }
                    if(d["country"] != "0"){
                        someGuy["Country"] = d["country"] // previously countryName
                    }
                    someGuy["Region"] = d["Region_final"]//new

                    someGuy["case"] = d["case"].trim(); // original case code from the data
                    someGuy["VisualCase"] = d["VisualCase"].trim(); // visual-case label used for display/menu grouping
                    someGuy["ExpectedVisualCase"] = lookupExpectedVisualCaseFromOriginalCase(someGuy["case"]); // expected visual case given original index case
                    someGuy["lineType"] = someGuy["case"]; // keep existing drawing logic on the original case code
                    someGuy["indexText"] = null; // in tab2 (TO DO, create indext when reading in data instead of on the fly)

                    // calculate aprox age
                    someGuy["AproxAge"]  = someGuy["AproxDeathDate"]- someGuy["AproxBirthDate"];

                    
                    // someGuy["Link"] = d["WikiLink"] // previously Wiki_Link
                    // //someGuy["Wikipedia2"] = d["Wikipedia"]

                    
                    if(d["WikiLink"] != ""){
                       // check for wikilink
                       someGuy["Link"] = d["WikiLink"] // previously Wiki_Link
                    }else if (d["Alternate Link"]!= ""){
                        //check for google book link
                        someGuy["Link"] = d["Alternate Link"]
                    } else {
                        someGuy["Link"] = "unknown"
                    }

        //            console.log (someGuy["Name"] + d["On Chart: Line #"] ); // debug

                    if(d["On Chart: Line #"] > 0 && someGuy["lineType"]!= ""){
                        //console.log("yes On Chart: Line #" + d["On Chart: Line #"])
                        someGuy["LineNumber"] = parseInt(d["On Chart: Line #"]) + parseInt(lnDict[d["OnChartCategory"]]);
                        allPeople[thisID] = new Array(); // set thisID as a key in the allPeople Dictionary
                        allPeople[thisID].push(someGuy); // put the values in the dictionary

                    } else { // we don't know where to draw it
                       // console.log("no On Chart: Line #" + d["On Chart: Line #"])

                        noLineNumber.push(someGuy); // record who it was
                        // console.log (someGuy["Name"] + d["On Chart: Line #"] ); // debug
                        return false; // break out, don't try to draw it.
                    };
                }        
            });
            
            sortPeople(allPeople, true); // second argument is a string that will evaluate to things you want to keep in the chart
            //sortPeople(allPeople, "someGuy.LifeLength < 50 && someGuy.LifeLength != null"); // second argument is a string that will evaluate to things you want to keep in the chart
            //drawBackgroundLines(); // just draw the grey lines and names
            // console.log("calling draw lines");
            drawLines(); // draw all the lines and names
//            drawCase1();
//            drawCase2()

            document.getElementById("loader").style.display = "none";  /* turn off the loader */
            document.body.classList.remove('waiting');
                setFilterControlsEnabled(true);
                logChartReady("loadBioData");

         // },
         // error: function(e) {
         //   // your error callback here!
         //   console.log("Error in reading data!!");
         //   console.log(e);
         //   document.getElementById("loader").style.display = "none";  /* turn off the loader */
         //   document.body.classList.remove('waiting');
         // }
     });
    var now = new Date();
    // console.log(now.toUTCString()+ " end of loadBioData()")
}

// LOAD people descriptions. 
// Note: Download from google sheets as XLS then save as csv UTF-8 to include French/special characters e.g check em dashes in  "JANSEN..."
// d3.csv("biography/csv/WatkinsData8_17_2023.csv") // when live
// // for dev to avoid CORS problems
// //Watkins
// //d3.request("https://pages.uoregon.edu/infographics/dev/timelineV2/pages/biography/csv/WatkinsData8_17_2023.csv")
//     .mimeType("text/csv")
//     .response(function (xhr) { return d3.csvParse(xhr.responseText); })
//     .get(function(data) {
//           data.forEach(function(d){
//               var id = d["WATKINS_ID"];      
//               watkinsDict[id] = [d["NAME"],d["BIO"],d["SOURCE"]];
//           })
//     });

//Aikin
d3.csv("biography/csv/Alternate_Dictionary.csv") // when live
//d3.request("https://pages.uoregon.edu/infographics/dev/timelineV2/pages/biography/csv/Alternate_Dictionary.csv")
    .mimeType("text/csv")
    .response(function (xhr) { return d3.csvParse(xhr.responseText); })
    .get(function(data) {
          data.forEach(function(d){
              var id = d["ALTERNATE_ID"];      
              alternateDict[id] = [d["ALTERNATE_NAME"],d["BIO"],d["SOURCE"],d["Biography source"]];
          })
    });
           

// console.log("b");
// console.log("someGuy[DisplayName]", someGuy["DisplayName"]); // debug (list everyone!)

// second argument is true OR a STRING that will evaluate to things you want to keep in the chart e.g. true or "someGuy.Name.startsWith('S')"
function filterPeople(thesePeople, peopleFilter) { 
   var now = new Date();
   // console.log(now.toUTCString()+" start of filterPeople");
  /* turn on the loader */
    // document.getElementById("loader").style.display = "block";
    
   var filterList = d3.selectAll('#filterResultsBox') // just get the filter list once, so we don't have to check the whole DOM for divs within it
   
    // console.log(peopleFilter);
    // if filter is anything but "true" look at them one by one
    // set all people as hidden, then remove the "hidden" from people that match the filter
    if(peopleFilter != true){ 

        // Compile predicate and populate currentFilterMatchSet if needed
        try {
            var predicate = compilePeopleFilterPredicate(peopleFilter);
            if (predicate) {
                currentFilterMatchSet = new Set();
                Object.keys(thesePeople).forEach(function(key) {
                    var p = thesePeople[key][0];
                    try {
                        if (predicate(p)) currentFilterMatchSet.add(key);
                    } catch (e) { /* ignore individual eval errors */ }
                });
            } else {
                currentFilterMatchSet = null;
            }
        } catch (e) {
            // console.log('Failed to compile filter predicate', e);
            currentFilterMatchSet = null;
        }

        people=[]; //clear out the current people list
        ////document.getElementById("filterResultsBox").innerHTML =""
        //var filterCount = 0;

        // console.log("filtering: " + Object.keys(thesePeople).length);
        // make all people invisible
        peopleGroup.selectAll(".people-lines,.circles").classed("hiddenGuy",true); // add the display-none class to chart name
        if (drawNames) peopleGroup.selectAll(".timeline-text").classed("hiddenGuy",true); // add the display-none class to chart name
        filterList.selectAll(".f-list").classed("d-none",true); // add the display-none class to names in the filter list
        filterList.selectAll(".f-list").classed("d-block",false); // remove the display-block class to names in the filter list
       // d3.selectAll("#list-" + id).classed("hidden",true); // remove the display-block class from list name
        
        // add back those that match
        if (currentFilterMatchSet) {
            currentFilterMatchSet.forEach(function(id) {
                someGuy = allPeople[id][0];
                peopleGroup.selectAll("#"+id+".people-lines,#"+id+".circles").classed("hiddenGuy",false); // add the display-none class to chart lines
                if (drawNames) peopleGroup.selectAll("#"+id+".timeline-text").classed("hiddenGuy",false); // add the display-none class to chart name
                filterList.selectAll("#list-" + id).classed("d-none",false); // if they match, remove the display-none 
                filterList.selectAll("#list-" + id).classed("d-block",true); // if they match, add the display-block class
                people.push(someGuy); // list of all those that match this filter
            });
        }

        // deal with the people filtered
        document.getElementById("numPeople").innerHTML =  people.length + " of " + Object.keys(thesePeople).length + " people";
        // if (people.length < 10) { console.log(people); } // for debug: print the people that match, only when fewer then 10
    } else {
        // no filter applied
        // Any = no filter
        currentFilterMatchSet = null;
        filterList.selectAll(".hidden").classed("hiddenGuy",false); // remove the display-none class from listed names
        filterList.selectAll(".hidden").classed("d-block",true); // add the display-block class to the listed names
        d3.selectAll(".hidden").classed("hidden",false);  // remove the hidden 
        peopleGroup.selectAll(".people-lines,.circles").classed("hiddenGuy",false); // remove the display-none class from the chart
        if (drawNames) peopleGroup.selectAll(".timeline-text, .timeline-text-background").classed("hiddenGuy",false); // remove the display-none class for names 
       // if (!drawNames) peopleGroup.selectAll(".timeline-text").classed("d-none",true); // add the display-none class for names 

        document.getElementById("numPeople").innerHTML =  Object.keys(thesePeople).length + " people";
    }
   // document.getElementById("loader").style.display = "none"; 
   later = new Date();
   diff = later-now;
   // console.log(later.toUTCString()+" end of filterPeople")
    setFilterControlsEnabled(true);
}


function sortPeople(thePeople, peopleFilter) { 
    // console.log("beginning of sort people" + Date())
    
   // clear out lists    
   people = [];
   solidLines = [];
   threeBegin = [];
   threeBeginTwoEnd = [];
   oneBegin = [];
   oneEndUnder = [];
   oneEndUnder2 = [];
   oneEnd = [];
   oneEnd2 = [];
   threeBeginOneEnd = [];
   unsure = [];
   solid2 = [];
   unsure2 = [];
   sevenDots = [];
   threeEnd = [];
  // noLineNumber = [];
    visualPeople = [];
    
    // console.log("filter "+ peopleFilter);  // logs current filter

    var peopleFilterPredicate = compilePeopleFilterPredicate(peopleFilter);
    currentFilterMatchSet = peopleFilterPredicate ? new Set() : null;
    
    // iterate through the dictionary
    // access the info about a person using: allPeople[key][0].FIELD_NAME
    var useVisualCases = currentLineSystem === "visual";
    $.each(allPeople, function(key) {
        //console.log(key, value[0].Name);
        
        var person = allPeople[key][0];
        // evaluate filters against the loaded person record ... keep chart lists keyed by id
        someGuy = person;
        
        //thePeople.forEach(function(someGuy){

        var testCase = parseInt(allPeople[key][0].lineType.match(/\d+/)[0]) // this person is in the list of cases we are drawing. e.g. "case3" -> 3. Mostly used to speed drawing during development
        var keepAllIndexCases = currentLineSystem === "index";
        var matchesFilter = peopleFilterPredicate ? peopleFilterPredicate(person) : true;

        // build the set once here so later passes can reveal only the matching ids without rerunning the filter
        if (currentFilterMatchSet && matchesFilter) {
            currentFilterMatchSet.add(key);
        }

        if (useVisualCases) {
            people.push(key);
            if (matchesFilter) visualPeople.push(key);
        } else if (keepAllIndexCases || (boolCases[testCase] && matchesFilter)){ // only do the rest if the person matches the manual boolean and the current filter

        // sort the people into their lists based on the case listed in the  spreadsheet
        //console.log("test case " + testCase) 
        people.push(key); // list of all those that match this filter, just push the key
        //console.log(someGuy)
        //console.log(testCase)
//          if(someGuy.name == "Suetonius"){
//              console.log(someGuy)
//          }
        switch(testCase){
            // try making this an array!!!

            case 1:                    
                    //console.log("solid line (case1)");
                    solidLines.push(key); 
                    break;
            case 2:
                    //console.log("3 starting dots (case2)");
                    threeBegin.push(key);
                    break;
            case 3:
                    //console.log("3 starting dots and 2 ending (case3)");
                    threeBeginTwoEnd.push(key);
                    break;
            case 4:
                    //console.log("1 dot beneath beginning (case4)");
                    oneBegin.push(key);
                    break;
            case 5:
                    //console.log("1 dot beneath ending (case5)");
                    oneEndUnder.push(key);
                    break;
            case 6:
                    //console.log("solid line (case6)");
                    solid2.push(key);
                    break;
            case 7:
                    //console.log("1 dot end (case7)");
                    oneEnd.push(key);
                    break;
            case 8:
                    //console.log("3 starting dots and 1 ending (case8)");
                    threeBeginOneEnd.push(key);
                    break;
            case 11:
                    //console.log("1 dot beneath ending 2 (case11)");
                    oneEndUnder2.push(key); 
                    break;
            case 12:
                    //console.log("no line number (case12)");
                    // not pushing... were already pushed on read in
                    break;
            case 13:
                    //console.log("seven dots (case13)");
                    sevenDots.push(key); 
                    break;
            case 14:
                    //console.log("1 dot end 2 (case14)");
                    oneEnd2.push(key);
                    break;
            case 15:
                    //console.log("three end (case15)");
                    threeEnd.push(key);
                    break;
            default:
                unsure.push(key); 
        } // switch





      } // if people filter      
	});

    // console.log("All people: ")
    // console.log(Object.keys(allPeople).length) // all people read in
    // console.log("filtered people " + people.length) // list of those that are in this filter.
   //document.getElementById("numPeople").innerHTML = " " + people.length + "people";
    // document.getElementById("numPeople").innerHTML = "(" + allPeople.length + ")";

   
   //  // logs number of people in each category
   // console.log("1. solidLines " + solidLines.length)
   // console.log("2. threeBegin " + threeBegin.length)
   // console.log("3. threeBeginTwoEnd " + threeBeginTwoEnd.length)
   // console.log("4. oneBegin " + oneBegin.length)
   // console.log("5. oneEndUnder " + oneEndUnder.length)
   // console.log("6. solid2 (solid) " + solid2.length)
   // console.log("7. oneEnd " + oneEnd.length)
   // console.log("8. threeBeginOneEnd " + threeBeginOneEnd.length)
   // console.log("10. unsure2 " + unsure2.length)
   // console.log("11. oneEndUnder2 " + oneEndUnder2.length)
   // console.log("13. seven dots " + sevenDots.length)
   // console.log("14. oneEnd2 " + oneEnd2.length)
   // console.log("15. threeEnd " + threeEnd.length)
   // console.log("12. noLineNumber (not updated on redraw) " + noLineNumber.length)
   // console.log("9 (don't fit a case). people " + unsure.length)
	
   var numPeopleDrawn = solidLines.length + threeBegin.length + threeBeginTwoEnd.length + oneBegin.length + oneEndUnder.length + oneEndUnder2.length + oneEnd.length + oneEnd2.length + threeBeginOneEnd.length + solid2.length + sevenDots.length  + threeEnd.length;
   var numPeopleDrawn = people.length;
   //document.getElementById("numPeople").innerHTML = "(" + numPeopleDrawn + ")";
   document.getElementById("numPeople").innerHTML =  numPeopleDrawn + " people";

   
   // document.getElementById("filterResultsBox").innerHTML = people.map(function(thisGuy){
   //          //var id= thisGuy.DisplayName.replace(/[\'\. ,:-]+/g, "-")
   //              return "<element onClick='resultClicked()' class='d-block f-list' id='list-"+ thisGuy.UO_ID + "\'>" + thisGuy.DisplayName + "</element>"
   //          }).sort(function (a, b) {
   //                return a.DisplayName - b.DisplayName;
   //          }).join('');

    people = people.sort((a, b) => d3.ascending(allPeople[a][0].Name, allPeople[b][0].Name)) // sort by name in index
    
    var filterList = d3.select("#filterResultsBox")
    var sectionList = d3.select("#selecctionResultsBox")
    
    filterList.text("")// remove "loading people" text
    filterList.selectAll("element")
     .data(people)
     .enter().append("div")
     .text(function(thisGuy) { return allPeople[thisGuy][0].Name; })
     .attr("id", function(thisGuy) { return "list-"+ thisGuy; })
//     .sort(d3.ascending)
//     .sort((a, b) => d3.descending(a.DisplayName, b.DisplayName)) // sort by displayname
     .attr('class','d-block f-list')
     .attr('style','direction: ltr')
     .attr('onClick','resultClicked()');


   // // if there is a filter, put names in the results box.
   // if(peopleFilter == true){
   //  document.getElementById("filterResultsBox").innerHTML =  "No filter applied";

   // } else {
   // 		// clear out the selection box
   // 		document.getElementById("filterResultsBox").innerHTML =""
   // 		// add list to the selection box
   // 		for (i in people){

   // 			var thisGuyID= people[i].DisplayName.replace(/[\'\. ,:-]+/g, "-")
   // 			document.getElementById("filterResultsBox").innerHTML += "<element onClick='resultClicked()' id='list-"+ thisGuyID + "''>" + people[i].DisplayName + "</element><br>";

   // 		}
   //      // document.getElementById("filterResultsBox").innerHTML = "<element onClick='resultClicked()'>" +  people.map(a => a.DisplayName).sort().join("</element><br><element onClick='resultClicked()'>") + "</element>";
   // }




   now = new Date();
   // console.log(now.toUTCString()+ " end of sortPeople()") 
    return;
}

// draw the grey names first these won't be redrawn
function drawBackgroundLines(){
    // console.log("drawing background lines")
        // draw the people from this case on the map
    if (case1){
             // % %  Case 1: Solid lines - Background  % % 
            var dataEnter = peopleGroup.selectAll("div")
                .data(solidLines)
                .enter();
            // Add the lines
            dataEnter.append("line")
                .attr("class", "people-lines-background")
                .attr("x1", function(d){
                    return xScale(parseDate((allPeople[d][0].DeathDate - allPeople[d][0].LifeLength).toString()));
                })
                .attr("y1", function(d){ return yScale(allPeople[d][0].LineNumber); })
                .attr("x2", function(d){
                    return xScale(parseDate(allPeople[d][0].DeathDate.toString()));
                })
                .attr("y2", function(d){ return yScale(allPeople[d][0].LineNumber); })
                .attr("stroke", backgroundLineColor)
                .attr("stroke-width", backgroundLineWidths)
            // Add the text
            if (drawNames) {
            dataEnter.append("text")
                .attr("class", "timeline-text-background")
                .attr("text-anchor", "middle")
                .text(function(d){ return allPeople[d][0].DisplayName; })
                .attr("x", function(d){
                var start = (allPeople[d][0].DeathDate-allPeople[d][0].LifeLength);
                    return xScale(parseDate((start + allPeople[d][0].LifeLength/2).toString()));
                })
                .attr("y", function(d){ return yScale(allPeople[d][0].LineNumber)-lineOffset; })
                .style("fill", backgroundLineColor)
            } 
    }  
    if (case2){
            // % % % % Case 2: Solid line with THREE dots at the BEGIN - Background % % % % %
   
        var threeBeginEnter = peopleGroup.selectAll("div")
            .data(threeBegin)
            .enter();
            // Add the lines
            threeBeginEnter.append("line")
                .attr("class", "people-lines-background")
                .attr("x1", function(d){
        //        console.log("threeBegin " + allPeople[d][0].DisplayName); // who is this? // old way to access
                //console.log("threeBegin " + allPeople[d][0].DisplayName) // dictionary way to access
                
                    return xScale(parseDate(allPeople[d][0].DeathDate - 30));
                })
                .attr("y1", function(d){ return yScale(allPeople[d][0].LineNumber); })
                .attr("x2", function(d){
                    return xScale(parseDate(allPeople[d][0].DeathDate));
                })
                .attr("y2", function(d){ return yScale(allPeople[d][0].LineNumber); })
                .attr("stroke", backgroundLineColor)
                .attr("stroke-width", backgroundLineWidths);
            //add the text
            if (drawNames) {
                threeBeginEnter.append("text")
                    .attr("class", "timeline-text-background")
                    .attr("text-anchor", "middle")
                    .text(function(d){ return allPeople[d][0].DisplayName; })
                    .attr("x", function(d){     
                        var start = (allPeople[d][0].DeathDate-15);
                        return xScale(parseDate(start));
                    })
                    .attr("y", function(d){ return yScale(allPeople[d][0].LineNumber)-lineOffset; })
                    .style("fill", backgroundLineColor);
                // add the circles
                [-35, -40, -45].forEach(function(j){
                threeBeginEnter.append("circle")
                    .attr("class", "circles-background")
                    .attr("cx", function(d){
                        return xScale(parseDate(parseInt(allPeople[d][0].DeathDate) + j))
                    })
                    .attr("cy", function(d){ return yScale(allPeople[d][0].LineNumber); })
                        .attr("r", dotSize)
                        .attr("stroke-width", "0.4px")
                        .style("fill", backgroundLineColor);
                })
            }

    }

    if (case3){
             // % % % Case 3: Solid lines with THREE dots at the BEGIN and TWO dots at the END - background % % % 
                    // draw the people from this case on the map  
            // no map on new page 
      //  if (page == "biographyMap.html"){   drawPeopleOnMap(threeBeginTwoEnd);}   

            var threeBeginTwoEndEnter = peopleGroup.selectAll("div")
                .data(threeBeginTwoEnd)
                .enter();
            // Add the lines
            threeBeginTwoEndEnter.append("line")
                .attr("class", "people-lines-background")
                .attr("x1", function(d){
        //        console.log("threeBeginTwoEnd " + allPeople[d][0].DisplayName); // who is this?
                    return xScale(parseDate((allPeople[d][0].AliveDate - 13).toString()));
                })
                .attr("y1", function(d){ return yScale(allPeople[d][0].LineNumber); })
                .attr("x2", function(d){
                    return xScale(parseDate((allPeople[d][0].AliveDate + 7).toString()));
                })
                .attr("y2", function(d){ return yScale(allPeople[d][0].LineNumber); })
                .attr("stroke", backgroundLineColor)
                .attr("stroke-width", backgroundLineWidths)

            // Add the text
            if (drawNames) {
                threeBeginTwoEndEnter.append("text")
                    .attr("class", "timeline-text-background")
                    .attr("text-anchor", "middle")
                    .text(function(d){ return allPeople[d][0].DisplayName; })
                    .attr("x", function(d){     
                    var start = (allPeople[d][0].AliveDate - 7);
                        return xScale(parseDate(start.toString()));
                    })
                    .attr("y", function(d){ return yScale(allPeople[d][0].LineNumber)-lineOffset; })
                    .style("fill", backgroundLineColor);
            }

                // Add the 5 dots (run through the data 5 times)
                [-18, -23, -28, 12,17].forEach(function(j){
                threeBeginTwoEndEnter.append("circle")
                    .attr("class", "circles-background")
                    .attr("cx", function(d){
                        return xScale(parseDate((parseInt(allPeople[d][0].AliveDate) + j).toString()))
                    })
                    .attr("cy", function(d){ return yScale(allPeople[d][0].LineNumber); })
                        .attr("r", dotSize)
                        .attr("stroke-width", "0.4px")
                        .style("fill", backgroundLineColor);
                })

    }
    if (case4) {
            // % % % % % % Case 4: Solid line with ONE dot at the BEGINNING - Background% % %  
        // no map on new page 
      //  if (page == "biographyMap.html"){   drawPeopleOnMap(oneBegin);  }       

            var oneBeginEnter = peopleGroup.selectAll("div")
                .data(oneBegin)
                .enter();
            // Add the lines
            oneBeginEnter.append("line")
                .attr("class", "people-lines-background")
                .attr("x1", function(d){
        //        console.log("oneBegin " + allPeople[d][0].DisplayName); // who is this?
                    return xScale(parseDate((allPeople[d][0].DeathDate - allPeople[d][0].LifeLength).toString()));
                })
                .attr("y1", function(d){ return yScale(allPeople[d][0].LineNumber); })
                .attr("x2", function(d){
                    return xScale(parseDate(allPeople[d][0].DeathDate.toString()));
                })
                .attr("y2", function(d){ return yScale(allPeople[d][0].LineNumber); })
                .attr("stroke", backgroundLineColor)
                .attr("stroke-width", backgroundLineWidths)

            // Add the text
            if (drawNames) {
            oneBeginEnter.append("text")
                .attr("class", "timeline-text-background")
                .attr("text-anchor", "middle")
                .text(function(d){ return allPeople[d][0].DisplayName; })
                .attr("x", function(d){
                var start = (allPeople[d][0].DeathDate-allPeople[d][0].LifeLength);
                    return xScale(parseDate((start + allPeople[d][0].LifeLength/2).toString()));   
                })
                .attr("y", function(d){ return yScale(allPeople[d][0].LineNumber)-lineOffset; })
                .style("fill", backgroundLineColor);
            }

            // Add the one dot below
            oneBeginEnter.append("circle")
                .attr("class", "circles-background")
                .attr("cx", function(d){
                return xScale(parseDate((allPeople[d][0].DeathDate - allPeople[d][0].LifeLength + 2).toString()));
                })
                .attr("cy", function(d){ return yScale(allPeople[d][0].LineNumber)+(lineOffset*1.2); })
                .attr("r", dotSize)
                .style("fill", backgroundLineColor)
                .attr("stroke-width", "0.4px");


    }

    if (case5){
        // % % % %  CASE 5:  Solid line with ONE dot UNDER at the END - Background % % % % % % 
        // draw the people from this case on the map  
            // no map on new page 
      //  if (page == "biographyMap.html"){   drawPeopleOnMap(oneEndUnder); }        

            var oneEndUnderEnter = peopleGroup.selectAll("div")
                .data(oneEndUnder)
                .enter();
            // Add the lines
            oneEndUnderEnter.append("line")
                .attr("class", "people-lines-background")
                .attr("x1", function(d){
        //        console.log("oneEndUnder " + allPeople[d][0].DisplayName); // who is this?
                return xScale(parseDate((allPeople[d][0].DeathDate - allPeople[d][0].LifeLength).toString()));
                })
                .attr("y1", function(d){ return yScale(allPeople[d][0].LineNumber); })
                .attr("x2", function(d){
                return xScale(parseDate(allPeople[d][0].DeathDate.toString()));
                })
                .attr("y2", function(d){ return yScale(allPeople[d][0].LineNumber); })
                .attr("stroke", backgroundLineColor)
                .attr("stroke-width", backgroundLineWidths)

            // Add the text
            if (drawNames) {
            oneEndUnderEnter.append("text")
                .attr("class", "timeline-text-background")
                .attr("text-anchor", "middle")
                .text(function(d){ return allPeople[d][0].DisplayName; })
                .attr("x", function(d){
                var start = (allPeople[d][0].DeathDate-allPeople[d][0].LifeLength);
                return xScale(parseDate((start + allPeople[d][0].LifeLength/2).toString()));   
                })
                .attr("y", function(d){ return yScale(allPeople[d][0].LineNumber)-lineOffset; })
                .style("fill", backgroundLineColor);    
            }

            // Add the one dot below
            oneEndUnderEnter.append("circle")
                .attr("class", "circles-background")
                .attr("cx", function(d){
                return xScale(parseDate((allPeople[d][0].DeathDate - 2).toString()));
                })
                .attr("cy", function(d){ return yScale(allPeople[d][0].LineNumber)+(lineOffset*1.2); })
                .attr("r", dotSize)
                .style("fill", backgroundLineColor);
    }

    if (case6){
        // % % % % % Case 6: solid2 - Background % % % % % % % % % % % % 
            // draw the people from this case on the map 
            // no map on new page 
      //  if (page == "biographyMap.html"){drawPeopleOnMap(solid2); }

            var solid2Enter = peopleGroup.selectAll("div")
                .data(solid2)
                .enter();
            // Add the lines
            solid2Enter.append("line")
                .attr("class", "people-lines-background")
                .attr("x1", function(d){
                return xScale(parseDate((allPeople[d][0].DeathDate).toString()));
                })
                .attr("y1", function(d){ return yScale(allPeople[d][0].LineNumber); })
                .attr("x2", function(d){
                return xScale(parseDate((allPeople[d][0].DeathDate-allPeople[d][0].LifeLength).toString()));
                })
                .attr("y2", function(d){ return yScale(allPeople[d][0].LineNumber); })
                .attr("stroke", backgroundLineColor)
                .attr("stroke-width", backgroundLineWidths)
                
            // Add the text
            if (drawNames) {
            solid2Enter.append("text")
                .attr("class", "timeline-text-background")
                .attr("text-anchor", "middle")
                .text(function(d){ return allPeople[d][0].DisplayName; })
                .attr("x", function(d){     
                var start = (allPeople[d][0].DeathDate-allPeople[d][0].LifeLength);
                return xScale(parseDate((start+allPeople[d][0].LifeLength/2).toString()));
                })
                .attr("y", function(d){ return yScale(allPeople[d][0].LineNumber)-lineOffset; })
                .style("fill", backgroundLineColor);
            }
    }

    if (case7){
            // % % % %  CASE 7: Solid line with ONE dot at the END - background % % % % %  
            // draw the people from this case on the map  
            // no map on new page 
            //  if (page == "biographyMap.html"){   drawPeopleOnMap(oneEnd); }

            var oneEndEnter = peopleGroup.selectAll("div")
                .data(oneEnd)
                .enter();
            // Add the lines
            oneEndEnter.append("line")
                .attr("class", "people-lines-background")
                .attr("x1", function(d){
        //        console.log("oneEnd " + allPeople[d][0].DisplayName); // who is this?
                    return xScale(parseDate((allPeople[d][0].BirthDate).toString()));
                })
                .attr("y1", function(d){ return yScale(allPeople[d][0].LineNumber); })
                .attr("x2", function(d){
                    return xScale(parseDate(allPeople[d][0].DeathDate.toString()));
                })
                .attr("y2", function(d){ return yScale(allPeople[d][0].LineNumber); })
                .attr("stroke", backgroundLineColor)
                .attr("stroke-width", backgroundLineWidths)
                
            // Add the text
            if (drawNames) {
                oneEndEnter.append("text")
                    .attr("class", "timeline-text-background")
                    .attr("text-anchor", "middle")
                    .text(function(d){ return allPeople[d][0].DisplayName; })
                    .attr("x", function(d){
                    var half = allPeople[d][0].BirthDate + (allPeople[d][0].DeathDate-allPeople[d][0].BirthDate)/2;
                    var bday = allPeople[d][0].BirthDate*1;
                    //console.log("half", bday, half)
                    return xScale(parseDate(half.toString()));  
                    })
                    .attr("y", function(d){ return yScale(allPeople[d][0].LineNumber)-lineOffset; })
                    .style("fill", backgroundLineColor);
            }

            // Add the one dot 
            oneEndEnter.append("circle")
                .attr("class", "circles-background")
                .attr("cx", function(d){
                return xScale(parseDate((allPeople[d][0].DeathDate).toString())) + 2;
                })
                .attr("cy", function(d){ return yScale(allPeople[d][0].LineNumber); })
                .attr("r", dotSize)
                .attr("stroke-width", "0.4px")
                .style("fill", backgroundLineColor);
    }

    if (case8){
        // % % % CASE 8: Solid lines with THREE dots at the BEGIN and ONE dot at the END - background % % %
        // draw the people from this case on the map  
            // no map on new page 
        //  if (page == "biographyMap.html"){   drawPeopleOnMap(threeBeginOneEnd); }

            var threeBeginOneEndEnter = peopleGroup.selectAll("div")
                .data(threeBeginOneEnd)
                .enter();
            // Add the lines
            threeBeginOneEndEnter.append("line")
                .attr("class", "people-lines-background")
                .attr("x1", function(d){
                return xScale(parseDate((allPeople[d][0].DeathDate - 30).toString()));
                })
                .attr("y1", function(d){ return yScale(allPeople[d][0].LineNumber); })
                .attr("x2", function(d){
                return xScale(parseDate(allPeople[d][0].DeathDate.toString()));
                })
                .attr("y2", function(d){ return yScale(allPeople[d][0].LineNumber); })
                .attr("stroke", backgroundLineColor)
                .attr("stroke-width", backgroundLineWidths)
               
            // Add the text
            if (drawNames) {
                threeBeginOneEndEnter.append("text")
                    .attr("class", "timeline-text-background")
                    .attr("text-anchor", "middle")
                    .text(function(d){ return allPeople[d][0].DisplayName; })
                    .attr("x", function(d){     
                    var start = (allPeople[d][0].DeathDate-15);
                    return xScale(parseDate(start.toString()));
                    })
                    .attr("y", function(d){ return yScale(allPeople[d][0].LineNumber)-lineOffset; })
                    .style("fill", backgroundLineColor);
            }

            // Add the 4 dots (run through the data 4 times)
            [-45, -40, -35, 5].forEach(function(j){
            threeBeginOneEndEnter.append("circle")
                .attr("class", "circles-background")
                .attr("cx", function(d){
                            return xScale(parseDate((parseInt(allPeople[d][0].DeathDate) + j).toString()))
                })
                .attr("cy", function(d){ return yScale(allPeople[d][0].LineNumber); })
                .attr("r", dotSize)
                .attr("stroke-width", "0.4px")
                .style("fill", backgroundLineColor);
                })
    }

    if (case11){
            // % % % %  CASE 11:  Solid line with ONE dot UNDER at the END - background % % % % % % 
            // draw the people from this case on the map  
            // no map on new page 
            //  if (page == "biographyMap.html"){   drawPeopleOnMap(oneEndUnder2); }   
                 

            var oneEndUnder2Enter = peopleGroup.selectAll("div")
                .data(oneEndUnder2)
                .enter();
            // Add the lines
            oneEndUnder2Enter.append("line")
                .attr("class", "people-lines-background")
                .attr("x1", function(d){
        //        console.log("oneEndUnder " + allPeople[d][0].DisplayName); // who is this?
                return xScale(

                    parseDate((allPeople[d][0].BirthDate + allPeople[d][0].LifeLength).toString()));
                    // console.log(allPeople[d][0].DisplayName)
                })
                .attr("y1", function(d){ return yScale(allPeople[d][0].LineNumber); })
                .attr("x2", function(d){
                return xScale(parseDate(allPeople[d][0].BirthDate.toString()));
                })
                .attr("y2", function(d){ return yScale(allPeople[d][0].LineNumber); })
                .attr("stroke", backgroundLineColor)
                .attr("stroke-width", backgroundLineWidths)

                //add text
            if (drawNames) {
                oneEndUnder2Enter.append("text")
                .attr("class", "timeline-text-background")
                .attr("text-anchor", "middle")
                .text(function(d){ return allPeople[d][0].DisplayName; })
                .attr("x", function(d){
                var start = (allPeople[d][0].BirthDate);
                return xScale(parseDate((start + allPeople[d][0].LifeLength/2).toString()));   
                })
                .attr("y", function(d){ return yScale(allPeople[d][0].LineNumber)-lineOffset; })
                .style("fill", backgroundLineColor);
            }
                // Add the one dot below
            oneEndUnder2Enter.append("circle")
                .attr("class", "circles-background")
                .attr("cx", function(d){
                return xScale(parseDate(((allPeople[d][0].BirthDate + allPeople[d][0].LifeLength) - 2).toString()));
                })
                .attr("cy", function(d){ return yScale(allPeople[d][0].LineNumber)+(lineOffset*1.2); })
                .attr("r", dotSize)
                .attr("stroke-width", "0.4px")
                .style("fill", backgroundLineColor);
    }

    if (case13){
            // % % % Case 13: seven dots - Background% % % 
            // draw the people from this case on the map  
            // no map on new page 
            //  if (page == "biographyMap.html"){   drawPeopleOnMap(sevenDots);    }     

            var sevenDotsEnter = peopleGroup.selectAll("div")
                .data(sevenDots)
                .enter();
            // Add the text
            if (drawNames) {
            sevenDotsEnter.append("text")
                .attr("class", "timeline-text-background")
                .attr("text-anchor", "middle")
                .text(function(d){ return allPeople[d][0].DisplayName; })
                .attr("x", function(d){     
                    var start = (allPeople[d][0].AliveDate - 2);
                    return xScale(parseDate(start.toString()));
                })
                .attr("y", function(d){ return yScale(allPeople[d][0].LineNumber)-lineOffset; })
                .style("fill", backgroundLineColor);
            }

            // Add the seven dots
            [-32, -22, -12, -2, 8, 18, 28].forEach(function(j){
            sevenDotsEnter.append("circle")
                .attr("class", "circles-background")
                .attr("cx", function(d){
                            return xScale(parseDate((parseInt(allPeople[d][0].AliveDate) + j).toString()))
                })
                .attr("cy", function(d){ return yScale(allPeople[d][0].LineNumber); })
                    .attr("r", dotSize)
                .attr("stroke-width", "0.4px")
                .style("fill", backgroundLineColor);
                })
            
    }

    if (case14){
            // % % % %  CASE 14: Solid line with ONE dot at the END - Background % % % % % 
             // draw the people from this case on the map  
            // no map on new page 
             //  if (page == "biographyMap.html"){   drawPeopleOnMap(oneEnd2); }

            var oneEnd2Enter = peopleGroup.selectAll("div")
                .data(oneEnd2)
                .enter();
            // Add the lines
            oneEnd2Enter.append("line")
                .attr("class", "people-lines-background")
                .attr("x1", function(d){
        //        console.log("oneEnd2 " + allPeople[d][0].DisplayName); // who is this?
                    return xScale(parseDate((allPeople[d][0].BirthDate).toString()));
                })
                .attr("y1", function(d){ return yScale(allPeople[d][0].LineNumber); })
                .attr("x2", function(d){
                    return xScale(parseDate(allPeople[d][0].AliveDate.toString()));
                })
                .attr("y2", function(d){ return yScale(allPeople[d][0].LineNumber); })
                .attr("stroke", backgroundLineColor)
                .attr("stroke-width", backgroundLineWidths)
            
            // Add the text
            if (drawNames) {
                oneEnd2Enter.append("text")
                    .attr("class", "timeline-text-background")
                    .attr("text-anchor", "middle")
                    .text(function(d){ return allPeople[d][0].DisplayName; })
                    .attr("x", function(d){
                    var half = allPeople[d][0].BirthDate + (allPeople[d][0].AliveDate-allPeople[d][0].BirthDate)/2;
                    var bday = allPeople[d][0].BirthDate*1;
                    //console.log("half", bday, half)
                    return xScale(parseDate(half.toString()));  
                    })
                    .attr("y", function(d){ return yScale(allPeople[d][0].LineNumber)-lineOffset; })
                    .style("fill", backgroundLineColor);
            }

            oneEnd2Enter.append("circle")
                .attr("class", "circles-background")
                .attr("cx", function(d){
                return xScale(parseDate((allPeople[d][0].AliveDate).toString())) + 3;
                })
                .attr("cy", function(d){ return yScale(allPeople[d][0].LineNumber); })
                .attr("r", dotSize)
                .attr("stroke-width", "0.4px")
                .style("fill", backgroundLineColor);
    }
    if (case15){
             // % % % Case 15: Solid lines with THREE DOTs at the END - background % % % 
             // draw the people from this case on the map  

            var threeEndEnter = peopleGroup.selectAll("div")
                .data(threeEnd)
                .enter();
            // Add the lines
            threeEndEnter.append("line")
                .attr("class", "people-lines-background")
                .attr("x1", function(d){
        //        console.log("threeBeginTwoEnd " + allPeople[d][0].DisplayName); // who is this?
                    return xScale(parseDate((allPeople[d][0].BirthDate).toString()));
                })
                .attr("y1", function(d){ return yScale(allPeople[d][0].LineNumber); })
                .attr("x2", function(d){
                    return xScale(parseDate((allPeople[d][0].BirthDate - 13).toString()));
                })
                .attr("y2", function(d){ return yScale(allPeople[d][0].LineNumber); })
                .attr("stroke", backgroundLineColor)
                .attr("stroke-width", backgroundLineWidths)

            // Add the text
            if (drawNames) {
                threeEndEnter.append("text")
                    .attr("class", "timeline-text-background")
                    .attr("text-anchor", "middle")
                    .text(function(d){ return allPeople[d][0].DisplayName; })
                    .attr("x", function(d){     
                    var start = (allPeople[d][0].BirthDate);
                        return xScale(parseDate(start.toString()));
                    })
                    .attr("y", function(d){ return yScale(allPeople[d][0].LineNumber)-lineOffset; })
                    .style("fill", backgroundLineColor);
            }

                // Add the 3 dots (run through the data 3 times)
                [7,12,17].forEach(function(j){
                threeEndEnter.append("circle")
                    .attr("class", "circles-background")
                    .attr("cx", function(d){
                        return xScale(parseDate((parseInt(allPeople[d][0].BirthDate) + j).toString()))
                    })
                    .attr("cy", function(d){ return yScale(allPeople[d][0].LineNumber); })
                        .attr("r", dotSize)
                        .attr("stroke-width", "0.4px")
                        .style("fill", backgroundLineColor);
                })

     }
}

function drawCase1(){
            // % % % % % Case 1: Solid lines % % % 

        // draw the people from this case on the map 
        // no map on new page 
       // if (page == "biographyMap.html"){   drawPeopleOnMap(solidLines);  } 

        var dataEnter = peopleGroup.selectAll("div")
            .data(getForegroundPeople(solidLines))
            .enter();
        // Add the lines
        dataEnter.append("line")
            .attr("class", "people-lines")
            .attr("id", function(d){ return d})
            .attr("x1", function(d){
        //    console.log("solidLines " + allPeople[d][0].DisplayName); // who is this?
                return xScale(parseDate(allPeople[d][0].DeathDate - (allPeople[d][0].LifeLength).toString()));
            })
            .attr("y1", function(d){ return yScale(allPeople[d][0].LineNumber); })
            .attr("x2", function(d){
                return xScale(parseDate(allPeople[d][0].DeathDate.toString()));
            })
            .attr("y2", function(d){ return yScale(allPeople[d][0].LineNumber); })
            .attr("stroke", "black")
            .attr("stroke-width", lineWidths);
        // Add the text
        if (drawNames) {
        dataEnter.append("text")
            .attr("class", "timeline-text")
            .attr("id", function(d){ return d})
            .attr("text-anchor", "middle")
            .text(function(d){ return allPeople[d][0].DisplayName; })
            .attr("x", function(d){
                var start = (allPeople[d][0].DeathDate-(allPeople[d][0].LifeLength));
                return xScale(parseDate(start + (allPeople[d][0].LifeLength/2)));
            })
            .attr("y", function(d){ return yScale(allPeople[d][0].LineNumber)-lineOffset; })
            .on("mouseover", function(d){
                // console.log(this)
                if (allPeople[d][0].DeathDate > 0 ){
                    mouseOverChartPeople(this,d,allPeople[d][0].DeathDate - allPeople[d][0].LifeLength, allPeople[d][0].DeathDate, "d. " + allPeople[d][0].DeathDate + ". " + allPeople[d][0].LifeLength);
                } else {
                    mouseOverChartPeople(this,d,allPeople[d][0].DeathDate - allPeople[d][0].LifeLength, allPeople[d][0].DeathDate, "d. " + Math.abs(allPeople[d][0].DeathDate) + " BC. " + allPeople[d][0].LifeLength);
                }
            })
            .on("mouseout", mouseOut)
            .on("click", function(e){ 
                // findPage(e["Name"]); // put back for PDF 
                //// updateLink(e);
                selectPerson(e);
           //  d3.select(this).style("fill", "red");  // change the selected text to red
                // wikiLink(e["Wikipedia"]);
                // get div for wikilink and insert e["Wikipedia"]
            });
        }
        //Add a transparent line for hovering/ mouse interactions//
        dataEnter.append("line")
            .attr("class", "mouse-lines")
            .attr("id", function(d){return d})
            .attr("x1", function(d){
      //        console.log("solidLines " + allPeople[d][0].DisplayName); // who is this?
                return xScale(parseDate(allPeople[d][0].DeathDate - allPeople[d][0].LifeLength));
            })
            .attr("y1", function(d){ return yScale(allPeople[d][0].LineNumber); })
            .attr("x2", function(d){
                return xScale(parseDate(allPeople[d][0].DeathDate.toString()));
            })
            .attr("y2", function(d){ return yScale(allPeople[d][0].LineNumber); })
            .attr("stroke", "transparent")
            // .attr("opacity",".4")
            .attr("stroke-width", "5px")
            .on("click", function(e) {
                //findPage(e["Name"]); // put back for PDF
                // updateLink(e);
                selectPerson(e);
            })
            .on("mouseover", function(d){
                if (allPeople[d][0].DeathDate > 0 ){
                    mouseOverChartPeople(this,d,allPeople[d][0].DeathDate - allPeople[d][0].LifeLength, allPeople[d][0].DeathDate, "d. " + allPeople[d][0].DeathDate + ". " + allPeople[d][0].LifeLength);
                } else {
                    mouseOverChartPeople(this,d,allPeople[d][0].DeathDate - allPeople[d][0].LifeLength, allPeople[d][0].DeathDate, "d. " + Math.abs(allPeople[d][0].DeathDate) + " BC. " + allPeople[d][0].LifeLength);
                }
            })
            .on("mouseout", mouseOut);
    
}

function drawCase2(){
    // % % % % Case 2: Solid line with THREE dots at the BEGIN % % % % % 
   
        // no map on new page 
        //if (page == "biographyMap.html"){   drawPeopleOnMap(threeBegin);  }       

        var threeBeginEnter = peopleGroup.selectAll("div")
            .data(getForegroundPeople(threeBegin))
            .enter();
        // Add the lines
        threeBeginEnter.append("line")
            .attr("class", "people-lines")
            .attr("id", function(d){ return d})
            .attr("x1", function(d){
      //        console.log("threeBegin " + allPeople[d][0].DisplayName); // who is this?
                return xScale(parseDate((allPeople[d][0].DeathDate - 30).toString()));
            })
            .attr("y1", function(d){ return yScale(allPeople[d][0].LineNumber); })
            .attr("x2", function(d){
                return xScale(parseDate(allPeople[d][0].DeathDate.toString()));
            })
            .attr("y2", function(d){ return yScale(allPeople[d][0].LineNumber); })
            .attr("stroke", function(){if(showColors) return "Gold"; else return "black";})
            .attr("stroke-width", lineWidths);
        // Add the text
        if (drawNames) {
        threeBeginEnter.append("text")
            .attr("class", "timeline-text")
            .attr("id", function(d){ return d})
            .attr("text-anchor", "middle")
            .text(function(d){ return allPeople[d][0].DisplayName; })
            .attr("x", function(d){     
            var start = (allPeople[d][0].DeathDate-15);
                return xScale(parseDate(start.toString()));
            })
            .attr("y", function(d){ return yScale(allPeople[d][0].LineNumber)-lineOffset; })
            .on("click", function(e) {
                //findPage(e["Name"]); // put back for PDF
                // updateLink(e);
                selectPerson(e);
            })
            .on("mouseover", function(d){
                if (allPeople[d][0].DeathDate > 0 ){
                    mouseOverChartPeople(this,d, (allPeople[d][0].DeathDate - 45),(allPeople[d][0].DeathDate), "d." + allPeople[d][0].DeathDate);
                } else {
                    mouseOverChartPeople(this,d, (allPeople[d][0].DeathDate - 45),(allPeople[d][0].DeathDate), "d." + Math.abs(allPeople[d][0].DeathDate) + " BC. ");
                }
            })
            .on("mouseout", mouseOut);
        }

        // Add the three dots (run through the data three times)
        [-35, -40, -45].forEach(function(j){
        threeBeginEnter.append("circle")
            .attr("class", "circles")
            .attr("id", function(d){ return d})
            .attr("cx", function(d){
                        return xScale(parseDate((parseInt(allPeople[d][0].DeathDate) + j).toString()))
            })
            .attr("cy", function(d){ return yScale(allPeople[d][0].LineNumber); })
                .attr("r", dotSize)
                .attr("stroke-width", lineWidths)
                .style("fill", notBlack);
            })

                //Add a transparent line for hovering/ mouse interactions//
        threeBeginEnter.append("line")
            .attr("class", "mouse-lines")
            .attr("id", function(d){return d})
            .attr("x1", function(d){
      //        console.log("threeBegin " + allPeople[d][0].DisplayName); // who is this?
                return xScale(parseDate((allPeople[d][0].DeathDate - 50).toString()));
            })
            .attr("y1", function(d){ return yScale(allPeople[d][0].LineNumber); })
            .attr("x2", function(d){ 
                return xScale(parseDate(allPeople[d][0].DeathDate.toString()));
            })
            .attr("y2", function(d){ return yScale(allPeople[d][0].LineNumber); })
            .attr("stroke", "transparent")
            .attr("stroke-width", "5px")
            // .attr("opacity", "0.5")
            .on("click", function(e) {
                //findPage(e["Name"]); // put back for PDF
                // updateLink(e);
                selectPerson(e);
            })
            .on("mouseover", function(d){
                if (allPeople[d][0].DeathDate > 0 ){
                    mouseOverChartPeople(this,d, (allPeople[d][0].DeathDate - 45),(allPeople[d][0].DeathDate), "d." + allPeople[d][0].DeathDate);
                } else {
                    mouseOverChartPeople(this,d, (allPeople[d][0].DeathDate - 45),(allPeople[d][0].DeathDate), "d." + Math.abs(allPeople[d][0].DeathDate) + " BC. ");
                }
            })
            .on("mouseout", mouseOut);
    }
         
function drawCase3(){
        // % % % Case 3: Solid lines with THREE dots at the BEGIN and TWO dots at the END % % % 

        // draw the people from this case on the map  
        // no map on new page 
      //  if (page == "biographyMap.html"){   drawPeopleOnMap(threeBeginTwoEnd);      }   

        var threeBeginTwoEndEnter = peopleGroup.selectAll("div")
            .data(getForegroundPeople(threeBeginTwoEnd))
            .enter();
        // Add the lines
        threeBeginTwoEndEnter.append("line")
            .attr("class", "people-lines")
            .attr("id", function(d){ return d})
            .attr("x1", function(d){
      //        console.log("threeBeginTwoEnd " + allPeople[d][0].DisplayName); // who is this?
                return xScale(parseDate((allPeople[d][0].AliveDate - 13).toString()));
            })
            .attr("y1", function(d){ return yScale(allPeople[d][0].LineNumber); })
            .attr("x2", function(d){
                return xScale(parseDate((allPeople[d][0].AliveDate + 7).toString()));
            })
            .attr("y2", function(d){ return yScale(allPeople[d][0].LineNumber); })
            .attr("stroke", function(){if(showColors) return "Chartreuse"; else return "black";})
            .attr("stroke-width", lineWidths);

        // Add the text
        if (drawNames) {
            threeBeginTwoEndEnter.append("text")
                .attr("class", "timeline-text")
            .attr("id", function(d){ return d})
                .attr("text-anchor", "middle")
                .text(function(d){ return allPeople[d][0].DisplayName; })
                .attr("x", function(d){     
                var start = (allPeople[d][0].AliveDate - 7);
                    return xScale(parseDate(start.toString()));
                })
                .attr("y", function(d){ return yScale(allPeople[d][0].LineNumber)-lineOffset; })
                .on("click", function(e) {
                    //findPage(e["Name"]); // put back for PDF
                    // updateLink(e);
                    selectPerson(e);
                })
                .on("mouseover", function(d){
                    if (allPeople[d][0].AliveDate > 0 ){
                        mouseOverChartPeople(this,d,allPeople[d][0].AliveDate - 37, allPeople[d][0].AliveDate + 19, allPeople[d][0].AlivePrecision + " " + allPeople[d][0].AliveDate);
                    } else {
                        mouseOverChartPeople(this,d,allPeople[d][0].AliveDate - 37, allPeople[d][0].AliveDate + 19, allPeople[d][0].AlivePrecision + " " + Math.abs(allPeople[d][0].AliveDate) + " BC.");
                    } 
                })    
                .on("mouseout", mouseOut);
        }

        // Add the 5 dots (run through the data 5 times)
        [-18, -23, -28, 12,17].forEach(function(j){
        threeBeginTwoEndEnter.append("circle")
            .attr("class", "circles")
            .attr("id", function(d){ return d})
            .attr("cx", function(d){
                        return xScale(parseDate((parseInt(allPeople[d][0].AliveDate) + j).toString()))
            })
            .attr("cy", function(d){ return yScale(allPeople[d][0].LineNumber); })
                .attr("r", dotSize)
                .attr("stroke-width", lineWidths)
                .style("fill", notBlack);
            })

                //Add a transparent line for hovering/ mouse interactions//
        threeBeginTwoEndEnter.append("line")
            .attr("class", "mouse-lines")
            .attr("id", function(d){ return d})
            .attr("x1", function(d){
    //        console.log("threeBeginTwoEnd " + allPeople[d][0].DisplayName); // who is this?
                return xScale(parseDate(allPeople[d][0].AliveDate)) - 13;
            })
            .attr("y1", function(d){ return yScale(allPeople[d][0].LineNumber); })
            .attr("x2", function(d){
                return xScale(parseDate(allPeople[d][0].AliveDate)) + 9;
            })
            .attr("y2", function(d){ return yScale(allPeople[d][0].LineNumber); })
            .attr("stroke", "transparent")
            .attr("stroke-width", "5px")
            // .attr("opacity", "0.5")
            .on("click", function(e) {
                //findPage(e["Name"]); // put back for PDF
                // updateLink(e);
                selectPerson(e);
            })
            .on("mouseover", function(d){
                if (allPeople[d][0].AliveDate > 0 ){
                    mouseOverChartPeople(this,d,allPeople[d][0].AliveDate - 37, allPeople[d][0].AliveDate + 19, allPeople[d][0].AlivePrecision + " " + allPeople[d][0].AliveDate);
                } else {
                    mouseOverChartPeople(this,d,allPeople[d][0].AliveDate - 37, allPeople[d][0].AliveDate + 19, allPeople[d][0].AlivePrecision + " " + Math.abs(allPeople[d][0].AliveDate) + " BC.");
                } 
            }) 
            .on("mouseout", mouseOut);

}

function drawCase4(){
            // % % % % % % Case 4: Solid line with ONE dot at the BEGINNING % % %  

        // draw the people from this case on the map  
        // no map on new page 
      //  if (page == "biographyMap.html"){   drawPeopleOnMap(oneBegin);  }       

        var oneBeginEnter = peopleGroup.selectAll("div")
            .data(getForegroundPeople(oneBegin))
            .enter();
        // Add the lines
        oneBeginEnter.append("line")
            .attr("class", "people-lines")
            .attr("id", function(d){ return d})
            .attr("x1", function(d){
    //        console.log("oneBegin " + allPeople[d][0].DisplayName); // who is this?
                return xScale(parseDate((allPeople[d][0].DeathDate - allPeople[d][0].LifeLength).toString()));
            })
            .attr("y1", function(d){ return yScale(allPeople[d][0].LineNumber); })
            .attr("x2", function(d){
                return xScale(parseDate(allPeople[d][0].DeathDate.toString()));
            })
            .attr("y2", function(d){ return yScale(allPeople[d][0].LineNumber); })
            .attr("stroke", function(){if(showColors) return "Plum"; else return "black";})
            .attr("stroke-width", lineWidths);
        // Add the text
        if (drawNames) {
        oneBeginEnter.append("text")
            .attr("class", "timeline-text")
            .attr("id", function(d){ return d})
            .attr("text-anchor", "middle")
            .text(function(d){ return allPeople[d][0].DisplayName; })
            .attr("x", function(d){
            var start = (allPeople[d][0].DeathDate-allPeople[d][0].LifeLength);
                return xScale(parseDate((start + allPeople[d][0].LifeLength/2).toString()));   
            })
            .attr("y", function(d){ return yScale(allPeople[d][0].LineNumber)-lineOffset; })
    //      .attr("stroke", notBlack)
    //      .attr("fill", notBlack)
            .on("click", function(e) {
                //findPage(e["Name"]); // put back for PDF
                // updateLink(e);
                selectPerson(e);
            })
            .on("mouseover", function(d){
                // console.log(d)
                // console.log(this)
                if (allPeople[d][0].DeathDate > 0 ){
                    mouseOverChartPeople(this,d,allPeople[d][0].DeathDate - allPeople[d][0].LifeLength, allPeople[d][0].DeathDate, "d." + " " + allPeople[d][0].DeathDate + " " + allPeople[d][0].LifePrecision + " " + allPeople[d][0].LifeLength);
                } else {
                    mouseOverChartPeople(this,d,allPeople[d][0].DeathDate - allPeople[d][0].LifeLength, allPeople[d][0].DeathDate, "d." + " " + Math.abs(allPeople[d][0].DeathDate) + " BC. " + allPeople[d][0].LifePrecision + " " + allPeople[d][0].LifeLength);
                }   
            })
            .on("mouseout", mouseOut);
        }

        // Add the one dot below
        oneBeginEnter.append("circle")
            .attr("class", "circles")
            .attr("id", function(d){ return d})
            .attr("cx", function(d){
            return xScale(parseDate((allPeople[d][0].DeathDate - allPeople[d][0].LifeLength + 2).toString()));
            })
            .attr("cy", function(d){ return yScale(allPeople[d][0].LineNumber)+(lineOffset*1.2); })
            .attr("r", dotSize)
            .style("fill", notBlack);


        //Add a transparent line for hovering/ mouse interactions//
        oneBeginEnter.append("line")
            .attr("class", "mouse-lines")
            .attr("id", function(d){ return d})
            .attr("x1", function(d){
    //        console.log("oneBegin " + allPeople[d][0].DisplayName); // who is this?
                return xScale(parseDate((allPeople[d][0].DeathDate - allPeople[d][0].LifeLength).toString())) - 2;
            })
            .attr("y1", function(d){ return yScale(allPeople[d][0].LineNumber) + 2; })
            .attr("x2", function(d){
                return xScale(parseDate(allPeople[d][0].DeathDate.toString())) + 2;
            })
            .attr("y2", function(d){ return yScale(allPeople[d][0].LineNumber) + 2; })
            .attr("stroke", "transparent")
            .attr("stroke-width", "6px")
            // .attr("opacity", "0.5")
            .on("click", function(e) {
                //findPage(e["Name"]); // put back for PDF
                // updateLink(e);
                selectPerson(e);
            })
            .on("mouseover", function(d){
                //console.log("this mouseover:" + this) 
                if (allPeople[d][0].DeathDate > 0 ){  
                    mouseOverChartPeople(this,d,allPeople[d][0].DeathDate - allPeople[d][0].LifeLength, allPeople[d][0].DeathDate, "d." + " " + allPeople[d][0].DeathDate + " " + allPeople[d][0].LifePrecision + " " + allPeople[d][0].LifeLength);
                } else {
                    mouseOverChartPeople(this,d,allPeople[d][0].DeathDate - allPeople[d][0].LifeLength, allPeople[d][0].DeathDate, "d." + " " + Math.abs(allPeople[d][0].DeathDate) + " BC. " + allPeople[d][0].LifePrecision + " " + allPeople[d][0].LifeLength);
                }   
            })
            .on("mouseout", mouseOut);
    
}

function drawCase5(){
     // % % % %  CASE 5:  Solid line with ONE dot UNDER at the END % % % % % % 

        // draw the people from this case on the map  
        // no map on new page 
      //  if (page == "biographyMap.html"){   drawPeopleOnMap(oneEndUnder); }        

        var oneEndUnderEnter = peopleGroup.selectAll("div")
            .data(getForegroundPeople(oneEndUnder))
            .enter();
        // Add the lines
        oneEndUnderEnter.append("line")
            .attr("class", "people-lines")
            .attr("id", function(d){ return d})
            .attr("x1", function(d){
    //        console.log("oneEndUnder " + allPeople[d][0].DisplayName); // who is this?
            return xScale(parseDate((allPeople[d][0].DeathDate - allPeople[d][0].LifeLength).toString()));
            })
            .attr("y1", function(d){ return yScale(allPeople[d][0].LineNumber); })
            .attr("x2", function(d){
            return xScale(parseDate(allPeople[d][0].DeathDate.toString()));
            })
            .attr("y2", function(d){ return yScale(allPeople[d][0].LineNumber); })
            .attr("stroke", function(){if(showColors) return "Cyan"; else return "black";})
            .attr("stroke-width", lineWidths);
        // Add the text
        if (drawNames) {
        oneEndUnderEnter.append("text")
            .attr("class", "timeline-text")
            .attr("id", function(d){ return d})
            .attr("text-anchor", "middle")
            .text(function(d){ return allPeople[d][0].DisplayName; })
            .attr("x", function(d){
            var start = (allPeople[d][0].DeathDate-allPeople[d][0].LifeLength);
            return xScale(parseDate((start + allPeople[d][0].LifeLength/2).toString()));   
            })
            .attr("y", function(d){ return yScale(allPeople[d][0].LineNumber)-lineOffset; })
    //      .attr("stroke", notBlack)
    //      .attr("fill", notBlack)
            .on("click", function(e) {
                //findPage(e["Name"]); // put back for PDF
                // updateLink(e);
                selectPerson(e);
            })
            .on("mouseover", function(d){
                if (allPeople[d][0].DeathDate > 0 ){
                mouseOverChartPeople(this,d,allPeople[d][0].DeathDate - allPeople[d][0].LifeLength, allPeople[d][0].DeathDate, "d. ab. " + allPeople[d][0].DeathDate + " ab. " + allPeople[d][0].LifeLength);
                } else {
                mouseOverChartPeople(this,d,allPeople[d][0].DeathDate - allPeople[d][0].LifeLength, allPeople[d][0].DeathDate, "d. ab. " + Math.abs(allPeople[d][0].DeathDate) + " BC. " + "ab. " + allPeople[d][0].LifeLength);
                }   
            })
            .on("mouseout", mouseOut);
        }

        // Add the one dot below
        oneEndUnderEnter.append("circle")
            .attr("class", "circles")
            .attr("id", function(d){ return d})
            .attr("cx", function(d){
            return xScale(parseDate((allPeople[d][0].DeathDate - 2).toString()));
            })
            .attr("cy", function(d){ return yScale(allPeople[d][0].LineNumber)+(lineOffset*1.2); })
            .attr("r", dotSize)
            .attr("stroke-width", lineWidths)
            .style("fill", notBlack);

        //Add a transparent line for hovering/ mouse interactions//
        oneEndUnderEnter.append("line")
            .attr("class", "mouse-lines")
            .attr("id", function(d){ return d})
            .attr("x1", function(d){
    //        console.log("oneEndUnder " + allPeople[d][0].DisplayName); // who is this?
            return xScale(parseDate((allPeople[d][0].DeathDate - allPeople[d][0].LifeLength).toString())) - 2;
            })
            .attr("y1", function(d){ return yScale(allPeople[d][0].LineNumber) + 2; })
            .attr("x2", function(d){
            return xScale(parseDate(allPeople[d][0].DeathDate.toString())) + 2;
            })
            .attr("y2", function(d){ return yScale(allPeople[d][0].LineNumber) + 2; })
            .attr("stroke", "transparent")
            .attr("stroke-width", "6px")
            .on("click", function(e) {
                //findPage(e["Name"]); // put back for PDF
                // updateLink(e);
                selectPerson(e);
            })
            .on("mouseover", function(d){
                if (allPeople[d][0].DeathDate > 0 ){
                mouseOverChartPeople(this,d,allPeople[d][0].DeathDate - allPeople[d][0].LifeLength, allPeople[d][0].DeathDate, "d. ab. " + allPeople[d][0].DeathDate + " ab. " + allPeople[d][0].LifeLength);
                } else {
                mouseOverChartPeople(this,d,allPeople[d][0].DeathDate - allPeople[d][0].LifeLength, allPeople[d][0].DeathDate, "d. ab. " + Math.abs(allPeople[d][0].DeathDate) + " BC. ab. " + allPeople[d][0].LifeLength);
                }   
            })
            .on("mouseout", mouseOut);
}

function drawCase6(){
     // % % % % % Case 6: solid2 % % % % % % % % % % % %
        //  essentially a solid line

        // draw the people from this case on the map 
        // no map on new page 
      //  if (page == "biographyMap.html"){drawPeopleOnMap(solid2);}

        var solid2Enter = peopleGroup.selectAll("div")
            .data(getForegroundPeople(solid2))
            .enter();
        // Add the lines
        solid2Enter.append("line")
            .attr("class", "people-lines")
            .attr("id", function(d){ return d})
            .attr("x1", function(d){
            return xScale(parseDate((allPeople[d][0].DeathDate).toString()));
            })
            .attr("y1", function(d){ return yScale(allPeople[d][0].LineNumber); })
            .attr("x2", function(d){
            return xScale(parseDate((allPeople[d][0].DeathDate-allPeople[d][0].LifeLength).toString()));
            })
            .attr("y2", function(d){ return yScale(allPeople[d][0].LineNumber); })
            .attr("stroke", function(){ if(showColors) return notBlack; else return "black";})
            .attr("stroke-width", lineWidths)
            
        // Add the text
        if (drawNames) {
        solid2Enter.append("text")
            .attr("class", "timeline-text")
            .attr("id", function(d){return d})
            .attr("text-anchor", "middle")
            .text(function(d){ return allPeople[d][0].DisplayName; })
            .attr("x", function(d){		
            var start = (allPeople[d][0].DeathDate-allPeople[d][0].LifeLength);
            return xScale(parseDate((start+allPeople[d][0].LifeLength/2).toString()));
            })
            .attr("y", function(d){ return yScale(allPeople[d][0].LineNumber)-lineOffset; })
            .on("click", function(e) {
                //findPage(e["Name"]); // put back for PDF
                // updateLink(e);
                selectPerson(e);
            })
            .on("mouseover", function(d){
                if (allPeople[d][0].DeathDate > 0 ){
                mouseOverChartPeople(this,d,allPeople[d][0].DeathDate - allPeople[d][0].LifeLength, allPeople[d][0].DeathDate, "d. ab. " + allPeople[d][0].DeathDate + ". " + allPeople[d][0].LifeLength);
                } else {
                mouseOverChartPeople(this,d,allPeople[d][0].DeathDate - allPeople[d][0].LifeLength, allPeople[d][0].DeathDate, "d. ab. " + Math.abs(allPeople[d][0].DeathDate) + " BC. " + allPeople[d][0].LifeLength);
                }   
            })
            .on("mouseout", mouseOut);
        }

        //Add a transparent line for hovering/ mouse interactions//
        solid2Enter.append("line")
            .attr("class", "mouse-lines")
            .attr("id", function(d){return d})
            .attr("x1", function(d){
            return xScale(parseDate((allPeople[d][0].DeathDate).toString())) + 2;
            })
            .attr("y1", function(d){ return yScale(allPeople[d][0].LineNumber); })
            .attr("x2", function(d){
            return xScale(parseDate((allPeople[d][0].DeathDate-allPeople[d][0].LifeLength).toString())) - 2;
            })
            .attr("y2", function(d){ return yScale(allPeople[d][0].LineNumber); })
            .attr("stroke", "transparent")
            .attr("stroke-width", "6px")
            .on("click", function(e) {
                //findPage(e["Name"]); // put back for PDF
                // updateLink(e);
                selectPerson(e);
            })
            .on("mouseover", function(d){
                if (allPeople[d][0].DeathDate > 0 ){
                mouseOverChartPeople(this,d,allPeople[d][0].DeathDate - allPeople[d][0].LifeLength, allPeople[d][0].DeathDate, "d. ab. " + allPeople[d][0].DeathDate + ". " + allPeople[d][0].LifeLength);
                } else {
                mouseOverChartPeople(this,d,allPeople[d][0].DeathDate - allPeople[d][0].LifeLength, allPeople[d][0].DeathDate, "d. ab. " + Math.abs(allPeople[d][0].DeathDate) + " BC. " + allPeople[d][0].LifeLength);
                }   
            })
            .on("mouseout", mouseOut);
    }

function drawCase7(){
     // % % % %  CASE 7: Solid line with ONE dot at the END % % % % %  

        // draw the people from this case on the map  
        // no map on new page 
      //  if (page == "biographyMap.html"){   drawPeopleOnMap(oneEnd); }

        var oneEndEnter = peopleGroup.selectAll("div")
            .data(getForegroundPeople(oneEnd))
            .enter();
        // Add the lines
        oneEndEnter.append("line")
            .attr("class", "people-lines")
            .attr("id", function(d){return d})
            .attr("x1", function(d){
    //        console.log("oneEnd " + allPeople[d][0].DisplayName); // who is this?
            return xScale(parseDate((allPeople[d][0].BirthDate).toString()));
            })
            .attr("y1", function(d){ return yScale(allPeople[d][0].LineNumber); })
            .attr("x2", function(d){
            return xScale(parseDate(allPeople[d][0].DeathDate.toString()));
            })
            .attr("y2", function(d){ return yScale(allPeople[d][0].LineNumber); })
            .attr("stroke", function(){if(showColors) return "Green"; else return "black";})
            .attr("stroke-width", lineWidths);
            
        // Add the text
        if (drawNames) {
            oneEndEnter.append("text")
                .attr("class", "timeline-text")
            .attr("id", function(d){return d})
                .attr("text-anchor", "middle")
                .text(function(d){ return allPeople[d][0].DisplayName; })
                .attr("x", function(d){
                var half = allPeople[d][0].BirthDate + (allPeople[d][0].DeathDate-allPeople[d][0].BirthDate)/2;
                var bday = allPeople[d][0].BirthDate*1;
                //console.log("half", bday, half)
                return xScale(parseDate(half.toString()));  
                })
                .attr("y", function(d){ return yScale(allPeople[d][0].LineNumber)-lineOffset; })
        //      .attr("stroke", "black")
        //      .attr("fill", "black")
                .on("click", function(e) {
                    //findPage(e["Name"]); // put back for PDF
                    // updateLink(e);
                    selectPerson(e);
                })
                .on("mouseover", function(d){
                    if (allPeople[d][0].DeathDate > 0 ){
                    mouseOverChartPeople(this,d,allPeople[d][0].BirthDate, parseInt(allPeople[d][0].AproxDeathDate), "b. " + allPeople[d][0].BirthDate + " d. af. " + allPeople[d][0].DeathDate);
                    } else {
                    mouseOverChartPeople(this,d,allPeople[d][0].BirthDate, parseInt(allPeople[d][0].AproxDeathDate), "b. " + Math.abs(allPeople[d][0].DeathDate) + " BC. d. af. " + allPeople[d][0].DeathDate);
                    }   
                })
                .on("mouseout", mouseOut);
        }


        // Add the one dot 
        oneEndEnter.append("circle")
            .attr("class", "circles")
            .attr("id", function(d){return d})
            .attr("cx", function(d){
            return xScale(parseDate((allPeople[d][0].DeathDate).toString())) + 2;
            })
            .attr("cy", function(d){ return yScale(allPeople[d][0].LineNumber); })
            .attr("r", dotSize)
            .attr("stroke-width", lineWidths)
            .style("fill", notBlack);

        //Add a transparent line for hovering/ mouse interactions//
        oneEndEnter.append("line")
            .attr("class", "mouse-lines")
            .attr("id", function(d){return d})
            .attr("x1", function(d){
    //        console.log("oneEnd " + allPeople[d][0].DisplayName); // who is this?
            return xScale(parseDate((allPeople[d][0].BirthDate).toString())) - 2;
            })
            .attr("y1", function(d){ return yScale(allPeople[d][0].LineNumber); })
            .attr("x2", function(d){
            return xScale(parseDate(allPeople[d][0].DeathDate.toString())) + 5;
            })
            .attr("y2", function(d){ return yScale(allPeople[d][0].LineNumber); })
            .attr("stroke", "transparent")
            .attr("stroke-width", "6px")
            .on("click", function(e) {
                //findPage(e["Name"]); // put back for PDF
                // updateLink(e);
                selectPerson(e);
            })
            .on("mouseover", function(d){
                if (allPeople[d][0].DeathDate > 0 ){
                mouseOverChartPeople(this,d,allPeople[d][0].BirthDate, (parseInt(allPeople[d][0].DeathDate) + 5), "b. " + allPeople[d][0].BirthDate + " d. af. " + allPeople[d][0].DeathDate);
                } else {
                mouseOverChartPeople(this,d,allPeople[d][0].BirthDate, (parseInt(allPeople[d][0].DeathDate) + 5), "b. " + Math.abs(allPeople[d][0].DeathDate) + " BC. d. af. " + allPeople[d][0].DeathDate);
                }   
            })
            .on("mouseout", mouseOut);   
    }
          
function drawCase8(){
     // % % % CASE 8: Solid lines with THREE dots at the BEGIN and ONE dot at the END % % %

        // draw the people from this case on the map  
        // no map on new page 
      //  if (page == "biographyMap.html"){ 	drawPeopleOnMap(threeBeginOneEnd); }

        var threeBeginOneEndEnter = peopleGroup.selectAll("div")
            .data(getForegroundPeople(threeBeginOneEnd))
            .enter();
        // Add the lines
        threeBeginOneEndEnter.append("line")
            .attr("class", "people-lines")
            .attr("id", function(d){return d})
            .attr("x1", function(d){
            return xScale(parseDate((allPeople[d][0].DeathDate - 30).toString()));
            })
            .attr("y1", function(d){ return yScale(allPeople[d][0].LineNumber); })
            .attr("x2", function(d){
            return xScale(parseDate(allPeople[d][0].DeathDate.toString()));
            })
            .attr("y2", function(d){ return yScale(allPeople[d][0].LineNumber); })
            .attr("stroke", function(){if(showColors) return "Blue"; else return "black";})
            .attr("stroke-width", lineWidths)
           
        // Add the text
        if (drawNames) {
            threeBeginOneEndEnter.append("text")
                .attr("class", "timeline-text")
            .attr("id", function(d){return d})
                .attr("text-anchor", "middle")
                .text(function(d){ return allPeople[d][0].DisplayName; })
                .attr("x", function(d){		
                var start = (allPeople[d][0].DeathDate-15);
                return xScale(parseDate(start.toString()));
                })
                .attr("y", function(d){ return yScale(allPeople[d][0].LineNumber)-lineOffset; })
        //	    .attr("stroke", "black")
        //	    .attr("fill", "black")
                .on("click", function(e) {
                        //findPage(e["Name"]); // put back for PDF
                        // updateLink(e);
                        selectPerson(e);
                })
                .on("mouseover", function(d){
                    if (allPeople[d][0].DeathDate > 0 ){
                    mouseOverChartPeople(this,d,allPeople[d][0].DeathDate - 45, (parseInt(allPeople[d][0].DeathDate) + 5), "d. af. " + allPeople[d][0].DeathDate);
                    } else {
                    mouseOverChartPeople(this,d,allPeople[d][0].DeathDate - 45, (parseInt(allPeople[d][0].DeathDate) + 5), "d. af. " + Math.abs(allPeople[d][0].DeathDate) + " BC.");
                    }   
                })
                .on("mouseout", mouseOut);
        }

        // Add the 4 dots (run through the data 4 times)
        [-45, -40, -35, 5].forEach(function(j){
        threeBeginOneEndEnter.append("circle")
            .attr("class", "circles")
            .attr("id", function(d){return d})
            .attr("cx", function(d){
                        return xScale(parseDate((parseInt(allPeople[d][0].DeathDate) + j).toString()))
            })
            .attr("cy", function(d){ return yScale(allPeople[d][0].LineNumber); })
            .attr("r", dotSize)
            .style("fill", notBlack);
            })

        //Add a transparent line for hovering/ mouse interactions//
        threeBeginOneEndEnter.append("line")
            .attr("class", "mouse-lines")
            .attr("id", function(d){return d})
            .attr("x1", function(d){
            return xScale(parseDate((allPeople[d][0].DeathDate - 30).toString())) - 10;
            })
            .attr("y1", function(d){ return yScale(allPeople[d][0].LineNumber); })
            .attr("x2", function(d){
            return xScale(parseDate(allPeople[d][0].DeathDate.toString())) + 5;
            })
            .attr("y2", function(d){ return yScale(allPeople[d][0].LineNumber); })
            .attr("stroke", "transparent")
            .attr("stroke-width", "6px")
            .on("click", function(e) {
                //findPage(e["Name"]); // put back for PDF
                // updateLink(e);
                selectPerson(e);
            })
            .on("mouseover", function(d){
                if (allPeople[d][0].DeathDate > 0 ){
                mouseOverChartPeople(this,d,allPeople[d][0].DeathDate - 45, (parseInt(allPeople[d][0].DeathDate) + 5), "d. af. " + allPeople[d][0].DeathDate);
                } else {
                mouseOverChartPeople(this,d,allPeople[d][0].DeathDate - 45, (parseInt(allPeople[d][0].DeathDate) + 5), "d. af. " + Math.abs(allPeople[d][0].DeathDate) + " BC.");
                }   
            })
            .on("mouseout", mouseOut);
}

function drawCase11(){
     // % % % %  CASE 11:  Solid line with ONE dot UNDER at the END % % % % % % 

        // draw the people from this case on the map  
        // no map on new page 
      //  if (page == "biographyMap.html"){   drawPeopleOnMap(oneEndUnder2); }        

        var oneEndUnder2Enter = peopleGroup.selectAll("div")
            .data(getForegroundPeople(oneEndUnder2))
            .enter();
        // Add the lines
        oneEndUnder2Enter.append("line")
            .attr("class", "people-lines")
            .attr("id", function(d){return d})
            .attr("x1", function(d){
    //        console.log("oneEndUnder " + allPeople[d][0].DisplayName); // who is this?
            return xScale(parseDate((allPeople[d][0].BirthDate + allPeople[d][0].LifeLength).toString()));
            })
            .attr("y1", function(d){ return yScale(allPeople[d][0].LineNumber); })
            .attr("x2", function(d){
            return xScale(parseDate(allPeople[d][0].BirthDate.toString()));
            })
            .attr("y2", function(d){ return yScale(allPeople[d][0].LineNumber); })
            .attr("stroke", function(){if(showColors) return "Cyan"; else return "black";})
            .attr("stroke-width", lineWidths);

            //add text
        if (drawNames) {
            oneEndUnder2Enter.append("text")
            .attr("class", "timeline-text")
            .attr("id", function(d){return d})
            .attr("text-anchor", "middle")
            .text(function(d){ return allPeople[d][0].DisplayName; })
            .attr("x", function(d){
            var start = (allPeople[d][0].BirthDate);
            return xScale(parseDate((start + allPeople[d][0].LifeLength/2).toString()));   
            })
            .attr("y", function(d){ return yScale(allPeople[d][0].LineNumber)-lineOffset; })
    //      .attr("stroke", notBlack)
    //      .attr("fill", notBlack)
            .on("click", function(e) {
                //findPage(e["Name"]); // put back for PDF
                // updateLink(e);
                selectPerson(e);
            })
            .on("mouseover", function(d){
                if (allPeople[d][0].DeathDate > 0 ){
                mouseOverChartPeople(this,d,allPeople[d][0].BirthDate, allPeople[d][0].BirthDate + allPeople[d][0].LifeLength, "b. " + allPeople[d][0].BirthDate + " " + allPeople[d][0].LifePrecision + " " + allPeople[d][0].LifeLength);
                } else {
                mouseOverChartPeople(this,d,allPeople[d][0].BirthDate, allPeople[d][0].BirthDate + allPeople[d][0].LifeLength, "b. " + Math.abs(allPeople[d][0].BirthDate) + " BC. " + allPeople[d][0].LifePrecision + " " + allPeople[d][0].LifeLength);    
                }   
            })
            .on("mouseout", mouseOut);
        }

            // Add the one dot below
        oneEndUnder2Enter.append("circle")
            .attr("class", "circles")
            .attr("id", function(d){return d})
            .attr("cx", function(d){
            return xScale(parseDate(((allPeople[d][0].BirthDate + allPeople[d][0].LifeLength) - 2).toString()));
            })
            .attr("cy", function(d){ return yScale(allPeople[d][0].LineNumber)+(lineOffset*1.2); })
            .attr("r", dotSize)
            .style("fill", notBlack);

        //Add a transparent line for hovering/ mouse interactions//
        oneEndUnder2Enter.append("line")
            .attr("class", "mouse-lines")
            .attr("id", function(d){return d})
            .attr("x1", function(d){
    //        console.log("oneEndUnder " + allPeople[d][0].DisplayName); // who is this?
            return xScale(parseDate((allPeople[d][0].BirthDate + allPeople[d][0].LifeLength).toString())) + 4;
            })
            .attr("y1", function(d){ return yScale(allPeople[d][0].LineNumber) + 2; })
            .attr("x2", function(d){
            return xScale(parseDate(allPeople[d][0].BirthDate.toString())) - 4;
            })
            .attr("y2", function(d){ return yScale(allPeople[d][0].LineNumber) + 2; })
            .attr("stroke", "transparent")
            .attr("stroke-width", "6px")
            .on("click", function(e) {
                //findPage(e["Name"]); // put back for PDF
                // updateLink(e);
                selectPerson(e);
            })
            .on("mouseover", function(d){
                if (allPeople[d][0].DeathDate > 0 ){
                mouseOverChartPeople(this,d,allPeople[d][0].BirthDate, allPeople[d][0].BirthDate + allPeople[d][0].LifeLength, "b. " + allPeople[d][0].BirthDate + " " + allPeople[d][0].LifePrecision + " " + allPeople[d][0].LifeLength);
                } else {
                mouseOverChartPeople(this,d,allPeople[d][0].BirthDate, allPeople[d][0].BirthDate + allPeople[d][0].LifeLength, "b. " + Math.abs(allPeople[d][0].BirthDate) + " BC. " + allPeople[d][0].LifePrecision + " " + allPeople[d][0].LifeLength);    
                }   
            })
            .on("mouseout", mouseOut);
}

function drawCase13(){
    // % % % Case 13: seven dots % % % 

        // draw the people from this case on the map  
        // no map on new page 
        //  if (page == "biographyMap.html"){ 	drawPeopleOnMap(sevenDots);    }     

        var sevenDotsEnter = peopleGroup.selectAll("div")
            .data(getForegroundPeople(sevenDots))
            .enter();
        // Add the text
        if (drawNames) {
        sevenDotsEnter.append("text")
            .attr("class", "timeline-text")
            .attr("id", function(d){return d})
            .attr("text-anchor", "middle")
            .text(function(d){ return allPeople[d][0].DisplayName; })
            .attr("x", function(d){		
                var start = (allPeople[d][0].AliveDate - 2);
                return xScale(parseDate(start.toString()));
            })
            .attr("y", function(d){ return yScale(allPeople[d][0].LineNumber)-lineOffset; })
    //	    .attr("stroke", "black")
    //	    .attr("fill", "black")
            .on("click", function(e) {
                //findPage(e["Name"]); // put back for PDF
                // updateLink(e);
                selectPerson(e);
            })
            .on("mouseover", function(d){
                if (allPeople[d][0].AliveDate > 0 ){
                mouseOverChartPeople(this,d,allPeople[d][0].AliveDate - 25, allPeople[d][0].AliveDate + 20, "fl. ab. " + allPeople[d][0].AliveDate);
                } else {
                mouseOverChartPeople(this,d,allPeople[d][0].AliveDate - 25, allPeople[d][0].AliveDate + 20, "fl. ab. " + Math.abs(allPeople[d][0].AliveDate) + " BC.");   
                }   
            })
            .on("mouseout", mouseOut);
        }


        // Add the seven dots
        [-32, -22, -12, -2, 8, 18, 28].forEach(function(j){
        sevenDotsEnter.append("circle")
            .attr("class", "circles")
            .attr("id", function(d){return d})
            .attr("cx", function(d){
                        return xScale(parseDate((parseInt(allPeople[d][0].AliveDate) + j).toString()))
            })
            .attr("cy", function(d){ return yScale(allPeople[d][0].LineNumber); })
            .attr("r", dotSize)
            .style("fill", notBlack);
            })

        //Add a transparent line for hovering/ mouse interactions//       
        sevenDotsEnter.append("line")
            .attr("class", "mouse-lines")
            .attr("id", function(d){return d})
           .attr("x1", function(d){
            return xScale(parseDate((allPeople[d][0].AliveDate - 30).toString())) - 5;
            })
            .attr("y1", function(d){ return yScale(allPeople[d][0].LineNumber); })
            .attr("x2", function(d){
                return xScale(parseDate(allPeople[d][0].AliveDate.toString())) + 16;
            })
            .attr("y2", function(d){ return yScale(allPeople[d][0].LineNumber); })
            .attr("stroke", "transparent")
            .attr("stroke-width", "6px")
            // .attr("opacity", "0.5")
            .on("click", function(e) {
                //findPage(e["Name"]); // put back for PDF
                selectPerson(e);
            })
            .on("mouseover", function(d){
                if (allPeople[d][0].AliveDate > 0 ){
                mouseOverChartPeople(this,d,allPeople[d][0].AliveDate - 25, allPeople[d][0].AliveDate + 20, "fl. ab. " + allPeople[d][0].AliveDate);
                } else {
                mouseOverChartPeople(this,d,allPeople[d][0].AliveDate - 25, allPeople[d][0].AliveDate + 20, "fl. ab. " + Math.abs(allPeople[d][0].AliveDate) + " BC.");   
                }   
            })
            .on("mouseout", mouseOut);

}

function drawCase14(){
        // % % % %  CASE 14: Solid line with ONE dot at the END % % % % % 
        // draw the people from this case on the map  
        // no map on new page 
      //  if (page == "biographyMap.html"){   drawPeopleOnMap(oneEnd2); }

        var oneEnd2Enter = peopleGroup.selectAll("div")
            .data(getForegroundPeople(oneEnd2))
            .enter();
        // Add the lines
        oneEnd2Enter.append("line")
            .attr("class", "people-lines")
            .attr("id", function(d){return d})
            .attr("x1", function(d){
    //        console.log("oneEnd2 " + allPeople[d][0].DisplayName); // who is this?
                return xScale(parseDate((allPeople[d][0].BirthDate).toString()));
            })
            .attr("y1", function(d){ return yScale(allPeople[d][0].LineNumber); })
            .attr("x2", function(d){
                return xScale(parseDate(allPeople[d][0].AliveDate.toString()));
            })
            .attr("y2", function(d){ return yScale(allPeople[d][0].LineNumber); })
            .attr("stroke", function(){if(showColors) return "Green"; else return "black";})
            .attr("stroke-width", lineWidths);
        
        // Add the text
        if (drawNames) {
            oneEnd2Enter.append("text")
                .attr("class", "timeline-text")
            .attr("id", function(d){return d})
                .attr("text-anchor", "middle")
                .text(function(d){ return allPeople[d][0].DisplayName; })
                .attr("x", function(d){
                    var half = allPeople[d][0].BirthDate + (allPeople[d][0].AliveDate-allPeople[d][0].BirthDate)/2;
                    var bday = allPeople[d][0].BirthDate*1;
                    //console.log("half", bday, half)
                    return xScale(parseDate(half.toString()));  
                })
                .attr("y", function(d){ return yScale(allPeople[d][0].LineNumber)-lineOffset; })
        //      .attr("stroke", "black")
        //      .attr("fill", "black")
                .on("click", function(e) {
                    //findPage(e["Name"]); // put back for PDF 
                    // updateLink(e);
                    selectPerson(e);
                })
                .on("mouseover", function(d){
                    if (allPeople[d][0].BirthDate > 0 ){
                    mouseOverChartPeople(this,d,allPeople[d][0].BirthDate, parseInt(allPeople[d][0].AliveDate), "b. " + allPeople[d][0].BirthDate + " " + allPeople[d][0].AlivePrecision + " " + allPeople[d][0].AliveDate);
                    } else {
                    mouseOverChartPeople(this,d,allPeople[d][0].BirthDate, parseInt(allPeople[d][0].AliveDate), "b. " + Math.abs(allPeople[d][0].BirthDate) + " BC. " + allPeople[d][0].AlivePrecision + " " + Math.abs(allPeople[d][0].AliveDate) + " BC.") ;    
                    }   
                })
                .on("mouseout", mouseOut);
        }


        oneEnd2Enter.append("circle")
            .attr("class", "circles")
            .attr("id", function(d){return d})
            .attr("cx", function(d){
                return xScale(parseDate((allPeople[d][0].AliveDate).toString())) + 3;
            })
            .attr("cy", function(d){ return yScale(allPeople[d][0].LineNumber); })
            .attr("r", dotSize)
            .style("fill", notBlack);

        // add the mouse lines
        oneEnd2Enter.append("line")
            .attr("class", "mouse-lines")
            .attr("id", function(d){return d})
            .attr("x1", function(d){
    //        console.log("oneEnd " + allPeople[d][0].DisplayName); // who is this?
                return xScale(parseDate((allPeople[d][0].BirthDate).toString())) - 2;
            })
            .attr("y1", function(d){ return yScale(allPeople[d][0].LineNumber); })
            .attr("x2", function(d){
            return xScale(parseDate(allPeople[d][0].AliveDate.toString())) + 5;
            })
            .attr("y2", function(d){ return yScale(allPeople[d][0].LineNumber); })
            .attr("stroke", "transparent")
            .attr("stroke-width", "6px")
            .on("click", function(e) {
                //findPage(e["Name"]); // put back for PDF
                // updateLink(e);
                selectPerson(e);
            })
            .on("mouseover", function(d){
                if (allPeople[d][0].BirthDate > 0 ){
                mouseOverChartPeople(this,d,allPeople[d][0].BirthDate, parseInt(allPeople[d][0].AliveDate), "b. " + allPeople[d][0].BirthDate + " " + allPeople[d][0].AlivePrecision + " " + allPeople[d][0].AliveDate);
                } else {
                mouseOverChartPeople(this,d,allPeople[d][0].BirthDate, parseInt(allPeople[d][0].AliveDate), "b. " + Math.abs(allPeople[d][0].BirthDate) + " BC. " + allPeople[d][0].AlivePrecision + " " + Math.abs(allPeople[d][0].AliveDate) + " BC.") ;    
                }   
            })
            .on("mouseout", mouseOut);
}

function drawCase15(){
     // % % % Case 15: Solid lines with THREE DOTs at the END  % % % 
                    // draw the people from this case on the map  
            // no map on new page 
            // console.log("drawCase15")

            var threeEndEnter = peopleGroup.selectAll("div")
                .data(getForegroundPeople(threeEnd))
                .enter();
            // Add the lines
            threeEndEnter.append("line")
                .attr("class", "people-lines")
                .attr("x1", function(d){
        //        console.log("threeBeginTwoEnd " + allPeople[d][0].DisplayName); // who is this?
                    return xScale(parseDate((allPeople[d][0].BirthDate).toString()));
                })
                .attr("y1", function(d){ return yScale(allPeople[d][0].LineNumber); })
                .attr("x2", function(d){
                    return xScale(parseDate((allPeople[d][0].BirthDate - 13).toString()));
                })
                .attr("y2", function(d){ return yScale(allPeople[d][0].LineNumber); })
                .attr("stroke", notBlack)
                .attr("stroke-width", backgroundLineWidths)

            // Add the text
            if (drawNames) {
                threeEndEnter.append("text")
                    .attr("class", "timeline-text")
                    .attr("text-anchor", "middle")
                    .text(function(d){ return allPeople[d][0].DisplayName; })
                    .attr("x", function(d){     
                    var start = (allPeople[d][0].BirthDate);
                        return xScale(parseDate(start.toString()));
                    })
                    .attr("y", function(d){ return yScale(allPeople[d][0].LineNumber)-lineOffset; })
                    .style("fill", notBlack);
            }

            // Add the 3 dots (run through the data 3 times)
            [7,12,17].forEach(function(j){
            threeEndEnter.append("circle")
                .attr("class", "circles")
                .attr("cx", function(d){
                    return xScale(parseDate((parseInt(allPeople[d][0].BirthDate) + j).toString()))
                })
                .attr("cy", function(d){ return yScale(allPeople[d][0].LineNumber); })
                    .attr("r", dotSize)
                    .attr("stroke-width", "0.4px")
                    .style("fill", notBlack);
            })

            // add the mouse lines
        threeEndEnter.append("line")
            .attr("class", "mouse-lines")
            .attr("id", function(d){return d})
            .attr("x1", function(d){
    //        console.log("oneEnd " + allPeople[d][0].DisplayName); // who is this?
                return xScale(parseDate((allPeople[d][0].BirthDate).toString())) - 2;
            })
            .attr("y1", function(d){ return yScale(allPeople[d][0].LineNumber); })
            .attr("x2", function(d){
            return xScale(parseDate(allPeople[d][0].BirthDate.toString())) + 13;
            })
            .attr("y2", function(d){ return yScale(allPeople[d][0].LineNumber); })
            .attr("stroke", "transparent")
            .attr("stroke-width", "6px")
            .on("click", function(e) {
                //findPage(e["Name"]); // put back for PDF
                // updateLink(e);
                selectPerson(e);
            })
            .on("mouseover", function(d){
                if (allPeople[d][0].BirthDate > 0 ){
                mouseOverChartPeople(this,d,allPeople[d][0].BirthDate, allPeople[d][0].BirthDate + 45, "b. " + allPeople[d][0].BirthDate);
                } else {
                mouseOverChartPeople(this,d,allPeople[d][0].BirthDate, allPeople[d][0].BirthDate + 45, "b. " + Math.abs(allPeople[d][0].BirthDate) + " BC. ") ;    
                }   
            })
            .on("mouseout", mouseOut);
}

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
        textX: null,
        textY: null,
        startDots: [],
        endDots: [],
        underStart: null,
        underEnd: null,
        afterDots: [],
        mouseStart: birthDate,
        mouseEnd: deathDate,
        tooltipLabel: someGuy.DisplayName
    };

    switch (visualCase) {
        case "A": // 3 dots line 2 dots | unknown birth, unknown death, exact flourished date; exact alive date; flourished after; exact flourished date, certain life length; unknown birth, unknown death
            // start and end dots bracket the same span for the visual case
            config.lineStart = aliveDate - 25;
            config.lineEnd = aliveDate + 10;
            config.startDots = [-15, -10, -5];
            config.endDots = [5, 10];
            config.textX = aliveDate - 7;
            config.mouseStart = aliveDate - 40;
            config.mouseEnd = aliveDate + 20;
            config.tooltipLabel = "fl. " + aliveDate;
            break;
        case "B": // 7 dots | unknown birth, unknown death, approx flourished date; unknown birth, unknown death, alive after
            config.drawLine = false;
            // seven dots span the same full visual window
            config.lineStart = aliveDate - 40;
            config.lineEnd = aliveDate - 40;
            config.afterDots = [0, 10, 20, 30, 40, 50, 60];
            config.textX = aliveDate - 10;
            config.mouseStart = aliveDate - 40;
            config.mouseEnd = aliveDate + 20;
            config.tooltipLabel = "fl. ab. " + aliveDate;
            break;
        case "C": // solid line | unknown birth, exact death date, certain life length
            config.lineStart = deathDate - lifeLength;
            config.lineEnd = deathDate;
            config.textX = config.lineStart + (lifeLength / 2);
            config.mouseStart = config.lineStart;
            config.mouseEnd = config.lineEnd;
            config.tooltipLabel = "d. " + deathDate + ". " + lifeLength;
            break;
        case "D": // 3 dots solid line | unknown birth, exact death date; unknown birth, exact death date (?)
            // three dots at the start then the line to death
            config.lineStart = deathDate - 45;
            config.lineEnd = deathDate;
            config.startDots = [-15, -10, -5];
            config.textX = deathDate - 22;
            config.mouseStart = deathDate - 60;
            config.mouseEnd = deathDate;
            config.tooltipLabel = "d. " + deathDate;
            break;
        case "E": // 3 dots solid line 1 dot under end | unknown birth, approx death date
            config.lineStart = deathDate - 45;
            config.lineEnd = deathDate;
            config.startDots = [-15, -10, -5];
            config.underEnd = 0;
            config.textX = deathDate - 22;
            config.mouseStart = deathDate - 60;
            config.mouseEnd = deathDate;
            config.tooltipLabel = "d. " + deathDate;
            break;
        case "F": // 3 dots solid line 1 dot after end | unknown birth, died after
            config.lineStart = deathDate - 45;
            config.lineEnd = deathDate;
            config.startDots = [-15, -10, -5];
            config.afterDots = [5];
            config.textX = deathDate - 22;
            config.mouseStart = deathDate - 60;
            config.mouseEnd = deathDate + 5;
            config.tooltipLabel = "d. " + deathDate;
            break;
        case "G": // solid line 1 dot under end | unknown birth, approx death date, certain life length; exact birth date, unknown death, approx life length
            config.lineStart = birthDate;
            config.lineEnd = deathDate;
            config.underEnd = 0;
            config.textX = config.lineStart + ((config.lineEnd - config.lineStart) / 2);
            config.mouseStart = config.lineStart;
            config.mouseEnd = config.lineEnd;
            config.tooltipLabel = "d. " + deathDate + ". " + lifeLength;
            break;
        case "H": // 1 dot under start solid line | unknown birth, exact death date, approx life length
            config.lineStart = birthDate;
            config.lineEnd = deathDate;
            config.underStart = 0;
            config.textX = config.lineStart + ((config.lineEnd - config.lineStart) / 2);
            config.mouseStart = config.lineStart;
            config.mouseEnd = config.lineEnd;
            config.tooltipLabel = "d. " + deathDate + ". " + lifeLength;
            break;
        case "I": // 1 dot under start solid line 1 dot under end | unknown birth, approx death date, approx life length
            config.lineStart = birthDate;
            config.lineEnd = deathDate;
            config.underStart = 0;
            config.underEnd = 0;
            config.textX = config.lineStart + ((config.lineEnd - config.lineStart) / 2);
            config.mouseStart = config.lineStart;
            config.mouseEnd = config.lineEnd;
            config.tooltipLabel = "d. " + deathDate + ". " + lifeLength;
            break;
        case "J": // 1 dot under start solid line 1 dot after end | unknown birth, died after, approx life length
            config.lineStart = birthDate;
            config.lineEnd = deathDate;
            config.underStart = 0;
            config.afterDots = [5];
            config.textX = config.lineStart + ((config.lineEnd - config.lineStart) / 2);
            config.mouseStart = config.lineStart;
            config.mouseEnd = config.lineEnd + 5;
            config.tooltipLabel = "d. " + deathDate + ". " + lifeLength;
            break;
        case "K": // solid line 1 dot after end | exact birth date, unknown death, approx life length; exact birth date, died after
            config.lineStart = birthDate;
            config.lineEnd = lineEnd;
            config.afterDots = [5];
            config.textX = birthDate + ((lineEnd - birthDate) / 2);
            config.mouseStart = birthDate;
            config.mouseEnd = lineEnd + 3;
            config.tooltipLabel = "b. " + birthDate + " d. af. " + deathDate;
            break;
        case "L": // solid line 3 dots after | exact birth date, unknown death
            config.lineStart = birthDate;
            config.lineEnd = birthDate + Math.max(13, lifeLength);
            config.afterDots = [10, 15, 20];
            config.textX = config.lineStart + ((config.lineEnd - config.lineStart) / 2);
            config.mouseStart = birthDate;
            config.mouseEnd = config.lineEnd + 20;
            config.tooltipLabel = "b. " + birthDate;
            break;
        case "M": // solid line 1 dot after end | exact birth date, unknown death, alive after
            config.lineStart = birthDate;
            config.lineEnd = lineEnd;
            config.afterDots = [5];
            config.textX = birthDate + ((lineEnd - birthDate) / 2);
            config.mouseStart = birthDate;
            config.mouseEnd = lineEnd + 20;
            config.tooltipLabel = "b. " + birthDate + " d. af. " + deathDate;
            break;
        case "N": // one dot under before solid line 3 dots after | approx birth date, unknown death
            config.lineStart = birthDate;
            config.lineEnd = birthDate + 5;
            config.underStart = 0;
            config.afterDots = [10, 15, 20];
            config.textX = birthDate + 10;
            config.mouseStart = birthDate;
            config.mouseEnd = birthDate + 20;
            config.tooltipLabel = "b. " + birthDate;
            break;
        default:
            config.lineStart = deathDate - lifeLength;
            config.lineEnd = deathDate;
            config.textX = config.lineStart + (lifeLength / 2);
            config.mouseStart = config.lineStart;
            config.mouseEnd = config.lineEnd;
            config.tooltipLabel = someGuy.DisplayName;
            break;
    }

    if (config.textX === null) {
        config.textX = config.lineStart + ((config.lineEnd - config.lineStart) / 2);
    }

    return config;
}

function drawVisualPerson(key) {
    var someGuy = allPeople[key][0];
    var config = getVisualCaseConfig(someGuy);
    var dot = notBlack;
    var line = notBlack;

    if (config.drawLine) {
        peopleGroup.append("line")
            .datum(key)
            .attr("class", "people-lines")
            .attr("id", key)
            .attr("x1", xScale(parseDate(config.lineStart.toString())))
            .attr("y1", yScale(someGuy.LineNumber))
            .attr("x2", xScale(parseDate(config.lineEnd.toString())))
            .attr("y2", yScale(someGuy.LineNumber))
            .attr("stroke", line)
            .attr("stroke-width", lineWidths);
    }

    if (drawNames) {
        peopleGroup.append("text")
            .datum(key)
            .attr("class", "timeline-text-background")
            .attr("id", key)
            .attr("text-anchor", "middle")
            .text(function() { return someGuy.DisplayName; })
            .attr("x", xScale(parseDate(config.textX.toString())))
            .attr("y", yScale(someGuy.LineNumber) - lineOffset)
            .style("fill", backgroundLineColor);

        peopleGroup.append("text")
            .datum(key)
            .attr("class", "timeline-text")
            .attr("id", key)
            .attr("text-anchor", "middle")
            .text(function() { return someGuy.DisplayName; })
            .attr("x", xScale(parseDate(config.textX.toString())))
            .attr("y", yScale(someGuy.LineNumber) - lineOffset)
            .on("click", function(e) {
                selectPerson(key);
            })
            .on("mouseover", function() {
                mouseOverChartPeople(this, key, config.lineStart, config.lineEnd, config.tooltipLabel);
            })
            .on("mouseout", mouseOut);
    }

    if (config.startDots.length > 0) {
        config.startDots.forEach(function(offset) {
            peopleGroup.append("circle")
                .datum(key)
                .attr("class", "circles")
                .attr("id", key)
                .attr("cx", xScale(parseDate((config.lineStart + offset).toString())))
                .attr("cy", yScale(someGuy.LineNumber))
                .attr("r", dotSize)
                .attr("stroke-width", "0.4px")
                .style("fill", dot);
        });
    }

    if (config.afterDots.length > 0) {
        config.afterDots.forEach(function(offset) {
            peopleGroup.append("circle")
                .datum(key)
                .attr("class", "circles")
                .attr("id", key)
                .attr("cx", xScale(parseDate((config.lineEnd + offset).toString())))
                .attr("cy", yScale(someGuy.LineNumber))
                .attr("r", dotSize)
                .attr("stroke-width", "0.4px")
                .style("fill", dot);
        });
    }

    if (config.endDots && config.endDots.length > 0) {
        config.endDots.forEach(function(offset) {
            peopleGroup.append("circle")
                .datum(key)
                .attr("class", "circles")
                .attr("id", key)
                .attr("cx", xScale(parseDate((config.lineEnd + offset).toString())))
                .attr("cy", yScale(someGuy.LineNumber))
                .attr("r", dotSize)
                .attr("stroke-width", "0.4px")
                .style("fill", dot);
        });
    }

    if (config.underStart !== null) {
        peopleGroup.append("circle")
            .datum(key)
            .attr("class", "circles")
            .attr("id", key)
            .attr("cx", xScale(parseDate((config.lineStart + config.underStart).toString())))
            .attr("cy", yScale(someGuy.LineNumber) + (lineOffset * 1.2))
            .attr("r", dotSize)
            .attr("stroke-width", "0.4px")
            .style("fill", dot);
    }

    if (config.underEnd !== null) {
        peopleGroup.append("circle")
            .datum(key)
            .attr("class", "circles")
            .attr("id", key)
            .attr("cx", xScale(parseDate((config.lineEnd - config.underEnd).toString())))
            .attr("cy", yScale(someGuy.LineNumber) + (lineOffset * 1.2))
            .attr("r", dotSize)
            .attr("stroke-width", "0.4px")
            .style("fill", dot);
    }

    if (config.mouseStart !== null && config.mouseEnd !== null) {
        peopleGroup.append("line")
            .datum(key)
            .attr("class", "mouse-lines")
            .attr("id", key)
            .attr("x1", xScale(parseDate(config.mouseStart.toString())))
            .attr("y1", yScale(someGuy.LineNumber))
            .attr("x2", xScale(parseDate(config.mouseEnd.toString())))
            .attr("y2", yScale(someGuy.LineNumber))
            .attr("stroke", "transparent")
            .attr("stroke-width", "6px")
            .on("click", function() {
                selectPerson(key);
            })
            .on("mouseover", function() {
                mouseOverChartPeople(this, key, config.lineStart, config.lineEnd, config.tooltipLabel);
            })
            .on("mouseout", mouseOut);
    }
}

function drawVisualPeople() {
    people.forEach(function(key) {
        drawVisualPerson(key);
    });
}

function getIndexLineRenderers() {
    return [
        { enabled: case1, render: drawCase1 },
        { enabled: case2, render: drawCase2 },
        { enabled: case3, render: drawCase3 },
        { enabled: case4, render: drawCase4 },
        { enabled: case5, render: drawCase5 },
        { enabled: case6, render: drawCase6 },
        { enabled: case7, render: drawCase7 },
        { enabled: case8, render: drawCase8 },
        { enabled: case11, render: drawCase11 },
        { enabled: case13, render: drawCase13 },
        { enabled: case14, render: drawCase14 },
        { enabled: case15, render: drawCase15 }
    ];
}

function drawIndexPeople() {
    // the varying line style filter needs the index chart to exist before filtering, so render synchronously in that case
    var drawSynchronously = F_varyingLineStyle !== "";
    getIndexLineRenderers().forEach(function(caseRenderer) {
        if (caseRenderer.enabled) {
            if (drawSynchronously) {
                caseRenderer.render();
            } else {
                d3.timeout(caseRenderer.render, 1);
            }
        }
    });
}

// draw the all the names these will be redrawn many times
function drawLines(){
    mouseOut(); // if a tooltip was open, close it
    if (currentLineSystem === "visual") {
        drawVisualPeople();
        return;
    }
    drawBackgroundLines();
    drawIndexPeople();
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

function setFilterControlsEnabled(enabled) {
    var filterPanel = document.getElementById("filterControlsPanel");
    if (!filterPanel) return;
    filterPanel.classList.toggle("is-disabled", !enabled);
}

var F_diffChartName="";
var F_gender="";
var F_profession="";
var F_continent="";
var F_region="";
var F_LineStyle="";
var F_age="";
var F_alive="";

function buildFullFilterQuery(){
    globalFilterString = ''; // zero it out and check each switch every time


    // if (document.getElementById("name_CB").checked  == true){
    //     globalFilterString += F_diffChartName;
    // }
 
   if (F_gender  != ""){
        if (globalFilterString != '') globalFilterString += ' && '
        globalFilterString += F_gender;
    }
    if (F_profession  != ""){
        if (globalFilterString != '') globalFilterString += ' && '
        globalFilterString += F_profession;
    }
    if (F_LineStyle  != ""){
         if (globalFilterString != '') globalFilterString += ' && '
         globalFilterString += F_LineStyle;
     }
    if (F_varyingLineStyle  != ""){
         if (globalFilterString != '') globalFilterString += ' && '
         globalFilterString += F_varyingLineStyle;
     }
   
   if (F_age  != ""){
        if (globalFilterString != '') globalFilterString += ' && '
        globalFilterString += F_age ;
    }

    if (F_alive  != ""){
        if (globalFilterString != '') globalFilterString += ' && '
        globalFilterString += F_alive ;
    }
    
    if (F_continent!=""){
        if (globalFilterString != '') globalFilterString += ' && '
        globalFilterString += F_continent ;
    }
    if (F_region!=""){
        if (globalFilterString != '') globalFilterString += ' && '
        globalFilterString += F_region;
    }

    if (globalFilterString  == ''){
        globalFilterString = true;
    }

}



// functions for drawing by filters
function drawAllPeople(){
    // console.log("All button")

    currentCase = "drawAllPeople";
    changeCase = false;

    // clear all filters and rebuild the chart from the full data set
    clearCheckBoxes();
    buildFullFilterQuery();
    document.getElementById("userInput").value= "";
    setLoadingUI();
    setTimeout(function() {
        refreshChartForCurrentFilters();
        d3.selectAll(".f-list").classed("d-none",false); // add the display-none class to names in the filter list
        d3.selectAll(".f-list").classed("d-block",true); // remove the display-block class to names in the filter list
        d3.select("#descriptive_text").html("Click a name to view text."); // clear text description
    }, 0);
}


$("#ageAprox_CB").change(function() {
    // console.log("Age Aprox CB clicked");
    drawYoungPeople(ageSlider.noUiSlider.get()[0],ageSlider.noUiSlider.get()[1]);
});

$("#varyingLineStyle_CB").change(function() {
    // filter to show people that have different cases index vs visual
    // console.log("Varying line style checkbox clicked");
    if (document.getElementById("varyingLineStyle_CB").checked == true) {
        F_varyingLineStyle = "(someGuy.VisualCase != '' && someGuy.ExpectedVisualCase != '' && someGuy.VisualCase != someGuy.ExpectedVisualCase)";
    } else {
        F_varyingLineStyle = "";
    }

    buildFullFilterQuery();
    document.getElementById("userInput").value = "";
    setLoadingUI();
    setTimeout(function() {
        refreshChartForCurrentFilters();
    }, 0);
});

function drawYoungPeople(minAge, maxAge){
    // console.log("age range: " + minAge + " to " + maxAge)

    //var minAge = document.getElementById("userMinInput").value;
    //var maxAge = document.getElementById("userMaxInput").value;

    if (minAge == 1 && maxAge == 100){
      //full age range, only 'certain' ages
      if (document.getElementById("ageAprox_CB").checked == true){
        F_age = "(someGuy.lineType == 'case1'|| someGuy.lineType == 'case6')"
        currentCase = "drawYoungPeople";
        changeCase = false;
      } else{
          //full age range, all ages ('certain/uncertain')
         // clear slider
          currentCase = "";
          F_age = "";
      }

       
    } else if (minAge > 1 || maxAge < 100) {
            // console.log("age_CB clicked")
            // set radio button
            // document.getElementById("age_CB").checked = true;
            //update the current case values
            currentCase = "drawYoungPeople";
            changeCase = false; 
          
            F_age = " (((someGuy.lineType == 'case1'|| someGuy.lineType == 'case6') && (someGuy.LifeLength > " + minAge + " && someGuy.LifeLength < " + maxAge + '))'

            if (document.getElementById("ageAprox_CB").checked == false){
                F_age += "||( someGuy.AproxAge > " + minAge +  " && someGuy.AproxAge < " + maxAge + ')'
            }

            F_age += ")"
    }

    
    buildFullFilterQuery();
    document.getElementById("userInput").value= "";
    setLoadingUI();
    setTimeout(function() {
        filterPeople(allPeople, globalFilterString);
        document.body.classList.remove('waiting');
            document.getElementById("loader").style.display = "none";
    }, 0);

       
}


function drawAliveDuring(minYear, maxYear){
    // console.log("alive during: " + minYear + " to " + maxYear)

    //var minYear = document.getElementById("userMinInput").value;
    //var maxYear = document.getElementById("userMaxInput").value;

    if (minYear == -1800 && maxYear == 1800){
        // clear slider
        currentCase = "";
        F_alive = "";
    } else if (minYear > -1800 || maxYear < 1800) {
            //console.log("alive_CB clicked")
            // set radio button
            // document.getElementById("age_CB").checked = true;
            //update the current case values
            currentCase = "drawAliveDuring";
            changeCase = false; 
          
            F_alive = " ((someGuy.AproxBirthDate > " + minYear + " && someGuy.AproxBirthDate < " + maxYear + 
            ") || (someGuy.AproxDeathDate > " + minYear + " && someGuy.AproxDeathDate < " + maxYear + ')) '
    }

    
    buildFullFilterQuery();
    document.getElementById("userInput").value= "";
    setLoadingUI();
    setTimeout(function() {
        filterPeople(allPeople, globalFilterString);
        document.body.classList.remove('waiting');
            document.getElementById("loader").style.display = "none";
    }, 0);

       
}


//function for drawing by gender
function drawGender(gender){
    //document.getElementById("gender_CB").checked = true;
    document.getElementById('gender_label').innerHTML = gender;

    if (gender == "Any"){
        F_gender = "";
        currentCase = "";
        currentGender = "";
        changeCase = false;
    } else if (currentGender != gender || changeCase == true) {
        currentCase = "drawGender";
        changeCase = false;
        currentGender = gender;

        var filterString;
        switch(gender.toLowerCase()){
            case "female":
            case "male":
                filterString = "someGuy.gender=='" + gender.toLowerCase() + "'";
                break;
            default:
                filterString = "(someGuy.gender!='male' && someGuy.gender!= 'female')";
        }

        F_gender = filterString;
    }

    buildFullFilterQuery();
    // console.log(F_gender)
    setLoadingUI();
    setTimeout(function() {
        filterPeople(allPeople, globalFilterString);
        document.body.classList.remove('waiting');
        document.getElementById("loader").style.display = "none";
    }, 0);
}


function unmatchedNames(){
    //don't redraw if this is already the current case
    if (currentCase != "unmatchedNames" || changeCase == true){
        currentCase = "unmatchedNames";
        changeCase = false;
    }

    if (document.getElementById('name_CB').checked){ 
        //document.getElementById("currentFilter").innerHTML = "Names the appear differently on the chart and in the index";
        //clearTimeline();
         //if (globalFilterString != '') globalFilterString += ' && '
        F_diffChartName = "someGuy.Name != someGuy.DisplayName";       
    } 
     else {
        F_diffChartName = ''
     }
    //     globalFilterString = globalFilterString.replace("&& someGuy.Name != someGuy.DisplayName", "");
    //     globalFilterString = globalFilterString.replace("someGuy.Name != someGuy.DisplayName", "");
    // }
        buildFullFilterQuery();
        document.getElementById("userInput").value= "";
        setLoadingUI();
        setTimeout(function() {
            filterPeople(allPeople, globalFilterString);
            document.body.classList.remove('waiting');
            document.getElementById("loader").style.display = "none";
        }, 0);
}

function examplePeople(){
    // set radio button
    $("input[name=display_switch][value='example']").prop('checked', true);
    //don't redraw if this is already the current case
    if (currentCase != "examplePeople" || changeCase == true){
    currentCase = "examplePeople";
    changeCase = false;
    //document.getElementById("currentFilter").innerHTML = "Example group created by Preistley";
    //clearTimeline();
    document.getElementById("userInput").value= "";
    setLoadingUI();
    setTimeout(function() {
            filterPeople(allPeople, "someGuy.Name == 'Pindar' || someGuy.Name == 'Sophocles' || someGuy.Name == 'Xenophon' || someGuy.Name == 'Plato' || someGuy.Name == 'Terence'");
            document.body.classList.remove('waiting');
            document.getElementById("loader").style.display = "none";
        }, 0); 
    }
}

function examplePeople2(){
    // set radio button
     $("input[name=display_switch][value='example']").prop('checked', true);
    //don't redraw if this is already the current case
    if (currentCase != "examplePeople2" || changeCase == true){
        currentCase = "examplePeople2";
        changeCase = false;
        //document.getElementById("currentFilter").innerHTML = "Example group created by Preistley";
        //clearTimeline();
        document.getElementById("userInput").value= ""; 
        setLoadingUI();
        setTimeout(function() {
            filterPeople(allPeople, "someGuy.Name == 'Herodotus' || someGuy.Name == 'Agis' || someGuy.Name == 'Thucydides' || someGuy.Name == 'Abul Pharai' || someGuy.Name == 'Alain' || someGuy.Name == 'Epaminondas' || someGuy.Name == 'Euclid' || someGuy.Name == 'Suidas' || someGuy.Name == 'Hesychius'");
            document.body.classList.remove('waiting');
            document.getElementById("loader").style.display = "none";
        }, 0);
        //drawLines();   
    }
}


// functions for drawing by case (line style), using the dropdown
function drawCase(num){
    // console.log("click line style") 
    // set radio button
   // document.getElementById("line_CB").checked = true;
   
   currentLineSelection = num;

   if (num == 0 || num == "0"){
        F_LineStyle = "";
        currentCase = "";
        currentGender = "";
        changeCase = false;
    } else {

        //don't redraw if this is already the current case
        if (currentCase != "drawCase" || currentLineStyle != num  || changeCase == true){
        currentCase = "drawCase";
            currentLineStyle = num;
            changeCase = false;
        if (currentLineSystem === "visual") {
            filterString = "someGuy.VisualCase =='" + num + "'"
        } else {
            filterString = "someGuy.lineType =='case" + num + "'"
        }
        } 
        if (currentLineSystem === "visual") {
            filterString = "someGuy.VisualCase =='" + num + "'"
        } else if (num == 1){
            filterString = "someGuy.lineType == 'case1' || someGuy.lineType == 'case6'"; // if drawing case 1, also draw case 6, both are solid line
        } else if (num == 5){
            filterString = "someGuy.lineType == 'case5' || someGuy.lineType == 'case11'"; // if drawing case 5, also draw case 11
        } else if (num == 7){
            filterString = "someGuy.lineType == 'case7' || someGuy.lineType == 'case14'"; // if drawing case 7, also draw case 14
        } else {
            filterString = "someGuy.lineType =='case" + num +"'"
        }
        //document.getElementById("currentFilter").innerHTML = "Life drawn as " + lookupLineStyle(num);
        //clearTimeline();
        F_LineStyle = "(" + filterString + ")";

    }
    updateLineLabel();
    buildFullFilterQuery();
    document.getElementById("userInput").value= "";
    setLoadingUI();
    setTimeout(function() {
        refreshChartForCurrentFilters();
    }, 0);
       
}
// end drawing by case


//function for drawing by Profession dropdown
function drawProfession(professionCode){
    //form.elements["profession_label"][0].innerHTML = "New<br>Text";

    document.getElementById('profession_label').innerHTML = lookupProfessionCode(professionCode);
   // clear profession
   if (professionCode == "Any"){
        F_profession = "";
        currentCase = "";
        currentProfession = "";
        changeCase = false;
    } else

    //don't redraw if this is already the current case
    if (currentCase != "drawProfession" || currentProfession != professionCode || changeCase == true ){
        currentCase = "drawProfession";
        changeCase = false;
        currentProfession = professionCode;

       
        switch(professionCode){
              // HP cases  
              case 'HPAll':
                filterString = "someGuy.profession != null && someGuy.profession.includes('HP')"; 
                break;
              // Category cases    
              case 'HAL':
                filterString = "['Ant','Ch','Geo','H','L','Trav'].includes(someGuy.profession)";
                break;
              case 'OC':
                filterString = "['Bel','Cr','Or'].includes(someGuy.profession)";
                break;
              case 'AP':
                filterString = "['Act','Ar','Eng','Engineer','Mu','P','Pa','Pr','St'].includes(someGuy.profession)";
                break;
              case 'MP':
                filterString = "['Chy','M','Ph'].includes(someGuy.profession)";
                break;
              case 'DM':
                filterString = "['D','F','HP Sto','J','Met','Moh','Mor','Po','Pol','HP','HP Ac','HP Cyn','HP Cyr','HP Eleack','HP Eleat','HP Ep','HP Ion','HP Ital','HP Meg','HP Per','HP Scept','HP Soc'].includes(someGuy.profession)";
                break;
              // Duplicate cases (Just 'bel' at this point. Add 'Eleat' if we list out all HP cases)
              case 'Bel':
                filterString = "['Bel','Bell'].includes(someGuy.profession)"; // note 
                break;
              default:
                filterString = "someGuy.profession=='" + professionCode +"'"
        }
        
//        
//        if (professionCode == 'HPAll'){
//            filterString = "someGuy.profession != null && someGuy.profession.includes('HP')"; 
//        } else {
//            filterString = "someGuy.profession=='" + professionCode +"'"
//        }        

        //clearTimeline();
        F_profession = filterString;
    }

        buildFullFilterQuery();
        document.getElementById("userInput").value= "";
        setLoadingUI();
        setTimeout(function() {
            filterPeople(allPeople, globalFilterString);
            document.body.classList.remove('waiting');
            document.getElementById("loader").style.display = "none";
            
        }, 0);
    
}

//function for drawing by continent
function drawContinent(continent){

    document.getElementById('continent_label').innerHTML = continent;
    // set radio button
   if (continent == "Any"){
        F_continent = "";
        currentCase = "";
        currentContinent = "";
        changeCase = false;
    } else 
   
    //don't redraw if this is already the current case
    if (currentCase != "drawContinent" || currentContinent != continent || changeCase == true ){
        currentCase = "drawContinent";
        changeCase = false;
        //document.getElementById("currentFilter").innerHTML = "Continent is " + continent;
        
        
        currentContinent = continent;
        if(continent == "Unknown"){
            filterString = "(someGuy.Continent== null)"; // + continent +"' || someGuy.Continent=='')";
        } else if(continent == "America"){
            // test for any one value in the conditions list
            filterString = "(someGuy.Continent != null && ['Central America', 'North America'].some(el => someGuy.Continent.includes(el)))";
        }  else if(continent == "Asia"){
            // test for any one value in the conditions list
            filterString = "(someGuy.Continent != null && ['Asia', 'Eurasia'].some(el => someGuy.Continent.includes(el)))";
        }  else {
            filterString = "(someGuy.Continent != null && someGuy.Continent.includes('" + continent +"'))";
        }     
        
        //clearTimeline();
        F_continent = filterString;

    }
        buildFullFilterQuery();
        document.getElementById("userInput").value= "";
        setLoadingUI();
        setTimeout(function() {
            filterPeople(allPeople, globalFilterString);
            document.body.classList.remove('waiting');
            document.getElementById("loader").style.display = "none";
        }, 0);
}

//function for drawing by region
function drawRegion(region){

    document.getElementById('region_label').innerHTML = region;
    // set radio button
   if (region == "Any"){
        F_region = "";
        currentCase = "";
        currentRegion = "";
        changeCase = false;
       //selectRegion(null) // select on map
    } else 
   
    //don't redraw if this is already the current case
    if (currentCase != "drawRegion" || currentRegion != region || changeCase == true ){
        if (page=="twoCharts.html"){
            selectRegion(region) // select on map            
        }

        currentCase = "drawRegion";
        changeCase = false;
        //document.getElementById("currentFilter").innerHTML = "Continent is " + continent;
        
        
        currentRegion = region;
        if(region == "Unknown"){
            filterString = "(someGuy.Region== '')"; // + continent +"' || someGuy.Continent=='')";
            F_region = "";
        } else {
            filterString = "(someGuy.Region != '' && someGuy.Region.includes('" + region +"'))";
        }     
        
        //clearTimeline();
        F_region = filterString;

    }
        buildFullFilterQuery();
        document.getElementById("userInput").value= "";
        setLoadingUI();
        setTimeout(function() {
            filterPeople(allPeople, globalFilterString);
            document.body.classList.remove('waiting');
            document.getElementById("loader").style.display = "none";
        }, 0);
}

// function for drawing by user entered text
function userNameFunction() {

    // set radio button
    $("input[name=display_switch][value='all']").prop('checked', true);
    currentCase = "userNameFunction";
    if (nameFilterTimeoutId) {
        clearTimeout(nameFilterTimeoutId);
    }

    nameFilterTimeoutId = setTimeout(function() {
        setLoadingUI();
        clearCheckBoxes();

        var x = document.getElementById("userInput").value;
        filterString = "someGuy.Name.toLowerCase().includes('"+ escapeQuotes(x) + "'.toLowerCase())"; // NameInIndex
        filterString += "|| someGuy.DisplayName.toLowerCase().includes('"+ escapeQuotes(x) + "'.toLowerCase())"; // NameOnChart
        filterString += "|| someGuy.BioName.toLowerCase().includes('"+ escapeQuotes(x) + "'.toLowerCase())"; // Bio Name (from source)

        var peopleFilterPredicate = compilePeopleFilterPredicate(filterString);
        currentFilterMatchSet = peopleFilterPredicate ? new Set() : null;

        if (currentFilterMatchSet) {
            Object.keys(allPeople).forEach(function(key) {
                var person = allPeople[key][0];
                if (peopleFilterPredicate(person)) {
                    currentFilterMatchSet.add(key);
                }
            });
        }

        // console.log(x);
        setTimeout(function() {
            filterPeople(allPeople, filterString);
            document.body.classList.remove('waiting');
            document.getElementById("loader").style.display = "none";
        }, 0);
    }, nameFilterDebounceMs);
}

function escapeQuotes(str) {
    return String(str).replace(/'/g, "\\'").replace(/"/g, '\\"');
}

function clearTimeline(){ 
    // fade everything,
    peopleGroup.selectAll(".people-lines, .circles, .timeline-text, .mouse-lines, .people-lines-background, .circles-background, .timeline-text-background")
        //.attr('pointer-events', 'none') // prevent mouse interaction while fading
        //.transition().duration(300) 
        //.style("opacity", 1e-6)//fade to near 0 before removing
        .remove();
    // no map on new page 
      //  if (page == "biographyMap.html"){ clearMapPeople(); }
//    mouseOut(); // if a tooltip was open, close it
//    document.getElementById("wikiLink").innerHTML = 'Click on a chart name to view their Wikipedia page, if available.';

}

//function fadeIn(){ 
//    // NOTE: sometimes the tooltip opens while things are fading, so close it (may be a cleaner way to do this) 
//    // fade everything,
//    peopleGroup.transition()
//        .duration(800)
////        .attr("opacity", 1.0) //we can't fade them in = 0 as the math messes up in the fade
//        .style("fill", "red");
////        .style("font-size", "2em");
//}


function drawNameFunc() {
    // do draw names
    if(document.getElementById("drawName_CB").checked){
        drawNames = true;

        var idsToShow = currentFilterMatchSet ? Array.from(currentFilterMatchSet) : null;

        if (!idsToShow) {
            // show all names when no filters are active
            peopleGroup.selectAll(".timeline-text,.timeline-text-background")
                .classed("d-none", false)
                .classed("hiddenGuy", false);
        } else {
            // show only filtered names
            peopleGroup.selectAll(".timeline-text,.timeline-text-background")
                .classed("d-none", true)
                .classed("hiddenGuy", false);

            idsToShow.forEach(function(id) {
                peopleGroup.selectAll("#" + id + ".timeline-text,#" + id + ".timeline-text-background")
                    .classed("d-none", false)
                    .classed("hiddenGuy", false);
            });
        }

    // remove names   
    } else {
        drawNames = false;
       // peopleGroup.selectAll(".timeline-text-background,.timeline-text")
       // .classed("d-none",true);
        peopleGroup.selectAll(".timeline-text-background,.timeline-text")
         .classed("d-none",true);



    }
}

    // console.log(checkBox.checked);
    // changeCase = true; // set the fact we DO want to redraw this case
    // drawNames = checkBox.checked; // change the value of the state
    

    // if (drawNames == false){
    //     peopleGroup.selectAll(".timeline-text-background, .timeline-text")
    //     //.attr('pointer-events', 'none') // prevent mouse interaction while fading
    //     //.transition().duration(300) 
    //     .style("opacity", 1e-6)//fade to near 0 before removing
    //     //.remove();
    // } else {
    //     // remove em all This slows it down. Perhaps find a better way of only adding what is needed
    //     peopleGroup.selectAll(".timeline-text-background, .timeline-text")
    //     //.attr('pointer-events', 'none') // prevent mouse interaction while fading
    //     //.transition().duration(300) 
    //     .style("opacity", 0.4)//fade to near 0 before removing
    //     //.remove();

    //     // add em all back
    //     //drawBackgroundLines();
    //     lookupCase(currentCase); // rerun the current case
    // }

    //

    // no map on new page 
      //  if (page == "biographyMap.html"){ clearMapPeople(); }
    
//}

function mouseOverChartSection(thisSection, d, section){
    d3.select(thisSection).attr("fill-opacity", 0.23)
    d3.select(thisSection).attr("stroke", "dimgrey")
   //console.log(sectionText[section]['label'])
    
    //get ruler
    
//    var rect = e.target.getBoundingClientRect();
//    var x = e.clientX - rect.left; //x position within the element.
    
//    console.log(d3.event.x) // NEED TO SCALE x for current zoom...
//    console.log(d3.event) // NEED TO SCALE x for current zoom...
    
    var hoverYearLabel = getHoverYearLabel();
    var tooltipHTML = sectionText[section]['label'] + "<br/>";
    if (hoverYearLabel) {
        tooltipHTML += hoverYearLabel + "<br/>";
    }
    tooltipHTML += "Era of " + findRuler(d3.event.x) + "<br/>";
    
    toolTip.html(tooltipHTML)
      .style("left", (d3.event.pageX) + "px")     
      .style("top", (d3.event.pageY) + "px");  

    toolTip.transition()
         .duration(100)    
         .style("opacity", .9);
}

function getHoverYearLabel() {
    if (!d3.event) return "";
    var mouse = d3.mouse(svg.node());
    if (!mouse) return "";
    var viewport = getChartViewport();
    var scale = (viewport.wide / outerWidth) * currentZoom;
    if (!scale) return "";
    var chartX = (mouse[0] - currentDragX) / scale;
    var dateValue = xScale.invert(chartX);
    if (!dateValue || isNaN(dateValue.getTime())) return "";

    var yearValue = dateValue.getFullYear();
    if (isNaN(yearValue)) return "";
    var roundedYear = Math.round(yearValue);
    if (roundedYear === 0) return "1 BC";
    if (roundedYear < 0) return Math.abs(roundedYear) + " BC";
    return "AD " + roundedYear;
}

function mouseOutChartSection(thisSection){
    d3.select(thisSection)
        .attr("fill-opacity", 0.13)
        .attr("stroke", "none");
    mouseOut();

}


function mouseOverSectionTitle(d){
    var sectionID = sectionText[d.section].label.replace(/\s/g, "") // name of section without spaces
    //console.log(sectionID)
    svg.select("rect[id='"+sectionID+"']").attr("fill-opacity", 0.23)
    svg.select("rect[id='"+sectionID+"']").attr("stroke", "dimgrey")
   //console.log(sectionText[section]['label'])
    var tooltipHTML = d.label

    toolTip.html(tooltipHTML)
      .style("left", (d3.event.pageX - 125) + "px")     
      .style("top", (d3.event.pageY) + "px");  

    toolTip.transition()
         .duration(100)    
         .style("opacity", .9);
}

function mouseOutSectionTitle(d){
    var sectionID = sectionText[d.section].label.replace(/\s/g, "") // name of section without spaces
    //console.log(sectionID)
    svg.select("rect[id='"+sectionID+"']")
        .attr("fill-opacity", 0.13)
        .attr("stroke", "none");
    mouseOut();

}

function isVaryingLineStyleActive() {
    // check if the varying line style filter is currently active
    var checkbox = document.getElementById("varyingLineStyle_CB");
    return (checkbox && checkbox.checked) || F_varyingLineStyle !== "";
}

function getPersonIndexLineImage(person) {
    // grab the image of both cases for the varying line style hover tooltip
    var caseCode = String(person.lineType || "").trim().toLowerCase();
    var caseMatch = caseCode.match(/\d+/);
    var caseNumber = caseMatch ? parseInt(caseMatch[0], 10) : null;

    if (caseCode.indexOf("case") === 0) {
        return caseCode + ".png";
    }
    if (caseNumber) {
        return "case" + caseNumber + ".png";
    }
    return "";
}

function getPersonVisualLineImage(person) {
    var visualCase = person.VisualCase || person.ExpectedVisualCase || "";
    return lookupVisualCaseImage(visualCase) || "";
}



 function mouseOverChartPeople(thisThing, key, fromDate, toDate, indexText){
//function mouseOverChartPeople(d, fromDate, toDate, indexText){
    //console.log("thisThing getBoundingClientRect().right:")
    temp = thisThing;
    //console.log(thisThing.getBoundingClientRect().right)

    // if the tooltip was triggered by a mouseover
    if (d3.event.pageX == undefined){
         // console.log("event undefined")
         newX = Math.round(thisThing.getBoundingClientRect().right) + 5;  
         newY =  Math.round(window.pageYOffset + thisThing.getBoundingClientRect().top - margin.top); // minus the header;
         // console.log("top: " + thisThing.getBoundingClientRect().top)
         // console.log("ctm: " + thisThing.getCTM().top)
         // console.log("ctm inverse: " + thisThing.getCTM().inverse)
         //console.log(allPeople[d][0].LineNumber)
         // newY = Math.round(thisThing.getBoundingClientRect().top);
    } else { // was triggered programmatically 
        newX = d3.event.pageX;
        newY = d3.event.pageY;
    }
    // console.log("New X,Y")
    // console.log(newX+ ", " + newY)
     
    var tooltipHTML = ""

    var G; // gender
    //if (allPeople[key][0].gender != null && allPeople[key][0].gender != '0' && allPeople[key][0].gender !='unsure') {
    if (allPeople[key][0].gender == "male" || allPeople[key][0].gender == "female"){
        G = allPeople[key][0].gender
        //capitalize
        G= G[0].toUpperCase() + G.substr(1)
    } else G = "Unknown";
    var P; // profession
    if (allPeople[key][0].profession !== undefined && allPeople[key][0].profession != "" && allPeople[key][0].profession != "X") {
        P = allPeople[key][0].profession;
    } else P = "";

    var A = ""; // age
    if (allPeople[key][0].LifeLength > 0) {
        if (allPeople[key][0].LifePrecision != "") A = "~ "
        A += allPeople[key][0].LifeLength;
    } else {
        if (allPeople[key][0].AproxAge === 45 || allPeople[key][0].AproxAge === 0 || isNaN(allPeople[key][0].AproxAge)) {
            A = "unknown";
        } else {
            A = "~ " + String(allPeople[key][0].AproxAge);
        }
    }


    var bornUncertainty ="";
    var thisCase = currentLineSystem === "visual" && allPeople[key][0].VisualCase ? allPeople[key][0].VisualCase : allPeople[key][0].lineType
    var tooltipCaseKey = allPeople[key][0].lineType || thisCase;
    var isEstimatedAge = allPeople[key][0].LifePrecision != "" || tooltipCaseKey == "case4" || tooltipCaseKey == "case5";
    if (A && A !== "unknown" && isEstimatedAge && A.indexOf("~") !== 0) {
        A = "~ " + A;
    }
    if (tooltipCaseKey == "case2" || tooltipCaseKey == "case4" || tooltipCaseKey == "case3" || tooltipCaseKey == "case8" || tooltipCaseKey == "case13") {
        bornUncertainty = "~ ";
    }

    var deathUncertainty ="";
    if (tooltipCaseKey == "case5" || tooltipCaseKey == "case7" || tooltipCaseKey == "case11" || tooltipCaseKey == "case14" || tooltipCaseKey == "case3" || tooltipCaseKey == "case8" || tooltipCaseKey == "case13") {
        deathUncertainty = "~ ";
    }
    
    var ageScale = 1.7; // to make the image wider if needed
    var ageWidth = (allPeople[key][0].AproxAge) * ageScale;
     
    // region
    var R = "";
    if (allPeople[key][0].Region != 0 || allPeople[key][0].Region == 'Unknown') {
        R = allPeople[key][0].Region
    } else {
         R = 'Unknown'
    };
//     var firstLine = thisCase + " " +
    var firstLine = "<span id='tooltip_topline'>"+allPeople[key][0].Name +" " + indexText + " " + P +"</span>";
    var lineStyleInfo = "";
    if (isVaryingLineStyleActive()) {
        // if the varying line style filter is active, show both styles with labels
        var indexImage = getPersonIndexLineImage(allPeople[key][0]);
        var visualImage = getPersonVisualLineImage(allPeople[key][0]);
        var indexLabel = currentLineSystem === "index" ? "<strong>Index</strong>" : "Index";
        var visualLabel = currentLineSystem === "visual" ? "<strong>Engraved chart</strong>" : "Engraved chart";
        var indexImg = indexImage ? "<img src='biography/img/" + indexImage + "' height='12px' />" : "";
        var visualImg = visualImage ? "<img src='biography/img/" + visualImage + "' height='12px' />" : "";

        if (indexImg || visualImg) {
            lineStyleInfo = "<span>Line style variation:</span>" +
                "<span style='display:block; margin-left:12px;'>" + indexLabel + ": " + indexImg + "</span>" +
                "<span style='display:block; margin-left:12px; margin-bottom:6px;'>" + visualLabel + ": " + visualImg + "</span>";
        }
    }
    

    
    var tooltipImage = currentLineSystem === "visual" ? lookupVisualCaseImage(thisCase) : "";
    if (!tooltipImage) {
        tooltipImage = thisCase + ".png";
    }
    var imgItem = "<img src='biography/img/" + tooltipImage + "' height='12px' width='" + ageWidth + "'> "
    
    
    var startDateText = "";
    var endDateText = "";
    var underText = ""
    
    if (fromDate < 0 && toDate > 0 ){
        startDateText = bornUncertainty + Math.abs(fromDate) + " BC ";
        endDateText = toDate;
    } else if (fromDate < 0 ){
        startDateText = bornUncertainty + Math.abs(fromDate) + " BC ";
        endDateText = deathUncertainty+ Math.abs(toDate)+ " BC";
    } else{
        startDateText = bornUncertainty;
        endDateText = deathUncertainty + toDate;
    } 
     

     


if (tooltipCaseKey == "case2" ||  tooltipCaseKey == "case8") {
    startDateText = "" // no text before line
    A = "unknown" // replace age

} 
     
if (tooltipCaseKey == "case3"||  tooltipCaseKey == "case13") {
     startDateText = "" // no text before line
     endDateText = "" // no text after line
     A = "unknown" // replace age
     if (allPeople[key][0].AliveDate < 0 ){
         var underDate =  Math.abs(allPeople[key][0].AliveDate) + " BC"
     } 
    if (allPeople[key][0].AliveDate > 0 ) {
         var underDate = allPeople[key][0].AliveDate 
     }
     underText = "<br/><span style='padding-left:1.5em; margin-top:-2em;'>"+ underDate + "<br/></span>"
}
     
   var lastLine = "    Lifespan: " + A +" years<br/>Profession: " +  lookupProfessionCode(allPeople[key][0].profession) + "<br> Gender: " + G + " <br/>Region: " + R;  
     
    var showTimelineText = !isVaryingLineStyleActive();
    var timelineText = showTimelineText
        ? "<span id='tooltip_timeline_text'>" + startDateText + imgItem + endDateText + underText + "</span>"
        : "";
    tooltipHTML = firstLine + lineStyleInfo + timelineText + lastLine;  
    
    
    
    




          
     
     toolTip.html(tooltipHTML)
            .style("left", newX + "px")   
            .style("top", newY + "px");

//    toolTip.classed('old-looking-font',true);

    toolTip.transition()
         .duration(100)    
         .style("opacity", .9); 
}


function lookupCase(inputCase) {
  switch (inputCase){
        case "drawAllPeople":
            return drawAllPeople();
        case "drawYoungPeople":
            return drawYoungPeople();
        case "unmatchedNames":
            return unmatchedNames();
        case "femalePeople":
            return femalePeople();
        case "examplePeople":
            return examplePeople();
        case "drawProfession":
            return drawProfession(currentProfession);
        case "drawCase":
            return drawCase(currentLineStyle);
        case "userFunction":
            return userFunction();
  }
}


// for looking up colors to fill polygons. NOTE if changing, also change lookupColorRGBA()
function lookupColor(inputColor) {
	switch (inputColor){
		case "pink":
			return "lightpink";
		case "blue":
			return "lightskyblue";
		case "yellow":
			return "khaki";
		case "green":
			return "darkseagreen";
		default:
			return "transparent";
 }
}


// for looking up colors to fill polygons, adds 0.13 opacity, NOTE related to lookupColor()
function lookupColorRGBA(inputColor) {
  switch (inputColor){
    case "pink":
      return "rgba(255,182,193,0.13)";
    case "blue":
      return "rgba(135, 206, 250,0.13)";
    case "yellow":
      return "rgba(240, 230, 140,0.13)";
    case "green":
      return "rgba(143, 188, 143,0.13)";
    default:
      return "transparent";
 }
}


function lookupSectionColor(inputSection) {
	switch (inputSection){
		case "Divines and Metaphysicians &cc":
			return lookupColor(pink);
		case "Mathematicians &cc Physicians":
			return lookupColor(blue);
		case "Artists Poets":
			return lookupColor(yellow);
		case "Orators and Critics &cc":
			return lookupColor(pink);
        case "Historians and Antiquaries Lawyers":    
            lookupColor(green);
        case "Statesmen and Warriors":
			return lookupColor(yellow);
		default:
			return "black";
 }
}


function setProfessionDropDownColors(){
  d3.selectAll(".pink-bg").style("background-color",lookupColorRGBA("pink"));
  d3.selectAll(".blue-bg").style("background-color",lookupColorRGBA("blue"));
  d3.selectAll(".green-bg").style("background-color",lookupColorRGBA("green"));
  d3.selectAll(".yellow-bg").style("background-color",lookupColorRGBA("yellow"));
}

function compilePeopleFilterPredicate(peopleFilter) {
    // compile the filter string once so the person loop can reuse a function instead of repeatedly calling eval
    if (peopleFilter === true) return null;

    try {
        return new Function("someGuy", "return (" + peopleFilter + ");");
    } catch (error) {
        // console.log("filter compile failed", error);
        return function() { return true; };
    }
}

function getForegroundPeople(keys) {
    // use the cached match set to keep only the people that survived the current filter
    if (!currentFilterMatchSet) return keys;
    return keys.filter(function(key) {
        return currentFilterMatchSet.has(key);
    });
}

// console.log("middle of JS")

function clearSelectedPeople(){
    mouseOut(); // close the tooltip
    d3.selectAll(".selectedGuy").classed("selectedGuy", false); 
    d3.selectAll(".selectedGuyText").classed("selectedGuyText", false); 
    d3.selectAll(".selectedGuyBox").classed("selectedGuyBox", false); 
    d3.selectAll("#clearSelectionButton").classed("disabled", true);
    //updateLink(''); //update link with a null
    d3.select("#selectedLink").remove();
    d3.select("#descriptive_text").html("Click a name to view text.");

    d3.selectAll(".s-list").remove(); // remove all the elements in the selector box 
    
    // empty out the click list
    clickList = [];
}

function restoreSelectedPeople() {
    // after a redraw, reapply the selected classes so previously selected people stay highlighted
    if (!clickList || clickList.length === 0) return;

    clickList.forEach(function(id) {
        peopleGroup.selectAll(".people-lines,.circles")
            .filter(function(s) {
                return s == id;
            })
            .classed("selectedGuy", true);

        peopleGroup.selectAll(".timeline-text,.timeline-text-background")
            .filter(function(s) {
                return s == id;
            })
            .classed("selectedGuyText", true);
    });
}

function logChartReady(sourceLabel) {
    var now = new Date();
    // console.log(now.toUTCString() + " chart ready: " + sourceLabel);
}


// person clicked in chart
function selectPerson(e){
        
     //console.log("e " + e)
	 //console.log("display name " + e.DisplayName)
     //console.log("link " + e.Link)
    // remove the selected class from existing selected guy (on chart and in list)
    //clearSelectedPerson();
    d3.selectAll("#clearSelectionButton").classed("disabled", false);
    // change color of the solid lines, solid dots, and timeline-text

    
    
     // select name from list
    var  id = e;// e.DisplayName.replace(/[\'\. ,:-]+/g, "-")
    thisGuy = document.getElementById(id)
//    thisGuy.scrollIntoView();
  
    // check if name is NOT in list
   if( clickList.indexOf(e) === -1) {

    
        clickList.push(e)
        //sort the people in the list
            clickList = clickList.sort((a, b) => d3.ascending(allPeople[a][0].Name, allPeople[b][0].Name)) // sort by name in index

       // highlight the person's lines and dots on the chart 
       peopleGroup.selectAll(".people-lines,.circles")
        .filter(function(s) {
                return (s == e); 
        }).classed("selectedGuy",true);
       
       // highlight the person's name on the chart 
        peopleGroup.selectAll(".timeline-text,.timeline-text-background")
        .filter(function(s) {
                return (s == e); 
        }).classed("selectedGuyText",true);

        //peopleGroup.selectAll(".selectedGuy").scrollIntoView;




        // if the name is in the list, scroll it to the top
        thisElement = document.getElementById("list-"+id)
    //    d3.selectAll("#list-"+id).classed("selectedGuy",true); 
    //    console.log(thisElement.offsetTop)
        var topPos  = thisElement.offsetTop;

        // scroll to person
    //    $("#filterResultsBox").animate({scrollTop:topPos-30},500);
        populateSelectionBox();
        // add the person's description
        setDescriptiveText(id) 

    } else { 
        // console.log("This person is already selected");
        // resultUnClicked(id);  // unselects the person if clicked
        setDescriptiveText(e) // keep them in the selection list and put their info in the description box
    
    }

    flyToPerson(id);
}



function populateSelectionBox(){
    var selectionList = d3.selectAll('#selectionResultsBox')
    selectionList.text("")// empty list
    selectionList.selectAll("element")
     .data(clickList)
     .enter().append("div")
     .html(function(thisGuy) { 
        return allPeople[thisGuy][0].Name + `<i class="fa fa-minus-square-o" aria-hidden="true" onclick="resultUnClicked('`+thisGuy+`')"></i>`; })
     .attr("id", function(thisGuy) { return "selectList-"+ thisGuy; })
//     .sort(d3.ascending)
//     .sort((a, b) => d3.descending(a.DisplayName, b.DisplayName)) // sort by displayname
     .attr('class','s-list selectedGuyBox')
     .attr('style','direction: ltr')
     .on("click", function(e){ 
//           setDescriptiveText(e)
            resultClicked()
     });
}


function lookupProfessionCode(inputProfession) {
    switch (inputProfession){
        case "Any":
            return "Any";
        case "HPAll":
            return "Heathen philosophers (all)";
        case "HP Ion":
            return "Heathen philosopher - Ionic sect";
        case "HP Soc":
            return "Heathen philosopher - Socratic";
        case "HP Cyr":
            return "Heathen philosopher - Cyrenaic";
        case "HP Meg":
            return "Heathen philosopher - Megaric";
        case "HP Eleat":
            return "Heathen philosopher - Eleatic";
        case "HP Eleack":
            return "Heathen philosopher - Eleack";
        case "HP Ac":
            return "Heathen philosopher - Academic";
        case "HP Per":
            return "Heathen philosopher - Peripatetic";
        case "HP Sto":
            return "Heathen philosopher - Stoic";
        case "HP Cyn":
            return "Heathen philosopher - Cynic";
        case "HP Ital":
            return "Heathen philosopher - Italic";
        case "HP Scept":
            return "Heathen philosopher - Sceptic";
        case "HP Ep":
            return "Heathen philosopher - Epicurean";
        case 'D':
            return 'Christian divine';
        case 'F':
            return 'Christian father';
        case 'J':
            return 'Jewish prophet or rabbi'; // note adapted from "Jew"
        case 'Met':
            return 'Metaphysician';
        case 'Moh':
            return 'Mohammedan doctor';
        case 'Mor':
            return 'Moralist';
        case 'Po':
            return 'Pope';
        case 'Pol':
            return 'Political writer';
        case 'HP':
            return 'Heathen philosopher';
        case 'Chy':
            return 'Chemist';
        case 'M':
            return 'Mathematician';
        case 'Ph':
            return 'Physician';
        case 'Act':
            return 'Actor';
        case 'Ar':
            return 'Architect';
        case 'Eng':
            return 'Engraver';
        case 'Engineer':
            return 'Engineer';
        case 'Mu':
            return 'Musician';
        case 'P':
            return 'Poet';
        case 'Pa':
            return 'Painter';
        case 'Pr':
            return 'Printer';
        case 'St':
            return 'Statuary';
        case 'Bel':
            return 'Belles lettres';
        case 'Cr':
            return 'Critic';
        case 'Or':
            return 'Orator';
        case 'Ant':
            return 'Antiquary';
        case 'Ch':
            return 'Chronologer';
        case 'Geo':
            return 'Geographer';
        case 'H':
            return 'Historian';
        case 'L':
            return 'Lawyer';
        case 'Trav':
            return 'Traveller';
        case 'X':
            return 'Statesman or warrior';
            
            
            
        default:
            return "";
    }
}

function lookupLineStyle(inputLineStyle) {
    switch (inputLineStyle){
        case 1:
            return "Solid line (case1 or 6)";
        case 2:
            return "3 starting dots (case2)";
        case 3:
            return "3 starting dots and 2 ending (case3)";
        case 4:
            return "1 dot beneath beginning (case4)";
        case 5:
            return "1 dot beneath ending (case5 or 11)";
        case 7:
            return "1 dot end (case7 or 14)";
        case 8:
            return "3 starting dots and 1 ending (case8)";
        case 13:
            return "Seven dots (case13)";
        case 14:
            return "1 dot end 2 (case14)";
        case 15:
            return "2 dot end (case15)";
        default:
            return "";
    }
}

function lookupVisualLineStyle(inputVisualCase) {
    switch (inputVisualCase) {
        case "A":
            return "3 dots line 2 dots";
        case "B":
            return "7 dots";
        case "C":
            return "solid line";
        case "D":
            return "3 dots solid line";
        case "E":
            return "3 dots solid line 1 dot under end";
        case "F":
            return "3 dots solid line 1 dot after end";
        case "G":
            return "solid line 1 dot under end";
        case "H":
            return "1 dot under start solid line";
        case "I":
            return "1 dot under start solid line 1 dot under end";
        case "J":
            return "1 dot under start solid line 1 dot after end";
        case "K":
            return "solid line 1 dot after end";
        case "L":
            return "solid line 3 dots after";
        case "M":
            return "solid line 1 dot after end";
        case "N":
            return "one dot under before solid line 3 dots after";
        default:
            return "";
    }
}

function lookupExpectedVisualCaseFromOriginalCase(inputCase) {
    // for finding differences between original index cases vs new visual cases
    var caseCode = String(inputCase || "").trim().toLowerCase();
    var caseCodeToVisualCase = {
        "case1": "C",
        "case2": "D",
        "case3": "A",
        "case4": "H",
        "case5": "I",
        "case6": "G",
        "case8": "F",
        "case11": "G",
        "case13": "B",
        "case14": "M",
        "case15": "L"
    };

    return caseCodeToVisualCase[caseCode] || "";
}

function lookupVisualCaseImage(inputVisualCase) {
    // mapping for visual case images
    var visualCaseToImage = {
        A: "case3.png",
        B: "case13.png",
        C: "case1.png",
        D: "case2.png",
        E: "CaseE.png",
        F: "case5.png",
        G: "case5.png",
        H: "case4.png",
        I: "CaseI.png",
        J: "caseJ.png",
        K: "case14.png",
        L: "case15.png",
        M: "case14.png",
        N: "CaseN.png"
    };

    return visualCaseToImage[inputVisualCase] || "";
}

var indexLineChoices = [
    { value: 0, label: "Any", image: "" },
    { value: 1, label: "Death year and life span", image: "biography/img/case1.png" },
    { value: 2, label: "Death year", image: "biography/img/case2.png" },
    { value: 3, label: "Flourished year", image: "biography/img/case3.png" },
    { value: 4, label: "Death year and approx life span", image: "biography/img/case4.png" },
    { value: 5, label: "Approx death year & approx life span", image: "biography/img/case5.png" },
    { value: 7, label: "Birth year and approx death year", image: "biography/img/case7.png" },
    { value: 8, label: "Approx death year", image: "biography/img/case8.png" },
    { value: 13, label: "Approx flourished year", image: "biography/img/case13.png" },
    { value: 15, label: "Birth year", image: "biography/img/case15.png" }
];

var visualLineChoices = [
    { value: "A", label: "3 dots line 2 dots", image: "biography/img/case3.png" },
    { value: "B", label: "7 dots", image: "biography/img/case13.png" },
    { value: "C", label: "solid line", image: "biography/img/case1.png" },
    { value: "D", label: "3 dots solid line", image: "biography/img/case2.png" },
    { value: "E", label: "3 dots solid line 1 dot under end", image: "biography/img/CaseE.png" },
    { value: "F", label: "3 dots solid line 1 dot after end", image: "biography/img/case5.png" },
    { value: "G", label: "solid line 1 dot under end", image: "biography/img/case5.png" },
    { value: "H", label: "1 dot under start solid line", image: "biography/img/case4.png" },
    { value: "I", label: "1 dot under start solid line 1 dot under end", image: "biography/img/CaseI.png" },
    { value: "J", label: "1 dot under start solid line 1 dot after end", image: "biography/img/caseJ.png" },
    { value: "K", label: "solid line 1 dot after end", image: "biography/img/case14.png" },
    { value: "L", label: "solid line 3 dots after", image: "biography/img/case15.png" },
    { value: "M", label: "solid line 1 dot after end", image: "biography/img/case14.png" },
    { value: "N", label: "one dot under before solid line 3 dots after", image: "biography/img/CaseN.png" }
];

function getCurrentLineChoices() {
    return currentLineSystem === "visual" ? visualLineChoices : indexLineChoices;
}

function getLineChoiceLabel(selection) {
    var choices = getCurrentLineChoices();
    for (var i = 0; i < choices.length; i += 1) {
        if (choices[i].value === selection) {
            return choices[i].label;
        }
    }
    return "";
}

function updateLineSystemLabel() {
    var button = document.getElementById("case_system_label");
    if (!button) return;
    var label = currentLineSystem === "visual" ? "Engraved Chart" : "Index";
    button.innerHTML = label + '<span class="caret"></span>';
}

function updateLineLabel() {
    var button = document.getElementById("line_label");
    if (!button) return;
    if (currentLineSelection === 0 || currentLineSelection === "0" || currentLineSelection === "") {
        button.innerHTML = "Any<span class=\"caret\"></span>";
        return;
    }

    var label = currentLineSystem === "visual" ? lookupVisualLineStyle(currentLineSelection) : lookupLineStyle(currentLineSelection);
    if (!label) {
        label = String(currentLineSelection);
    }

    button.innerHTML = label + '<span class="caret"></span>';
}

function buildLineMenu() {
    var menu = document.getElementById("lineMenu");
    if (!menu) return;

    var choices = getCurrentLineChoices();
    var html = "";

    choices.forEach(function(choice) {
        var imageHtml = choice.image ? '<img src="' + choice.image + '" width="30%"> ' : "";
        html += "<li><a tabindex=\"-1\" onclick='drawCase(" + JSON.stringify(choice.value) + ")'>" + imageHtml + choice.label + "</a></li>";
    });

    menu.innerHTML = html;
    updateLineSystemLabel();
    updateLineLabel();
}

function refreshChartForCurrentFilters() {
    clearTimeline();
    sortPeople(allPeople, globalFilterString);
    drawLines();
    filterPeople(allPeople, globalFilterString);
    restoreSelectedPeople();
    document.body.classList.remove('waiting');
    document.getElementById("loader").style.display = "none";
    setFilterControlsEnabled(true);
    logChartReady("refreshChartForCurrentFilters");
}

function setLineSystem(mode, redrawChart) {
    if (mode !== "index" && mode !== "visual") return;

    if (currentLineSystem === mode) {
        return;
    }

    currentLineSystem = mode;
    currentLineSelection = 0;
    currentLineStyle = "";
    F_LineStyle = "";
    changeCase = true;
    currentCase = "drawCase";
    buildLineMenu();
    if (redrawChart !== false) {
        setLoadingUI();
        buildFullFilterQuery();
        setTimeout(function() {
            refreshChartForCurrentFilters();
        }, 0);
    }
}


function clearCheckBoxes(){
    //document.getElementById("drawName_CB").checked = true;
    //document.getElementById("name_CB").checked = false;
    F_gender = "";
    document.getElementById('gender_label').innerHTML = "Any ";
    F_profession = "";
    document.getElementById('profession_label').innerHTML = "Any  ";
    currentLineSelection = 0;
    currentLineStyle = "";
    F_LineStyle = "";
    F_varyingLineStyle = "";
    document.getElementById('line_label').innerHTML = "Any  ";
    document.getElementById("varyingLineStyle_CB").checked = false;
    // document.getElementById("age_CB").checked = false;
    F_age="";
    ageSlider.noUiSlider.set([0, 0]);
    ageSlider.noUiSlider.set([1, 100]);
//    zoomSlider.noUiSlider.set([100]);
    
    document.getElementById("ageAprox_CB").checked = false;
    aliveSlider.noUiSlider.set([0, 0]);
    aliveSlider.noUiSlider.set([-1800, 1800]);

    continent_CB = "";
    document.getElementById('continent_label').innerHTML = "Any  ";
    if($('#region_label').length > 0) {
      document.getElementById("region_label").innerHTML =" Any  ";
      F_region = "";
    }
    
    if(currentCase != "userNameFunction") document.getElementById("userInput").value= "";
    mouseOut(); // close the tooltip

}

function resultUnClicked(e){
    // console.log(e) // debug
    var  id = e;
    
    mouseOut(); // close the tooltip
    // console.log("unselecting id: "+id) // debug
    
    
    // remove name from the click list
    clickList = clickList.filter(function(thisGuy) { return thisGuy !== id })
    // repopulate the selection box from the clickList
    populateSelectionBox()
    
    // remove highlight from the person's line and text on the chart 
        peopleGroup.selectAll(".people-lines,.circles,.timeline-text,.timeline-text-background")
      .filter(function(s) {
                return (s == id); 
      })
        .classed("selectedGuy",false)
        .classed("selectedGuyText",false);
    ;
    
    setDescriptiveText('-99')
    
    //e.stopPropagation(); // don't bubble up clicking on parent

}


// person clicked in list
function resultClicked(){
    
   //console.log("event: " + event) // debug
   //console.log("clickity") // debug
    if (!flyToEnabled) {
        fullExtentBio(); // when clicking in the list, set the chart to full extent
    }

    // get the ID and replace any special characters
    // var  id = event.target.innerHTML.replace(/[\'\. ,:-]+/g, "-")
    var  id = event.target.id.split("-")[1] // split the list ID on the hyphen, and keep everything after it 
    //console.log("id: "+id) // debug

    if (id){ // if it has an id (which the link does not), do stuff
         //remove any existing active class 
        //clearSelectedPerson() 
        //console.log("id exists")
        
        clickObject = peopleGroup.select("#"+ id +".mouse-lines")

        // console.log(clickObject) // debug
        clickObject.dispatch('click'); 
        clickObject.dispatch('mouseover'); 

        //highlight class the target text
       // event.target.className += " selectedGuy";
        
        // add the person's description
        setDescriptiveText(id) 
    }
    
}


function fullExtentBio(){
    // reset the chart back to its full view and zero pan so the user starts centered
    currentZoom = 1.0;
    currentDragX =  0.0;
    currentDragY = 0.0;
    zoomSlider.noUiSlider.set([100]);
//    var scale = (wide/outerWidth)*currentZoom;
    
//    d3.select(".topGroup").attr("transform", "scale(" + currentZoom + ") translate(" + currentDragX + " " + currentDragY+ ")");
//    d3.select(".middleGroup").attr("transform", "scale(" + currentZoom + ") translate(" + currentDragX + " " + currentDragY+ ")");
//    d3.select(".bottomGroup").attr("transform", "scale(" + currentZoom + ") translate(" + currentDragX + " " + currentDragY+ ")");
//    d3.select(".peopleGroup").attr("transform", "scale(" + currentZoom + ") translate(" + currentDragX + " " + currentDragY+ ")");
//    d3.select(".categoryGroup").attr("transform", "scale(" + currentZoom + ") translate(" + currentDragX + " " + currentDragY+ ")");
    
}

svg.on("wheel", function(d){
    //console.log("zoom zoom")
    d3.event.preventDefault(); // prevent default page scroll

    // zoom should keep the point under the mouse fixed in place
    var rect = this.getBoundingClientRect();
    var mouseX = d3.event.clientX - rect.left;
    var mouseY = d3.event.clientY - rect.top;

    // old scale is the current transform before the wheel step
    // wheel delta is turned into a small zoom step and then clamped
    var nextZoom = (d3.event.wheelDelta < 0) ? currentZoom - 0.2 : currentZoom + 0.2;
    zoomChartTo(nextZoom, mouseX, mouseY);

    zoomSlider.noUiSlider.set([currentZoom * 100]);

      // sizeChange(currentZoom);
      //console.log(currentZoom)
      //zoom(direction === 'up' ? d : d.parent);

    //   var translateX = d3.event;
    //   var translateY = d3.event;
//      console.log(d3.event)
//      console.log(translateY)

});

const delta = 0.5;
let dragStartX;
let dragStartY;
let dragStartPanX;
let dragStartPanY;


 function redraw() {
     return svg.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")");
 }

// SET descriptive text in the element
function setDescriptiveText(UOID) {
	// console.log("looking for UOID: " + UOID)
    
    if(UOID == "-99"){
        document.getElementById("descriptive_text").innerHTML = "Click another name to view text.";
        return false;
    }
    

        
    //watkinsID = allPeople[UOID][0].Watkins_ID
    var alternateName= ""
    var link = (allPeople[UOID][0].Link) ? allPeople[UOID][0].Link : '';
    var biography = allPeople[UOID][0].Biography
    var source = allPeople[UOID][0].BioSource
    var BioName = allPeople[UOID][0].BioName

    //console.log(link)
    var linkText = ''
    
    // get link info
    if(link !="" && link !="0"){

            if(link.indexOf("google") !== -1){
                thisImg = "<i class='fa fa-link'></i>"
                thisLinkType = 'to Google'
            } else if(link.indexOf("wikipedia") !== -1){
                thisImg = "<i class='fa fa-link'></i>"
                thisLinkType = 'to Wikipedia'
            }
        
            linkText ='<span id="selectedLink"><a class="p-0" target="_blank" title="Open link ' + thisLinkType +' in new window" href="'+ link +'">&nbsp;'+thisImg+'<span class="linkArrow">&#8599;</span></a></span>'
    } 
    
              
    var pName = "<span style='text-transform:uppercase'>" + allPeople[UOID][0].Name + "</span>";

    
    // // check description from Watkins
	// if (typeof watkinsID != 'undefined' && watkinsID in watkinsDict) {
    //     // NOTE: when dictionary is built, watkinsDict[ID][0] is name, watkinsDict[ID][1] is description, watkinsDict[ID][2] is source
        
    //     // SET NAME
    //     // add Watkins name if different
    //     if (allPeople[UOID][0].Name.toUpperCase() !=  watkinsDict[watkinsID][0].toUpperCase()){
    //         alternateName = " or <span style='text-transform:uppercase'>" + watkinsDict[watkinsID][0] + "</span>"
    //     }
        
       
    //     //set description
    //     document.getElementById("descriptive_text").innerHTML = pName + alternateName + linkText + "<br>"+ watkinsDict[watkinsID][1] + "<br>— " + watkinsDict[watkinsID][2]+" (Watkins)";
             
	// } else if(allPeople[UOID][0].alterrnateID != '' && allPeople[UOID][0].alterrnateID !== undefined) { // check for an Alternate description
    //     var alterrnateID = allPeople[UOID][0].Alternate_ID
    //     console.log("alterrnateID " + alterrnateID)
    //     // NOTE: when dictionary is built, alternateDict[ID][0] is name, alternateDict[ID][1] is description, alternateDict[ID][2] is the entry's source, alternateDict[ID][3] is text which was used
        

        
        // SET NAME
        // add Alternate name if bio name is different
        // allPeople[UOID][0].Name is the name in the field "Name"
        // allPeople[UOID][0].alternateName is the name in the field "alternateName"
        // NOTE: lost the bio text title with this setup, the old sheets
        // console.log(BioName)
        if (BioName && BioName != "" && allPeople[UOID][0].Name.toUpperCase() !=  BioName.toUpperCase()){
            alternateName = ` or <span style='text-transform:uppercase'>${BioName} </span>`
            // set description
            document.getElementById("descriptive_text").innerHTML = pName + alternateName + linkText + "<br>"+ `${biography}<br>—(${source})`;
        } else { // no name found at all
                // console.log("No descriptive text found")
                // set description
                document.getElementById("descriptive_text").innerHTML = pName + linkText + "<br>No descriptive text found. Click another name to view text.";
        }

       
}


//panning
svg.call(d3.drag() // call specific function when circle is dragged
     .on("start", dragstarted)
     .on("drag", dragged)
     .on("end", dragended));


function dragstarted(d) {
    // console.log("drag start")
//    console.log(d3.event)
  d3.select(this).style("cursor", "move"); 
    dragStartX = d3.event.x;
    dragStartY = d3.event.y;
    dragStartPanX = currentDragX;
    dragStartPanY = currentDragY;
}

function dragged() {
    if (currentZoom <= 1.0) {
        // at full zoom out there is no room to pan so dragging should do nothing
        // reset the pan values so tiny pointer movement cannot leave drift behind
        currentDragX = 0;
        currentDragY = 0;
        var viewport = getChartViewport();
        applyChartTransform((viewport.wide / outerWidth) * currentZoom);
        return;
    }

    // use the original drag start position so the pan offset stays stable across events
    // d3.event.x and d3.event.y are the current pointer position in svg screen space
    currentDragX = dragStartPanX + (d3.event.x - dragStartX);
    currentDragY = dragStartPanY + (d3.event.y - dragStartY);

    var viewport = getChartViewport();
    // scale must match the zoom math used everywhere else so drag and zoom agree
    var scale = (viewport.wide / outerWidth) * currentZoom;

    // clamp after the move so the chart cannot overshoot the viewport and snap back
    clampPan(scale, viewport);
    applyChartTransform(scale);
  }

function dragended(d) {
    d3.select(this).style("cursor", "pointer");  
//  if (!d3.event.active) simulation.alphaTarget(.03);
//  d.fx = null;
//  d.fy = null;
}



function changeFont(thisFont){
    // console.log(thisFont)
    const collection = document.getElementsByClassName("timeline-text");
//    const collection2 = document.getElementsByClassName("timeline-text-background");
    
    for (let i = 0; i < collection.length; i++) {
            collection[i].style.fontFamily = thisFont;
//            collection2[i].style.fontFamily = thisFont;
    }

    switch(thisFont){
        case  "STIX Two Text":
           for (let i = 0; i < collection.length; i++) {
               collection[i].style.letterSpacing= "0.2px";
//               collection2[i].style.letterSpacing= "0.2px";
            }
            break;
        case  "PT Serif":
           for (let i = 0; i < collection.length; i++) {
               collection[i].style.letterSpacing= "0.2px";
//               collection2[i].style.letterSpacing= "0.2px";
            }
            break;
        default:
            for (let i = 0; i < collection.length; i++) {
                collection[i].style.letterSpacing= "0px";
//                collection2[i].style.letterSpacing= "0px";
            }
            
            
    }
        
}



// Set the resize function
d3.select(window).on("resize", sizeChange(1.0)); // 11/5/2020 needs a different resize function?

setProfessionDropDownColors();


// console.log("end of JS");
