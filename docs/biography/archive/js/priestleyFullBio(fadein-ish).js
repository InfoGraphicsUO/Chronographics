// TOOL TIP
var toolTip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// Set the resize function
d3.select(window).on("resize", sizeChange);

//check the current page to determine what is needed
var path = window.location.pathname;
var page = path.split("/").pop();
//console.log(page)

var showColors = false;

var drawName = true; //boolean for drawing text on chart of bio//
var currentCase = "drawAllPeople";
var changeCase = false;
var currentProfession = "";
var currentLineStyle = "";
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
outerHeight = container.height();
width = outerWidth - margin.left - margin.right;
height = outerHeight - margin.top - margin.bottom;
innerWidth = width - padding.left - padding.right;
innerHeight = height - padding.top - padding.bottom;
endX = startX + width;
endY = startY + height;
endInX = startInX + innerWidth;
endInY = startInY + innerHeight;    
var aspect = outerWidth/outerHeight;
var numRows = 164;



// ~ ~ ~ Function to scale the main group ~  ~ ~
function sizeChange() {

    // Resize the timeline
    var wide = container.width(),
	high = container.height();
    var scale = wide/outerWidth;
    d3.select(".topGroup").attr("transform", "scale(" + scale + ")");
    d3.select(".middleGroup").attr("transform", "scale(" + scale + ")");
    d3.select(".bottomGroup").attr("transform", "scale(" + scale + ")");
    $("#svg-chart").height(wide*(1.0/aspect));
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
var linesLocations = [0, 154]; // Sets the min/max lines
var sectionLines = [0,23,44,72,104,134,numRows]
var textLocations = [-1150,-1050,-950,-850,-750, -650,-550, -450, -350, -250, -150, -50,50,  150,250,350,450,550,650,750,850,950,1050,1150,1250,1350,1450,1550,1650,1750]; // where the little 50's go
var minMaxX = d3.extent(linesArray);
var minMaxY = d3.extent(linesLocations);
var timeArray = d3.range(-1200, 1800, 25); // locations for dots [start, end, separation]

// The scale for timeline dot radii, x and y axes
var xScale = d3.time.scale()
    .range([startInX, endInX])
    .domain([parseDate(minMaxX[0].toString()), 
	     parseDate(minMaxX[1].toString())]);
var yScale = d3.scale.ordinal()
    .domain(d3.range(0, numRows))  // number of rows 
    .rangePoints([startInY, endInY]);


// coloured rectangles 
var rectangle = middleGroup.append("rect")
                           .attr("x", startInX)
                           .attr("y", yScale(0))
                           .attr("width", width-margin.right)
                           .attr("height", yScale(sectionLines[1])-yScale(sectionLines[0]))
                           .attr("fill", lookupColor("green"))
                           .attr("fill-opacity", 0.13);

var rectangle = middleGroup.append("rect")
                           .attr("x", startInX)
                           .attr("y", yScale(sectionLines[1]))
                           .attr("width", width-margin.right)
                           .attr("height", yScale(sectionLines[2])-yScale(sectionLines[1]))
                           .attr("fill", lookupColor("pink"))
                           .attr("fill-opacity", 0.1);

var rectangle = middleGroup.append("rect")
                           .attr("x", startInX)
                           .attr("y", yScale(sectionLines[2]))
                           .attr("width", width-margin.right)
                           .attr("height", yScale(sectionLines[3])-yScale(sectionLines[2]))
                           .attr("fill", lookupColor("yellow"))
                           .attr("fill-opacity", 0.1);

var rectangle = middleGroup.append("rect")
                           .attr("x", startInX)
                           .attr("y", yScale(sectionLines[3]))
                           .attr("width", width-margin.right)
                           .attr("height", yScale(sectionLines[4])-yScale(sectionLines[3]))
                           .attr("fill", lookupColor("blue"))
                           .attr("fill-opacity", 0.13);

var rectangle = middleGroup.append("rect")
                           .attr("x", startInX)
                           .attr("y", yScale(sectionLines[4]))
                           .attr("width", width-margin.right)
                           .attr("height", yScale(sectionLines[5])-yScale(sectionLines[4]))
                           .attr("fill", lookupColor("pink"))
                           .attr("fill-opacity", 0.1);

var rectangle = middleGroup.append("rect")
                           .attr("x", startInX)
                           .attr("y", yScale(sectionLines[5]))
                           .attr("width", width-margin.right)
                           .attr("height", yScale(sectionLines[6]-1)-yScale(sectionLines[5]))
                           .attr("fill", lookupColor("yellow"))
                           .attr("fill-opacity", 0.1);


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
    .attr("stroke", notBlack)
    .attr("stroke-width", "0.3px");

var horozontalLine = middleGroup.selectAll("g") //horizontal sections lines
    .data(sectionLines)
    .enter()
    .append("line")
    .attr("class", "horozontalLine")
    .attr("x1", xScale(parseDate("-1200")))
    .attr("y1", function(d){ return yScale(d); }) // can't be a decimal.
    .attr("x2", xScale(parseDate("1850")))
    .attr("y2", function(d){ return yScale(d); })
    .attr("stroke", notBlack)
    .attr("stroke-width", "0.5px");


var bottomLine = middleGroup.selectAll("g") // hotizontal bottom
    .append("line")
    .attr("class", "horozontalLine")
    .attr("x1", xScale(parseDate("-1200"))-2)
    .attr("y1", yScale(numRows-1)+35)
    .attr("x2", xScale(parseDate("1850"))+2)
    .attr("y2", yScale(numRows-1)+35)
    .attr("stroke", notBlack)
    .attr("stroke-width", "3px");

var topLine = middleGroup.selectAll("g") // top border
    .append("line")
    .attr("class", "horozontalLine")
    .attr("x1", xScale(parseDate("-1200"))-2)
    .attr("y1", yScale(0)-37)
    .attr("x2", xScale(parseDate("1850"))+2)
    .attr("y2", yScale(0)-37)
    .attr("stroke", notBlack)
    .attr("stroke-width", "3px");

var leftLine = middleGroup.selectAll("g")  // left vertical border
    .append("line")
    .attr("class", "horozontalLine")
    .attr("x1", xScale(parseDate("-1200")))
    .attr("y1", yScale(0)-35)
    .attr("x2", xScale(parseDate("-1200")))
    .attr("y2", yScale(numRows-1)+35)
    .attr("stroke", notBlack)
    .attr("stroke-width", "3px");

var rightLine = middleGroup.selectAll("g") // right vertical
    .append("line")
    .attr("class", "horozontalLine")
    .attr("x1", xScale(parseDate("1850")))
    .attr("y1", yScale(0)-35)
    .attr("x2", xScale(parseDate("1850")))
    .attr("y2", yScale(numRows-1)+35)
    .attr("stroke", notBlack)
    .attr("stroke-width", "3px");


var top50sText = topGroup.selectAll("div") // 50s across the top
    .data(textLocations)
    .enter()
    .append("text")
    .attr("class", "text-top")
    .text("50")
    .attr("text-anchor", "middle")
    .attr("x", function(d){ return xScale(parseDate(d.toString())); })
    .attr("y", yScale(0)-10);

var bottom50sText = topGroup.selectAll("div") // 50s across the bottom
    .data(textLocations)
    .enter()
    .append("text")
    .attr("class", "text-top")
    .text("50")
    .attr("text-anchor", "middle")
    .attr("x", function(d){ return xScale(parseDate(d.toString())); })
    .attr("y", yScale(numRows-1)+15);

var fleurDeLis = topGroup.selectAll("div")
    .data(textLocations)
    .enter()
    .append("text")
    .attr("class", "text-top")
    .html("&#x269C;")
    .style('fill', notBlack)
    .style("font-size", "13px")
    .attr("text-anchor", "middle")
    .attr("x", xScale(parseDate("0")))
    .attr("y", yScale(0)-20)



// text stamped on the right
var sectionText = [  
    {label:"Historians and Antiquaries", row:11},
    {label:"Orators and Critics",row:34},
    {label:"Artists Poets",row:58},
    {label:"Mathematicians & Physicians",row:88},
    {label:"Divines and Metaphysicians",row:120},
    {label:"Statesmen and Warriors",row:150}
];


//var historians = middleGroup.selectAll("g")
//    .data(sectionText)
//    .append("text")
//    .text(function(d){ return d.label})
//    .attr("class", "label-text")
//    .attr("text-anchor", "middle")
////    .attr("x", xScale(parseDate("10")))
//    .attr("y", yScale(25))
//    .style("font-size", "1.5em");

var historians = middleGroup.selectAll("text")
                .data(sectionText)
                .enter()
                .append("text")
                .attr("class", "label-text")
                .text(function(d){
                    return d.label;
                })
                .attr("class", "label-text")
                .style("font-size", "10px")
                .attr("y", function(d){
                    return d.row;
                });

middleGroup.selectAll(".label-text") 
    .attr("y", xScale(parseDate("1828"))) // year
    .attr("x", function(d){
                    return yScale(d.row)*-1;
                }) 
//    .attr("dy", ".35em")
    .attr("transform", "rotate(-90)")
    .style("text-anchor", "middle")
    .style('fill', notBlack);

// text stamped in the middle
//var learningText = middleGroup.selectAll("g")
//    .append("text")
//    .attr("class", "label-text-learning")
//    .text("Men of Learning")
//    .attr("text-anchor", "middle")
//    .attr("x", xScale(parseDate("10")))
//    .attr("y", yScale(5));

//middleGroup.selectAll(".label-text-learning") //??
//    .attr("y", 990)
//    .attr("x", -217)
//    .attr("dy", ".35em")
//    .attr("transform", "rotate(-90)")
//    .style("text-anchor", "start")
//    .style('fill', "red")

var topDots = middleGroup.selectAll("div")
    .data(timeArray)
    .enter()
    .append("circle")
    .attr("class", "circles")
    .attr("cx", function(d){
	return xScale(parseDate(d.toString())); })
    .style("font-size", "larger")
    .attr("cy", yScale(0)-5)
    .attr("r", 0.8)
    .attr("stroke", "notBlack");

var bottomDots = middleGroup.selectAll("div")
    .data(timeArray)
    .enter()
    .append("circle")
    .attr("class", "circles")
    .attr("cx", function(d){
	return xScale(parseDate(d.toString())); })
    .attr("cy", yScale(numRows-1)+5)
    .attr("r", 0.8)
    .attr("stroke", notBlack);

// Get an xval via the scale and date parser
//var xVal = function(d){ return xScale(parseDate(d.toString())); }; // not used

// The lower axis numbers
var xAxisBottom = d3.svg.axis()
    .scale(xScale)
    .tickSize(0, 0)
    .tickFormat(function(d){ return toYear(d); })
    .tickPadding(10)
    .ticks(d3.time.years, 100) // frequency of labels
    .orient("bottom");
axisGroupBottom.call(xAxisBottom)
    .selectAll("text")
    .attr("y", 15)
    .attr("x", 0)
    .attr("dy", ".35em")
    .style("text-anchor", "start");


// The upper axis numbers
var xAxisTop = d3.svg.axis()
    .scale(xScale)
    .tickSize(0, 0)
    .tickPadding(10)
    .ticks(d3.time.years, 100) // frequency of labels
    .tickFormat(function(d){ return toYear(d); })
    .orient("top");
axisGroupTop.call(xAxisTop)
    .selectAll("text")
    .attr("y", -12)
    .attr("x", 0)
    .attr("dy", ".35em")
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

var allPeople = []; // don't reset. this is what we draw from
var noLineNumber = [];  // don't reset or we lose this count
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
var Solid2 = [];
var unsure2 = [];
var sevenDots = []

// which lines to draw by default or change manually
// not really needed any more since the drawing can also no be controlled in the font end, but this allows us to crontrol it before hand.
var case1 = 1; // solidLines
var case2 = 1; // threeBegin
var case3 = 1; // threeBeginTwoEnd
var case4 = 1; // oneBegin
var case5 = 1; // oneEndUnder
var case6 = 1; // "Solid2" solid lines
var case7 = 1; // oneEnd
var case8 = 1; // threeBeginOneEnd
var case9 = 0; // no match
var case10 = 0; // unsure2
var case11 = 1; // oneEndUnder2
var case12= 0; // No line number
var case13= 1; // seven dots
var case14= 1; // oneEnd2


// Read in the data from Google spreadsheets
// currently using v10 merged with pantheon which is stored on the InfoGraphic's Lab Google Drive.
//https://docs.google.com/spreadsheets/d/1iMIC-QtrrHf6DDDVaZlUn3siMW2i2k6aHPWdX-kOapM/

 var ds = new Miso.Dataset({
     key: "1iMIC-QtrrHf6DDDVaZlUn3siMW2i2k6aHPWdX-kOapM", 
     worksheet : "1", //use sheet location, not name. Note if there is only one sheet use "od6", else 1,2,3etc
     importer: Miso.Dataset.Importers.GoogleSpreadsheet,
     parser : Miso.Dataset.Parsers.GoogleSpreadsheet
 });


//console.log(ds);
ds.fetch({
    success : function() {
        // Go through the data, create a json
        this.each(function(d){
            var someGuy = {}
            someGuy["DisplayName"] = d["NameOnChart"];
            someGuy["Name"] = d["NameInIndex"]; 
            someGuy["DeathPrecision"] = d["DeathPrecision"];
            someGuy["BornPrecision"] = d["BornPrecision"]; 
            someGuy["BirthDate"] = d["BirthDate"]*1;
            someGuy["LifePrecision"] = d["LifeLength Precision"]; 
            someGuy["LifeLength"] = d["LifeLength"]; 
            someGuy["AlivePrecision"] = d["Alive precision"];
            someGuy["AliveDate"] = d["AliveDate"]*1;
            someGuy["profession"] = d["Index Category 1"];
            // add the full text for profession here.
            someGuy["OnChartCategory"] = d["OnChartCategory"];
            someGuy["DeathDate"] = d["DeathDate"];
            someGuy["gender"] = d["gender"];
            someGuy["lat"] = d["LAT"];
            someGuy["lon"] = d["LON"];
            
            // add a placeholder for the line type
            someGuy["lineType"] = null; // in tab2
            someGuy["indexText"] = null; // in tab2 (TO DO, create indext when reading in data instead of on the fly)


            
            // If displayName and Name are null, this is a blank line. Skip it.
            if(someGuy["DisplayName"] == null && someGuy["Name"]== null) return false;
            // If displayName is null, get the name
            if(someGuy["DisplayName"] == null) someGuy["DisplayName"]  = someGuy["Name"]; 
                 
//            console.log (someGuy["Name"] + d["On Chart: Line #"] ); // debug
            
            if(d["On Chart: Line #"] > 0 ){
                someGuy["LineNumber"] = d["On Chart: Line #"] + lnDict[d["OnChartCategory"]];
                allPeople.push(someGuy);
              
            } else { // we don't know where to draw it
                noLineNumber.push(someGuy); // record who it was
                // console.log (someGuy["Name"] + d["On Chart: Line #"] ); // debug
                return false; // break out, don't try to draw it.
            };        
        });
        document.getElementById("loader").style.display = "none";
        sortPeople(allPeople, true); // second argument is a string that will evaluate to things you want to keep in the chart
        //sortPeople(allPeople, "someGuy.LifeLength < 50 && someGuy.LifeLength != null"); // second argument is a string that will evaluate to things you want to keep in the chart
        drawLines();
     },
     error: function(e) {
	   // your error callback here!
	   console.log("Error in reading data!!");
       console.log(e);
     }
 });
        
// console.log("someGuy[DisplayName]", someGuy["DisplayName"]); // debug (list everyone!)


// second argument is true OR a STRING that will evaluate to things you want to keep in the chart e.g. true or "someGuy.Name.startsWith('S')"
function sortPeople(thePeople, peopleFilter) { 
    
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
 Solid2 = [];
 unsure2 = [];
 sevenDots = []
// noLineNumber = [];


    
    //console.log("filter "+ peopleFilter);  // logs current filter
    
    thePeople.forEach(function(someGuy){
        
        if (!(eval(peopleFilter)))  return false; // break out if the person doesn't match the current filter
        
        //console.log(d.DeathDate)
//	    var someGuy = {}
	    // Find all solid lines
	    if(someGuy.DeathPrecision == "d." && someGuy.BornPrecision==null && someGuy.LifePrecision == null){
            if(someGuy.LifeLength != null){
                // Case 1: solid line
                // DeathPrecision is d, BornPrecision is null, LifePrecision is null, and LifeLength is not null
                someGuy.lineType = "case1"
                solidLines.push(someGuy);
            }
            // Case 2: 3 starting dots
            // DeathPrecision is d, BornPrecision is null, LifePrecision is null, and LifeLength is null    
            else {
                someGuy.lineType = "case2"
                threeBegin.push(someGuy);
            }
	    }
	    // Find the ones with 3 starting dots and 2 ending ones
	    else if(someGuy.AlivePrecision == "fl." || someGuy.AlivePrecision == "fl. af."){
            if(someGuy.AliveDate != null ){
            // Case 3: 3 starting dots and 2 ending dots
            // AlivePrecision is fl., and AliveDate is not null
                someGuy.lineType = "case3"

                threeBeginTwoEnd.push(someGuy);
            }
            // case 10 have enough data to draw it (birth date and life length )
            else if (someGuy.LifeLength != null && someGuy.BirthDate != null) { 
                someGuy.lineType = "case10"      
                unsure2.push(someGuy); 
            } 
             else people.push(someGuy); // case 9
        }
	    // Find the ones with one dot beneath
        //Case 4: 1 dot beneath beginning
        //DeathPrecision is d, LifePrecision is ab., and LifeLength is not null
	    else if(someGuy.DeathPrecision == "d." && (someGuy.LifePrecision=="ab." || someGuy.LifePrecision=="Above") && someGuy.LifeLength != null){
            someGuy.lineType = "case4"
            oneBegin.push(someGuy);
        }

        //Case 5: 1 dot beneath ending
        //DeathPrecision is d. ab., LifePrecision is ab.
	    else if(someGuy.DeathPrecision == "d. ab."){
            if(someGuy.LifePrecision=="ab."){
                someGuy.lineType = "case5"
                oneEndUnder.push(someGuy);
            }
            else if(someGuy.LifeLength != null){
                 //Case 6: 
                // DeathPrecision is d. ab., LifePrecision is NOT ab., and LifeLength is not null
                someGuy.lineType = "case6"
                // console.log (someGuy.Name)
                Solid2.push(someGuy);
            }
            else people.push(someGuy); // case 9
	    }
        
        //Case 7: 1 dot end
        // DeathPrecision is d. af., BornPrecision is b. 
	    else if(someGuy.DeathPrecision == "d. af."){
            if(someGuy.BornPrecision=="b."){
                someGuy.lineType = "case7"
                oneEnd.push(someGuy);

            } else if(someGuy.BornPrecision == null && someGuy.DeathDate != null){
                //Case 8: 3 starting dots and 1 end dot
                // DeathPrecision is d. af., BornPrecision is null //and death date is not null
                someGuy.lineType = "case8"

                threeBeginOneEnd.push(someGuy);
                //console.log(someGuy)
            }
            else people.push(someGuy); 
	    } 
                
        else if(someGuy.DeathPrecision == null && someGuy.BornPrecision == 'b.') { 
            // case 11 death precis is null, born precis is b. and life length is ab. or Above
             if(someGuy.LifePrecision=="ab." || someGuy.LifePrecision=="Above"){
                someGuy.lineType = "case11"
                oneEndUnder2.push(someGuy);
            }
            else if(someGuy.AlivePrecision == "l. af." || someGuy.AlivePrecision == "liv. af.")  {
                someGuy.lineType = "case14"
                oneEnd2.push(someGuy);
            } 
        
        }
        
        else if(someGuy.AlivePrecision == "fl. ab.") { 
            // case 13 alive  precis is fl. ab.
                someGuy.lineType = "case13"
                sevenDots.push(someGuy);        
        }

        else people.push(someGuy);
        
	});
    
    console.log("allPeople " + allPeople.length)
    
    // logs number of people in each category
//    console.log("1. solidLines " + solidLines.length)
//    console.log("2. threeBegin " + threeBegin.length)
//    console.log("3. threeBeginTwoEnd " + threeBeginTwoEnd.length)
//    console.log("4. oneBegin " + oneBegin.length)
//    console.log("5. oneEndUnder " + oneEndUnder.length)
//    console.log("6. Solid2 (solid) " + Solid2.length)
//    console.log("7. oneEnd " + oneEnd.length)
//    console.log("8. threeBeginOneEnd " + threeBeginOneEnd.length)
//    console.log("10. unsure2 " + unsure2.length)
//    console.log("11. oneEndUnder2 " + oneEndUnder2.length)
//    console.log("13. seven dots " + sevenDots.length)
//    console.log("14. oneEnd2 " + oneEnd2.length)
//    console.log("12. noLineNumber (not updated on redraw) " + noLineNumber.length)
//    console.log("9 (don't fit a case). people " + people.length)
	
    return;
}

function drawLines(){
    mouseOut(); // if a tooltip was open, close it
    if (case1){
        // % % % % % Case 1: Solid lines % % % Color: black

        // draw the people from this case on the map  
        if (page == "biographyMap.html"){   drawPeopleOnMap(solidLines);  } 

        var dataEnter = peopleGroup.selectAll("div")
            .data(solidLines)
            .enter();
        // Add the lines
        dataEnter.append("line")
            .attr("class", "people-lines")
            .attr("x1", function(d){
    //        console.log("solidLines " + d["DisplayName"]); // who is this?
                return xScale(parseDate((d["DeathDate"] - d["LifeLength"]).toString()));
            })
            .attr("y1", function(d){ return yScale(d["LineNumber"]); })
            .attr("x2", function(d){
                return xScale(parseDate(d["DeathDate"].toString()));
            })
            .attr("y2", function(d){ return yScale(d["LineNumber"]); })
            .attr("stroke", "black")
            .attr("stroke-width", "1px")
            .attr("opacity", 1e-6) // can't fade from 0 as the math messes up in the fade
            .transition().duration(300).attr("opacity", 1.0);

        // Add the text
        if (drawName) {
        dataEnter.append("text")
            .attr("class", "timeline-text")
            .attr("text-anchor", "middle")
            .text(function(d){ return d["DisplayName"]; })
            .attr("x", function(d){
            var start = (d["DeathDate"]-d["LifeLength"]);
                return xScale(parseDate((start + d["LifeLength"]/2).toString()));
            })
            .attr("y", function(d){ return yScale(d["LineNumber"])-3; })
            .attr('pointer-events', 'none')
            .attr("opacity", 1e-6) // can't fade from 0 as the math messes up in the fade
            .transition().duration(300).attr("opacity", 1.0)
            .transition().attr('pointer-events', 'auto');
//            .on("mouseover", function(d){
//                if (d["DeathDate"] > 0 ){
//                    mouseOverChartPeople(d,d["DeathDate"] - d["LifeLength"], d["DeathDate"], "d. " + d["DeathDate"] + ". " + d["LifeLength"]);
//                } else {
//                    mouseOverChartPeople(d,d["DeathDate"] - d["LifeLength"], d["DeathDate"], "d. " + Math.abs(d["DeathDate"]) + " BC. " + d["LifeLength"]);
//                }
//            })
//            .on("mouseout", mouseOut)
//            .on("click", function(e){ 
//                findPage(e["Name"]);
//                selectPerson(e);
////                d3.select(this).style("fill", "red");  // change the selected text to red
//            });

        }
        //Add a transparent line for hovering/ mouse interactions//
        dataEnter.append("line")
            .attr("class", "mouse-lines")
            .attr("x1", function(d){
    //        console.log("solidLines " + d["DisplayName"]); // who is this?
                return xScale(parseDate((d["DeathDate"] - d["LifeLength"]).toString()));
            })
            .attr("y1", function(d){ return yScale(d["LineNumber"]); })
            .attr("x2", function(d){
                return xScale(parseDate(d["DeathDate"].toString()));
            })
            .attr("y2", function(d){ return yScale(d["LineNumber"]); })
            .attr("stroke", "transparent")
            // .attr("opacity",".4")
            .attr("stroke-width", "5px")
            .on("click", function(e) {
                findPage(e["Name"]);
                selectPerson(e);
            })
            .on("mouseover", function(d){
                if (d["DeathDate"] > 0 ){
                    mouseOverChartPeople(d,d["DeathDate"] - d["LifeLength"], d["DeathDate"], "d. " + d["DeathDate"] + ". " + d["LifeLength"]);
                } else {
                    mouseOverChartPeople(d,d["DeathDate"] - d["LifeLength"], d["DeathDate"], "d. " + Math.abs(d["DeathDate"]) + " BC. " + d["LifeLength"]);
                }
            })
            .on("mouseout", mouseOut);
    }  
    

    if (case2){
        // % % % % Case 2: Solid line with THREE dots at the BEGIN % % % % % Color:Gold

        // draw the people from this case on the map  
        if (page == "biographyMap.html"){   drawPeopleOnMap(threeBegin);  }       

        var threeBeginEnter = peopleGroup.selectAll("div")
            .data(threeBegin)
            .enter();
        // Add the lines
        threeBeginEnter.append("line")
            .attr("class", "people-lines")
            .attr("x1", function(d){
    //        console.log("threeBegin " + d["DisplayName"]); // who is this?
                return xScale(parseDate((d["DeathDate"] - 30).toString()));
            })
            .attr("y1", function(d){ return yScale(d["LineNumber"]); })
            .attr("x2", function(d){
                return xScale(parseDate(d["DeathDate"].toString()));
            })
            .attr("y2", function(d){ return yScale(d["LineNumber"]); })
            .attr("stroke", function(){if(showColors) return "Gold"; else return "black";})
            .attr("stroke-width", "1px")
            .attr("opacity", 1e-6) // can't fade from 0 as the math messes up in the fade
            .transition().duration(300).attr("opacity", 1.0);
        // Add the text
        if (drawName) {
        threeBeginEnter.append("text")
            .attr("class", "timeline-text")
            .attr("text-anchor", "middle")
            .text(function(d){ return d["DisplayName"]; })
            .attr("x", function(d){     
            var start = (d["DeathDate"]-15);
                return xScale(parseDate(start.toString()));
            })
            .attr("y", function(d){ return yScale(d["LineNumber"])-3; })
            .attr('pointer-events', 'none')
            .attr("opacity", 1e-6) // can't fade from 0 as the math messes up in the fade
            .transition().duration(300).attr("opacity", 1.0)
            .transition().attr('pointer-events', 'auto');
//            .on("click", function(e) {
//                findPage(e["Name"]);
//                selectPerson(e);
//            })
//            .on("mouseover", function(d){
//                if (d["DeathDate"] > 0 ){
//                    mouseOverChartPeople(d, (d["DeathDate"] - 45),(d["DeathDate"]), "d." + d["DeathDate"]);
//                } else {
//                    mouseOverChartPeople(d, (d["DeathDate"] - 45),(d["DeathDate"]), "d." + Math.abs(d["DeathDate"]) + " BC. ");
//                }
//            })
//            .on("mouseout", mouseOut);
        }

        //Add a transparent line for hovering/ mouse interactions//
        threeBeginEnter.append("line")
            .attr("class", "mouse-lines")
            .attr("x1", function(d){
    //        console.log("threeBegin " + d["DisplayName"]); // who is this?
                return xScale(parseDate((d["DeathDate"] - 50).toString()));
            })
            .attr("y1", function(d){ return yScale(d["LineNumber"]); })
            .attr("x2", function(d){ 
                return xScale(parseDate(d["DeathDate"].toString()));
            })
            .attr("y2", function(d){ return yScale(d["LineNumber"]); })
            .attr("stroke", function(){if(showColors) return "Gold"; else return "transparent";})
            .attr("stroke-width", "5px")
            // .attr("opacity", "0.5")
            .on("click", function(e) {
                findPage(e["Name"]);
                selectPerson(e);
            })
            .on("mouseover", function(d){
                if (d["DeathDate"] > 0 ){
                    mouseOverChartPeople(d, (d["DeathDate"] - 45),(d["DeathDate"]), "d." + d["DeathDate"]);
                } else {
                    mouseOverChartPeople(d, (d["DeathDate"] - 45),(d["DeathDate"]), "d." + Math.abs(d["DeathDate"]) + " BC. ");
                }
            })
            .on("mouseout", mouseOut);
        
        // Add the three dots (run through the data three times)
        [-35, -40, -45].forEach(function(j){
            threeBeginEnter.append("circle")
                .attr("class", "circles")
                .attr("cx", function(d){
                        return xScale(parseDate((parseInt(d["DeathDate"]) + j).toString()))
                })
                .attr("cy", function(d){ return yScale(d["LineNumber"]); })
                .attr("r", 0.8)
                .attr("stroke-width", "1px")
                .attr("opacity", 1e-6) // can't fade from 0 as the math messes up in the fade
                .transition().duration(300).attr("opacity", 1.0);
        })
    }
        
    if (case3){
        // % % % Case 3: Solid lines with THREE dots at the BEGIN and TWO dots at the END % % % Color: Chartreuse

        // draw the people from this case on the map  
        if (page == "biographyMap.html"){   drawPeopleOnMap(threeBeginTwoEnd);      }   

        var threeBeginTwoEndEnter = peopleGroup.selectAll("div")
            .data(threeBeginTwoEnd)
            .enter();
        // Add the lines
        threeBeginTwoEndEnter.append("line")
            .attr("class", "people-lines")
            .attr("x1", function(d){
    //        console.log("threeBeginTwoEnd " + d["DisplayName"]); // who is this?
                return xScale(parseDate((d["AliveDate"] - 13).toString()));
            })
            .attr("y1", function(d){ return yScale(d["LineNumber"]); })
            .attr("x2", function(d){
                return xScale(parseDate((d["AliveDate"] + 7).toString()));
            })
            .attr("y2", function(d){ return yScale(d["LineNumber"]); })
            .attr("stroke", function(){if(showColors) return "Chartreuse"; else return "black";})
            .attr("stroke-width", "1px")
            .attr("opacity", 1e-6) // can't fade from 0 as the math messes up in the fade
            .transition().duration(300).attr("opacity", 1.0);

        // Add the text
        if (drawName) {
            threeBeginTwoEndEnter.append("text")
                .attr("class", "timeline-text")
                .attr("text-anchor", "middle")
                .text(function(d){ return d["DisplayName"]; })
                .attr("x", function(d){     
                var start = (d["AliveDate"] - 7);
                    return xScale(parseDate(start.toString()));
                })
                .attr("y", function(d){ return yScale(d["LineNumber"])-3; })
                .attr('pointer-events', 'none')
                .attr("opacity", 1e-6) // can't fade from 0 as the math messes up in the fade
                .transition().duration(300).attr("opacity", 1.0)
                .transition().attr('pointer-events', 'auto')

//                .on("click", function(e) {
//                    findPage(e["Name"]);
//                    selectPerson(e);
//                })
//                .on("mouseover", function(d){
//                    if (d["AliveDate"] > 0 ){
//                        mouseOverChartPeople(d,d["AliveDate"] - 37, d["AliveDate"] + 19, d["AlivePrecision"] + " " + d["AliveDate"]);
//                    } else {
//                        mouseOverChartPeople(d,d["AliveDate"] - 37, d["AliveDate"] + 19, d["AlivePrecision"] + " " + Math.abs(d["AliveDate"]) + " BC.");
//                    } 
//                })    
//                .on("mouseout", mouseOut);
        }

        //Add a transparent line for hovering/ mouse interactions//
        threeBeginTwoEndEnter.append("line")
            .attr("class", "mouse-lines")
            .attr("x1", function(d){
    //        console.log("threeBeginTwoEnd " + d["DisplayName"]); // who is this?
                return xScale(parseDate((d["AliveDate"]).toString())) - 13;
            })
            .attr("y1", function(d){ return yScale(d["LineNumber"]); })
            .attr("x2", function(d){
                return xScale(parseDate((d["AliveDate"]).toString())) + 9;
            })
            .attr("y2", function(d){ return yScale(d["LineNumber"]); })
            .attr("stroke", function(){if(showColors) return "Chartreuse"; else return "transparent";})
            .attr("stroke-width", "5px")
            // .attr("opacity", "0.5")
            .on("click", function(e) {
                findPage(e["Name"]);
                selectPerson(e);
            })
            .on("mouseover", function(d){
                if (d["AliveDate"] > 0 ){
                    mouseOverChartPeople(d,d["AliveDate"] - 37, d["AliveDate"] + 19, d["AlivePrecision"] + " " + d["AliveDate"]);
                } else {
                    mouseOverChartPeople(d,d["AliveDate"] - 37, d["AliveDate"] + 19, d["AlivePrecision"] + " " + Math.abs(d["AliveDate"]) + " BC.");
                } 
            }) 
            .on("mouseout", mouseOut);

        // Add the 5 dots (run through the data 5 times)
        [-18, -23, -28, 12,17].forEach(function(j){
            threeBeginTwoEndEnter.append("circle")
                .attr("class", "circles")
                .attr("cx", function(d){
                        return xScale(parseDate((parseInt(d["AliveDate"]) + j).toString()))
                })
                .attr("cy", function(d){ return yScale(d["LineNumber"]); })
                .attr("r", 0.8)
                .attr("stroke-width", "1px")
                .attr("opacity", 1e-6) // can't fade from 0 as the math messes up in the fade
                .transition().duration(300).attr("opacity", 1.0);
        })
    }

    if (case4){
        // % % % % % % Case 5: Solid line with ONE dot at the BEGINNING % % %  Color: Plum

        // draw the people from this case on the map  
        if (page == "biographyMap.html"){   drawPeopleOnMap(oneBegin);  }       

        var oneBeginEnter = peopleGroup.selectAll("div")
            .data(oneBegin)
            .enter();
        // Add the lines
        oneBeginEnter.append("line")
            .attr("class", "people-lines")
            .attr("x1", function(d){
    //        console.log("oneBegin " + d["DisplayName"]); // who is this?
                return xScale(parseDate((d["DeathDate"] - d["LifeLength"]).toString()));
            })
            .attr("y1", function(d){ return yScale(d["LineNumber"]); })
            .attr("x2", function(d){
                return xScale(parseDate(d["DeathDate"].toString()));
            })
            .attr("y2", function(d){ return yScale(d["LineNumber"]); })
            .attr("stroke", function(){if(showColors) return "Plum"; else return "black";})
            .attr("stroke-width", "1px")
            .attr("opacity", 1e-6) // can't fade from 0 as the math messes up in the fade
            .transition().duration(300).attr("opacity", 1.0);
        // Add the text
        if (drawName) {
        oneBeginEnter.append("text")
            .attr("class", "timeline-text")
            .attr("text-anchor", "middle")
            .text(function(d){ return d["DisplayName"]; })
            .attr("x", function(d){
            var start = (d["DeathDate"]-d["LifeLength"]);
                return xScale(parseDate((start + d["LifeLength"]/2).toString()));   
            })
            .attr("y", function(d){ return yScale(d["LineNumber"])-3; })
            .attr('pointer-events', 'none')
            .attr("opacity", 1e-6) // can't fade from 0 as the math messes up in the fade
            .transition().duration(300).attr("opacity", 1.0)
            .transition().attr('pointer-events', 'auto')

//            .on("click", function(e) {
//                findPage(e["Name"]);
//                selectPerson(e);
//            })
//            .on("mouseover", function(d){
//                if (d["DeathDate"] > 0 ){
//                mouseOverChartPeople(d,d["DeathDate"] - d["LifeLength"], d["DeathDate"], "d." + " " + d["DeathDate"] + " " + d["LifePrecision"] + " " + d["LifeLength"]);
//                } else {
//                mouseOverChartPeople(d,d["DeathDate"] - d["LifeLength"], d["DeathDate"], "d." + " " + Math.abs(d["DeathDate"]) + " BC. " + d["LifePrecision"] + " " + d["LifeLength"]);
//                }   
//            })
//            .on("mouseout", mouseOut);
        }

        //Add a transparent line for hovering/ mouse interactions//
        oneBeginEnter.append("line")
            .attr("class", "mouse-lines")
            .attr("x1", function(d){
    //        console.log("oneBegin " + d["DisplayName"]); // who is this?
                return xScale(parseDate((d["DeathDate"] - d["LifeLength"]).toString())) - 2;
            })
            .attr("y1", function(d){ return yScale(d["LineNumber"]) + 2; })
            .attr("x2", function(d){
                return xScale(parseDate(d["DeathDate"].toString())) + 2;
            })
            .attr("y2", function(d){ return yScale(d["LineNumber"]) + 2; })
            .attr("stroke", function(){if(showColors) return "Plum"; else return "transparent";})
            .attr("stroke-width", "9px")
            // .attr("opacity", "0.5")
            .on("click", function(e) {
                findPage(e["Name"]);
                selectPerson(e);
            })
            .on("mouseover", function(d){
                if (d["DeathDate"] > 0 ){
                mouseOverChartPeople(d,d["DeathDate"] - d["LifeLength"], d["DeathDate"], "d." + " " + d["DeathDate"] + " " + d["LifePrecision"] + " " + d["LifeLength"]);
                } else {
                mouseOverChartPeople(d,d["DeathDate"] - d["LifeLength"], d["DeathDate"], "d." + " " + Math.abs(d["DeathDate"]) + " BC. " + d["LifePrecision"] + " " + d["LifeLength"]);
                }   
            })
            .on("mouseout", mouseOut);

        // Add the one dot below
        oneBeginEnter.append("circle")
            .attr("class", "circles")
            .attr("cx", function(d){
            return xScale(parseDate((d["DeathDate"] - d["LifeLength"] + 2).toString()));
            })
            .attr("cy", function(d){ return yScale(d["LineNumber"])+4; })
            .attr("r", 0.8)
            .attr("stroke", "black")
            .attr("stroke-width", "1px")
            .attr("opacity", 1e-6) // can't fade from 0 as the math messes up in the fade
            .transition().duration(300).attr("opacity", 1.0);
    }
    
    

    if (case5){
        // % % % %  CASE 5:  Solid line with ONE dot UNDER at the END % % % % % % Color: Cyan

        // draw the people from this case on the map  
        if (page == "biographyMap.html"){   drawPeopleOnMap(oneEndUnder); }        

        var oneEndUnderEnter = peopleGroup.selectAll("div")
            .data(oneEndUnder)
            .enter();
        // Add the lines
        oneEndUnderEnter.append("line")
            .attr("class", "people-lines")
            .attr("x1", function(d){
    //        console.log("oneEndUnder " + d["DisplayName"]); // who is this?
            return xScale(parseDate((d["DeathDate"] - d["LifeLength"]).toString()));
            })
            .attr("y1", function(d){ return yScale(d["LineNumber"]); })
            .attr("x2", function(d){
            return xScale(parseDate(d["DeathDate"].toString()));
            })
            .attr("y2", function(d){ return yScale(d["LineNumber"]); })
            .attr("stroke", function(){if(showColors) return "Cyan"; else return "black";})
            .attr("stroke-width", "1px")
            .attr("opacity", 1e-6) // can't fade from 0 as the math messes up in the fade
            .transition().duration(300).attr("opacity", 1.0);
        // Add the text
        if (drawName) {
        oneEndUnderEnter.append("text")
            .attr("class", "timeline-text")
            .attr("text-anchor", "middle")
            .text(function(d){ return d["DisplayName"]; })
            .attr("x", function(d){
            var start = (d["DeathDate"]-d["LifeLength"]);
            return xScale(parseDate((start + d["LifeLength"]/2).toString()));   
            })
            .attr("y", function(d){ return yScale(d["LineNumber"])-3; })
            .attr('pointer-events', 'none')
            .attr("opacity", 1e-6) // can't fade from 0 as the math messes up in the fade
            .transition().duration(300).attr("opacity", 1.0)
            .transition().attr('pointer-events', 'auto')

//            .on("click", function(e) {
//                findPage(e["Name"]);
//                selectPerson(e);
//            })
//            .on("mouseover", function(d){
//                if (d["DeathDate"] > 0 ){
//                mouseOverChartPeople(d,d["DeathDate"] - d["LifeLength"], d["DeathDate"], "d. ab. " + d["DeathDate"] + " ab. " + d["LifeLength"]);
//                } else {
//                mouseOverChartPeople(d,d["DeathDate"] - d["LifeLength"], d["DeathDate"], "d. ab. " + Math.abs(d["DeathDate"]) + " BC. " + "ab. " + d["LifeLength"]);
//                }   
//            })
//            .on("mouseout", mouseOut);
        }

        //Add a transparent line for hovering/ mouse interactions//
        oneEndUnderEnter.append("line")
            .attr("class", "mouse-lines")
            .attr("x1", function(d){
    //        console.log("oneEndUnder " + d["DisplayName"]); // who is this?
            return xScale(parseDate((d["DeathDate"] - d["LifeLength"]).toString())) - 2;
            })
            .attr("y1", function(d){ return yScale(d["LineNumber"]) + 2; })
            .attr("x2", function(d){
            return xScale(parseDate(d["DeathDate"].toString())) + 2;
            })
            .attr("y2", function(d){ return yScale(d["LineNumber"]) + 2; })
            .attr("stroke", function(){if(showColors) return "Cyan"; else return "transparent";})
            .attr("stroke-width", "8px")
            .on("click", function(e) {
                findPage(e["Name"]);
                selectPerson(e);
            })
            .on("mouseover", function(d){
                if (d["DeathDate"] > 0 ){
                mouseOverChartPeople(d,d["DeathDate"] - d["LifeLength"], d["DeathDate"], "d. ab. " + d["DeathDate"] + " ab. " + d["LifeLength"]);
                } else {
                mouseOverChartPeople(d,d["DeathDate"] - d["LifeLength"], d["DeathDate"], "d. ab. " + Math.abs(d["DeathDate"]) + " BC. ab. " + d["LifeLength"]);
                }   
            })
            .on("mouseout", mouseOut);

        // Add the one dot below
        oneEndUnderEnter.append("circle")
            .attr("class", "circles")
            .attr("cx", function(d){
            return xScale(parseDate((d["DeathDate"] - 2).toString()));
            })
            .attr("cy", function(d){ return yScale(d["LineNumber"])+4; })
            .attr("r", 0.8)
            .attr("stroke", "black")
            .attr("stroke-width", "1px")
            .attr("opacity", 1e-6) // can't fade from 0 as the math messes up in the fade
            .transition().duration(300).attr("opacity", 1.0);
    }

    if (case6){
        // % % % % % Case 6: Solid2 % % % % % % % % % % % % : RED
        //  essentially a solid line

        // draw the people from this case on the map 
        if (page == "biographyMap.html"){
                drawPeopleOnMap(Solid2);
       }

        var Solid2Enter = peopleGroup.selectAll("div")
            .data(Solid2)
            .enter();
        // Add the lines
        Solid2Enter.append("line")
            .attr("class", "people-lines")
            .attr("x1", function(d){
            return xScale(parseDate((d["DeathDate"]).toString()));
            })
            .attr("y1", function(d){ return yScale(d["LineNumber"]); })
            .attr("x2", function(d){
            return xScale(parseDate((d["DeathDate"]-d["LifeLength"]).toString()));
            })
            .attr("y2", function(d){ return yScale(d["LineNumber"]); })
            .attr("stroke", function(){ if(showColors) return notBlack; else return "black";})
            .attr("stroke-width", "1px")
            .attr("opacity", 1e-6) // can't fade from 0 as the math messes up in the fade
            .transition().duration(300).attr("opacity", 1.0);
            
        // Add the text
        if (drawName) {
        Solid2Enter.append("text")
            .attr("class", "timeline-text")
            .attr("text-anchor", "middle")
            .text(function(d){ return d["DisplayName"]; })
            .attr("x", function(d){		
            var start = (d["DeathDate"]-d["LifeLength"]);
            return xScale(parseDate((start+d["LifeLength"]/2).toString()));
            })
            .attr("y", function(d){ return yScale(d["LineNumber"])-3; })
            .attr('pointer-events', 'none')
            .attr("opacity", 1e-6) // can't fade from 0 as the math messes up in the fade
            .transition().duration(300).attr("opacity", 1.0)
            .transition().attr('pointer-events', 'auto');

//            .on("click", function(e) {
//                findPage(e["Name"]);
//                selectPerson(e);
//            })
////            .attr("stroke", function(){ if(showColors) return notBlack; else return "black";})
//            .on("mouseover", function(d){
//                if (d["DeathDate"] > 0 ){
//                mouseOverChartPeople(d,d["DeathDate"] - d["LifeLength"], d["DeathDate"], "d. ab. " + d["DeathDate"] + ". " + d["LifeLength"]);
//                } else {
//                mouseOverChartPeople(d,d["DeathDate"] - d["LifeLength"], d["DeathDate"], "d. ab. " + Math.abs(d["DeathDate"]) + " BC. " + d["LifeLength"]);
//                }   
//            })
//            .on("mouseout", mouseOut);
        }

        //Add a transparent line for hovering/ mouse interactions//
        Solid2Enter.append("line")
            .attr("class", "mouse-lines")
            .attr("x1", function(d){
            return xScale(parseDate((d["DeathDate"]).toString())) + 2;
            })
            .attr("y1", function(d){ return yScale(d["LineNumber"]); })
            .attr("x2", function(d){
            return xScale(parseDate((d["DeathDate"]-d["LifeLength"]).toString())) - 2;
            })
            .attr("y2", function(d){ return yScale(d["LineNumber"]); })
            .attr("stroke", function(){ if(showColors) return notBlack; else return "transparent";})
            .attr("stroke-width", "6px")
            .on("click", function(e) {
                findPage(e["Name"]);
                selectPerson(e);
            })
            .on("mouseover", function(d){
                if (d["DeathDate"] > 0 ){
                mouseOverChartPeople(d,d["DeathDate"] - d["LifeLength"], d["DeathDate"], "d. ab. " + d["DeathDate"] + ". " + d["LifeLength"]);
                } else {
                mouseOverChartPeople(d,d["DeathDate"] - d["LifeLength"], d["DeathDate"], "d. ab. " + Math.abs(d["DeathDate"]) + " BC. " + d["LifeLength"]);
                }   
            })
            .on("mouseout", mouseOut);
    }

    if (case7){    
        // % % % %  CASE 7: Solid line with ONE dot at the END % % % % %  Color: Green

        // draw the people from this case on the map  
        if (page == "biographyMap.html"){   drawPeopleOnMap(oneEnd); }

        var oneEndEnter = peopleGroup.selectAll("div")
            .data(oneEnd)
            .enter();
        // Add the lines
        oneEndEnter.append("line")
            .attr("class", "people-lines")
            .attr("x1", function(d){
    //        console.log("oneEnd " + d["DisplayName"]); // who is this?
            return xScale(parseDate((d["BirthDate"]).toString()));
            })
            .attr("y1", function(d){ return yScale(d["LineNumber"]); })
            .attr("x2", function(d){
            return xScale(parseDate(d["DeathDate"].toString()));
            })
            .attr("y2", function(d){ return yScale(d["LineNumber"]); })
            .attr("stroke", function(){if(showColors) return "Green"; else return "black";})
            .attr("stroke-width", "1px")
            .attr("opacity", 1e-6) // can't fade from 0 as the math messes up in the fade
            .transition().duration(300).attr("opacity", 1.0);
            
        // Add the text
        if (drawName) {
            oneEndEnter.append("text")
                .attr("class", "timeline-text")
                .attr("text-anchor", "middle")
                .text(function(d){ return d["DisplayName"]; })
                .attr("x", function(d){
                var half = d["BirthDate"] + (d["DeathDate"]-d["BirthDate"])/2;
                var bday = d["BirthDate"]*1;
                //console.log("half", bday, half)
                return xScale(parseDate(half.toString()));  
                })
                .attr("y", function(d){ return yScale(d["LineNumber"])-3; })
                .attr('pointer-events', 'none')
                .attr("opacity", 1e-6) // can't fade from 0 as the math messes up in the fade
                .transition().duration(300).attr("opacity", 1.0)
                .transition().attr('pointer-events', 'auto')
//                .on("click", function(e) {
//                    findPage(e["Name"]);
//                    selectPerson(e);
//                })
//                .on("mouseover", function(d){
//                    if (d["DeathDate"] > 0 ){
//                    mouseOverChartPeople(d,d["BirthDate"], (parseInt(d["DeathDate"]) + 5), "b. " + d["BirthDate"] + " d. af. " + d["DeathDate"]);
//                    } else {
//                    mouseOverChartPeople(d,d["BirthDate"], (parseInt(d["DeathDate"]) + 5), "b. " + Math.abs(d["DeathDate"]) + " BC. d. af. " + d["DeathDate"]);
//                    }   
//                })
//                .on("mouseout", mouseOut);
        }

        oneEndEnter.append("line")
            .attr("class", "mouse-lines")
            .attr("x1", function(d){
    //        console.log("oneEnd " + d["DisplayName"]); // who is this?
            return xScale(parseDate((d["BirthDate"]).toString())) - 2;
            })
            .attr("y1", function(d){ return yScale(d["LineNumber"]); })
            .attr("x2", function(d){
            return xScale(parseDate(d["DeathDate"].toString())) + 5;
            })
            .attr("y2", function(d){ return yScale(d["LineNumber"]); })
            .attr("stroke", function(){if(showColors) return "Green"; else return "transparent";})
            .attr("stroke-width", "6px")
            .on("click", function(e) {
                findPage(e["Name"]);
                selectPerson(e);
            })
            .on("mouseover", function(d){
                if (d["DeathDate"] > 0 ){
                mouseOverChartPeople(d,d["BirthDate"], (parseInt(d["DeathDate"]) + 5), "b. " + d["BirthDate"] + " d. af. " + d["DeathDate"]);
                } else {
                mouseOverChartPeople(d,d["BirthDate"], (parseInt(d["DeathDate"]) + 5), "b. " + Math.abs(d["DeathDate"]) + " BC. d. af. " + d["DeathDate"]);
                }   
            })
            .on("mouseout", mouseOut);
        // Add the one dot 

        oneEndEnter.append("circle")
            .attr("class", "circles")
            .attr("cx", function(d){
            return xScale(parseDate((d["DeathDate"]).toString())) + 2;
            })
            .attr("cy", function(d){ return yScale(d["LineNumber"]); })
            .attr("r", 0.8)
            .attr("stroke", "black")
            .attr("stroke-width", "1px")
            .attr("opacity", 1e-6) // can't fade from 0 as the math messes up in the fade
            .transition().duration(300).attr("opacity", 1.0);
}
          
    if (case8){
        // % % % CASE 8: Solid lines with THREE dots at the BEGIN and ONE dot at the END % % % : Blue

        // draw the people from this case on the map  
        if (page == "biographyMap.html"){ 	drawPeopleOnMap(threeBeginOneEnd); }

        var threeBeginOneEndEnter = peopleGroup.selectAll("div")
            .data(threeBeginOneEnd)
            .enter();
        // Add the lines
        threeBeginOneEndEnter.append("line")
            .attr("class", "people-lines")
            .attr("x1", function(d){
            return xScale(parseDate((d["DeathDate"] - 30).toString()));
            })
            .attr("y1", function(d){ return yScale(d["LineNumber"]); })
            .attr("x2", function(d){
            return xScale(parseDate(d["DeathDate"].toString()));
            })
            .attr("y2", function(d){ return yScale(d["LineNumber"]); })
            .attr("stroke", function(){if(showColors) return "Blue"; else return "black";})
            .attr("stroke-width", "1px")
            .attr("opacity", 1e-6) // can't fade from 0 as the math messes up in the fade
            .transition().duration(300).attr("opacity", 1.0);
           
        // Add the text
        if (drawName) {
            threeBeginOneEndEnter.append("text")
                .attr("class", "timeline-text")
                .attr("text-anchor", "middle")
                .text(function(d){ return d["DisplayName"]; })
                .attr("x", function(d){		
                var start = (d["DeathDate"]-15);
                return xScale(parseDate(start.toString()));
                })
                .attr("y", function(d){ return yScale(d["LineNumber"])-3; })
                .attr('pointer-events', 'none')
                .attr("opacity", 1e-6) // can't fade from 0 as the math messes up in the fade
                .transition().duration(300).attr("opacity", 1.0)
                .transition().attr('pointer-events', 'auto')
//                .on("mouseover", function(d){
//                    if (d["DeathDate"] > 0 ){
//                    mouseOverChartPeople(d,d["DeathDate"] - 45, (parseInt(d["DeathDate"]) + 5), "d. af. " + d["DeathDate"]);
//                    } else {
//                    mouseOverChartPeople(d,d["DeathDate"] - 45, (parseInt(d["DeathDate"]) + 5), "d. af. " + Math.abs(d["DeathDate"]) + " BC.");
//                    }   
//                })
//                .on("mouseout", mouseOut);
        }

        //Add a transparent line for hovering/ mouse interactions//
        threeBeginOneEndEnter.append("line")
            .attr("class", "mouse-lines")
            .attr("x1", function(d){
            return xScale(parseDate((d["DeathDate"] - 30).toString())) - 10;
            })
            .attr("y1", function(d){ return yScale(d["LineNumber"]); })
            .attr("x2", function(d){
            return xScale(parseDate(d["DeathDate"].toString())) + 5;
            })
            .attr("y2", function(d){ return yScale(d["LineNumber"]); })
            .attr("stroke", function(){if(showColors) return "Blue"; else return "transparent";})
            .attr("stroke-width", "6px")
            .on("click", function(e) {
                findPage(e["Name"]);
                selectPerson(e);
            })
            .on("mouseover", function(d){
                if (d["DeathDate"] > 0 ){
                mouseOverChartPeople(d,d["DeathDate"] - 45, (parseInt(d["DeathDate"]) + 5), "d. af. " + d["DeathDate"]);
                } else {
                mouseOverChartPeople(d,d["DeathDate"] - 45, (parseInt(d["DeathDate"]) + 5), "d. af. " + Math.abs(d["DeathDate"]) + " BC.");
                }   
            })
            .on("mouseout", mouseOut);
        
        // Add the 4 dots (run through the data 4 times)
        [-45, -40, -35, 5].forEach(function(j){
            threeBeginOneEndEnter.append("circle")
                .attr("class", "circles")
                .attr("cx", function(d){
                        return xScale(parseDate((parseInt(d["DeathDate"]) + j).toString()))
                })
                .attr("cy", function(d){ return yScale(d["LineNumber"]); })
                .attr("r", 0.8)
                .attr("stroke-width", "1px");
        })
    }
        
    if (case11){
        // % % % %  CASE 11:  Solid line with ONE dot UNDER at the END % % % % % % Color: Cyan

        // draw the people from this case on the map  
        if (page == "biographyMap.html"){   drawPeopleOnMap(oneEndUnder2); }        

        var oneEndUnder2Enter = peopleGroup.selectAll("div")
            .data(oneEndUnder2)
            .enter();
        // Add the lines
        oneEndUnder2Enter.append("line")
            .attr("class", "people-lines")
            .attr("x1", function(d){
    //        console.log("oneEndUnder " + d["DisplayName"]); // who is this?
            return xScale(parseDate((d["BirthDate"] + d["LifeLength"]).toString()));
            })
            .attr("y1", function(d){ return yScale(d["LineNumber"]); })
            .attr("x2", function(d){
            return xScale(parseDate(d["BirthDate"].toString()));
            })
            .attr("y2", function(d){ return yScale(d["LineNumber"]); })
            .attr("stroke", function(){if(showColors) return "Cyan"; else return "black";})
            .attr("stroke-width", "1px")
            .attr("opacity", 1e-6) // can't fade from 0 as the math messes up in the fade
            .transition().duration(300).attr("opacity", 1.0);;

            //add text
        if (drawName) {
            oneEndUnder2Enter.append("text")
            .attr("class", "timeline-text")
            .attr("text-anchor", "middle")
            .text(function(d){ return d["DisplayName"]; })
            .attr("x", function(d){
            var start = (d["BirthDate"]);
            return xScale(parseDate((start + d["LifeLength"]/2).toString()));   
            })
            .attr("y", function(d){ return yScale(d["LineNumber"])-3; })
            .attr('pointer-events', 'none')
            .attr("opacity", 1e-6) // can't fade from 0 as the math messes up in the fade
            .transition().duration(300).attr("opacity", 1.0)
            .transition().attr('pointer-events', 'auto')
    //      .attr("stroke", notBlack)
    //      .attr("fill", notBlack)
//            .on("click", function(e) {
//                findPage(e["Name"]);
//                selectPerson(e);
//            })
//            .on("mouseover", function(d){
//                if (d["DeathDate"] > 0 ){
//                mouseOverChartPeople(d,d["BirthDate"], d["BirthDate"] + d["LifeLength"], "b. " + d["BirthDate"] + " " + d["LifePrecision"] + " " + d["LifeLength"]);
//                } else {
//                mouseOverChartPeople(d,d["BirthDate"], d["BirthDate"] + d["LifeLength"], "b. " + Math.abs(d["BirthDate"]) + " BC. " + d["LifePrecision"] + " " + d["LifeLength"]);    
//                }   
//            })
//            .on("mouseout", mouseOut);
        }

        //Add a transparent line for hovering/ mouse interactions//
        oneEndUnder2Enter.append("line")
            .attr("class", "mouse-lines")
            .attr("x1", function(d){
    //        console.log("oneEndUnder " + d["DisplayName"]); // who is this?
            return xScale(parseDate((d["BirthDate"] + d["LifeLength"]).toString())) + 4;
            })
            .attr("y1", function(d){ return yScale(d["LineNumber"]) + 2; })
            .attr("x2", function(d){
            return xScale(parseDate(d["BirthDate"].toString())) - 4;
            })
            .attr("y2", function(d){ return yScale(d["LineNumber"]) + 2; })
            .attr("stroke", function(){if(showColors) return "Cyan"; else return "transparent";})
            .attr("stroke-width", "9px")
            .on("click", function(e) {
                findPage(e["Name"]);
                selectPerson(e);
            })
            .on("mouseover", function(d){
                if (d["DeathDate"] > 0 ){
                mouseOverChartPeople(d,d["BirthDate"], d["BirthDate"] + d["LifeLength"], "b. " + d["BirthDate"] + " " + d["LifePrecision"] + " " + d["LifeLength"]);
                } else {
                mouseOverChartPeople(d,d["BirthDate"], d["BirthDate"] + d["LifeLength"], "b. " + Math.abs(d["BirthDate"]) + " BC. " + d["LifePrecision"] + " " + d["LifeLength"]);    
                }   
            })
            .on("mouseout", mouseOut);

            // Add the one dot below
        oneEndUnder2Enter.append("circle")
            .attr("class", "circles")
            .attr("cx", function(d){
            return xScale(parseDate(((d["BirthDate"] + d["LifeLength"]) - 2).toString()));
            })
            .attr("cy", function(d){ return yScale(d["LineNumber"])+4; })
            .attr("r", 0.8)
            .attr("stroke", "black")
            .attr("stroke-width", "1px");
    }
        
    if (case13){
        // % % % Case 13: sevent dots % % % Color: Chartreuse

        // draw the people from this case on the map  
        if (page == "biographyMap.html"){ 	drawPeopleOnMap(sevenDots);    }     

        var sevenDotsEnter = peopleGroup.selectAll("div")
            .data(sevenDots)
            .enter();
        // Add the text
        if (drawName) {
        sevenDotsEnter.append("text")
            .attr("class", "timeline-text")
            .attr("text-anchor", "middle")
            .text(function(d){ return d["DisplayName"]; })
            .attr("x", function(d){		
                var start = (d["AliveDate"] - 2);
                return xScale(parseDate(start.toString()));
            })
            .attr("y", function(d){ return yScale(d["LineNumber"])-2; })
            .attr("opacity", 1e-6) // can't fade from 0 as the math messes up in the fade
            .transition().duration(300).attr("opacity", 1.0)
            .transition().attr('pointer-events', 'auto')
//            .on("click", function(e) {
//                findPage(e["Name"]);
//                selectPerson(e);
//            })
//            .on("mouseover", function(d){
//                if (d["AliveDate"] > 0 ){
//                mouseOverChartPeople(d,d["AliveDate"] - 25, d["AliveDate"] + 20, "fl. ab. " + d["AliveDate"]);
//                } else {
//                mouseOverChartPeople(d,d["AliveDate"] - 25, d["AliveDate"] + 20, "fl. ab. " + Math.abs(d["AliveDate"]) + " BC.");   
//                }   
//            })
//            .on("mouseout", mouseOut);
        }


        //Add a transparent line for hovering/ mouse interactions//       
        sevenDotsEnter.append("line")
            .attr("class", "mouse-lines")
           .attr("x1", function(d){
            return xScale(parseDate((d["AliveDate"] - 30).toString())) - 5;
            })
            .attr("y1", function(d){ return yScale(d["LineNumber"]); })
            .attr("x2", function(d){
                return xScale(parseDate(d["AliveDate"].toString())) + 16;
            })
            .attr("y2", function(d){ return yScale(d["LineNumber"]); })
            .attr("stroke", function(){if(showColors) return "Blue"; else return "transparent";})
            .attr("stroke-width", "6px")
            // .attr("opacity", "0.5")
            .on("click", function(e) {
                findPage(e["Name"]);
                selectPerson(e);
            })
            .on("mouseover", function(d){
                if (d["AliveDate"] > 0 ){
                mouseOverChartPeople(d,d["AliveDate"] - 25, d["AliveDate"] + 20, "fl. ab. " + d["AliveDate"]);
                } else {
                mouseOverChartPeople(d,d["AliveDate"] - 25, d["AliveDate"] + 20, "fl. ab. " + Math.abs(d["AliveDate"]) + " BC.");   
                }   
            })
            .on("mouseout", mouseOut);

        // Add the sevent dots
        [-32, -22, -12, -2, 8, 18, 28].forEach(function(j){
            sevenDotsEnter.append("circle")
                .attr("class", "circles")
                .attr("cx", function(d){
                        return xScale(parseDate((parseInt(d["AliveDate"]) + j).toString()))
                })
                .attr("cy", function(d){ return yScale(d["LineNumber"]); })
                .attr("r", 0.8)
                .attr("stroke-width", "1px");
        })
    }

    if (case14){    
        // % % % %  CASE 14: Solid line with ONE dot at the END % % % % %  Color: Green
        // draw the people from this case on the map  
        if (page == "biographyMap.html"){   drawPeopleOnMap(oneEnd2); }

        var oneEnd2Enter = peopleGroup.selectAll("div")
            .data(oneEnd2)
            .enter();
        // Add the lines
        oneEnd2Enter.append("line")
            .attr("class", "people-lines")
            .attr("x1", function(d){
    //        console.log("oneEnd2 " + d["DisplayName"]); // who is this?
                return xScale(parseDate((d["BirthDate"]).toString()));
            })
            .attr("y1", function(d){ return yScale(d["LineNumber"]); })
            .attr("x2", function(d){
                return xScale(parseDate(d["AliveDate"].toString()));
            })
            .attr("y2", function(d){ return yScale(d["LineNumber"]); })
            .attr("stroke", function(){if(showColors) return "Green"; else return "black";})
            .attr("stroke-width", "1px")
            .attr("opacity", 1e-6) // can't fade from 0 as the math messes up in the fade
            .transition().duration(300).attr("opacity", 1.0);;

    // Add the text
        if (drawName) {
            oneEnd2Enter.append("text")
                .attr("class", "timeline-text")
                .attr("text-anchor", "middle")
                .text(function(d){ return d["DisplayName"]; })
                .attr("x", function(d){
                var half = d["BirthDate"] + (d["AliveDate"]-d["BirthDate"])/2;
                var bday = d["BirthDate"]*1;
                //console.log("half", bday, half)
                return xScale(parseDate(half.toString()));  
                })
                .attr("y", function(d){ return yScale(d["LineNumber"])-3; })
                .attr('pointer-events', 'none')
                .attr("opacity", 1e-6) // can't fade from 0 as the math messes up in the fade
                .transition().duration(300).attr("opacity", 1.0)
                .transition().attr('pointer-events', 'auto')

//                .on("click", function(e) {
//                    findPage(e["Name"]); 
//                    selectPerson(e);
//                })
//                .on("mouseover", function(d){
//                    if (d["BirthDate"] > 0 ){
//                    mouseOverChartPeople(d,d["BirthDate"], parseInt(d["AliveDate"]), "b. " + d["BirthDate"] + " " + d["AlivePrecision"] + " " + d["AliveDate"]);
//                    } else {
//                    mouseOverChartPeople(d,d["BirthDate"], parseInt(d["AliveDate"]), "b. " + Math.abs(d["BirthDate"]) + " BC. " + d["AlivePrecision"] + " " + Math.abs(d["AliveDate"]) + " BC.") ;    
//                    }   
//                })
//                .on("mouseout", mouseOut);
        }

        oneEnd2Enter.append("line")
            .attr("class", "mouse-lines")
            .attr("x1", function(d){
    //        console.log("oneEnd " + d["DisplayName"]); // who is this?
            return xScale(parseDate((d["BirthDate"]).toString())) - 2;
            })
            .attr("y1", function(d){ return yScale(d["LineNumber"]); })
            .attr("x2", function(d){
            return xScale(parseDate(d["AliveDate"].toString())) + 5;
            })
            .attr("y2", function(d){ return yScale(d["LineNumber"]); })
            .attr("stroke", function(){if(showColors) return "Green"; else return "transparent";})
            .attr("stroke-width", "6px")
            .on("click", function(e) {
                findPage(e["Name"]);
                selectPerson(e);
            })
            .on("mouseover", function(d){
                if (d["BirthDate"] > 0 ){
                mouseOverChartPeople(d,d["BirthDate"], parseInt(d["AliveDate"]), "b. " + d["BirthDate"] + " " + d["AlivePrecision"] + " " + d["AliveDate"]);
                } else {
                mouseOverChartPeople(d,d["BirthDate"], parseInt(d["AliveDate"]), "b. " + Math.abs(d["BirthDate"]) + " BC. " + d["AlivePrecision"] + " " + Math.abs(d["AliveDate"]) + " BC.") ;    
                }   
            })
            .on("mouseout", mouseOut);

        oneEnd2Enter.append("circle")
            .attr("class", "circles")
            .attr("cx", function(d){
            return xScale(parseDate((d["AliveDate"]).toString())) + 3;
            })
            .attr("cy", function(d){ return yScale(d["LineNumber"]); })
            .attr("r", 0.8)
            .attr("stroke", "black")
            .attr("stroke-width", "1px");
    }
    
mouseOut();
}


// fade out tooltip on mouse out
function mouseOut() {
	// clear tooltip
	toolTip.transition()    
		.duration(300)    
		.style("opacity", 0)
        .style("pointer-events", "none"); // prevent tooltip from blocking mouse. 
}

// functions for drawing by filters
function drawAllPeople(){
    //don't redraw if this is already the current case with no change to draw names
//    if (currentCase != "drawAllPeople" || changeCase == true){
        currentCase = "drawAllPeople";
        changeCase = false;
        document.getElementById("currentFilter").innerHTML = "All People";
        clearTimeline();
        sortPeople(allPeople, true);
        drawLines();
        document.getElementById("userInput").value= "";
        
//    }
}

function drawYoungPeople(){
    //don't redraw if this is already the current case
    if (currentCase != "drawYoungPeople" || changeCase == true){
       currentCase = "drawYoungPeople"; 
       changeCase = false;
       document.getElementById("currentFilter").innerHTML = "People with a known, exact life length under 50";
       clearTimeline();
       sortPeople(allPeople, "someGuy.LifeLength < 50 && someGuy.LifeLength != null");
       drawLines(); 
       document.getElementById("userInput").value= "";
       
    }
}

function sPeople(){
    //don't redraw if this is already the current case
    if (currentCase != "sPeople" || changeCase == true){
        currentCase = "sPeople"; 
        changeCase = false;
        document.getElementById("currentFilter").innerHTML = "People with names starting with 'S'";
        clearTimeline();
        sortPeople(allPeople, "someGuy.Name.startsWith('S')");
        drawLines();
        document.getElementById("userInput").value= "";
        
    }
}

function femalePeople(){
    //don't redraw if this is already the current case
    if (currentCase != "femalePeople" || changeCase == true){
        currentCase = "femalePeople"; 
        changeCase = false;
        document.getElementById("currentFilter").innerHTML = "The few women that made the cut";
        clearTimeline();
        sortPeople(allPeople, "someGuy.gender=='Female'");
        drawLines();
        document.getElementById("userInput").value= "";
        
    }
}

function unmatchedNames(){
    //don't redraw if this is already the current case
    if (currentCase != "unmatchedNames" || changeCase == true){
        currentCase = "unmatchedNames"; 
        changeCase = false;
        document.getElementById("currentFilter").innerHTML = "Names the appear differently on the chart and in the index";
        clearTimeline();
        sortPeople(allPeople, "someGuy.Name != someGuy.DisplayName");
        drawLines();
        document.getElementById("userInput").value= "";
        
    }
}

function examplePeople(){
    //don't redraw if this is already the current case
    if (currentCase != "examplePeople" || changeCase == true){
        currentCase = "examplePeople"; 
        changeCase = false;
        document.getElementById("currentFilter").innerHTML = "Example group created by Preistley";
        clearTimeline();
        sortPeople(allPeople, "someGuy.Name == 'Pindar' || someGuy.Name == 'Sophocles' || someGuy.Name == 'Xenophon' || someGuy.Name == 'Plato' || someGuy.Name == 'Terence'");
        drawLines();
        document.getElementById("userInput").value= "";
        
    }
}
//

// functions for drawing by case
function drawCase(num){
    //don't redraw if this is already the current case
    if (currentCase != "drawCase" || currentLineStyle != num  || changeCase == true){
        currentCase = "drawCase"; 
        currentLineStyle = num;
        changeCase = false;
        filterString = "someGuy.lineType =='case" + num +"'"
        document.getElementById("currentFilter").innerHTML = "Case " + num ;
        clearTimeline();
        sortPeople(allPeople, filterString);
        drawLines();
        document.getElementById("userInput").value= "";
//        
    }
}
// end drawing by case

//function for drawing by Profession
function drawProfession(professionCode){
    //don't redraw if this is already the current case
    if (currentCase != "drawProfession" || currentProfession != professionCode || changeCase == true ){
        currentCase = "drawProfession";
        changeCase = false;
        currentProfession = professionCode;
        filterString = "someGuy.profession=='" + professionCode +"'"
        document.getElementById("currentFilter").innerHTML = "Profession is " + lookupProfessionCode(professionCode);
        clearTimeline();
        sortPeople(allPeople, filterString);
        drawLines();
        document.getElementById("userInput").value= "";
    }
}

// function for drawing by user entered text
function userFunction() {
        currentCase = "userFunction";
        var x = document.getElementById("userInput").value;
        filterString = "someGuy.Name.toLowerCase().includes('"+ x + "'.toLowerCase())"
        document.getElementById("currentFilter").innerHTML= x;
        clearTimeline();
        sortPeople(allPeople, filterString);
        drawLines();
}

function clearTimeline(){ 
    // fade everything,
    peopleGroup.selectAll(".people-lines, .circles, .timeline-text, .mouse-lines")
        .attr('pointer-events', 'note') // prevent mouse interaction while fading
        .transition().duration(300)     
        .style("opacity", 1e-5) //we can't fade them in = 0 as the math messes up in the fade
        .remove();
    if (page == "biographyMap.html"){ clearMapPeople(); }
//    mouseOut(); // if a tooltip was open, close it
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


function drawNameFunc(){
    var checkBox = document.getElementById("Check");
    // console.log(checkBox.checked);
    changeCase = true; // set the fact we DO want to redraw this case
    drawName = checkBox.checked; // set the value of the state
    lookupCase(currentCase); // rerun the current case
}

function mouseOverChartPeople(d, fromDate, toDate, indexText){
    var G;
    if (d["gender"] != null) {
        G = " (" + d["gender"] + ")";
    } else G = "";
    var P;
    if (d["profession"] != null) {
        P = d["profession"];
    } else P = "";
    toolTip.transition()
         .duration(100)    
         .style("opacity", .9); 
         // toolTip.html("this is my tooltip " + d["profession"] )
     toolTip.html( "<i>" + d["Name"] +" " + indexText + " " + P + "</i><br/><hr style='border: 0.5px solid #3F3418;'>Aprox. "+ fromDate + " to " + toDate+"<br/>" + " " + lookupProfessionCode(d["profession"]) + " " + G)
         .style("left", (d3.event.pageX) + "px")   
         .style("top", (d3.event.pageY - 28) + "px");

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


// for looking up colors to fill polygons
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

function lookupSectionColor(inputSection){
	switch (inputSection){
		case "Divines and Metaphysicians &cc":
			return "lightpink";
		case "Mathematicians &cc Physicians":
			return "lightskyblue";
		case "Artists Poets":
			return "khaki";
		case "Orators and Critics &cc":
			return "lightpink";
        case "Historians and Antiquaries Lawyers":    
            return "darkseagreen";
        case "Statesmen and Warriors":
			return "khaki";
		default:
			return "black";
 }
}

function selectPerson(e){
    // for the given person
    // change color of the solid lines, solid dots, and timeline-text
    peopleGroup.selectAll(".people-lines,.circles,.timeline-text")
    .filter(function(s) {
             return (s == e); 
    })
    .attr( "stroke", "red");
    
}


function lookupProfessionCode(inputProfession) {
    switch (inputProfession){
        case "J":
            return "Jew";
        case "HP":
            return "Heathen philosopher";
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
        case "HP Ac":
            return "Heathen philosopher - Academic";
        case "HP Per":
            return "Heathen philosopher - Perupatetic";
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
        case "Po":
            return "Pope";
        case "F":
            return "Christian father";
        case "D":
            return "Christian divine";
        case "Moh":
            return "Mohammedan doctor";
        case "Met":
            return "Metaphysician";
        case "Mor":
            return "Moralist";
        case "Pol":
            return "Political writer";
        case "M":
            return "Mathematician";
        case "Ph":
            return "Physician";
        case "Chy":
            return "Chemists";
        case "P":
            return "Poet";
        case "Pa":
            return "Painter";
        case "St":
            return "Statuary";
        case "Mu":
            return "Musician";
        case "Pr":
            return "Printer";
        case "Act":
            return "Actor";
        case "Eng":
            return "Engraver";
        case "Ar":
            return "Architect";
        case "Or":
            return "Orator";
        case "Cr":
            return "Critic";
        case "Bel":
            return "Belles letres";
        case "H":
            return "Historian";
        case "Trav":
            return "Traveller";
        case "Geo":
            return "Geographer";
        case "Ch":
            return "Chronologer";
        case "Ant":
            return "Antiquary";
        case "L":
            return "Lawyer";
        case "X":
            return "Statesmen warrior";
        default:
            return "";
    }
}

