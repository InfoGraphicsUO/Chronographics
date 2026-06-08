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
// pixel X per numeric year; parseDate + xScale are slow when called for every dot, line end, and label
var chartXCache = Object.create(null);
function chartX(year) {
    var y = Number(year);
    if (y in chartXCache) {
        return chartXCache[y];
    }
    var px = xScale(parseDate(String(year)));
    chartXCache[y] = px;
    return px;
}

var yScale = d3.scalePoint()
    .domain(d3.range(0, numRows))  // number of rows 
    .range([startInY, endInY]);


// text stamped on the right
// width: the difference between the row above and the row below
// row: should change to ...the section row above - 1/2 the section width
var sectionText = [  
    {label:"", section:0, lines:[""]}, //
    {label:"Historians, Antiquaries, & Lawyers", section:1, lines:["Historians, Antiquaries,", "& Lawyers"]},
    {label:"Orators & Critics", section:2, lines:["Orators & Critics"]},
    {label:"Artists & Poets", section:3, lines:["Artists & Poets"]},
    {label:"Mathematicians & Physicians", section:4, lines:["Mathematicians", "& Physicians"]},
    {label:"Divines & Metaphysicians", section:5, lines:["Divines & Metaphysicians"]},
    {label:"Statesmen & Warriors", section:6, lines:["Statesmen & Warriors"]}
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
    .call(renderCategoryLabelLines)
    .each(function() {
        d3.select(this).classed("label-text-single", d3.select(this).selectAll("tspan").size() === 1);
    })
    .call(centerCategoryLabels)
    .on("mouseover", function(d){
        // console.log(d.label)
             mouseOverSectionTitle(d)
     })
    .on("mouseout", function(d){
             mouseOutSectionTitle(d)
    });




/* render category labels with manually chosen line breaks */
function renderCategoryLabelLines(text) {
  text.each(function(d) {
    var text = d3.select(this),
        lines = d.lines || [d.label],
        y = text.attr("y");

    text.text(null);
    lines.forEach(function(line, i) {
      text.append("tspan")
          .attr("x", lines.length === 1 ? 0 : 2 - (i * 8))
          .attr("y", y)
          .text(line);
    });
  });
}

var SINGLE_LINE_CATEGORY_LABEL_X_NUDGE = 2;

/* center each section label horizontally in the right margin (1- or 2-line stacks) */
function centerCategoryLabels(text) {
  // Wait one frame so CSS class changes (notably .label-text-single font size) affect getBBox().
  window.requestAnimationFrame(function() {
    text.each(function() {
      var bbox = this.getBBox();
      if (!bbox.width) return;

      var label = d3.select(this);
      var singleLineNudge = label.classed("label-text-single") ? SINGLE_LINE_CATEGORY_LABEL_X_NUDGE : 2;
      var offset = -(bbox.x + bbox.width / 2) + singleLineNudge;

      label.selectAll("tspan").each(function() {
        var tspan = d3.select(this);
        var currentX = parseFloat(tspan.attr("x")) || 0;
        tspan.attr("x", currentX + offset);
      });
    });
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

