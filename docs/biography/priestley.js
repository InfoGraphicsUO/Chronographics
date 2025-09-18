// TOOL TIP
var toolTip = d3.select("body").append("div")
    .attr("class", "tooltip")       
    .style("opacity", 0);

// Set the resize function
d3.select(window).on("resize", sizeChange);

var showColors = false;

// ~ = ~ = ~ = ~ = ~ SVG elements ~ = ~ = ~ = ~ = ~ //

// The timeline SVG
var svg =  d3.select("#timeline")
    .append("svg")
    .attr("id", "svg-chart")
    .attr("width", "100%")
    .attr("height","100%");
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



// ~ ~ ~ Function to scale the main group ~  ~ ~
function sizeChange(){

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

// The bottom x axis group
var axisGroupBottom = bottomGroup.append("g")
    .attr("class", "xaxis")
   .attr("transform", "translate(0," + endInY +")");

// The top x axis group
var axisGroupTop = topGroup.append("g")
    .attr("class", "xaxis")
    .attr("transform", "translate(0," + startInY +")");

var timelinesGroup = middleGroup.append("g")
    .attr("class", "timelines");

// ~ = ~ = ~ = ~ = ~ Data manipulations  ~ = ~ = ~ = ~ = ~ //

var linesArray = [-650, -600, -500, -400, -300, -200, -100, 0, 20];
var linesLocations = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
var textLocations = [-550, -450, -350, -250, -150, -50];
var minMaxX = d3.extent(linesArray);
var minMaxY = d3.extent(linesLocations);
var timeArray = d3.range(-650, 10, 10);

// The scale for timeline dot radii, x and y axes
var xScale = d3.time.scale()
    .range([startInX, endInX])
    .domain([parseDate(minMaxX[0].toString()), 
	     parseDate(minMaxX[1].toString())]);
var yScale = d3.scale.ordinal()
    .domain(d3.range(0, 18))
    .rangePoints([startInY, endInY]);

var vertLines = middleGroup.selectAll("div")
    .data(linesArray)
    .enter()
    .append("line")
    .attr("class", "lines")
    .attr("x1", function(d){ return xScale(parseDate(d.toString())); })
    .attr("y1", yScale(minMaxY[0]))
    .attr("x2", function(d){ return xScale(parseDate(d.toString())); })
    .attr("y2", yScale(17))
    .attr("stroke", "black")
    .attr("stroke-width", "0.5px");

var middleLine = middleGroup.selectAll("g")
    .append("line")
    .attr("class", "middleLine")
    .attr("x1", xScale(parseDate("-650")))
    .attr("y1", yScale(9))
    .attr("x2", xScale(parseDate("20")))
    .attr("y2", yScale(9))
    .attr("stroke", "Black")
    .attr("stroke-width", "1px");

var bottomLine = middleGroup.selectAll("g")
    .append("line")
    .attr("class", "middleLine")
    .attr("x1", xScale(parseDate("-650"))-2)
    .attr("y1", yScale(17)+35)
    .attr("x2", xScale(parseDate("20"))+2)
    .attr("y2", yScale(17)+35)
    .attr("stroke", "Black")
    .attr("stroke-width", "1px");

var topLine = middleGroup.selectAll("g")
    .append("line")
    .attr("class", "middleLine")
    .attr("x1", xScale(parseDate("-650"))-2)
    .attr("y1", yScale(0)-37)
    .attr("x2", xScale(parseDate("20"))+2)
    .attr("y2", yScale(0)-37)
    .attr("stroke", "Black")
    .attr("stroke-width", "1px");

var leftLine = middleGroup.selectAll("g")
    .append("line")
    .attr("class", "middleLine")
    .attr("x1", xScale(parseDate("-650")))
    .attr("y1", yScale(0)-35)
    .attr("x2", xScale(parseDate("-650")))
    .attr("y2", yScale(17)+35)
    .attr("stroke", "Black")
    .attr("stroke-width", "1px");

var rightLine = middleGroup.selectAll("g")
    .append("line")
    .attr("class", "middleLine")
    .attr("x1", xScale(parseDate("20")))
    .attr("y1", yScale(0)-35)
    .attr("x2", xScale(parseDate("20")))
    .attr("y2", yScale(17)+35)
    .attr("stroke", "Black")
    .attr("stroke-width", "1px");


var top50sText = topGroup.selectAll("div")
    .data(textLocations)
    .enter()
    .append("text")
    .attr("class", "text-top")
    .text("50")
    .attr("text-anchor", "middle")
    .attr("x", function(d){ return xScale(parseDate(d.toString())); })
    .attr("y", yScale(0)-10);
var bottom50sText = topGroup.selectAll("div")
    .data(textLocations)
    .enter()
    .append("text")
    .attr("class", "text-top")
    .text("50")
    .attr("text-anchor", "middle")
    .attr("x", function(d){ return xScale(parseDate(d.toString())); })
    .attr("y", yScale(17)+20);

var statesmenText = middleGroup.selectAll("g")
    .append("text")
    .attr("class", "label-text-state")
    .text("Statesmen")
    .attr("text-anchor", "middle")
    .attr("x", xScale(parseDate("10")))
    .attr("y", yScale(15));
middleGroup.selectAll(".label-text-state")
//    .attr("y", 990)
//    .attr("x", -350)
//    .attr("dy", ".35em")
//    .attr("transform", "rotate(-90)")
    .style("text-anchor", "start");

var learningText = middleGroup.selectAll("g")
    .append("text")
    .attr("class", "label-text-learning")
    .text("Men of Learning")
    .attr("text-anchor", "middle")
    .attr("x", xScale(parseDate("10")))
    .attr("y", yScale(5)*-1);
middleGroup.selectAll(".label-text-learning")
//    .attr("y", 990)
//    .attr("x", -217)
//    .attr("dy", ".35em")
//    .attr("transform", "rotate(-90)")
    .style("text-anchor", "start");

var topDots = middleGroup.selectAll("div")
    .data(timeArray)
    .enter()
    .append("circle")
    .attr("class", "circles")
    .attr("cx", function(d){
	return xScale(parseDate(d.toString())); })
    .attr("cy", yScale(0)-5)
    .attr("r", 1)
    .attr("stroke", "black");

var bottomDots = middleGroup.selectAll("div")
    .data(timeArray)
    .enter()
    .append("circle")
    .attr("class", "circles")
    .attr("cx", function(d){
	return xScale(parseDate(d.toString())); })
    .attr("cy", yScale(17)+5)
    .attr("r", 1)
    .attr("stroke", "black")

// Get an xval via the scale and date parser
var xVal = function(d){ return xScale(parseDate(d.toString())); };

// The lower axis
var xAxisBottom = d3.svg.axis()
    .scale(xScale)
    .tickSize(0, 0)
    .tickFormat(function(d){ return toYear(d); })
    .tickPadding(15)
    .orient("bottom");
axisGroupBottom.call(xAxisBottom)
    .selectAll("text")
    .attr("y", 0)
    .attr("x", -30)
    .attr("dy", ".35em")
    .attr("transform", "rotate(-90)")
    .style("text-anchor", "start");


// The upper axis
var xAxisTop = d3.svg.axis()
    .scale(xScale)
    .tickSize(0, 0)
    .tickPadding(15)
    .tickFormat(function(d){ return toYear(d); })
    .orient("top");
axisGroupTop.call(xAxisTop)
    .selectAll("text")
    .attr("y", 0)
    .attr("x", 10)
    .attr("dy", ".35em")
    .attr("transform", "rotate(-90)")
    .style("text-anchor", "start");

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
    .attr("stroke", "red")
*/

var people = [];
var solidLines = [];
var threeBegin = [];
var threeBeginTwoEnd = [];
var oneBegin = [];
var oneEndUnder = [];
var oneEnd = [];
var threeBeginOneEnd = [];
var unsure = [];

// Read in the data from Google spreadsheets
// currently using https://docs.google.com/spreadsheets/d/1wHow46zTuzCA7veIUnq7K2GU5O3VHzuYsuvW2KocWBQ/edit#gid=1949542003
// which is "PriestleySpecimanBioData_JRM" stored on Joanna's Google Drive.
 var ds = new Miso.Dataset({
     key: "1wHow46zTuzCA7veIUnq7K2GU5O3VHzuYsuvW2KocWBQ", //joanna's recreated attempt loads, but porblems parcing the data
//     key: "1_PrJ2wSb-HDL5_1LwV_CwBCGTP3thPXtHq_LHbGtquw",
     worksheet : "2", //use sheet location, not name. Note if there is only one sheet use "od6"
     importer: Miso.Dataset.Importers.GoogleSpreadsheet,
     parser : Miso.Dataset.Parsers.GoogleSpreadsheet
 });
//console.log(ds);
ds.fetch({
    success : function() {

	// Go through the data, create a json
	this.each(function(d){
	    //console.log("d", d);
	    var someGuy = {}
	    someGuy["DisplayName"] = d["DisplayName"];
        someGuy["Name"] = d["Name"]; // in tab2
	    someGuy["DeathPrecision"] = d["DeathPrecision"];// in tab2
	    someGuy["BornPrecision"] = d["BornPrecision"]; // in tab2
	    someGuy["LifePrecision"] = d["LifePrecision"]; // in tab2
	    someGuy["Profession"] = d["Profession"]; // in tab2
	    someGuy["ChartDivision"] = d["ChartDivision"]; // in tab2
	    someGuy["DotsBefore"] = d["DotsBefore"]; // in tab2
	    someGuy["DotsAfter"] = d["DotsAfter"]; // in tab2
	    someGuy["DeathDate"] = d["DeathDate"];  // in tab2
	    someGuy["BirthDate"] = d["BirthDate"]*1;// in tab2
	    someGuy["LifeLength"] = d["LifeLength"]; // in tab2
	    someGuy["StartDate"] = d["StartDate"]; // in tab2
	    someGuy["EndDate"] = d["EndDate"]; // in tab2
	    someGuy["LineNumber"] = d["LineNumber"]; // in tab2

	    // Find all solid lines
	    if(someGuy["DeathPrecision"] == "d." && someGuy["BornPrecision"]==null && someGuy["LifePrecision"] == null){
		if(someGuy["LifeLength"] != null)
		    solidLines.push(someGuy);
		else
		    threeBegin.push(someGuy);
	    }
	    // Find the ones with 3 starting dots and 2 ending ones
	    else if(someGuy["DeathPrecision"] == "fl.")
		threeBeginTwoEnd.push(someGuy);
	    // Find the ones with one dot beneath
	    else if(someGuy["DeathPrecision"] == "d." && someGuy["LifePrecision"]=="ab." && someGuy["LifeLength"] != null)
		oneBegin.push(someGuy);
	    else if(someGuy["DeathPrecision"] == "d. ab."){
		if(someGuy["LifePrecision"]=="ab.")
		    oneEndUnder.push(someGuy);
		else if(someGuy["LifeLength"] != null)
		    unsure.push(someGuy);
	    }
	    else if(someGuy["DeathPrecision"] == "d. af."){
		
		if(someGuy["BornPrecision"]=="b.")
		    oneEnd.push(someGuy);
		else if(someGuy["BornPrecision"] == null)
		    threeBeginOneEnd.push(someGuy);
	    }	    
	 
	   // people.push(someGuy); 
	});
	//console.log("oneEnd", threeBeginOneEnd);
	
	  	
	// % % % % % % % Unsure % % % % % % % % % % % % : RED
	var unsureEnter = middleGroup.selectAll("div")
	    .data(unsure)
	    .enter();
	// Add the lines
	unsureEnter.append("line")
	    .attr("class", "lines")
	    .attr("x1", function(d){
		return xScale(parseDate((d["DeathDate"]).toString()));
	    })
	    .attr("y1", function(d){ return yScale(d["LineNumber"]); })
	    .attr("x2", function(d){
		return xScale(parseDate((d["DeathDate"]-d["LifeLength"]).toString()));
	    })
	    .attr("y2", function(d){ return yScale(d["LineNumber"]); })
	    .attr("stroke", function(){ if(showColors) return "red"; else return "black";})
	    .attr("stroke-width", "1px");
	// Add the text
	unsureEnter.append("text")
	    .attr("class", "timeline-text")
	    .attr("text-anchor", "middle")
	    .text(function(d){ return d["DisplayName"]; })
	    .attr("x", function(d){		
		var start = (d["DeathDate"]-d["LifeLength"]);
		return xScale(parseDate((start+d["LifeLength"]/2).toString()));
	    })
	    .attr("y", function(d){ return yScale(d["LineNumber"])-3; })
//	    .attr("stroke", "red")
//	    .attr("fill", "red")
	    .on("click", function(e) {
	    	findPage(e["Name"])
	    })
	    .on("mouseover", function(d) {
	    	toolTip.transition()
				.duration(100)    
				.style("opacity", .9); 
	    	toolTip.html(d["Name"] + "<br/>" + (d["DeathDate"]-d["LifeLength"]) + " to " + (d["DeathDate"]))  
				.style("left", (d3.event.pageX) + "px")   
				.style("top", (d3.event.pageY - 28) + "px");
	    })
	    .on("mouseout", mouseOut);


	// % % % Solid lines with THREE dots at the BEGIN and ONE dot at the END % % % : Blue
	var threeBeginOneEndEnter = middleGroup.selectAll("div")
	    .data(threeBeginOneEnd)
	    .enter();
	// Add the lines
	threeBeginOneEndEnter.append("line")
	    .attr("class", "lines")
	    .attr("x1", function(d){
		return xScale(parseDate((d["DeathDate"] - 30).toString()));
	    })
	    .attr("y1", function(d){ return yScale(d["LineNumber"]); })
	    .attr("x2", function(d){
		return xScale(parseDate(d["DeathDate"].toString()));
	    })
	    .attr("y2", function(d){ return yScale(d["LineNumber"]); })
	    .attr("stroke", function(){if(showColors) return "Blue"; else return "black";})
	    .attr("stroke-width", "1px");
	// Add the text
	threeBeginOneEndEnter.append("text")
	    .attr("class", "timeline-text")
	    .attr("text-anchor", "middle")
	    .text(function(d){ return d["DisplayName"]; })
	    .attr("x", function(d){		
		var start = (d["DeathDate"]-15);
		return xScale(parseDate(start.toString()));
	    })
	    .attr("y", function(d){ return yScale(d["LineNumber"])-3; })
//	    .attr("stroke", "black")
//	    .attr("fill", "black")
	    .on("click", function(e) {
	    	findPage(e["Name"])
	    })
	    .on("mouseover", function(d) {
	    	toolTip.transition()
				.duration(100)    
				.style("opacity", .9); 
	    	toolTip.html(d["Name"] + "<br/>" + (d["DeathDate"] - 45) + " to " + (d["DeathDate"] + 5))  
				.style("left", (d3.event.pageX) + "px")   
				.style("top", (d3.event.pageY - 28) + "px");
	    })
	    .on("mouseout", mouseOut);
	// Add the three begin dots
	threeBeginOneEndEnter.append("circle")
	    .attr("class", "circles")
	    .attr("cx", function(d){
		return xScale(parseDate((d["DeathDate"] - 35).toString()));
	    })
	    .attr("cy", function(d){ return yScale(d["LineNumber"]); })
	    .attr("r", 1)
	    .attr("stroke", "black")
	    .attr("stroke-width", "1px");
	threeBeginOneEndEnter.append("circle")
	    .attr("class", "circles")
	    .attr("cx", function(d){
		return xScale(parseDate((d["DeathDate"] - 40).toString()));
	    })
	    .attr("cy", function(d){ return yScale(d["LineNumber"]); })
	    .attr("r", 1)
	    .attr("stroke", "black")
	    .attr("stroke-width", "1px");
	threeBeginOneEndEnter.append("circle")
	    .attr("class", "circles")
	    .attr("cx", function(d){
		return xScale(parseDate((d["DeathDate"] - 45).toString()));
	    })
	    .attr("cy", function(d){ return yScale(d["LineNumber"]); })
	    .attr("r", 1)
	    .attr("stroke", "black")	
	    .attr("stroke-width", "1px");
	// Add the end dot
	threeBeginOneEndEnter.append("circle")
	    .attr("class", "circles")
	    .attr("cx", function(d){
		return xScale(parseDate((d["DeathDate"] + 5).toString()));
	    })
	    .attr("cy", function(d){ return yScale(d["LineNumber"]); })
	    .attr("r", 1)
	    .attr("stroke", "black")
	    .attr("stroke-width", "1px");


	// % % % %  Solid line with ONE dot at the END % % % % %  Color: Green
	var oneEndEnter = middleGroup.selectAll("div")
	    .data(oneEnd)
	    .enter();
	// Add the lines
	oneEndEnter.append("line")
	    .attr("class", "lines")
	    .attr("x1", function(d){
		return xScale(parseDate((d["BirthDate"]).toString()));
	    })
	    .attr("y1", function(d){ return yScale(d["LineNumber"]); })
	    .attr("x2", function(d){
		return xScale(parseDate(d["DeathDate"].toString()));
	    })
	    .attr("y2", function(d){ return yScale(d["LineNumber"]); })
	    .attr("stroke", function(){if(showColors) return "Green"; else return "black";})
	    .attr("stroke-width", "1px");
	// Add the text
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
//	    .attr("stroke", "black")
//	    .attr("fill", "black")
	    .on("click", function(e) {
	    	findPage(e["Name"])
	    })
	    .on("mouseover", function(d) {
	    	toolTip.transition()
				.duration(100)    
				.style("opacity", .9);
	    	toolTip.html(d["Name"] + "<br/>" + (d["BirthDate"]) + " to " + (d["DeathDate"] + 5))  
				.style("left", (d3.event.pageX) + "px")   
				.style("top", (d3.event.pageY - 28) + "px");
	    })
	    .on("mouseout", mouseOut);
	// Add the one dot 
	oneEndEnter.append("circle")
	    .attr("class", "circles")
	    .attr("cx", function(d){
		return xScale(parseDate((d["DeathDate"] + 5).toString()));
	    })
	    .attr("cy", function(d){ return yScale(d["LineNumber"]); })
	    .attr("r", 1)
	    .attr("stroke", "black")
	    .attr("stroke-width", "1px");
	


	// % % % % % % % % % % % % % Solid line with ONE dot UNDER at the END % % % % % % % % % Color: Cyan
	var oneEndUnderEnter = middleGroup.selectAll("div")
	    .data(oneEndUnder)
	    .enter();
	// Add the lines
	oneEndUnderEnter.append("line")
	    .attr("class", "lines")
	    .attr("x1", function(d){
		return xScale(parseDate((d["DeathDate"] - d["LifeLength"]).toString()));
	    })
	    .attr("y1", function(d){ return yScale(d["LineNumber"]); })
	    .attr("x2", function(d){
		return xScale(parseDate(d["DeathDate"].toString()));
	    })
	    .attr("y2", function(d){ return yScale(d["LineNumber"]); })
	    .attr("stroke", function(){if(showColors) return "Cyan"; else return "black";})
	    .attr("stroke-width", "1px");
	// Add the text
	oneEndUnderEnter.append("text")
	    .attr("class", "timeline-text")
	    .attr("text-anchor", "middle")
	    .text(function(d){ return d["DisplayName"]; })
	    .attr("x", function(d){
		var start = (d["DeathDate"]-d["LifeLength"]);
		return xScale(parseDate((start + d["LifeLength"]/2).toString()));	
	    })
	    .attr("y", function(d){ return yScale(d["LineNumber"])-3; })
//	    .attr("stroke", "red")
//	    .attr("fill", "red")
	    .on("click", function(e) {
	    	findPage(e["Name"])
	    })
	    .on("mouseover", function(d) {
	    	toolTip.transition()
				.duration(100)    
				.style("opacity", .9);
	    	toolTip.html(d["Name"] + "<br/>" + (d["DeathDate"] - d["LifeLength"]) + " to " + (d["DeathDate"]))
				.style("left", (d3.event.pageX) + "px")   
				.style("top", (d3.event.pageY - 28) + "px");
	    })
	    .on("mouseout", mouseOut);
	// Add the one dot below
	oneEndUnderEnter.append("circle")
	    .attr("class", "circles")
	    .attr("cx", function(d){
		return xScale(parseDate((d["DeathDate"] - 2).toString()));
	    })
	    .attr("cy", function(d){ return yScale(d["LineNumber"])+5; })
	    .attr("r", 1)
	    .attr("stroke", "black")
	    .attr("stroke-width", "1px");
	


	// % % % % % % % % % % % % % Solid line with ONE dot at the BEGIN % % % % % % % Color: Plum
	var oneBeginEnter = middleGroup.selectAll("div")
	    .data(oneBegin)
	    .enter();
	// Add the lines
	oneBeginEnter.append("line")
	    .attr("class", "lines")
	    .attr("x1", function(d){
		return xScale(parseDate((d["DeathDate"] - d["LifeLength"]).toString()));
	    })
	    .attr("y1", function(d){ return yScale(d["LineNumber"]); })
	    .attr("x2", function(d){
		return xScale(parseDate(d["DeathDate"].toString()));
	    })
	    .attr("y2", function(d){ return yScale(d["LineNumber"]); })
	    .attr("stroke", function(){if(showColors) return "Plum"; else return "black";})
	    .attr("stroke-width", "1px");
	// Add the text
	oneBeginEnter.append("text")
	    .attr("class", "timeline-text")
	    .attr("text-anchor", "middle")
	    .text(function(d){ return d["DisplayName"]; })
	    .attr("x", function(d){
		var start = (d["DeathDate"]-d["LifeLength"]);
		return xScale(parseDate((start + d["LifeLength"]/2).toString()));	
	    })
	    .attr("y", function(d){ return yScale(d["LineNumber"])-3; })
//	    .attr("stroke", "red")
//	    .attr("fill", "red")
	    .on("click", function(e) {
	    	findPage(e["Name"])
	    })
	    .on("mouseover", function(d) {
	    	toolTip.transition()
				.duration(100)    
				.style("opacity", .9);
	    	toolTip.html(d["Name"] + "<br/>" + (d["DeathDate"] - d["LifeLength"]) + " to " + (d["DeathDate"]))
				.style("left", (d3.event.pageX) + "px")   
				.style("top", (d3.event.pageY - 28) + "px");
	    })
	    .on("mouseout", mouseOut);
	// Add the one dot below
	oneBeginEnter.append("circle")
	    .attr("class", "circles")
	    .attr("cx", function(d){
		return xScale(parseDate((d["DeathDate"] - d["LifeLength"] + 2).toString()));
	    })
	    .attr("cy", function(d){ return yScale(d["LineNumber"])+5; })
	    .attr("r", 1)
	    .attr("stroke", "black")
	    .attr("stroke-width", "1px");
	
	// % % % % % % % % % % % % % Solid lines % % % % % % % % % Color: black
	var dataEnter = middleGroup.selectAll("div")
	    .data(solidLines)
	    .enter();
	// Add the lines
	dataEnter.append("line")
	    .attr("class", "lines")
	    .attr("x1", function(d){
		return xScale(parseDate((d["DeathDate"] - d["LifeLength"]).toString()));
	    })
	    .attr("y1", function(d){ return yScale(d["LineNumber"]); })
	    .attr("x2", function(d){
		return xScale(parseDate(d["DeathDate"].toString()));
	    })
	    .attr("y2", function(d){ return yScale(d["LineNumber"]); })
	    .attr("stroke", "black")
	    .attr("stroke-width", "1px");
	// Add the text
	dataEnter.append("text")
	    .attr("class", "timeline-text")
	    .attr("text-anchor", "middle")
	    .text(function(d){ return d["DisplayName"]; })
	    .attr("x", function(d){
		var start = (d["DeathDate"]-d["LifeLength"]);
		return xScale(parseDate((start + d["LifeLength"]/2).toString()));
	    })
	    .attr("y", function(d){ return yScale(d["LineNumber"])-3; })
//	    .attr("stroke", "red")
//	    .attr("fill", "red")
	    .on("click", function(e) {
	    	findPage(e["Name"])
	    })
	    .on("mouseover", function(d) {
	    	toolTip.transition()
				.duration(100)    
				.style("opacity", .9);
	    	toolTip.html(d["Name"] + "<br/>" + (d["DeathDate"] - d["LifeLength"]) + " to " + (d["DeathDate"]))
				.style("left", (d3.event.pageX) + "px")   
				.style("top", (d3.event.pageY - 28) + "px");
	    })
	    .on("mouseout", mouseOut);



	// % % %  % % % % % % % %  % % Solid line with THREE dots at the BEGIN % % % % % Color:Gold
	var threeBeginEnter = middleGroup.selectAll("div")
	    .data(threeBegin)
	    .enter();
	// Add the lines
	threeBeginEnter.append("line")
	    .attr("class", "lines")
	    .attr("x1", function(d){
		return xScale(parseDate((d["DeathDate"] - 30).toString()));
	    })
	    .attr("y1", function(d){ return yScale(d["LineNumber"]); })
	    .attr("x2", function(d){
		return xScale(parseDate(d["DeathDate"].toString()));
	    })
	    .attr("y2", function(d){ return yScale(d["LineNumber"]); })
	    .attr("stroke", function(){if(showColors) return "Gold"; else return "black";})
	    .attr("stroke-width", "1px");
	// Add the text
	threeBeginEnter.append("text")
	    .attr("class", "timeline-text")
	    .attr("text-anchor", "middle")
	    .text(function(d){ return d["DisplayName"]; })
	    .attr("x", function(d){		
		var start = (d["DeathDate"]-15);
		return xScale(parseDate(start.toString()));
	    })
	    .attr("y", function(d){ return yScale(d["LineNumber"])-3; })
//	    .attr("stroke", "black")
//	    .attr("fill", "black")
	    .on("click", function(e) {
	    	findPage(e["Name"])
	    })
	    .on("mouseover", function(d) {
	    	toolTip.transition()
				.duration(100)    
				.style("opacity", .9);
	    	toolTip.html(d["Name"] + "<br/>" + (d["DeathDate"] - 45) + " to " + (d["DeathDate"]))
				.style("left", (d3.event.pageX) + "px")   
				.style("top", (d3.event.pageY - 28) + "px");
	    })
	    .on("mouseout", mouseOut);
	// Add the three dots
	threeBeginEnter.append("circle")
	    .attr("class", "circles")
	    .attr("cx", function(d){
		return xScale(parseDate((d["DeathDate"] - 35).toString()));
	    })
	    .attr("cy", function(d){ return yScale(d["LineNumber"]); })
	    .attr("r", 1)
	    .attr("stroke", "black")
	    .attr("stroke-width", "1px");
	threeBeginEnter.append("circle")
	    .attr("class", "circles")
	    .attr("cx", function(d){
		return xScale(parseDate((d["DeathDate"] - 40).toString()));
	    })
	    .attr("cy", function(d){ return yScale(d["LineNumber"]); })
	    .attr("r", 1)
	    .attr("stroke", "black")
	    .attr("stroke-width", "1px");
	threeBeginEnter.append("circle")
	    .attr("class", "circles")
	    .attr("cx", function(d){
		return xScale(parseDate((d["DeathDate"] - 45).toString()));
	    })
	    .attr("cy", function(d){ return yScale(d["LineNumber"]); })
	    .attr("r", 1)
	    .attr("stroke", "black")
	    .attr("stroke-width", "1px");

	// % % % Solid lines with THREE dots at the BEGIN and TWO dots at the END % % % Color: Chartreuse
	var threeBeginTwoEndEnter = middleGroup.selectAll("div")
	    .data(threeBeginTwoEnd)
	    .enter();
	// Add the lines
	threeBeginTwoEndEnter.append("line")
	    .attr("class", "lines")
	    .attr("x1", function(d){
		return xScale(parseDate((d["DeathDate"] - 30).toString()));
	    })
	    .attr("y1", function(d){ return yScale(d["LineNumber"]); })
	    .attr("x2", function(d){
		return xScale(parseDate(d["DeathDate"].toString()));
	    })
	    .attr("y2", function(d){ return yScale(d["LineNumber"]); })
	    .attr("stroke", function(){if(showColors) return "Chartreuse"; else return "black";})
	    .attr("stroke-width", "1px");
	// Add the text
	threeBeginTwoEndEnter.append("text")
	    .attr("class", "timeline-text")
	    .attr("text-anchor", "middle")
	    .text(function(d){ return d["DisplayName"]; })
	    .attr("x", function(d){		
		var start = (d["DeathDate"]-15);
		return xScale(parseDate(start.toString()));
	    })
	    .attr("y", function(d){ return yScale(d["LineNumber"])-3; })
//	    .attr("stroke", "black")
//	    .attr("fill", "black")
	    .on("click", function(e) {
	    	findPage(e["Name"])
	    })
	    .on("mouseover", function(d) {
	    	toolTip.transition()
				.duration(100)    
				.style("opacity", .9);
	    	toolTip.html(d["Name"] + "<br/>" + (d["DeathDate"] - 45) + " to " + (d["DeathDate"] + 10))
				.style("left", (d3.event.pageX) + "px")   
				.style("top", (d3.event.pageY - 28) + "px");
	    })
	    .on("mouseout", mouseOut);

	// Add the three begin dots
	threeBeginTwoEndEnter.append("circle")
	    .attr("class", "circles")
	    .attr("cx", function(d){
		return xScale(parseDate((d["DeathDate"] - 35).toString()));
	    })
	    .attr("cy", function(d){ return yScale(d["LineNumber"]); })
	    .attr("r", 1)
	    .attr("stroke", "black")
	    .attr("stroke-width", "1px");
	threeBeginTwoEndEnter.append("circle")
	    .attr("class", "circles")
	    .attr("cx", function(d){
		return xScale(parseDate((d["DeathDate"] - 40).toString()));
	    })
	    .attr("cy", function(d){ return yScale(d["LineNumber"]); })
	    .attr("r", 1)
	    .attr("stroke", "black")
	    .attr("stroke-width", "1px");
	threeBeginTwoEndEnter.append("circle")
	    .attr("class", "circles")
	    .attr("cx", function(d){
		return xScale(parseDate((d["DeathDate"] - 45).toString()));
	    })
	    .attr("cy", function(d){ return yScale(d["LineNumber"]); })
	    .attr("r", 1)
	    .attr("stroke", "black")	
	    .attr("stroke-width", "1px");
	// Add the two end dots
	threeBeginTwoEndEnter.append("circle")
	    .attr("class", "circles")
	    .attr("cx", function(d){
		return xScale(parseDate((d["DeathDate"] + 5).toString()));
	    })
	    .attr("cy", function(d){ return yScale(d["LineNumber"]); })
	    .attr("r", 1)
	    .attr("stroke", "black")
	    .attr("stroke-width", "1px");
	threeBeginTwoEndEnter.append("circle")
	    .attr("class", "circles")
	    .attr("cx", function(d){
		return xScale(parseDate((d["DeathDate"] + 10).toString()));
	    })
	    .attr("cy", function(d){ return yScale(d["LineNumber"]); })
	    .attr("r", 1)
	    .attr("stroke", "black")
	    .attr("stroke-width", "1px");

	
	
	// Add the front circles
/*	dataEnter.append("circle")
	    .attr("class", "timeline-dots")
	    .attr("r", function(d){ return d["DotsBefore"]*3; })
	    .attr("cx", function(d){ return xScale(parseDate(d["StartDate"].toString())-2); })
	    .attr("cy", function(d){  return yScale(d["LineNumber"]); })
	    .attr("fill", "paleturquoise")
	    .attr("stroke","black")
	    .attr("stroke-width", 1);

	// Add the end circles
	dataEnter.append("circle")
	    .attr("class", "timeline-dots")
	    .attr("r", function(d){ return d["DotsAfter"]*3; })
	    .attr("cx", function(d){ return xScale(parseDate(d["EndDate"].toString())-2); })
	    .attr("cy", function(d){  return yScale(d["LineNumber"]); })
	    .attr("fill", "palegreen")
	    .attr("stroke","black")
	    .attr("stroke-width", 1);
	
	
	*/
	
    },
     error : function(e) {
	   // your error callback here!
	   console.log("Error in reading data!!");
       console.log(e);
     }
 });


// fade out tooltip on mouse out
function mouseOut(d) {
	// clear tooltip
	toolTip.transition()  
        .style("pointer-events", "none")  // prevent tooltip from blocking mouse 
		.duration(300)    
		.style("opacity", 0); 

}