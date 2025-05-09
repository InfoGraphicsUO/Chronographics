var bioBuffer = svgContainer.append( "rect" )
    .attr("x", 0)            
    .attr("y", 0)
    .attr("height", visHeight)
    .attr("width", visWidth)
    .attr("fill", "#E8D5B6") // Beige
    .style('opacity', 0.9)
    .on("click", clickThruBio)
    .on("mousemove", moveThruBio);

var people = [];
var solidLines = [];
var threeBegin = [];
var threeBeginTwoEnd = [];
var oneBegin = [];
var oneEndUnder = [];
var oneEnd = [];
var threeBeginOneEnd = [];
var unsure = [];
var xUnder = [];

allGuys = [];
var showColors = false;

// create lookup dict to find the y point of places
var placeLookup = {};
for (i = 0; i < placeVar.length; i++) {
	placeLookup[placeVar[i].properties.placeGRIDCODE] = placeVar[i].properties.CENTROID_Y;
}


for (var i=0; i < bioVar.length; i++) {
	    //console.log("d", d);
	    
	    var someGuy = {}
	    someGuy["DisplayName"] = bioVar[i].attributes.DisplayNam;
        someGuy["Name"] = bioVar[i].attributes.Name;
	    someGuy["DeathPrecision"] = bioVar[i].attributes.DeathPreci;// in tab2
	    someGuy["BornPrecision"] = bioVar[i].attributes.BornPrecis; // in tab2
	    someGuy["LifePrecision"] = bioVar[i].attributes.LifePrecis; // in tab2
	    someGuy["DotsBefore"] = bioVar[i].attributes.DotsBefore; // in tab2
	    someGuy["DotsAfter"] = bioVar[i].attributes.DotsAfter; // in tab2
	    someGuy["DeathDate"] = bioVar[i].attributes.DeathDate;  // in tab2
	    someGuy["BirthDate"] = bioVar[i].attributes.BirthDate*1;// in tab2
	    someGuy["LifeLength"] = bioVar[i].attributes.LifeLength; // in tab2
	    someGuy["StartDate"] = bioVar[i].attributes.StartDate; // in tab2
	    someGuy["EndDate"] = bioVar[i].attributes.EndDate; // in tab2
	    someGuy["LineNumber"] = bioVar[i].attributes.LineNumber; // in tab2
	    someGuy["Place"] = bioVar[i].attributes.name_1; // in tab2
	    someGuy["PlaceID"] = bioVar[i].attributes.placeID; // in tab2

	    allGuys.push(someGuy)
	    // Find all solid lines
	    if(someGuy["DeathPrecision"] == "d." && someGuy["BornPrecision"]== " " && someGuy["LifePrecision"] == " "){
		if(someGuy["LifeLength"] != 0)
		    solidLines.push(someGuy);

		else
		    threeBegin.push(someGuy);
	    }
	    // Find the ones with 3 starting dots and 2 ending ones
	    else if(someGuy["DeathPrecision"] == "fl.")
		threeBeginTwoEnd.push(someGuy);
	    // Find the ones with one dot beneath
	    else if(someGuy["DeathPrecision"] == "d." && someGuy["LifePrecision"]=="ab." && someGuy["LifeLength"] != 0)
		oneBegin.push(someGuy);
	    else if(someGuy["DeathPrecision"] == "d. ab."){
		if(someGuy["LifePrecision"]=="ab.")
		    oneEndUnder.push(someGuy);
		else if(someGuy["LifeLength"] != 0)
		    unsure.push(someGuy);
	    }
	    else if(someGuy["DeathPrecision"] == "d. af."){
		if(someGuy["BornPrecision"]=="b.")
		    oneEnd.push(someGuy);
		else if(someGuy["BornPrecision"] == " ")
		    threeBeginOneEnd.push(someGuy);
	    }	    
	 
	   // people.push(someGuy); 
	}
	
	//console.log("oneEnd", threeBeginOneEnd);
	
	// % % % % % % % Unsure % % % % % % % % % % % % : RED
	var unsureEnter = svgContainer.selectAll("div")
	    .data(unsure)
	    .enter();


	// Add the lines
	unsureEnter.append("line")
	    .attr("class", "lines")
	    .attr("x1", function(d){
		return xFull(d["DeathDate"]);
	    })
	     .attr("y1", function(d){ 
	    	yScale(placeLookup[d["PlaceID"]])

	    })
	    .attr("y2", function(d){ 
	    	yScale(placeLookup[d["PlaceID"]])
	    })
	    .attr("x2", function(d){
		return xFull(d["DeathDate"]-d["LifeLength"]);
	    })
	    .attr("stroke", function(){ if(showColors) return "red"; else return "black";})
	    .attr("stroke-width", .3)
	    .on("click", clickThruBio)
	     .on("mousemove", function(d) {
	    	toolTip.html(d["Name"] + "<br/>" + "Years: " + (d["DeathDate"]-d["LifeLength"]) + " to " + (d["DeathDate"]) + "<br/>"  + "Place: " + d["Place"])  
				.style("left", (d3.event.pageX) + "px")   
				.style("top", (d3.event.pageY - 28) + "px")
				.style("opacity", 1);
	    });
	// Add the text
	unsureEnter.append("text")
	    .attr("class", "timeline-text")
	    .attr("text-anchor", "middle")
	    .text(function(d){ return d["DisplayName"]; })
	    .style("font-size", "4px")
	    .attr("x", function(d){		
		var start = (d["DeathDate"]-d["LifeLength"]);
		return xFull(start+d["LifeLength"]/2);
	    })
	    .attr("y", function(d){ 
	    	yScale(placeLookup[d["PlaceID"]])
	    })
//	    .attr("stroke", "red")
//	    .attr("fill", "red")
	    .on("click", clickThruBio)
	     .on("mousemove", function(d) {
	    	toolTip.html(d["Name"] + "<br/>" + "Years: " + (d["DeathDate"]-d["LifeLength"]) + " to " + (d["DeathDate"]) + "<br/>"  + "Place: " + d["Place"])  
				.style("left", (d3.event.pageX) + "px")   
				.style("top", (d3.event.pageY - 28) + "px")
				.style("opacity", 1);
	    });


	// % % % Solid lines with THREE dots at the BEGIN and ONE dot at the END % % % : Blue
	var threeBeginOneEndEnter = svgContainer.selectAll("div")
	    .data(threeBeginOneEnd)
	    .enter();
	// Add the lines
	threeBeginOneEndEnter.append("line")
	    .attr("class", "lines")
	    .attr("x1", function(d){
		return xFull((d["DeathDate"] - 30));
	    })
	    .attr("y1", function(d){ return yScale(placeLookup[d["PlaceID"]]); })
	    .attr("x2", function(d){
		return xFull(d["DeathDate"]);
	    })
	    .attr("y2", function(d){ return yScale(placeLookup[d["PlaceID"]]); })
	    .attr("stroke", function(){if(showColors) return "Blue"; else return "black";})
	    .attr("stroke-width", ".2px")
	    .on("click", clickThruBio)
	    .on("mousemove", function(d) {
	    	toolTip.html(d["Name"] + "<br/>" + "Years: " + (d["DeathDate"] - 45) + " to " + (d["DeathDate"] + 5) + "<br/>"  + "Place: " + d["Place"])  
				.style("left", (d3.event.pageX) + "px")   
				.style("top", (d3.event.pageY - 28) + "px")
				.style("opacity", 1);
	    });
	// Add the text
	threeBeginOneEndEnter.append("text")
	    .attr("class", "timeline-text")
	    .attr("text-anchor", "middle")
	    .text(function(d){ return d["DisplayName"]; })
	    .style("font-size", "4px")
	    .attr("x", function(d){		
		var start = (d["DeathDate"]-15);
		return xFull(start);
	    })
	    .attr("y", function(d){ return yScale(placeLookup[d["PlaceID"]])-1; })
//	    .attr("stroke", "black")
//	    .attr("fill", "black")
	    .on("click", clickThruBio)
	    .on("mousemove", function(d) {
	    	toolTip.html(d["Name"] + "<br/>" + "Years: " + (d["DeathDate"] - 45) + " to " + (d["DeathDate"] + 5) + "<br/>"  + "Place: " + d["Place"])  
				.style("left", (d3.event.pageX) + "px")   
				.style("top", (d3.event.pageY - 28) + "px")
				.style("opacity", 1);
	    });
	// Add the three begin dots
	threeBeginOneEndEnter.append("circle")
	    .attr("class", "circles")
	    .attr("cx", function(d){
		return xFull((d["DeathDate"] - 35));
	    })
	    .attr("cy", function(d){ return yScale(placeLookup[d["PlaceID"]]); })
	    .attr("r", .3)
	    .attr("stroke", "black")
	    .attr("stroke-width", ".2px")
	    .on("click", clickThruBio)
	    .on("mousemove", function(d) {
	    	toolTip.html(d["Name"] + "<br/>" + "Years: " + (d["DeathDate"] - 45) + " to " + (d["DeathDate"] + 5) + "<br/>"  + "Place: " + d["Place"])  
				.style("left", (d3.event.pageX) + "px")   
				.style("top", (d3.event.pageY - 28) + "px")
				.style("opacity", 1);
	    });
	threeBeginOneEndEnter.append("circle")
	    .attr("class", "circles")
	    .attr("cx", function(d){
		return xFull((d["DeathDate"] - 40));
	    })
	    .attr("cy", function(d){ return yScale(placeLookup[d["PlaceID"]]); })
	    .attr("r", .3)
	    .attr("stroke", "black")
	    .attr("stroke-width", ".2px")
	    .on("click", clickThruBio)
	    .on("mousemove", function(d) {
	    	toolTip.html(d["Name"] + "<br/>" + "Years: " + (d["DeathDate"] - 45) + " to " + (d["DeathDate"] + 5) + "<br/>"  + "Place: " + d["Place"])  
				.style("left", (d3.event.pageX) + "px")   
				.style("top", (d3.event.pageY - 28) + "px")
				.style("opacity", 1);
	    });
	threeBeginOneEndEnter.append("circle")
	    .attr("class", "circles")
	    .attr("cx", function(d){
		return xFull((d["DeathDate"] - 45));
	    })
	    .attr("cy", function(d){ return yScale(placeLookup[d["PlaceID"]]); })
	    .attr("r", .3)
	    .attr("stroke", "black")	
	    .attr("stroke-width", ".2px")
	    .on("click", clickThruBio)
	    .on("mousemove", function(d) {
	    	toolTip.html(d["Name"] + "<br/>" + "Years: " + (d["DeathDate"] - 45) + " to " + (d["DeathDate"] + 5) + "<br/>"  + "Place: " + d["Place"])  
				.style("left", (d3.event.pageX) + "px")   
				.style("top", (d3.event.pageY - 28) + "px")
				.style("opacity", 1);
	    });
	// Add the end dot
	threeBeginOneEndEnter.append("circle")
	    .attr("class", "circles")
	    .attr("cx", function(d){
		return xFull((d["DeathDate"] + 5));
	    })
	    .attr("cy", function(d){ return yScale(placeLookup[d["PlaceID"]]); })
	    .attr("r", .3)
	    .attr("stroke", "black")
	    .attr("stroke-width", ".2px")
	    .on("click", clickThruBio)
	    .on("mousemove", function(d) {
	    	toolTip.html(d["Name"] + "<br/>" + "Years: " + (d["DeathDate"] - 45) + " to " + (d["DeathDate"] + 5) + "<br/>"  + "Place: " + d["Place"])  
				.style("left", (d3.event.pageX) + "px")   
				.style("top", (d3.event.pageY - 28) + "px")
				.style("opacity", 1);
	    });


	// % % % %  Solid line with ONE dot at the END % % % % %  Color: Green
	var oneEndEnter = svgContainer.selectAll("div")
	    .data(oneEnd)
	    .enter();
	// Add the lines
	oneEndEnter.append("line")
	    .attr("class", "lines")
	    .attr("x1", function(d){
		return xFull((d["BirthDate"]));
	    })
	    .attr("y1", function(d){ return yScale(placeLookup[d["PlaceID"]]); })
	    .attr("x2", function(d){
		return xFull(d["DeathDate"]);
	    })
	    .attr("y2", function(d){ return yScale(placeLookup[d["PlaceID"]]); })
	    .attr("stroke", function(){if(showColors) return "Green"; else return "black";})
	    .attr("stroke-width", ".2px")
	    .on("mousemove", function(d) {
	    	toolTip.html(d["Name"] + "<br/>" + "Years: " + (d["BirthDate"]) + " to " + (d["DeathDate"] + 5) + "<br/>"  + "Place: " + d["Place"])  
				.style("left", (d3.event.pageX) + "px")   
				.style("top", (d3.event.pageY - 28) + "px")
				.style("opacity", 1);
	    });
	// Add the text
	oneEndEnter.append("text")
	    .attr("class", "timeline-text")
	    .attr("text-anchor", "middle")
	    .text(function(d){ return d["DisplayName"]; })
	    .style("font-size", "4px")
	    .attr("x", function(d){
		var half = d["BirthDate"] + (d["DeathDate"]-d["BirthDate"])/2;
		var bday = d["BirthDate"]*1;
		//console.log("half", bday, half)
		return xFull(half);	
	    })
	    .attr("y", function(d){ return yScale(placeLookup[d["PlaceID"]])-1; })
//	    .attr("stroke", "black")
//	    .attr("fill", "black")
	    .on("click", clickThruBio)
	    .on("mousemove", function(d) {
	    	toolTip.html(d["Name"] + "<br/>" + "Years: " + (d["BirthDate"]) + " to " + (d["DeathDate"] + 5) + "<br/>"  + "Place: " + d["Place"])  
				.style("left", (d3.event.pageX) + "px")   
				.style("top", (d3.event.pageY - 28) + "px")
				.style("opacity", 1);
	    });
	// Add the one dot 
	oneEndEnter.append("circle")
	    .attr("class", "circles")
	    .attr("cx", function(d){
		return xFull((d["DeathDate"] + 5));
	    })
	    .attr("cy", function(d){ return yScale(placeLookup[d["PlaceID"]]); })
	    .attr("r", .3)
	    .attr("stroke", "black")
	    .attr("stroke-width", ".2px")
	    .on("mousemove", function(d) {
	    	toolTip.html(d["Name"] + "<br/>" + "Years: " + (d["BirthDate"]) + " to " + (d["DeathDate"] + 5) + "<br/>"  + "Place: " + d["Place"])  
				.style("left", (d3.event.pageX) + "px")   
				.style("top", (d3.event.pageY - 28) + "px")
				.style("opacity", 1);
	    });
	


	// % % % % % % % % % % % % % Solid line with ONE dot UNDER at the END % % % % % % % % % Color: Cyan
	var oneEndUnderEnter = svgContainer.selectAll("div")
	    .data(oneEndUnder)
	    .enter();
	// Add the lines
	oneEndUnderEnter.append("line")
	    .attr("class", "lines")
	    .attr("x1", function(d){
		return xFull((d["DeathDate"] - d["LifeLength"]));
	    })
	    .attr("y1", function(d){ return yScale(placeLookup[d["PlaceID"]]); })
	    .attr("x2", function(d){
		return xFull(d["DeathDate"]);
	    })
	    .attr("y2", function(d){ return yScale(placeLookup[d["PlaceID"]]); })
	    .attr("stroke", function(){if(showColors) return "Cyan"; else return "black";})
	    .attr("stroke-width", ".2px")
	    .on("click", clickThruBio)
	    .on("mousemove", function(d) {
	    	toolTip.html(d["Name"] + "<br/>" + "Years: " + (d["DeathDate"] - d["LifeLength"]) + " to " + (d["DeathDate"]) + "<br/>"  + "Place: " + d["Place"])  
				.style("left", (d3.event.pageX) + "px")   
				.style("top", (d3.event.pageY - 28) + "px")
				.style("opacity", 1);
	    });
	// Add the text
	oneEndUnderEnter.append("text")
	    .attr("class", "timeline-text")
	    .attr("text-anchor", "middle")
	    .text(function(d){ return d["DisplayName"]; })
	    .style("font-size", "4px")
	    .attr("x", function(d){
		var start = (d["DeathDate"]-d["LifeLength"]);
		return xFull((start + d["LifeLength"]/2));	
	    })
	    .attr("y", function(d){ return yScale(placeLookup[d["PlaceID"]])-1; })
//	    .attr("stroke", "red")
//	    .attr("fill", "red")
	    .on("click", clickThruBio)
	    .on("mousemove", function(d) {
	    	toolTip.html(d["Name"] + "<br/>" + "Years: " + (d["DeathDate"] - d["LifeLength"]) + " to " + (d["DeathDate"]) + "<br/>"  + "Place: " + d["Place"])  
				.style("left", (d3.event.pageX) + "px")   
				.style("top", (d3.event.pageY - 28) + "px")
				.style("opacity", 1);
	    });
	// Add the one dot below
	oneEndUnderEnter.append("circle")
	    .attr("class", "circles")
	    .attr("cx", function(d){
		return xFull((d["DeathDate"] - 2));
	    })
	    .attr("cy", function(d){ return yScale(placeLookup[d["PlaceID"]])+2; })
	    .attr("r", .3)
	    .attr("stroke", "black")
	    .attr("stroke-width", ".2px")
	    .on("click", clickThruBio)
	    .on("mousemove", function(d) {
	    	toolTip.html(d["Name"] + "<br/>" + "Years: " + (d["DeathDate"] - d["LifeLength"]) + " to " + (d["DeathDate"]) + "<br/>"  + "Place: " + d["Place"])  
				.style("left", (d3.event.pageX) + "px")   
				.style("top", (d3.event.pageY - 28) + "px")
				.style("opacity", 1);
	    });
	


	// % % % % % % % % % % % % % Solid line with ONE dot at the BEGIN % % % % % % % Color: Plum
	var oneBeginEnter = svgContainer.selectAll("div")
	    .data(oneBegin)
	    .enter();
	// Add the lines
	oneBeginEnter.append("line")
	    .attr("class", "lines")
	    .attr("x1", function(d){
		return xFull((d["DeathDate"] - d["LifeLength"]));
	    })
	    .attr("y1", function(d){ 
	    	yScale(placeLookup[d["PlaceID"]])

	    })
	    .attr("x2", function(d){
		return xFull(d["DeathDate"]);
	    })
	    .attr("y2", function(d){ 
	    	yScale(placeLookup[d["PlaceID"]])

	    })
	    .attr("stroke", function(){if(showColors) return "Plum"; else return "black";})
	    .attr("stroke-width", ".2px")
	    .on("click", clickThruBio)
	    .on("mousemove", function(d) {
	    	toolTip.html(d["Name"] + "<br/>" + "Years: " + (d["DeathDate"] - d["LifeLength"]) + " to " + (d["DeathDate"]) + "<br/>"  + "Place: " + d["Place"])  
				.style("left", (d3.event.pageX) + "px")   
				.style("top", (d3.event.pageY - 28) + "px")
				.style("opacity", 1);
	    });
	// Add the text
	oneBeginEnter.append("text")
	    .attr("class", "timeline-text")
	    .attr("text-anchor", "middle")
	    .text(function(d){ return d["DisplayName"]; })
	    .style("font-size", "4px")
	    .attr("x", function(d){
		var start = (d["DeathDate"]-d["LifeLength"]);
		return xFull((start + d["LifeLength"]/2));	
	    })
	    .attr("y", function(d){ return yScale(placeLookup[d["PlaceID"]])-1; })
//	    .attr("stroke", "red")
//	    .attr("fill", "red")
	    .on("click", clickThruBio)
	    .on("mousemove", function(d) {
	    	toolTip.html(d["Name"] + "<br/>" + "Years: " + (d["DeathDate"] - d["LifeLength"]) + " to " + (d["DeathDate"]) + "<br/>"  + "Place: " + d["Place"])  
				.style("left", (d3.event.pageX) + "px")   
				.style("top", (d3.event.pageY - 28) + "px")
				.style("opacity", 1);
	    });

	// Add the one dot below
	oneBeginEnter.append("circle")
	    .attr("class", "circles")
	    .attr("cx", function(d){
		return xFull((d["DeathDate"] - d["LifeLength"] + 2));
	    })
	    .attr("cy", function(d){ return yScale(placeLookup[d["PlaceID"]])+2; })
	    .attr("r", .3)
	    .attr("stroke", "black")
	    .attr("stroke-width", ".2px")
	    .on("click", clickThruBio)
	    .on("mousemove", function(d) {
	    	toolTip.html(d["Name"] + "<br/>" + "Years: " + (d["DeathDate"] - d["LifeLength"]) + " to " + (d["DeathDate"]) + "<br/>"  + "Place: " + d["Place"])  
				.style("left", (d3.event.pageX) + "px")   
				.style("top", (d3.event.pageY - 28) + "px")
				.style("opacity", 1);
	    });
	
	// % % % % % % % % % % % % % Solid lines % % % % % % % % % Color: black
	var dataEnter = svgContainer.selectAll("div")
	    .data(solidLines)
	    .enter();
	// Add the lines
	dataEnter.append("line")
	    .attr("class", "lines")
	    .attr("x1", function(d){
		return xFull((d["DeathDate"] - d["LifeLength"]));
	    })
	    .attr("y1", function(d){ return yScale(placeLookup[d["PlaceID"]]); })
	    .attr("x2", function(d){
		return xFull(d["DeathDate"]);
	    })
	    .attr("y2", function(d){ return yScale(placeLookup[d["PlaceID"]]); })
	    .attr("stroke", "black")
	    .attr("stroke-width", ".2px")
	    .on("click", clickThruBio)
	    .on("mousemove", function(d) {
	    	toolTip.html(d["Name"] + "<br/>" + "Years: " + (d["DeathDate"] - d["LifeLength"]) + " to " + (d["DeathDate"]) + "<br/>"  + "Place: " + d["Place"])  
				.style("left", (d3.event.pageX) + "px")   
				.style("top", (d3.event.pageY - 28) + "px")
				.style("opacity", 1);
	    });
	// Add the text
	dataEnter.append("text")
	    .attr("class", "timeline-text")
	    .attr("text-anchor", "middle")
	    .text(function(d){ return d["DisplayName"]; })
	    .style("font-size", "4px")
	    .attr("x", function(d){
		var start = (d["DeathDate"]-d["LifeLength"]);
		return xFull((start + d["LifeLength"]/2));
	    })
	    .attr("y", function(d){ return yScale(placeLookup[d["PlaceID"]])-1; })
//	    .attr("stroke", "red")
//	    .attr("fill", "red")
	    .on("click", clickThruBio)
	    .on("mousemove", function(d) {
	    	toolTip.html(d["Name"] + "<br/>" + "Years: " + (d["DeathDate"] - d["LifeLength"]) + " to " + (d["DeathDate"]) + "<br/>"  + "Place: " + d["Place"])  
				.style("left", (d3.event.pageX) + "px")   
				.style("top", (d3.event.pageY - 28) + "px")
				.style("opacity", 1);
	    });



	// % % %  % % % % % % % %  % % Solid line with THREE dots at the BEGIN % % % % % Color:Gold
	var threeBeginEnter = svgContainer.selectAll("div")
	    .data(threeBegin)
	    .enter();
	// Add the lines
	threeBeginEnter.append("line")
	    .attr("class", "lines")
	    .attr("x1", function(d){
		return xFull((d["DeathDate"] - 30));
	    })
	    .attr("y1", function(d){ return yScale(placeLookup[d["PlaceID"]]); })
	    .attr("x2", function(d){
		return xFull(d["DeathDate"]);
	    })
	    .attr("y2", function(d){ return yScale(placeLookup[d["PlaceID"]]); })
	    .attr("stroke", function(){if(showColors) return "Gold"; else return "black";})
	    .attr("stroke-width", ".2px")
	    .on("click", clickThruBio)
	    .on("mousemove", function(d) {
	    	toolTip.html(d["Name"] + "<br/>" + "Years: " + (d["DeathDate"] - 45) + " to " + (d["DeathDate"]) + "<br/>"  + "Place: " + d["Place"])  
				.style("left", (d3.event.pageX) + "px")   
				.style("top", (d3.event.pageY - 28) + "px")
				.style("opacity", 1);
	    });
	// Add the text
	threeBeginEnter.append("text")
	    .attr("class", "timeline-text")
	    .attr("text-anchor", "middle")
	    .text(function(d){ return d["DisplayName"]; })
	    .style("font-size", "4px")
	    .attr("x", function(d){		
		var start = (d["DeathDate"]-15);
		return xFull(start);
	    })
	    .attr("y", function(d){ return yScale(placeLookup[d["PlaceID"]]); })
//	    .attr("stroke", "black")
//	    .attr("fill", "black")
	    .on("click", clickThruBio)
	    .on("mousemove", function(d) {
	    	toolTip.html(d["Name"] + "<br/>" + "Years: " + (d["DeathDate"] - 45) + " to " + (d["DeathDate"]) + "<br/>"  + "Place: " + d["Place"])  
				.style("left", (d3.event.pageX) + "px")   
				.style("top", (d3.event.pageY - 28) + "px")
				.style("opacity", 1);
	    });
	// Add the three dots
	threeBeginEnter.append("circle")
	    .attr("class", "circles")
	    .attr("cx", function(d){
		return xFull((d["DeathDate"] - 35));
	    })
	    .attr("cy", function(d){ return yScale(placeLookup[d["PlaceID"]]); })
	    .attr("r", .3)
	    .attr("stroke", "black")
	    .attr("stroke-width", ".2px")
	    .on("click", clickThruBio)
	    .on("mousemove", function(d) {
	    	toolTip.html(d["Name"] + "<br/>" + "Years: " + (d["DeathDate"] - 45) + " to " + (d["DeathDate"]) + "<br/>"  + "Place: " + d["Place"])  
				.style("left", (d3.event.pageX) + "px")   
				.style("top", (d3.event.pageY - 28) + "px")
				.style("opacity", 1);
	    });
	threeBeginEnter.append("circle")
	    .attr("class", "circles")
	    .attr("cx", function(d){
		return xFull((d["DeathDate"] - 40));
	    })
	    .attr("cy", function(d){ return yScale(placeLookup[d["PlaceID"]]); })
	    .attr("r", .3)
	    .attr("stroke", "black")
	    .attr("stroke-width", ".2px")
	    .on("click", clickThruBio)
	    .on("mousemove", function(d) {
	    	toolTip.html(d["Name"] + "<br/>" + "Years: " + (d["DeathDate"] - 45) + " to " + (d["DeathDate"]) + "<br/>"  + "Place: " + d["Place"])  
				.style("left", (d3.event.pageX) + "px")   
				.style("top", (d3.event.pageY - 28) + "px")
				.style("opacity", 1);
	    });
	threeBeginEnter.append("circle")
	    .attr("class", "circles")
	    .attr("cx", function(d){
		return xFull((d["DeathDate"] - 45));
	    })
	    .attr("cy", function(d){ yScale(placeLookup[d["PlaceID"]]); })
	    .attr("r", .3)
	    .attr("stroke", "black")
	    .attr("stroke-width", ".2px")
	    .on("click", clickThruBio)
	    .on("mousemove", function(d) {
	    	toolTip.html(d["Name"] + "<br/>" + "Years: " + (d["DeathDate"] - 45) + " to " + (d["DeathDate"]) + "<br/>"  + "Place: " + d["Place"])  
				.style("left", (d3.event.pageX) + "px")   
				.style("top", (d3.event.pageY - 28) + "px")
				.style("opacity", 1);
	    });

	// % % % Solid lines with THREE dots at the BEGIN and TWO dots at the END % % % Color: Chartreuse
	var threeBeginTwoEndEnter = svgContainer.selectAll("div")
	    .data(threeBeginTwoEnd)
	    .enter();
	// Add the lines
	threeBeginTwoEndEnter.append("line")
	    .attr("class", "lines")
	    .attr("x1", function(d){
		return xFull((d["DeathDate"] - 30));
	    })
	    .attr("y1", function(d){ return yScale(placeLookup[d["PlaceID"]]); })
	    .attr("x2", function(d){
		return xFull(d["DeathDate"]);
	    })
	    .attr("y2", function(d){ return yScale(placeLookup[d["PlaceID"]]); })
	    .attr("stroke", function(){if(showColors) return "Chartreuse"; else return "black";})
	    .attr("stroke-width", ".2px")
	    .on("click", clickThruBio)
	    .on("mousemove", function(d) {
	    	toolTip.html(d["Name"] + "<br/>" + "Years: " + (d["DeathDate"] - 45) + " to " + (d["DeathDate"] + 10) + "<br/>"  + "Place: " + d["Place"])  
				.style("left", (d3.event.pageX) + "px")   
				.style("top", (d3.event.pageY - 28) + "px")
				.style("opacity", 1);
	    });
	// Add the text
	threeBeginTwoEndEnter.append("text")
	    .attr("class", "timeline-text")
	    .attr("text-anchor", "middle")
	    .text(function(d){ return d["DisplayName"]; })
	    .style("font-size", "4px")
	    .attr("x", function(d){		
		var start = (d["DeathDate"]-15);
		return xFull(start);
	    })
	    .attr("y", function(d){ return yScale(placeLookup[d["PlaceID"]])-1; })
//	    .attr("stroke", "black")
//	    .attr("fill", "black")
	    .on("click", clickThruBio)
	    .on("mousemove", function(d) {
	    	toolTip.html(d["Name"] + "<br/>" + "Years: " + (d["DeathDate"] - 45) + " to " + (d["DeathDate"] + 10) + "<br/>"  + "Place: " + d["Place"])  
				.style("left", (d3.event.pageX) + "px")   
				.style("top", (d3.event.pageY - 28) + "px")
				.style("opacity", 1);
	    });
	// Add the three begin dots
	threeBeginTwoEndEnter.append("circle")
	    .attr("class", "circles")
	    .attr("cx", function(d){
		return xFull((d["DeathDate"] - 35));
	    })
	    .attr("cy", function(d){ return yScale(placeLookup[d["PlaceID"]]); })
	    .attr("r", .3)
	    .attr("stroke", "black")
	    .attr("stroke-width", ".2px")
	    .on("click", clickThruBio)
	    .on("mousemove", function(d) {
	    	toolTip.html(d["Name"] + "<br/>" + "Years: " + (d["DeathDate"] - 45) + " to " + (d["DeathDate"] + 10) + "<br/>"  + "Place: " + d["Place"])  
				.style("left", (d3.event.pageX) + "px")   
				.style("top", (d3.event.pageY - 28) + "px")
				.style("opacity", 1);
	    });
	threeBeginTwoEndEnter.append("circle")
	    .attr("class", "circles")
	    .attr("cx", function(d){
		return xFull((d["DeathDate"] - 40));
	    })
	    .attr("cy", function(d){ return yScale(placeLookup[d["PlaceID"]]); })
	    .attr("r", .3)
	    .attr("stroke", "black")
	    .attr("stroke-width", ".2px")
	    .on("click", clickThruBio)
	    .on("mousemove", function(d) {
	    	toolTip.html(d["Name"] + "<br/>" + "Years: " + (d["DeathDate"] - 45) + " to " + (d["DeathDate"] + 10) + "<br/>"  + "Place: " + d["Place"])  
				.style("left", (d3.event.pageX) + "px")   
				.style("top", (d3.event.pageY - 28) + "px")
				.style("opacity", 1);
	    });
	threeBeginTwoEndEnter.append("circle")
	    .attr("class", "circles")
	    .attr("cx", function(d){
		return xFull((d["DeathDate"] - 45));
	    })
	    .attr("cy", function(d){ return yScale(placeLookup[d["PlaceID"]]); })
	    .attr("r", .3)
	    .attr("stroke", "black")	
	    .attr("stroke-width", ".2px")
	    .on("click", clickThruBio)
	    .on("mousemove", function(d) {
	    	toolTip.html(d["Name"] + "<br/>" + "Years: " + (d["DeathDate"] - 45) + " to " + (d["DeathDate"] + 10) + "<br/>"  + "Place: " + d["Place"])  
				.style("left", (d3.event.pageX) + "px")   
				.style("top", (d3.event.pageY - 28) + "px")
				.style("opacity", 1);
	    });
	// Add the two end dots
	threeBeginTwoEndEnter.append("circle")
	    .attr("class", "circles")
	    .attr("cx", function(d){
		return xFull((d["DeathDate"] + 5));
	    })
	    .attr("cy", function(d){ return yScale(placeLookup[d["PlaceID"]]); })
	    .attr("r", .3)
	    .attr("stroke", "black")
	    .attr("stroke-width", ".2px")
	    .on("click", clickThruBio)
	    .on("mousemove", function(d) {
	    	toolTip.html(d["Name"] + "<br/>" + "Years: " + (d["DeathDate"] - 45) + " to " + (d["DeathDate"] + 10) + "<br/>"  + "Place: " + d["Place"])  
				.style("left", (d3.event.pageX) + "px")   
				.style("top", (d3.event.pageY - 28) + "px")
				.style("opacity", 1);
	    });
	threeBeginTwoEndEnter.append("circle")
	    .attr("class", "circles")
	    .attr("cx", function(d){
		return xFull((d["DeathDate"] + 10));
	    })
	    .attr("cy", function(d){ return yScale(placeLookup[d["PlaceID"]]); })
	    .attr("r", .3)
	    .attr("stroke", "black")
	    .attr("stroke-width", ".2px")
	    .on("click", clickThruBio)
	    .on("mousemove", function(d) {
	    	toolTip.html(d["Name"] + "<br/>" + "Years: " + (d["DeathDate"] - 45) + " to " + (d["DeathDate"] + 10) + "<br/>"  + "Place: " + d["Place"])  
				.style("left", (d3.event.pageX) + "px")   
				.style("top", (d3.event.pageY - 28) + "px")
				.style("opacity", 1);
	    });

	
	
	// Add the front circles
/*	dataEnter.append("circle")
	    .attr("class", "timeline-dots")
	    .attr("r", function(d){ return d["DotsBefore"]*3; })
	    .attr("cx", function(d){ return xFull(d["StartDate"]-2); })
	    .attr("cy", function(d){  return yFull(d["LineNumber"]); })
	    .attr("fill", "paleturquoise")
	    .attr("stroke","black")
	    .attr("stroke-width", .3);

	// Add the end circles
	dataEnter.append("circle")
	    .attr("class", "timeline-dots")
	    .attr("r", function(d){ return d["DotsAfter"]*3; })
	    .attr("cx", function(d){ return xFull(d["EndDate"]-2); })
	    .attr("cy", function(d){  return yFull(d["LineNumber"]); })
	    .attr("fill", "palegreen")
	    .attr("stroke","black")
	    .attr("stroke-width", .3);
	
	
	*/

bioBuffer.style('opacity', 0);
d3.selectAll(".circles").style('opacity', 0);
d3.selectAll(".lines").style('opacity', 0);
d3.selectAll(".timeline-text").style('opacity', 0);