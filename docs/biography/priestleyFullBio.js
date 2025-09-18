// TOOL TIP
var toolTip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

    // fade out tooltip on mouse out
function mouseOut() {
    // console.log("close the tooltip");
    // clear tooltip
    toolTip.transition()    
        .duration(300)    
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
var currentLineStyle = "";
var currentContinent = "";
var currentRegion = "";
var currentGender = "";
var currentZoom = 1.0;
var currentDragX = 0;
var currentDragY=0;


var globalFilterString = "";
var clickList= [];


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
console.log("aspect:"+ aspect)
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
  console.log("age range: " + values[0] + " to "+ values[1]);
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
         console.log
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
    console.log(values)
    var fromYear;
    if( typeof values[0] === 'string' && values[0].includes(" BC")){
         // if negative, remove substring and change value to negative 
         fromYear = -1 * (parseInt(values[0].split(" BC")[0]))
         console.log(fromYear)
     } else {
       // if int/positive, no change
        fromYear = parseInt(values[0])
     }
    
    var toYear;
    if( typeof values[1] === 'string' && values[1].includes(" BC")){
         // if negative, remove substring and change value to negative 
         toYear = -1 * (parseInt(values[1].split(" BC")[0]))
         console.log(toYear)
     } else {
       // if int/positive, no change
        toYear = parseInt(values[1])
     }
    
    
  drawAliveDuring(fromYear, toYear)
  console.log("alive during: " + fromYear + " to "+ toYear);
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
  currentZoom = values[0].replace('%', '')/100.0
  sizeChange(currentZoom);//drawYoungPeople(values[0], values[1])
  console.log("slide currentZoom: " + currentZoom);
  console.log("slide zoom factor: " + values[0]);
});

zoomSlider.noUiSlider.on('set',function(values, handle){
  //currentZoom = values[0]
  sizeChange(currentZoom);//drawYoungPeople(values[0], values[1])
  console.log("set currentZoom: " + currentZoom);
  console.log("set zoom factor: " + values[0]);
});
// *** END ZOOM SLIDER ***

// clear all checkboxes when script is loaded, after the slider is setup
clearCheckBoxes();

// ~ ~ ~ Function to scale the main group ~  ~ ~
function sizeChange(factor) {
    console.log("resizing")
    console.log("x: " + currentDragX)
    console.log("y: " + currentDragY)

    // Resize the timeline
    var wide = container.width(),
	// high = container.height();
    high = wide / aspect;
    if (high > container.height()){
        high = container.height()
        wide = high * aspect
    }
    if (high > 685){
        high = 685
        wide = high * aspect
    }

    var scale = (wide/outerWidth)*factor;
 //   var translateX = (wide*scale)/-2
//    d3.select(".topGroup").attr("transform", "scale(" + scale + ") translate(" + translateX + " 0)");
    d3.select(".topGroup").attr("transform", "scale(" + scale + ") translate(" + currentDragX + " " + currentDragY +")");
    d3.select(".middleGroup").attr("transform", "scale(" + scale + ") translate(" + currentDragX + " " + currentDragY +")");
    d3.select(".bottomGroup").attr("transform", "scale(" + scale + ") translate(" + currentDragX + " " + currentDragY +")");
    d3.select(".peopleGroup").attr("transform", "scale(" + scale + ") translate(" + currentDragX + " " + currentDragY +")");
    d3.select(".categoryGroup").attr("transform", "scale(" + scale + ") translate(" + currentDragX + " " + currentDragY +")");

  $("#svg-chart").height(wide*(currentZoom/aspect));


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
                   console.log(center)
                   return ("rotate(180,0,"+center+")")
                })
    .call(wrap, 85)  // hard codded value for max height, need a select each or similar instead of ".call" for this to be calculated based on row height
    .on("mouseover", function(d){
        console.log(d.label)
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

//Unused cases...
var case9 = 0; // unsure - no match //0
var case12= 0; // No line number //0
var case10 = 0; // unsure2 //0

////Sample
//var case1 = 0; //solidLines
//var case2 = 0; //threeBegin
//var case3 = 0; //threeBeginTwoEnd
//var case4 = 0; //oneBegin
//var case5 = 0; //oneEndUnder
//var case6 = 0; //"solid2" solid lines
//var case7 = 0; // oneEnd
//var case8 = 0; // threeBeginOneEnd //0
//var case11 = 0; // oneEndUnder2
//var case13= 0; //seven dots
//var case14= 1; // oneEnd2



// array for testing which cases to draw to speed up development
boolCases=[0,case1,case2,case3,case4, case5, case6, case7, case8, case9, case10, case11, case12, case13, case14]

console.log("A");

var dataSheet; // for data loaded via d3

function loadBioData(){
    //document.getElementById("loader").style.display = "block";
    setLoadingUI();
    
    document.getElementById("filterResultsBox").innerHTML =  ""; 
    console.log("loading bio data");
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
  if($('#region_label').length > 0) {
      document.getElementById("region_label").disabled = false;
     }
  document.getElementById("line_label").disabled = false;
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
    d3.request("biography/csv/PriestleyBioData_Feb2_2023(2_20_2024).csv") 
    //local dev
    //d3.request("https://pages.uoregon.edu/infographics/dev/timelineV2/pages/biography/csv/PriestleyBioData_Feb2_2023(2_20_2024).csv")
      .mimeType("text/csv")
      .response(function (xhr) { return d3.csvParse(xhr.responseText); })
      .get(function(data) {
          data.forEach(function(d){
                // check if this case is in the current MANUAL case filter
                //console.log(d["case"])
                var testCase="";
                if (d["case"] != "" ) {
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
                    someGuy["Watkins_ID"] = parseInt(d["Watkins_ID"]);
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

                    someGuy["lineType"] = d["case"].trim(); //get the line type eg. 'case1', but remove newlines and other whitespace (was a problem on case 3)
                    someGuy["indexText"] = null; // in tab2 (TO DO, create indext when reading in data instead of on the fly)

                    // calculate aprox age
                    someGuy["AproxAge"]  = someGuy["AproxDeathDate"]- someGuy["AproxBirthDate"];

                    
                    someGuy["Link"] = d["WikiLink"] // previously Wiki_Link
                    //someGuy["Wikipedia2"] = d["Wikipedia"]

                    
                    if(d["WikiLink"] != ""){
                       // check for wikilink
                       someGuy["Link"] = d["WikiLink"] // previously Wiki_Link
                    }else if (d["Alternate Link"]!= ""){
                        //check for google book link
                        someGuy["Link"] = d["Alternate Link"]
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
            console.log("calling draw lines");
            drawLines(); // draw all the lines and names
//            drawCase1();
//            drawCase2()

            document.getElementById("loader").style.display = "none";  /* turn off the loader */
            document.body.classList.remove('waiting');

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
    console.log(now.toUTCString()+ " end of loadBioData()")
}


// LOAD people descriptions. 
// Note: Download from google sheets as XLS then save as csv UTF-8 to include French/special characters e.g check em dashes in  "JANSEN..."
d3.csv("biography/csv/WatkinsData8_17_2023.csv") // when live
// for dev to avoid CORS problems
//Watkins
//d3.request("https://pages.uoregon.edu/infographics/dev/timelineV2/pages/biography/csv/WatkinsData8_17_2023.csv")
    .mimeType("text/csv")
    .response(function (xhr) { return d3.csvParse(xhr.responseText); })
    .get(function(data) {
          data.forEach(function(d){
              var id = d["WATKINS_ID"];      
              watkinsDict[id] = [d["NAME"],d["BIO"],d["SOURCE"]];
          })
    });

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
           

console.log("b");
// console.log("someGuy[DisplayName]", someGuy["DisplayName"]); // debug (list everyone!)

// second argument is true OR a STRING that will evaluate to things you want to keep in the chart e.g. true or "someGuy.Name.startsWith('S')"
function filterPeople(thesePeople, peopleFilter) { 
   var now = new Date();
   console.log(now.toUTCString()+" start of filterPeople");
  /* turn on the loader */
    // document.getElementById("loader").style.display = "block";
    
   var filterList = d3.selectAll('#filterResultsBox') // just get the filter list once, so we don't have to check the whole DOM for divs within it
   
    console.log(peopleFilter);
    // if filter is anything but "true" look at them one by one
    // set all people as hidden, then remove the "hidden" from people that match the filter
    if(peopleFilter != true){ 

        people=[]; //clear out the current people list
        ////document.getElementById("filterResultsBox").innerHTML =""
        //var filterCount = 0;

        console.log("filtering: " + Object.keys(thesePeople).length);
        // make all people invisible
        peopleGroup.selectAll(".people-lines,.circles").classed("hiddenGuy",true); // add the display-none class to chart name
        if (drawNames) peopleGroup.selectAll(".timeline-text").classed("hiddenGuy",true); // add the display-none class to chart name
        filterList.selectAll(".f-list").classed("d-none",true); // add the display-none class to names in the filter list
        filterList.selectAll(".f-list").classed("d-block",false); // remove the display-block class to names in the filter list
       // d3.selectAll("#list-" + id).classed("hidden",true); // remove the display-block class from list name
        
        // add back those that match
        $.each(allPeople, function(key) { // new way to iterate, just using keys
         someGuy = allPeople[key][0]; 
        
        
        //thesePeople.forEach(function(someGuy){  // old way to iterate, passing all data
           // console.log(someGuy)
          // console.log("match: " + someGuy.gender)
          var  id = key // someGuy.UO_ID //someGuy.DisplayName.replace(/[\'\. ,:-]+/g, "-") // get clean version of name for ID
          if(eval(peopleFilter)){ // test against the current UI filter
              // //console.log("match: " + someGuy.DisplayName)
              peopleGroup.selectAll("#"+id+".people-lines,#"+id+".circles").classed("hiddenGuy",false); // add the display-none class to chart lines
              if (drawNames) peopleGroup.selectAll("#"+id+".timeline-text").classed("hiddenGuy",false); // add the display-none class to chart name
              filterList.selectAll("#list-" + id).classed("d-none",false); // if they match, remove the display-none 
              filterList.selectAll("#list-" + id).classed("d-block",true); // if they match, add the display-block class
              // //filterCount ++;
              people.push(someGuy); // list of all those that match this filter
              
              //list people in the box if there is a filter applied (anything but "true")
              //if(peopleFilter != true) document.getElementById("filterResultsBox").innerHTML += "<element onClick='resultClicked()' id='list-"+ id + "''>" + someGuy.DisplayName + "</element><br>";
          } else { // if they don't match
            
          }
             
        });

        // deal with the people filtered
        document.getElementById("numPeople").innerHTML =  people.length + " of " + Object.keys(thesePeople).length + " people";
        if (people.length < 10) {console.log(people)} // for debug: print the people that match, only when fewer then 10

    } else {
        // no filter applied
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
   console.log(later.toUTCString()+" end of filterPeople")
}


function sortPeople(thePeople, peopleFilter) { 
    console.log("beginning of sort people" + Date())
    
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
   sevenDots = []
  // noLineNumber = [];
    
    console.log("filter "+ peopleFilter);  // logs current filter
    
    // iterate through the dictionary
    // access the info about a person using: allPeople[key][0].FIELD_NAME
    $.each(allPeople, function(key) {
        //console.log(key, value[0].Name);
        
        // someGuy = allPeople[key][0] // used to push all the data, not just pushing  the k to speed things along
        someGuy = key
        
        //thePeople.forEach(function(someGuy){

        var testCase = parseInt(allPeople[key][0].lineType.match(/\d+/)[0]) // this person is in the list of cases we are drawing. e.g. "case3" -> 3. Mostly used to speed drawing during development

        if (boolCases[testCase] && eval(peopleFilter)){ // only do the rest if the person matches the manual boolean and the current filter

        // sort the people into their lists based on the case listed in the  spreadsheet
        //console.log("test case " + testCase) 
        people.push(someGuy); // list of all those that match this filter, just push the key
        //console.log(someGuy)
        //console.log(testCase)
//          if(someGuy.name == "Suetonius"){
//              console.log(someGuy)
//          }
        switch(testCase){
            // try making this an array!!!

            case 1:                    
                    //console.log("solid line (case1)");
                    solidLines.push(someGuy); 
                    break;
            case 2:
                    //console.log("3 starting dots (case2)");
                    threeBegin.push(someGuy);  
                    break;
            case 3:
                    //console.log("3 starting dots and 2 ending (case3)");
                    threeBeginTwoEnd.push(someGuy); 
                    break;
            case 4:
                    //console.log("1 dot beneath beginning (case4)");
                    oneBegin.push(someGuy); 
                    break;
            case 5:
                    //console.log("1 dot beneath ending (case5)");
                    oneEndUnder.push(someGuy); 
                    break;
            case 6:
                    //console.log("solid line (case6)");
                    solid2.push(someGuy);
                    break;
            case 7:
                    //console.log("1 dot end (case7)");
                    oneEnd.push(someGuy); 
                    break;
            case 8:
                    //console.log("3 starting dots and 1 ending (case8)");
                    threeBeginOneEnd.push(someGuy);
                    break;
            case 11:
                    //console.log("1 dot beneath ending 2 (case11)");
                    oneEndUnder2.push(someGuy); 
                    break;
            case 12:
                    //console.log("no line number (case12)");
                    // not pushing... were already pushed on read in
                    break;
            case 13:
                    //console.log("seven dots (case13)");
                    sevenDots.push(someGuy); 
                    break;
            case 14:
                    //console.log("1 dot end 2 (case14)");
                    oneEnd2.push(someGuy);
                    break;
            default:
                unsure.push(someGuy); 
        } // switch





      } // if people filter      
 	});

    console.log("All people: ")
    console.log(Object.keys(allPeople).length) // all people read in
    console.log("filtered people " + people.length) // list of those that are in this filter.
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
   // console.log("12. noLineNumber (not updated on redraw) " + noLineNumber.length)
   // console.log("9 (don't fit a case). people " + unsure.length)
	
   var numPeopleDrawn = solidLines.length + threeBegin.length + threeBeginTwoEnd.length + oneBegin.length + oneEndUnder.length + oneEndUnder2.length + oneEnd.length + oneEnd2.length + threeBeginOneEnd.length + solid2.length + sevenDots.length;
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
   console.log(now.toUTCString()+ " end of sortPeople()") 
    return;
}

// draw the grey names first these won't be redrawn
function drawBackgroundLines(){
    console.log("drawing background lines")
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
                    console.log(allPeople[d][0].DisplayName)
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
            // % % % Case 13: sevent dots - Background% % % 
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
}

function drawCase1(){
            // % % % % % Case 1: Solid lines % % % 

        // draw the people from this case on the map 
        // no map on new page 
       // if (page == "biographyMap.html"){   drawPeopleOnMap(solidLines);  } 

        var dataEnter = peopleGroup.selectAll("div")
            .data(solidLines)
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
            .data(threeBegin)
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
            .data(threeBeginTwoEnd)
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
            .data(oneBegin)
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
            .data(oneEndUnder)
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
            .data(solid2)
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
            .data(oneEnd)
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
            .data(threeBeginOneEnd)
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
            .data(oneEndUnder2)
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
            .data(sevenDots)
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
            .data(oneEnd2)
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


// draw the all the names these will be redrawn many times
function drawLines(){
    mouseOut(); // if a tooltip was open, close it
    // % % % % % Case 1: Solid lines % % % 
    if (case1){
        d3.timeout(drawCase1(),1);
    }   

    if (case2){
        d3.timeout(drawCase2(),1);
    }
    
     if (case3){
        d3.timeout(drawCase3(),1);
    }

     if(case4){
        d3.timeout(drawCase4(),1);
    }

     if (case5){
         d3.timeout(drawCase5(),1);
    }

    if (case6){
        d3.timeout(drawCase6(),1);  
    }
    
    if (case7){
         d3.timeout(drawCase7(),1);
    }

    if (case8){
        d3.timeout(drawCase8(),1);
    }
    if (case11){
        d3.timeout(drawCase11(),1);
    }
    
    if (case13){
        d3.timeout(drawCase13(),1);
    }
    
    if (case14){
        d3.timeout(drawCase14(),1);
    }
    var now = new Date();
    console.log(now.toUTCString()+ " end of drawLines()");
    document.addEventListener("DOMContentLoaded", function(event) { 
      //do work
        console.log(now.toUTCString()+ " READY!")
    });
//    document.getElementById("loader").style.display = "none"; // turn OFF the loader every time something is drawn
    

}

function setLoadingUI(){
    document.body.classList.add('waiting');
    document.getElementById("loader").style.display = "block";
    mouseOut(); // close the tooltip
    document.getElementById("numPeople").innerHTML =  "<span 'style=direction: ltr'><i>loading people...</i></span>"; 
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
    console.log("All button")
    
    //don't redraw if this is already the current case with no change to draw names
    if (currentCase != "drawAllPeople" || changeCase == true){
        currentCase = "drawAllPeople";
        changeCase = false;
        //document.getElementById("currentFilter").innerHTML = "All People";
        //clearTimeline();
        // clear global people
        
        // clear all checkboxes
        clearCheckBoxes();
        globalFilterString = "";
        document.getElementById("userInput").value= "";
        setLoadingUI();
        setTimeout(function() {
            filterPeople(allPeople, true);
            document.body.classList.remove('waiting');
            document.getElementById("loader").style.display = "none";
        }, 0);

        d3.selectAll(".f-list").classed("d-none",false); // add the display-none class to names in the filter list
        d3.selectAll(".f-list").classed("d-block",true); // remove the display-block class to names in the filter list
        
        d3.select("#descriptive_text").html("Click a name to view text."); // clear text description
     }
    
}


$("#ageAprox_CB").change(function() {
    console.log("Age Aprox CB clicked");
    drawYoungPeople(ageSlider.noUiSlider.get()[0],ageSlider.noUiSlider.get()[1]);
});

function drawYoungPeople(minAge, maxAge){
    console.log("age range: " + minAge + " to " + maxAge)

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
            console.log("age_CB clicked")
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
    console.log("alive during: " + minYear + " to " + maxYear)

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
   // clear gender
   if (gender == "Any"){
        F_gender = "";
        currentCase = "";
        currentGender = "";
        changeCase = false;
    } else

    //don't redraw if this is already the current case
    if (currentGender != gender || changeCase == true ){
        currentCase = "drawGender";
        changeCase = false;
               
        currentGender = gender;


        switch(gender.toLowerCase()){
            // try making this an array!!!

            case "female":                    
            case "male":
                // both female and male cases
                filterString = "someGuy.gender=='" + gender.toLowerCase() +"'";  
                break;
           case "unknown":
                filterString = "(someGuy.gender=='0'|| someGuy.gender== 'unsure')"; 
                break;
            default:
                filterString = "(someGuy.gender=='missing from OpenRefine results' || someGuy.gender== null)";
        }
        
        //clearTimeline();
        F_gender = filterString;  
    }
        buildFullFilterQuery();
        console.log(F_gender)
        document.getElementById("userInput").value= "";

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
    console.log("click line style") 
    // set radio button
   // document.getElementById("line_CB").checked = true;
   
   if (num == 0){
        document.getElementById('line_label').innerHTML = "Any ";
        F_LineStyle = "";
        currentCase = "";
        currentGender = "";
        changeCase = false;
    } else {

        //don't redraw if this is already the current case
        if (currentCase != "drawCase" || currentLineStyle != num  || changeCase == true){
            document.getElementById('line_label').innerHTML =  lookupLineStyle(num).substring(0, lookupLineStyle(num).indexOf("(")-1); // show line type, strip case number
//            document.getElementById('line_label').innerHTML = "<small>" + lookupLineStyle(num) + "</small>" // show case # to dropdown label
        currentCase = "drawCase";
            currentLineStyle = num;
            changeCase = false;
        filterString = "someGuy.lineType =='case" + num +"'"
        } 
        if (num == 1){
            filterString = "someGuy.lineType == 'case1' || someGuy.lineType == 'case6'"; // if drawing case 1, also draw case 6, both are solid line
        } else if (num == 5){
            filterString = "someGuy.lineType == 'case5' || someGuy.lineType == 'case11'"; // if drawing case 1, also draw case 6, both are solid line
        } else if (num == 7){
            filterString = "someGuy.lineType == 'case7' || someGuy.lineType == 'case14'"; // if drawing case 1, also draw case 6, both are solid line
        } else {
            filterString = "someGuy.lineType =='case" + num +"'"
        }
        //document.getElementById("currentFilter").innerHTML = "Life drawn as " + lookupLineStyle(num);
        //clearTimeline();
        F_LineStyle = "(" + filterString + ")";

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
    setLoadingUI();
    clearCheckBoxes();

    var x = document.getElementById("userInput").value;
    filterString = "someGuy.Name.toLowerCase().includes('"+ escapeQuotes(x) + "'.toLowerCase())"
    filterString += "|| someGuy.DisplayName.toLowerCase().includes('"+ escapeQuotes(x) + "'.toLowerCase())"
    
    
    
    console.log(x)
    setTimeout(function() {
        filterPeople(allPeople, filterString);
        document.body.classList.remove('waiting');
        document.getElementById("loader").style.display = "none";
    }, 0);
}

function escapeQuotes(str) {
    return String(str).replace("'", "\\'").replace('"', '\\"');
}

function clearTimeline(){ 
    // fade everything,
    peopleGroup.selectAll(".people-lines, .circles, .timeline-text, .mouse-lines")
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

        // put all background names back
        peopleGroup.selectAll(".timeline-text-background").classed("d-none",false);

        // put foreground names back
       if(globalFilterString==""){
            //for all
            peopleGroup.selectAll(".timeline-text").classed("d-none",false);
        } else {
            // just for filter
           people.map(function(thisGuy){
                //id = thisGuy.DisplayName.replace(/[\'\. ,:-]+/g, "-")
                peopleGroup.selectAll("#"+thisGuy.UO_ID+".timeline-text").classed("d-none",false);
           //      id = thisGuy.replace(/[\'\. ,:-]+/g, "-")
           //          return "<element onClick='resultClicked()' id='list-"+ id + "\'>" + thisGuy + "</element><br>"
           //      }).sort().join('')
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
    
    var tooltipHTML = sectionText[section]['label'] + "<br/>Era of "+ findRuler(d3.event.x) +"<br/>";
    
    toolTip.html(tooltipHTML)
      .style("left", (d3.event.pageX) + "px")     
      .style("top", (d3.event.pageY) + "px");  

    toolTip.transition()
         .duration(100)    
         .style("opacity", .9);
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
    if (allPeople[key][0].gender != null && allPeople[key][0].gender != '0' && allPeople[key][0].gender !='unsure') {
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
    } else A = "~ " + String(allPeople[key][0].AproxAge);


    var bornUncertainty ="";
    var thisCase = allPeople[key][0].lineType
    if (thisCase == "case2" || thisCase == "case4" || thisCase == "case3" || thisCase == "case8" || thisCase == "case13") {
        bornUncertainty = "~ ";
    }

    var deathUncertainty ="";
    if (thisCase == "case5" || thisCase == "case7" || thisCase == "case11" || thisCase == "case14" || thisCase == "case3" || thisCase == "case8" || thisCase == "case13") {
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
    

    
    var imgItem = "<img src='biography/img/"+thisCase+".png' height='12px' width='"+ageWidth+"'> "
    
    
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
     

     


if (thisCase == "case2" ||  thisCase == "case8") {
    startDateText = "" // no text before line
    A = "unknown" // replace age

} 
     
if (thisCase == "case3"||  thisCase == "case13") {
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
     
   tooltipHTML = firstLine+ "<span id='tooltip_timeline_text'>"+startDateText+imgItem+endDateText+ underText + "</span>"+ lastLine;  
    
    
    
    




          
     
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

console.log("middle of JS")

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
       peopleGroup.selectAll(".timeline-text")
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
        default:
            return "";
    }
}


function clearCheckBoxes(){
    //document.getElementById("drawName_CB").checked = true;
    //document.getElementById("name_CB").checked = false;
    F_gender = "";
    document.getElementById('gender_label').innerHTML = "Any ";
    F_profession = "";
    document.getElementById('profession_label').innerHTML = "Any  ";
    F_LineStyle = "";
    document.getElementById('line_label').innerHTML = "Any  ";
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
    console.log(e) // debug
    var  id = e;
    
    mouseOut(); // close the tooltip
    // console.log("unselecting id: "+id) // debug
    
    
    // remove name from the click list
    clickList = clickList.filter(function(thisGuy) { return thisGuy !== id })
    // repopulate the selection box from the clickList
    populateSelectionBox()
    
    // remove highlight from the person's line and text on the chart 
    peopleGroup.selectAll(".people-lines,.circles,.timeline-text")
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
    fullExtentBio(); // when clicking in the list, set the chart to full extent

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
      var direction = d3.event.wheelDelta < 0 ? 'down' : 'up';
      currentZoom = (d3.event.wheelDelta < 0 ) ? currentZoom -= 0.2 : currentZoom += 0.2; // decrement / increment
      currentZoom = (currentZoom < 1.0 ) ? 1.0 : currentZoom; // test lower bound
      currentZoom = (currentZoom > 8.0 ) ? 8.0 : currentZoom; // test upper bound
      zoomSlider.noUiSlider.set([currentZoom]*100); 
      // sizeChange(currentZoom);
      //console.log(currentZoom)
      //zoom(direction === 'up' ? d : d.parent);

      var translateX = d3.event;
      var translateY = d3.event;
//      console.log(d3.event)
//      console.log(translateY)

});

const delta = 0.5;
let dragStartX;
let dragStartY;


 function redraw() {
     return svg.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")");
 }

// SET descriptive text in the element
function setDescriptiveText(UOID) {
	console.log("looking for UOID: " + UOID)
    
    if(UOID == "-99"){
        document.getElementById("descriptive_text").innerHTML = "Click another name to view text.";
        return false;
    }
    
    watkinsID = allPeople[UOID][0].Watkins_ID
    var alternateID= ""
    var alternateName="";
    var link = allPeople[UOID][0].Link
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
    
    // check description from Watkins
	if (typeof watkinsID != 'undefined' && watkinsID in watkinsDict) {
        // NOTE: when dictionary is built, watkinsDict[ID][0] is name, watkinsDict[ID][1] is description, watkinsDict[ID][2] is source
        
        // SET NAME
        // add Watkins name if different
        if (allPeople[UOID][0].Name.toUpperCase() !=  watkinsDict[watkinsID][0].toUpperCase()){
            alternateName = " or <span style='text-transform:uppercase'>" + watkinsDict[watkinsID][0] + "</span>"
        }
        
       
        //set description
        document.getElementById("descriptive_text").innerHTML = pName + alternateName + linkText + "<br>"+ watkinsDict[watkinsID][1] + "<br>— " + watkinsDict[watkinsID][2]+" (Watkins)";
             
	} else if(allPeople[UOID][0].alterrnateID != '' && allPeople[UOID][0].alterrnateID !== undefined) { // check for an Alternate description
        var alterrnateID = allPeople[UOID][0].Alternate_ID
        console.log("alterrnateID " + alterrnateID)
        // NOTE: when dictionary is built, alternateDict[ID][0] is name, alternateDict[ID][1] is description, alternateDict[ID][2] is the entry's source, alternateDict[ID][3] is text which was used
        

        
        // SET NAME
        // add Alternate name if different
        // allPeople[UOID][0].Name is the name in the field "Name"
        // alternateDict[alterrnateID][0] is the name, which is stored in the first index of the array
        if (allPeople[UOID][0].Name.toUpperCase() !=  alternateDict[alterrnateID][0].toUpperCase()){
            alternateName = " or <span style='text-transform:uppercase'>" + alternateDict[alterrnateID][0] + "</span>"
        }
        
        //set description
        document.getElementById("descriptive_text").innerHTML = pName + alternateName + linkText + "<br>"+ alternateDict[alterrnateID][1] +"<br>— " + alternateDict[alterrnateID][2]+" ("+ alternateDict[alterrnateID][3]+")";
        
    } else { // no name found at all
			console.log("Not in watkinsDict")
		 	document.getElementById("descriptive_text").innerHTML = pName + linkText + "<br>No descriptive text found. Click another name to view text.";
	}

}


//panning
svg.call(d3.drag() // call specific function when circle is dragged
     .on("start", dragstarted)
     .on("drag", dragged)
     .on("end", dragended));


function dragstarted(d) {
    console.log("drag start")
//    console.log(d3.event)
  d3.select(this).style("cursor", "move"); 
  dragStartX = d3.event.x;
  dragStartY = d3.event.y;
}

function dragged(d) {
//  console.log("draged")
//  console.log(d3.event.x)
//  dragStartX = d3.event.x;
//  dragStartY = d3.event.y;
    
  //    console.log(d3.event)
  const diffX = d3.event.x - dragStartX;
  const diffY = d3.event.y - dragStartY;
  // only move if a big drag  
  if (Math.abs(diffX) > delta || Math.abs(diffY) > delta) {
        console.log("draged big")
        console.log(d3.event.x)
    // Drag!
      currentDragX = currentDragX + diffX
      currentDragY = currentDragY + diffY
//      console.log("drag")
//      console.log("currentDragX"+currentDragX)
      
      
    // Maintain current timeline zoom
    var wide = container.width(),
	high = container.height();
    var scale = (wide/outerWidth)*currentZoom;
 //   var translateX = (wide*scale)/-2
//    d3.select(".topGroup").attr("transform", "scale(" + scale + ") translate(" + translateX + " 0)");
      
     
      // cap x/y pans
      xgap =  -1*((outerWidth)-wide)
//      currentDragX = Math.min(currentDragX,0)
      //currentDragX = currentDragX > 0 ?  Math.min(currentDragX, 0): Math.min(xgap, 0);

//      
      currentDragX = currentDragX < -0.8*(container.width()) ?  -0.8*(container.width()) : currentDragX // don't drag over 80% left
      currentDragX = currentDragX > 0.8*(container.width()) ?  0.8*(container.width()) : currentDragX // don't drag over 80% right
      
      currentDragY = Math.min(currentDragY, 0) // can't drag below the top
      
      console.log("wide:"+wide+" high:"+high +" scale:"+scale)
      console.log("container width:"+ outerWidth+" container hight:"+outerHeight +" scale:"+scale)
      console.log("xgap:"+ xgap)
      console.log("cdX:"+currentDragX)
      console.log("cdY:"+currentDragY)
      
    d3.select(".topGroup").attr("transform", "scale(" + scale + ") translate(" + currentDragX + " " + currentDragY+ ")");
    d3.select(".middleGroup").attr("transform", "scale(" + scale + ") translate(" + currentDragX + " " + currentDragY+ ")");
    d3.select(".bottomGroup").attr("transform", "scale(" + scale + ") translate(" + currentDragX + " " + currentDragY+ ")");
    d3.select(".peopleGroup").attr("transform", "scale(" + scale + ") translate(" + currentDragX + " " + currentDragY+ ")");
    d3.select(".categoryGroup").attr("transform", "scale(" + scale + ") translate(" + currentDragX + " " + currentDragY+ ")");
    
     
    
  dragStartX = d3.event.x;
  dragStartY = d3.event.y;
    
  }
    
}

function dragended(d) {
    d3.select(this).style("cursor", "pointer");  
//  if (!d3.event.active) simulation.alphaTarget(.03);
//  d.fx = null;
//  d.fy = null;
}



function changeFont(thisFont){
    console.log(thisFont)
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


console.log("end of JS");
