//check the current page to determine what the mouseover does
var path = window.location.pathname;
var page = path.split("/").pop();
//console.log(page)


// TOOL TIP
var toolTip = d3.select("body").append("div")
    .attr("class", "tooltip")       
    .style("opacity", 0);

// for the year label background
var xFull = d3.scale.linear()
    .domain([fullStartYear, fullEndYear])
    .range([0, visWidth]);

// defines the x scale based upon year
var xScale = d3.scale.linear()
    .domain([startYear, endYear])
    .range([0, visWidth]);

// for the year region label background
var yFull = d3.scale.linear()
    .domain([-225, 2325])  // magic numbers so that the y axis aligns correctly
    .range([visHeight, 0]);

// defines the y scale based upon place
var yScale = d3.scale.linear()
    .domain([-225, 2325])  // magic numbers so that the y axis aligns correctly
    .range([visHeight, 0]);


// CREATE THE AXIS
var axisRuler = d3.svg.axis()
    .scale(xScale)
    .orient("bottom")
    .tickValues(rulerTicks)
    .tickFormat(function(d,i) { return rulerTickLabels[i]})
    .tickSize(-visHeight);

var axisRegion = d3.svg.axis()
    .scale(yScale)
    .orient("right")
    .tickValues(regionTicks)
    .tickFormat(function(d,i) { return regionTickLabels2[i]})
    .tickSize(visWidth);

var axisRegionTicks = d3.svg.axis()
    .scale(yScale)
    .orient("right")
    .tickValues(regionTicks2)
    .tickFormat(function(d,i) { return regionTickLabels2[i]})
    .tickSize(visWidth);

var axisPlace = d3.svg.axis()
    .scale(yScale)
    .orient("right")
    .tickValues(placeTicks)
    .tickFormat(function(d,i) { return placeTickLabels[i]})
    .tickSize(-visWidth);

var axisTop = d3.svg.axis()
    .scale(xScale)
    .orient("bottom")
    .tickValues(d3.range(startYear + 100, endYear - 100, 100))    // increment by 100
    .tickFormat(d3.format("d"))
    .tickSize(-visHeight);
    
var axisTopTicks = d3.svg.axis()
    .scale(xScale)
    .orient("bottom")
    .tickValues(d3.range(startYear + 50, endYear - 50, 100))    // increment by 100 (dots on 50s)
    .tickFormat(d3.format("d"))
    .tickSize(-visHeight);

var axisTopTicksZ = d3.svg.axis()
    .scale(xScale)
    .orient("bottom")
    .tickValues(d3.range(startYear, endYear - 100, 10))    // increment by 10
    .tickFormat(d3.format("d"))
    .tickSize(-visHeight);


    // FRAME LINES

    // Define the line
// var valueline = d3.svg
// .append( "line" )
//     .style("stroke", "green") 
//     .attr("x1", 0)            
//     .attr("y1", visHeight -20)
//     .attr("x2", visWidth) 
//     .attr("y2", visHeight -20 )
//     .attr("vector-effect", "non-scaling-stroke");
// var axisTopline = d3.svg.axis()
//     .style("stroke", "red") 
//     .attr("x1", 0)            
//     .attr("x2", 0.5*visWidth) 
//     .attr("y1",  10 + (zoomChart.scale()*1.5) + "px")
//     .attr("y2",  10 + (zoomChart.scale()*1.5) +  "px")
//     .attr("vector-effect", "non-scaling-stroke");

// var bottomLine = svgContainer.append( "line" )
//     .style("stroke", "green") 
//     .attr("x1", 0)            
//     .attr("y1", visHeight -20)
//     .attr("x2", visWidth) 
//     .attr("y2", visHeight -20 )
//     .attr("vector-effect", "non-scaling-stroke");
    
var axisBottom = d3.svg.axis()
    .scale(xScale)
    .orient("bottom")
    .tickValues(d3.range(startYear + 100, endYear - 100, 100))    // increment by 100
    .tickFormat(d3.format("d"))
    .tickSize(-visHeight);

var axisBottomTicks = d3.svg.axis()
    .scale(xScale)
    .orient("bottom")
    .tickValues(d3.range(startYear + 50, endYear - 50, 100))     // increment by 100 (dots on 50s)
    .tickFormat(d3.format("d"))
    .tickSize(-visHeight);

var axisBottomTicksZ = d3.svg.axis()
    .scale(xScale)
    .orient("bottom")
    .tickValues(d3.range(startYear, endYear - 100, 10))    // increment by 10
    .tickFormat(d3.format("d"))
    .tickSize(-visHeight);
    
// make the frame bigger than chart by defined margins
var chartFrame = d3.select( "#vis" )
    .append( "svg" )
    .attr( "width", visWidth + margin.left + margin.right)
    .attr( "height", visHeight + margin.top + margin.bottom)
    .attr("class", "div-frame")
//    .style("background", "#EADBC0");

// make the chart
var chartSVG = chartFrame
    .append( "svg" )
    .attr( "width", visWidth)
    .attr( "height", visHeight)
    .attr("x", margin.left)
    .attr("y", margin.top);

svgContainer = chartSVG.append("g");


// zoom math implemented based on http://bl.ocks.org/shawnbot/6518285
var zoomChart = d3.behavior.zoom()
    .x(xScale)
    .y(yScale)
    .scaleExtent([1, 7]) // can change numbers to change how far it zooms
//    .on("zoom", function() {
    .on("zoom", function() {
                    throttle(zoomed("mouse"));
     });
//    .on("scroll wheel DOMMouseScroll mousewheel", function (){
//            throttle(zoomed("mouse"))
//    })
//    .on("zoom", function (){
//            zoomed("mouse")
//    });


var tx = null;
var ty = null; 

//function zoomed() {

function zoomed(zoomType) {
//        console.log(zoomType)
    // to disable on compare page
//    if (page == "chart.html"){
    
        var e = d3.event

        // if we are already at 1, get outta here.  
//        extent = zoomChart.scaleExtent()
//        if ( e.scale * extent[0] === 1 ) return;  // nope
        
        if (zoomType == "mouse") {
            // zoom was initiated by the mouse
//            console.log(e.translate[0])
            //console.log(e.scale)
            

            
             // translation math
            tx = Math.min(0, Math.max(e.translate[0], visWidth - visWidth * e.scale));
            ty = Math.min(0, Math.max(e.translate[1], visHeight - visHeight * e.scale));
        } else {
            // zoom was initiated by a button click
            
            console.log("button: " + zoomType)
//            
            var scale = zoomChart.scale(),
            factor = (zoomType === 'in') ? 2.0 : 1/2.0,
            target_scale = Math.max(zoomChart.scaleExtent()[0], scale * factor),
            center = [visWidth / 2, visHeight / 2];
//            
            console.log("chart scale: " + scale +" target scale: " + target_scale + " center: " + center[0]+ " "+ center[1]);
//
            e = new Event("MouseEvents"); // overwrite e with a new d3-like object
            e.scale = target_scale; // change the target scale
            
            console.log("e.scale: " + e.scale);
            
//            
//            // Center each vector, stretch, then put back
//            //    x = (x - center[0]) * factor + center[0];
//            //    y = (y - center[1]) * factor + center[1];
//
////            tx = (visWidth/2) * factor + visWidth/2;
////            ty = (visHeight/2) * factor + visHeight/2;
//            
//            tx = visWidth - (visWidth/2) * factor;
//            ty = visHeight - (visHeight/2) * factor;
//            
////            var tx = (visWidth/0.5);
////            var ty = (visHeight/0.5);
            tx = 0;
            ty = 0;

//            
//            console.log("factor "+ factor + " scale "+ e.scale)
//            
//            
        }

    
//        console.log("translate map: tx "+ tx +" ty "+ ty + " scale "+ e.scale);
        // translates map
        zoomChart.translate([tx, ty]);
        svgContainer.attr("transform", [
            "translate(" + [tx, ty] + ")",
            "scale(" + e.scale + ")"
            ].join(" "));

        // change the year to the zoomed extent
        startYear = axisBottom.scale().domain()[0];
        endYear = axisBottom.scale().domain()[1];

        var endY = axisRegion.scale().domain()[1];
        var startY = axisRegion.scale().domain()[0];

        // update axis
        topAxisGroup.call(customAxisTop);
        topTickGroup.call(customAxisTopTicks);
        bottomAxisGroup.call(customAxisBottom);
        bottomTickGroup.call(customAxisBottomTicks);

    
        if (e.scale > 1) {
            bottomTickZGroup.call(customAxisBottomTicksZ);
            topTickZGroup.call(customAxisTopTicksZ);
        }
        else {
            bottomTickZGroup.selectAll("*").remove();
            topTickZGroup.selectAll("*").remove();
        }

        // the label's background buffer needs to change places/sizes
        topBuffer
            .attr("height", 14* 1/e.scale)
            .attr("y", yFull(endY+1));  // does math based upon (pixel <-> chart space) conversion
        bottomBuffer
            .attr("height", 30* 3.1/e.scale)
            .attr("y", yFull(startY) - (30* 3.1/e.scale));  // does math based upon (pixel <-> chart space) conversion 

        if (rulerToggled) {
            // different sized buffers for different zooms
            if (e.scale > 4) {
                rulerAxisGroup.call(customAxisRulerZ);
                bottomBuffer
                    .attr("height", 45* 4/e.scale)
                    .attr("y", yFull(axisRegion.scale().domain()[0]) - (45* 4/e.scale));  // does math based upon (pixel <-> chart space) conversion 
                }
            else {
                rulerAxisGroup.call(customAxisRuler);
                bottomBuffer
                    .attr("height", 39* 3/e.scale)
                    .attr("y", yFull(axisRegion.scale().domain()[0]) - (39* 3/e.scale));  // does math based upon (pixel <-> chart space) conversion 

                }
        }
        // Math for toggling the right axis
        if (eraToggled) {  // if its toggled (open)
            regionAxisGroup.call(customAxisRegion);

            // if the chart is zoomed past certain extent 
            // (extent can be changed below in if statement)
            // then we show the regions and places
            if (e.scale > 3 && page != "chartofHistory.html") {
                // re-size/draw the axis
                regionTicksGroup.call(customAxisRegionTicksZ); 
                placeAxisGroup.call(customAxisPlace); 
                // re-size/draw the label background buffer
                rightBuffer
                    // these numbers need to match those in the
                    // toggleEra() function in functionsAxis.js 
                    .attr("width", 10 +10* 10/e.scale)
                    .attr("x", xFull(endYear) - (10 + 10* 10/e.scale));
            }
            // if the chart is not zoomed past certain extent
            // just show the regions
            else {
                // re-size/draw the axis
                regionTicksGroup.call(customAxisRegionTicks); 
                placeAxisGroup.selectAll("*").remove();
                // re-size/draw the label background buffer 
                rightBuffer
                    // these numbers need to match those in the
                    // toggleEra() function in functionsAxis.js 
                    // and the fullExtent() function in functions.js
                    .attr("width", 10* 3/e.scale)                      
                    .attr("x", xFull(endYear) - (10* 3/e.scale));
            }
    }
        
    // if on compare page, zoom the image as well   
    if (page == "chartofHistory.html"){   
        comContainer.attr("scale("+e.scale+")");
        console.log("zoom");  
        zoomCompare(e.scale, tx, ty);
    }
        
        
}
//    });

// disables double click zooming
chartSVG.call(zoomChart)
    .on("dblclick.zoom", null);

function zoomOut() {
    console.log("Zoom Out")
}


function zoomButton(buttonID) {
    console.log(buttonID)
    var scale = zoomChart.scale(),
        extent = zoomChart.scaleExtent(),
        translate = zoomChart.translate(),
        x = translate[0], y = translate[1],
        factor = (buttonID === 'in') ? 1.2 : 1/1.2,
        target_scale = scale * factor;

    // If we're already at an extent, done
    if (target_scale === extent[0] || target_scale === extent[1]) { return false; }
    // If the factor is too much, scale it down to reach the extent exactly
    var clamped_target_scale = Math.max(extent[0], Math.min(extent[1], target_scale));
    if (clamped_target_scale != target_scale){
        target_scale = clamped_target_scale;
        factor = target_scale / scale;
    }

    // Center each vector, stretch, then put back
//    x = (x - center[0]) * factor + center[0];
//    y = (y - center[1]) * factor + center[1];
    
    x = (x - visWidth/2) * factor + visWidth/2;
    y = (y - visHeight/2) * factor + visHeight/2;
//     x= (visWidth/2)*-1;
//     y= (visHeight/2)*-1;

    // Transition to the new view over 350ms
    d3.transition().duration(350).tween("zoom", function () {
        var interpolate_scale = d3.interpolate(scale, target_scale),
            interpolate_trans = d3.interpolate(translate, [x,y]);
//        return function (t) {
//            zoomChart.scale(interpolate_scale(t))
//                .translate(interpolate_trans(t));
//            zoomed();
//            zoomChart.translate([-x, -y]);
        
        // kinda works
//            svgContainer.attr("transform", [
//                "translate(" + [x, y] + ")",
//                "scale(" + (target_scale) + ")"
//                ].join(" "));
        target_scale += 1;
        console.log(target_scale)
        
             svgContainer.attr("transform", [
                
                "scale(" + (target_scale) + ")"
                ].join(" "));
//        };
        
        
        // if on compare page, zoom the image as well   
    if (page == "compare.html"){   
//        console.log("zoom: "+zoomChart.scale());
//        comContainer.attr("scale("+zoomChart.scale()+")");
//        console.log("zoom");
        
        zoomCompare(target_scale, x, y);
    }
        
    });
}

// Axisfunctions.js for formating
topAxisGroup = chartSVG.append("g")
    .attr("transform", "translate(" + 0 + "," + (visHeight) + ")")
    .call(customAxisTop);
topTickGroup = chartSVG.append("g")
    .attr("transform", "translate(" + 0 + "," + (visHeight) + ")")
    .call(customAxisTopTicks);
topTickZGroup = chartSVG.append("g")
    .attr("transform", "translate(" + 0 + "," + (visHeight) + ")");

bottomAxisGroup = chartSVG.append("g")
    .attr("transform", "translate(" + 0 + "," + (visHeight)+ ")")
    .call(customAxisBottom);
bottomTickGroup = chartSVG.append("g")
    .attr("transform", "translate(" + 0 + "," + (visHeight)+ ")")
    .call(customAxisBottomTicks);

bottomTickZGroup = chartSVG.append("g")
    .attr("transform", "translate(" + 0 + "," + (visHeight)+ ")");

rulerAxisGroup = chartSVG.append("g")
    .attr("transform", "translate(" + 0 + "," + (visHeight)+ ")")


placeAxisGroup = chartSVG.append("g");

regionAxisGroup = chartSVG.append("g");

regionTicksGroup = chartSVG.append("g");

// linear projection
var projection = d3.geo.projection(function(x, y) {return [x, y];})
    .precision(0).scale(1).translate([0, 0]);

 // Create a path generator
 // The geographic path generator renders the given object (generates an SVG path data string)
var geoPath = d3.geo.path().projection(projection).pointRadius(.75);

// bounds calculated based on manually entered json due to artifact polygons
var bounds = geoPath.bounds(places_json_bounds), 
    scale  = 1 / ((bounds[1][0] - bounds[0][0]) / visWidth), //scale factor just based on width
    transl = [(visWidth - scale * (bounds[1][0] + bounds[0][0])) / 2, 
            (visHeight - scale * (bounds[1][1] + bounds[0][1])) / 2]; // use width and height for translate

// clip to extent of screen space to remove artifacts
projection.scale(scale).translate(transl).clipExtent([[0,0], [visWidth,visHeight]]);

//Create containers for the various SVG groups
//ADD "Powers" data
var powersGroup = svgContainer.append( "g" );
//ADD boundary lines for "Powers" data
var powerLines = svgContainer.append( "g" );
// ADD "Places" Data
var placesGroup = svgContainer.append( "g" );
//ADD "Label" data
var powersLabel = svgContainer.append( "g" );
var pointsLabel = svgContainer.append( "g" );
// ADD "Event Lines" data
var eventLinesS = svgContainer.append( "g" ); // solid
var eventLinesH = svgContainer.append( "g" ); // dashed
var eventLinesT = svgContainer.append( "g" ); // dotted
var eventLinesN = svgContainer.append( "g" ); // no line
var eventPoints = svgContainer.append( "g" ); // point





// for place selection labels
var numbersGroup = svgContainer.append('g');

// ADD CLICK LINE
var verticalLine = svgContainer.append('line')
    .attr({
        'x1': 0,
        'y1': 0,
        'x2': 0,
        'y2': visHeight + margin.top + margin.bottom
    })
    .attr("stroke", "transparent")
    .attr("stroke-width", 1)
    .attr('class', 'verticalLine')     // name this class to allow mouse updates
    .attr('pointer-events', 'none')


// ADD CLICK RECT
var horizontalLine = svgContainer.append('rect')
    .attr({
        'x': 0,
        'y': 0,
        'height': 1,
        'width': 20
    })
    .attr("fill", "transparent")
    .attr('class', 'horizontalLine')    // name this class to allow mouse updates
    .attr('pointer-events', 'none')

// ADD CLICK DOT
var dot = svgContainer.append('circle')
    .attr({
        'cx': 0,
        'cy': 0,
        'r': 3,
    })
    .attr("fill", "transparent")
    .attr('class', 'dot')   // name this class to allow mouse updates
    .attr('pointer-events', 'none')

// TOP/RIGHT/BOTTOM LABEL BACKGROUND SVGs
var topBuffer = svgContainer.append( "rect" )
    .attr("x", 0)            
    .attr("y", 0)
    .attr("height",zoomChart.scale()*1.5 + 5 + "px")
    .attr("width",visWidth)
    .attr("fill", backgroundCol) 
    .style('opacity', 0.95);

var bottomBuffer = svgContainer.append( "rect" )
    .attr("x", 0)            
    .attr("y", visHeight - 10)
    .attr("height",10)
    .attr("width",visWidth)
    .attr("fill", backgroundCol)
    .style('opacity', 0.95);

var rightBuffer = svgContainer.append( "rect" )
    .attr("x", visWidth - 10)            
    .attr("y", 0)
    .attr("height", visHeight)
    .attr("width",0)
    .attr("fill", backgroundCol)// Beige
    .style('opacity', 0.95);



// ADD ERA FILTER COVERS
var eraCover1 = svgContainer.append( "rect" )
    .attr("x", 0)            
    .attr("y", 0)
    .attr("height", visHeight)
    .attr("width", 0)
    .attr("fill", backgroundCol)// Beige
    .style('opacity', 0);

var eraCover2 = svgContainer.append( "rect" )
    .attr("x", visWidth)            
    .attr("y", 0)
    .attr("height", visHeight)
    .attr("width", visWidth)
    .attr("fill", backgroundCol)// Beige
    .style('opacity', 0);

// ADD REGION FILTER COVERS
var regionCover1 = svgContainer.append( "rect" )
    .attr("x", 0)            
    .attr("y", 0)
    .attr("height", 0)
    .attr("width", visWidth) 
    .attr("fill", backgroundCol)
    .style('opacity', 0);

var regionCover2 = svgContainer.append( "rect" )
    .attr("x", 0)            
    .attr("y", visHeight)
    .attr("height", visHeight)
    .attr("width", visWidth)
    .attr("fill", backgroundCol)
    .style('opacity', 0);

// ERA GRADIENTS
var gradient = svgContainer.append("defs")
  .append("linearGradient")
    .attr("id", "gradient")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "100%")
    .attr("y2", "0%")
    .attr("spreadMethod", "pad");

gradient.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", backgroundCol)
    .attr("stop-opacity", 1);

gradient.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", backgroundCol)
    .attr("stop-opacity", 0);

var gradient2 = svgContainer.append("defs")
    .append("linearGradient")
    .attr("id", "gradient2")
    .attr("x1", "100%")
    .attr("y1", "0%")
    .attr("x2", "0%")
    .attr("y2", "0%")
    .attr("spreadMethod", "pad");

gradient2.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", "#E8D5B6")
    .attr("stop-opacity", 1);

gradient2.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", "#E8D5B6")
    .attr("stop-opacity", 0);

var eraGrad1 = svgContainer.append( "rect" )
    .attr({
        'x': 0,
        'y': 0,
        'height': visHeight,
        'width': 0
    })
    .style("fill", "url(#gradient)")
    .attr("opacity", 0);

var eraGrad2 = svgContainer.append( "rect" )
    .attr({
        'x': visWidth,
        'y': 0,
        'height': visHeight,
        'width': 0
    })
    .style("fill", "url(#gradient2)")
    .attr("opacity", 0);

// REGION GRADIENTS
var gradient3 = svgContainer.append("defs")
    .append("linearGradient")
    .attr("id", "gradient3")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "0%")
    .attr("y2", "100%")
    .attr("spreadMethod", "pad");

gradient3.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", "#E8D5B6")
    .attr("stop-opacity", 1);

gradient3.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", "#E8D5B6")
    .attr("stop-opacity", 0);

var gradient4 = svgContainer.append("defs")
    .append("linearGradient")
    .attr("id", "gradient4")
    .attr("x1", "0%")
    .attr("y1", "100%")
    .attr("x2", "0%")
    .attr("y2", "0%")
    .attr("spreadMethod", "pad");

gradient4.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", "#E8D5B6")
    .attr("stop-opacity", 1);

gradient4.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", "#E8D5B6")
    .attr("stop-opacity", 0);

var regionGrad1 = svgContainer.append( "rect" )
    .attr({
        'x': 0,
        'y': 0,
        'height': 0,
        'width': visWidth
    })
    .style("fill", "url(#gradient3)")
    .attr("opacity", 0);

var regionGrad2 = svgContainer.append( "rect" )
    .attr({
        'x': 0,
        'y': visHeight,
        'height': 0,
        'width': visWidth
    })
    .style("fill", "url(#gradient4)")
    .attr("opacity", 0);

// Colored gradients for powers
var greenGradient = svgContainer.append("defs").append("linearGradient")
    .attr("id", "greenGradient")
    .attr("y1", "0.4")
    .attr("spreadMethod", "reflect");

greenGradient.append("stop")
    .attr("offset", "0")
    .attr("stop-color", "#699f5b")
    .attr("stop-opacity", 1);

greenGradient.append("stop")
    .attr("offset", "0.85")
    .attr("stop-color", "#B1C296");

var pinkGradient = svgContainer.append("defs").append("linearGradient")
    .attr("id", "pinkGradient")
    .attr("spreadMethod", "reflect");

pinkGradient.append("stop").attr("offset", "0")
    .attr("stop-color", "#CE7268")
    .attr("stop-opacity", 1);

pinkGradient.append("stop").attr("offset", "0.65")
    .attr("stop-color", "#D4A8A3");

var blueGradient = svgContainer.append("defs").append("radialGradient")
    .attr("id", "blueGradient")
    .attr("cx", 0.1)
    .attr("cy", 0.1)
    .attr("transform", "rotate(45)");

blueGradient.append("stop")
    .attr("offset", "0.15")
    .attr("stop-color", "#96BBC2")
   .attr("stop-opacity", "0.6");

blueGradient.append("stop")
    .attr("offset", "0.9")
    .attr("stop-color", "#6eadc3");

var yellowGradient = svgContainer.append("defs").append("linearGradient")
    .attr("id", "yellowGradient");

yellowGradient.append("stop")
    .attr("offset", "0.15")
    .attr("stop-color", "#FFE27F")
    .attr("stop-opacity", 0.8);

yellowGradient.append("stop")
    .attr("offset", "0.9")
    .attr("stop-color", "#FFD548")
    .attr("stop-opacity", "0.2");


//// Colored fills for the chart //  NOT USING SWATCHES ANYMORE
//var redFill = svgContainer.append("defs")
//   .append("pattern")
//   .attr("id", "bg_red")
//   .attr("height", 125)
//   .attr("width",125)
//   .append("image")
//   .attr("x", 0)            
//   .attr("y", 0)
//   .attr("height", 125)
//   .attr("width",125)
//   .attr("xlink:href", "img/redSwatch.jpg");
//
//var greenFill = svgContainer.append("defs")
//   .append("pattern")
//   .attr("id", "bg_green")
//   .attr("height", 300)
//   .attr("width",300)
//   .append("image")
//    .attr("x", 0)            
//   .attr("y", 0)
//   .attr("height", 300)
//   .attr("width",300)
//   .attr("xlink:href", "img/greenSwatch.jpg");
//
//var blueFill = svgContainer.append("defs")
//   .append("pattern")
//   .attr("id", "bg_blue")
//   .attr("height", 225)
//   .attr("width",225)
//   .append("image")
//   .attr("x", 0)            
//   .attr("y", 0)
//   .attr("height", 225)
//   .attr("width",225)
//   .attr("xlink:href", "img/blueSwatch.jpg");
//
//var yellowFill = svgContainer.append("defs")
//   .append("pattern")
//   .attr("id", "bg_yellow")
//   .attr("height", 125)
//   .attr("width",125)
//   .append("image")
//   .attr("x", 0)            
//   .attr("y", 0)
//   .attr("height", 125)
//   .attr("width",125)
//   .attr("xlink:href", "img/yellowSwatch.jpg");

// end fills //


// set symbology for chart data. false means it is the first time data is being drawn
updateData("1", false);
// change togles in variable.js
toggleEra();    // toggle the place labels

// burn it to the ground
setTimeout(toggleRuler, 0);

// TRACKING THE MOUSE
d3.selectAll("#vis")
    .attr('width', visWidth)
    .attr('height', visHeight)
    .on('mouseout', mouseOut)
    .on('mousemove', function(){ 
    
    // function to report year based on mouse position
    mouseYear = xScale.invert(d3.mouse(this)[0] - margin.left);

    if (mouseYear < startYear) {    // if date is out of range, cap it.
        mouseYear = startYear; } 
    else if (mouseYear > endYear) {
        mouseYear = endYear; }
    
    // determining mouse year and displaying the tooltip both ran at the same time and sometimes an old mouse year was displayed
    // this makes sure mouseMove is always ran after the correct mouse year is found
        if ((mouseYear >= fullStartYear) && (mouseYear <= fullEndYear - 100) && bioToggled) {
                toolYear()
        }
    }
);

function throttle(fn, threshhold, scope) {
//    console.log("t")
  threshhold || (threshhold = 1000);
  var last,
      deferTimer;
  return function () {
    var context = scope || this;

    var now = +new Date,
        args = arguments,
        event = d3.event;
    if (last && now < last + threshhold) {
      // hold on to it
      clearTimeout(deferTimer);
      deferTimer = setTimeout(function () {
        last = now;
          d3.event = event;
        fn.apply(context, args);
      }, threshhold);
    } else {
      last = now;
        d3.event = event;
      fn.apply(context, args);
    }
  };
}


// button zooming function

//var zoom = d3.behavior.zoom()
//    .scaleExtent([1, 8])
//    .on("zoom", zoomed);

//var intervalID;
//
//d3.selectAll('.button').on('mousedown', function(){
//    d3.event.preventDefault();
//    var factor = (this.id === 'zoom_in') ? 1.1 : 1/1.1;
//    intervalID = setInterval(zoom_by, 40, factor);
//}).on('mouseup', function(){
//    d3.event.preventDefault();
//    clearInterval(intervalID);
//    intervalID = undefined;
//})
//
//
//
//function zoom_by(factor){
//    var scale = zoom.scale(),
//        extent = zoom.scaleExtent(),
//        translate = zoom.translate(),
//        x = translate[0], y = translate[1],
//        target_scale = scale * factor;
//
//    // If we're already at an extent, done
//    if (target_scale === extent[0] || target_scale === extent[1]) { return false; }
//    // If the factor is too much, scale it down to reach the extent exactly
//    var clamped_target_scale = Math.max(extent[0], Math.min(extent[1], target_scale));
//    if (clamped_target_scale != target_scale){
//        target_scale = clamped_target_scale;
//        factor = target_scale / scale;
//    }
//
//    // Center each vector, stretch, then put back
//    x = (x - center[0]) * factor + center[0];
//    y = (y - center[1]) * factor + center[1];
//
//    // Enact the zoom immediately
//    zoom.scale(target_scale)
//        .translate([x,y]);
//    zoomed();
//}