 // CHANGE CHART DATA ON SORT TOGGLE
function updateData(newVal, redraw=true){
    if (redraw) {
		clearSelection();
		fullExtent();
		clearFilter();
	}
	
	// establish the approriate data
	if (newVal ==("1")) {
		placeVar = places_json.features;
		powerVar = powers_json.features;
		powerLineVar = powerLines_json.features;
		eventVar = eventLines_json.features;
		regionVar = regions_json.features;
		pointsVar = eventPoints_json.features;
	} 

	else if ( newVal == "2") {
		placeVar = places_json2.features;
		powerVar = powers_json2.features;
		powerLineVar = powerLines_json2.features;
		eventVar = eventLines_json2.features;
		regionVar = regions_json2.features;
		pointsVar = eventPoints_json2.features;
		// no current second sort of the data so just reload the same data
	}
    
    else if ( newVal == "3") {
		placeVar = places_json3.features;
		powerVar = powers_json3.features;
		powerLineVar = powerLines_json3.features;
		eventVar = eventLines_json3.features;
		regionVar = regions_json3.features;
		pointsVar = eventPoints_json3.features;
		// no current second sort of the data so just reload the same data
	}

	// remove any existing features in the groups
	placesGroup.selectAll("path").remove(); 
	powersGroup.selectAll("path").remove(); 
	eventLinesS.selectAll("path").remove();
	eventLinesH.selectAll("path").remove();
	eventLinesT.selectAll("path").remove();

	powerLines.selectAll("path").remove();
	powersLabel.selectAll("text").remove();

	eventPoints.selectAll("*").remove();
	pointsLabel.selectAll("*").remove();

	placeAxisGroup.selectAll("*").remove();
	regionAxisGroup.selectAll("*").remove();
	regionTicksGroup.selectAll("*").remove();

	//RE-CAULCULATE TICKS FOR NEW SORT
	// populate the place row tick locations and labels
	var placeTicks = [];
	var placeTickLabels = [];

	for (i = 0; i < placeVar.length; i++) {
	    placeTicks.push(placeVar[i].properties.INSIDE_Y);
	    placeTickLabels.push(placeVar[i].properties.name)
	}

	// populate the region tick locations and labels
	// the first one is for the label (text)
	// the 2nd one is for the ticks (lines)
	// there is an offset in placement so they need to be seperate
	var regionTicks = [];
	var regionTickLabels2 = [];
	var regionTicks2 = [];
	var regionTickLabels2 = [];

	for (i = 0; i < regionVar.length; i++) {
	    regionTicks.push(regionVar[i].properties.INSIDE_Y);
	    regionTickLabels2.push(regionVar[i].properties.name.toUpperCase())
	    regionTicks2.push(Math.min(regionVar[i].geometry.coordinates[0][0][1], regionVar[i].geometry.coordinates[0][1][1]));
	    //regionTickLabels2.push(regionVar[i].properties.name.toUpperCase())
	}
	
	// change to the alt sort ticks
	axisRegion
	    .tickValues(regionTicks)
	    .tickFormat(function(d,i) { return regionTickLabels2[i]})   
	axisRegionTicks
	    .tickValues(regionTicks2)
	    .tickFormat(function(d,i) { return regionTickLabels2[i]})
	axisPlace
	    .tickValues(placeTicks)
	    .tickFormat(function(d,i) { return placeTickLabels[i]})
	
	// create axis
	regionAxisGroup
		.call(customAxisRegion);
	regionTicksGroup
	    .call(customAxisRegionTicks);  
	

	// load the power data 
	powersGroup.selectAll("path").data(powerVar).enter().append( "path" )
		.attr( "d", geoPath )
		//.attr( "fill", function(d){return lookupFill(d.properties.color);} ) // fill with pattern 
		.attr( "stroke", "transparent")
		.style( "fill", function(d){return lookupGradient(d.properties.color);} ) // fill with solid color
		.attr( "fill-opacity","0.35")
		.attr( "stroke-width", powerLineWidth)
		.on("mousemove", mouseMove)
		.on("mouseout", mouseOut)
		.on("touchend", clickPlace)
		.on("click", clickPlace);

	// load boundary lines for power data
	powerLines.selectAll("path").data(powerLineVar).enter().append( "path" )
		.attr( "d", geoPath )
		.attr( "stroke", powerColors[1])
		.style("stroke-linecap", "round")
		.attr( "stroke-width",powerLineWidth);

	// load the place data 
	placesGroup.selectAll("path").data(placeVar).enter().append( "path" )
		.attr( "d", geoPath )
		.attr( "fill", placeColors[1] )
		.attr( "stroke", "transparent")
		.attr( "stroke-width","0.5")
		.on("mousemove", moveThru)
		.on("mouseout", mouseOutThru)
		.on("touchend", clickPlace)
		.on("click", clickPlace);

	// load the labels for the point events
	pointsLabel.selectAll("text").data(pointsVar).enter().append("text")
		.attr("x", function(d) {return xScale(d.geometry.coordinates[0] - 500000) + 1; }) // to change JSON x value into screen space
		.attr("y", function(d) {return yScale(d.geometry.coordinates[1]); }) // JSON y --> screen space
		.text( function(d) {  return d.properties.regime; })
		.attr("font-family", "sans-serif")
		.style("text-anchor", "front")
		.attr("font-size", "2px")  // Math to scale text size by polygon area
		.on("mousemove", moveThru)
		.on("click", clickThru)
		.on("touchend", clickThru);


	// load the labels for the power data
	powersLabel.selectAll("text").data(powerVar).enter().append("text")
		.attr("x", function(d) {return xScale(d.properties.INSIDE_X - 500000); }) // to change JSON x value into screen space
		.attr("y", function(d) {return yScale(d.properties.INSIDE_Y - 2); }) // JSON y --> screen space
		.text( function(d) {  return d.properties.regime; })
		.style("text-anchor", "middle")
        .attr("font-variant", "small-caps")
        .attr("font-style", "oblique ")
        .attr("letter-spacing", "0.25em") // note kerning not applied to firefox 		
        .attr("font-size", function(d) {return Math.pow(d.properties.POLY_AREA/1.4, 0.2) - 0.7 + "px"})  // Math to scale text size by polygon areas
		.on("mousemove", moveThru)
		.on("click", clickThru)
		.on("touchend", clickThru);
    
	// LOAD EVENT LINES
	// solid
	eventLinesS.selectAll("path").data(eventVar
		.filter(function(line){return (line.properties.lineType == "SV") || (line.properties.lineType == "SF") || (line.properties.lineType == "SR");}))
		.enter()
		.append("path")
		.attr( "d", geoPath )
		.attr( "stroke", powerColors[1])
		.attr( "stroke-width",powerLineWidth);

	// dahsed
	eventLinesH.selectAll("path").data(eventVar
		.filter(function(line){return (line.properties.lineType == "HV") || (line.properties.lineType== "HF") || (line.properties.lineType == "HR");}))
		.enter()
		.append("path")
		.attr( "d", geoPath )
		.attr( "stroke", powerColors[1])
		.attr( "stroke-width",powerLineWidth)
		.style("stroke-dasharray", ("1, 1.5"));

	// dotted
	eventLinesT.selectAll("path").data(eventVar
		.filter(function(line){return (line.properties.lineType == "TV") || (line.properties.lineType == "TF") || (line.properties.lineType == "TR");}))
		.enter()
		.append("path")
		.attr( "d", geoPath )
		.attr( "stroke", powerColors[1])
		.attr( "stroke-width",powerLineWidth*1.85)
		.style("stroke-dasharray", (".2, 1.5"))
		.style("stroke-linecap", "round");

	// event points
	eventPoints.selectAll("path").data(pointsVar)
		.enter()
		.append("path")
		.attr( "d", geoPath )

	// no line
	eventLinesN.selectAll("path").data(eventVar
		.filter(function(line){return (line.properties.lineType == "NL");}))
		.enter()
		.append("path")
		.attr( "d", geoPath );
}  

// CHANGE DISPLAYED DATA ON FILTER
// preset years
function updateEra(newVal){
	switch (parseInt(newVal)) {
	    case 1:
    		var start = 0;
	    	var end = 3000;
    		d3.select("#range-label").html((start - 1200)  + " &mdash; " + (end -1200));
        	updateEraCover(start - 1200, end -1200);
	        break;
	    case 2:
	    	var start = 0;
	    	var end = 800;
    		d3.select("#range-label").html((start - 1200)  + " &mdash; " + (end -1200));
        	updateEraCover(start - 1200, end -1200);
	        break;
	    case 3:
    		var start = 800;
	    	var end = 2200;
    		d3.select("#range-label").html((start - 1200)  + " &mdash; " + (end -1200));
        	updateEraCover(start - 1200, end -1200);
	        break;
	    case 4:
    		var start = 2200;
	    	var end = 3000;
    		d3.select("#range-label").html((start - 1200)  + " &mdash; " + (end -1200));
        	updateEraCover(start - 1200, end -1200);
	        break;
	    case 5:
 			var start = 1500;
	    	var end = 2500;
    		d3.select("#range-label").html((start - 1200)  + " &mdash; " + (end -1200));
        	updateEraCover(start - 1200, end -1200);
	        break;
	    case 6:
 			var start = 1500;
	    	var end = 1800;
    		d3.select("#range-label").html((start - 1200)  + " &mdash; " + (end -1200));
        	updateEraCover(start - 1200, end -1200);
	}
}
// updates the rect to the correct position
function updateEraCover(start, end) {
	eraCover1
		.transition()
		.duration(500)
		.attr("width",function(d){return ((xFull(parseInt(start)) - 30) < 0) ? 0 : (xFull(parseInt(start)) - 30)})
		.style('opacity', .9);

	eraCover2
		.transition()
		.duration(500)	
		.attr("x", xFull(parseInt(end)) + 30)
		.style('opacity', .9);	
    
	eraGrad1
		.transition()
		.duration(500)	
		.attr("x", xFull(parseInt(start)) - 30)
		.attr("width", 30)
		.style('opacity', .9);
	
	eraGrad2
		.transition()
		.duration(500)	
		.attr("x", xFull(parseInt(end)))
		.attr("width", 30)
		.style('opacity', .9);
}

// CHANGE DISPLAYED DATA ON FILTER
// preset region values (magic numbers)
function updateRegion(newVal){
	switch (parseInt(newVal)) {
	    case 1:
    		var start = 0;
	    	var end = 3000;
    		d3.select("#range-label2").html((start)  + " &mdash; " + (end));
        	updateRegionCover(start, end);
	        break;
	    case 2:
	    	var start = 0;
	    	var end = 78;
    		d3.select("#range-label2").html((start)  + " &mdash; " + (end));
        	updateRegionCover(start, end);
	        break;
	    case 3:
    		var start = 78;
	    	var end = 109;
    		d3.select("#range-label2").html((start)  + " &mdash; " + (end));
        	updateRegionCover(start, end);
	        break;
	    case 4:
    		var start = 109;
	    	var end = 144;
    		d3.select("#range-label2").html((start)  + " &mdash; " + (end));
        	updateRegionCover(start, end);
	        break;
	    case 5:
 			var start = 144;
	    	var end = 170;
    		d3.select("#range-label2").html((start)  + " &mdash; " + (end));
        	updateRegionCover(start, end);
	        break;
	    case 6:
 			var start = 170;
	    	var end = 207.5;
    		d3.select("#range-label2").html((start)  + " &mdash; " + (end));
        	updateRegionCover(start, end);
        	break;
        case 7:
    		var start = 207.5;
	    	var end = 227;
    		d3.select("#range-label2").html((start)  + " &mdash; " + (end));
        	updateRegionCover(start, end);
	        break;
	    case 8:
	    	var start = 227;
	    	var end = 254;
    		d3.select("#range-label2").html((start)  + " &mdash; " + (end));
        	updateRegionCover(start, end);
	        break;
	    case 9:
    		var start = 254;
	    	var end = 285;
    		d3.select("#range-label2").html((start)  + " &mdash; " + (end));
        	updateRegionCover(start, end);
	        break;
	    case 10:
    		var start = 285;
	    	var end = 338;
    		d3.select("#range-label2").html((start)  + " &mdash; " + (end));
        	updateRegionCover(start, end);
	        break;
	    case 11:
 			var start = 338;
	    	var end = 405;
    		d3.select("#range-label2").html((start)  + " &mdash; " + (end));
        	updateRegionCover(start, end);
	        break;
	    case 12:
 			var start = 405;
	    	var end = 458;
    		d3.select("#range-label2").html((start)  + " &mdash; " + (end));
        	updateRegionCover(start, end);
        	break;
        case 13:
    		var start = 458;
	    	var end = 519;
    		d3.select("#range-label2").html((start)  + " &mdash; " + (end));
        	updateRegionCover(start, end);
	        break;
	    case 14:
	    	var start = 519;
	    	var end = 582;
    		d3.select("#range-label2").html((start)  + " &mdash; " + (end));
        	updateRegionCover(start, end);
	        break;
	    case 15:
    		var start = 582;
	    	var end = 602.5;
    		d3.select("#range-label2").html((start)  + " &mdash; " + (end));
        	updateRegionCover(start, end);
	        break;
	    case 16:
    		var start = 602.5;
	    	var end = 615;
    		d3.select("#range-label2").html((start)  + " &mdash; " + (end));
        	updateRegionCover(start, end);
	        break;
	    case 17:
 			var start = 615;
	    	var end = 650;
    		d3.select("#range-label2").html((start)  + " &mdash; " + (end));
        	updateRegionCover(start, end);
	        break;
	}

}
// update the filter region cover
function updateRegionCover(start, end) {
	regionCover1
		.transition()
		.duration(500)
		.attr("height",function(d){return ((parseInt(start) - 30) < 0) ? 0 : (parseInt(start) - 30)})
		.style('opacity', .9);
	regionCover2
		.transition()
		.duration(500)	
		.attr("y", parseInt(end) + 30)
		.style('opacity', .9);

	regionGrad1
		.transition()
		.duration(500)
		.attr("y", parseInt(start) - 30)
		.attr("height", 30)
		.style('opacity', .9);
	
	regionGrad2
		.transition()
		.duration(500)
		.attr("y", parseInt(end))
		.attr("height", 30)
		.style('opacity', .9);
}


// toggle the biography overlay
function toggleBio() {
	bioToggled = !bioToggled;
	
	if (bioToggled) {
		d3.selectAll(".circles").transition()
			.duration(400).style('opacity', 0);
		d3.selectAll(".lines").transition()
			.duration(400).style('opacity', 0);
		d3.selectAll(".timeline-text").transition()
			.duration(400).style('opacity', 0);
		
		bioBuffer
			.transition()
			.duration(600)
			.style('opacity', 0)
			
	}
	else {
		bioBuffer
			.attr("height", visHeight)
			.attr("width", visWidth)
			.transition()
			.duration(400)
			.style('opacity', 0.7)
		d3.selectAll(".circles").transition()
			.duration(400).style('opacity', 1);
		d3.selectAll(".lines").transition()
			.duration(400).style('opacity', 1);
		d3.selectAll(".timeline-text").transition()
			.duration(400).style('opacity', 1);


		var translate = [0, -70];
		var scale = 1.65;

		zoomChart.translate([0, -70]).scale(1.65);
		svgContainer.transition()
			.delay(600)
			.duration(600)
			.attr("transform", [
            "translate(" + [0, -70] + ")",
            "scale(" + 1.65 + ")"
            ].join(" "));

		startYear = axisBottom.scale().domain()[0];
	    endYear = axisBottom.scale().domain()[1];
	    
	    var endY = axisRegion.scale().domain()[1];
	    var startY = axisRegion.scale().domain()[0];

		// update axis
	    topAxisGroup.call(customAxisTop);
	    topTickGroup.call(customAxisTopTicks);
	    bottomAxisGroup.call(customAxisBottom);
	    bottomTickGroup.call(customAxisBottomTicks);


        topBuffer.transition()
			.delay(600)
			.duration(600)
        .attr("height", 14* 1/scale)
        .attr("y", yFull(endY+1));  // does math based upon (pixel <-> chart space) conversion
       bottomBuffer.transition()
			.delay(600)
			.duration(600)
        .attr("height", 12* 1/scale)
        .attr("y", yFull(startY) - (12* 1/scale));  // does math based upon (pixel <-> chart space) conversion 
		
		regionAxisGroup.call(customAxisRegion);
        regionTicksGroup.call(customAxisRegionTicks); 
        placeAxisGroup.selectAll("*").remove();
        // re-size/draw the label background buffer 
        rightBuffer.transition()
			.delay(600)
			.duration(600)
            .attr("width", 10* 3/scale)                      
            .attr("x", xFull(endYear) - (10* 3/scale));
	}
}

//CLEAR SELECTION
function clearSelection(bool){
	console.log("clearing")
	// click selection labels
	d3.select("#place_label").text("")
	d3.select("#place_map").text("Selected Places")
	d3.select("#graph_label").text("Make a selection on the chart or map to show the graphs.")
	
	// place number labels
	selectedPlaces = [];
	numbersGroup.selectAll("*").remove();

	// place row
	placesGroup.selectAll("path")  
		.attr( "stroke", "transparent")
		.attr( "fill", "transparent");

	// map polygons
	samplePlaceGroup.selectAll("path")
		.style( "stroke", mapLandColor[0])  
		.style("stroke-width", mapLineWidth)
		.style("fill", powerColors[1])

	// power polygons
	powersGroup.selectAll("path")
		.attr( "stroke", powerColors[2])
		.attr( "stroke-width",powerLineWidth);

	// reset bar graphs
	/*
    barContainer2.selectAll("*")
        .transition()
        .duration(1000)
        .style("opacity", 0)
        .remove();
        

    barContainer2.selectAll("*")
        .transition()
        .duration(1000)
        .style("opacity", 0)
        .remove();
	*/

	barContainer.selectAll("*").remove();
	barContainer2.selectAll("*").remove();
	barContainer4.selectAll("*").remove();
	d3.select("#container-graph3").selectAll("*").remove();

	// reset selector if not called by selector function
	if (!bool) {
		$("#regimeSelector").val('0');
	}

	// for zooming the map on the places page 
	placeX = [];
	placeY = [];
}


//RESET CHART/MAP ZOOM
function fullExtent(){
	// reset slider
	/*
	$("[name=slider-stack]").filter("[value='"+1+"']").prop("checked",true);
	updateEra("1");
	*/
	// Reset Map
	zoomMap.translate([0, 0]).scale(1);
	mapContainer.attr("transform", [
		"translate(" + [0, 0] + ")",
		"scale(" + 1 + ")"
	].join(" "));
  
	// Reset Chart
	zoomChart.translate([0, 0]).scale(1);
	svgContainer.attr("transform", [
		"translate(" + 0 + "," + 0 + ")",
		"scale(" + 1 + ")"
	].join(" "));
  
	// year to full extent
	startYear = fullStartYear;
	endYear = fullEndYear;

	// rescale axis
	topAxisGroup.call(customAxisTop);
	topTickGroup.call(customAxisTopTicks);
	topTickZGroup.selectAll("*").remove();

	bottomAxisGroup.call(customAxisBottom);
    bottomTickGroup.call(customAxisBottomTicks);
    bottomTickZGroup.selectAll("*").remove();

    placeAxisGroup.selectAll("*").remove();

    if (rulerToggled) {
    	rulerAxisGroup.call(customAxisRuler);
    	bottomBuffer
            .attr("height", 20* 2.7/e.scale)
            .attr("y", yFull(axisRegion.scale().domain()[0]) - (20* 2.7/e.scale));  // does math based upon (pixel <-> chart space) conversion    
    }
	
	if (eraToggled) {
	    regionAxisGroup.call(customAxisRegion);
	    regionTicksGroup.call(customAxisRegionTicks);
	    rightBuffer
	    	// these numbers need to match those in the
            // toggleEra() function in functionsAxis.js 
            // and the zoom section in chart.js
		    .attr("width", 10* 3/zoomChart.scale())
		    .attr("x", xFull(endYear) - (10* 3/zoomChart.scale()));
    }

  	// reset top/bottom buffers
	topBuffer
		.attr("y", 0)
		.attr("height", 10);
	bottomBuffer    
	    .attr("y", visHeight - 10)
	    .attr("height",10);	
}

// sets filter back to full view
function clearFilter() {
	$("#eraSelector").val('1');
	eraGrad1.attr("width", 0)
	eraGrad2.attr("width", 0)
	updateEra(1)

	$("#regionSelector").val('1');
	regionGrad1.attr("height", 0)
	regionGrad2.attr("height", 0)
	updateRegion(1)
}

// for looking up colors to fill regime polygons
function lookupColor(inputColor) {
	var banana = inputColor;
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

// for looking up colors to fill the 'explore places' page graph
// .40 opacity added
function graphColor(inputColor) {
	var banana = inputColor;
	switch (inputColor){
		case "pink":
			return "rgb(255,182,193,.40)";
		case "blue":
			return "rgb(134,168,188,.40)";
		case "yellow":
			return "rgb(240,230,140,.40)";
		case "green":
			return "rgb(143,188,143,.40)";
		default:
			return "rgb(197, 172, 130,.40)";
 }
}

function wordColor(inputColor) {
	var banana = inputColor;
	switch (inputColor){
		case "pink":
			return "#d19999";
		case "blue":
			return "#86A8BC";
		case "yellow":
			return "#FCF2BB";
		case "green":
			return "rgb(143,188,143)";
		default:
			return "#3F3418";
 }
}

// for looking up pattern to fill regime polygons
//function lookupFill(inputColor){
//		var banana = inputColor;
//	switch (inputColor){
//		case "pink":
//			return "url(#bg_red)";
//		case "blue":
//			return "url(#bg_blue)";
//		case "yellow":
//			return "url(#bg_yellow)";
//		case "green":
//			return "url(#bg_green)";
//		default:
//			return "transparent";
// }
//}

// for looking up colors to fill regime polygons
function lookupGradient(inputColor) {
	var banana = inputColor;
	switch (inputColor){
		case "pink":
			return "url(#pinkGradient)";
		case "blue":
			return "url(#blueGradient)";
		case "yellow":
			return "url(#yellowGradient)";
		case "green":
			return "url(#greenGradient)";
		default:
			return "transparent";
	}
 }



