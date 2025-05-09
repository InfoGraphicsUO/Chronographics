////check the current page to determine what the mouseover does
// don't need? This is captured in variables.js
//var path = window.location.pathname;
//var page = path.split("/").pop();
////console.log(page)

// CHANGE CHART DATA ON SORT TOGGLE
function updateData(newVal, redraw=true) {
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
        timelineVar = topTimeline_json.features;
        boundsVar = places_json_bounds.features;
        frameVar = frame_json.features;
        topTime = topTimeline_json.features;
	} 

	else if ( newVal == "2") {
//         if (page == "chart.html"){    
         // load second sort if on this page only

        // download the new data
             //trying to load later.
//         $.when(
//          jQuery.getJSON("/jsonplaces2.json", placeVar),
//          jQuery.getJSON("/jsonpowers2.json", powerVar),
//          jQuery.getJSON("/powerLines_json2.json", powerLineVar),
//          jQuery.getJSON("/eventLines_json2", eventVar),
//          jQuery.getJSON("/regions_json2", regionVar),
//          jQuery.getJSON("/eventPoints_json2", pointsVar)
//             
//          // do for all jsons
//          .error(function(jqXHR, textStatus, errorThrown) {
//            console.log("Encounter error " + textStatus + ". " + errorThrown);
//         }))
//      


    		placeVar = places_json2.features;
    		powerVar = powers_json2.features;
    		powerLineVar = powerLines_json2.features;
    		eventVar = eventLines_json2.features;
    		regionVar = regions_json2.features;
    		pointsVar = eventPoints_json2.features;

    }	
    else if ( newVal == "3") {
    		placeVar = places_json3.features;
    		powerVar = powers_json3.features;
    		powerLineVar = powerLines_json3.features;
    		eventVar = eventLines_json3.features;
    		regionVar = regions_json3.features;
    		pointsVar = eventPoints_json3.features;

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

	regionAxisGroup.call(customAxisRegion);
	regionTicksGroup.call(customAxisRegionTicks);
	//rulerAxisGroup.call(customAxisRuler);

//    // draw the bounding box
//    frameRect.selectAll("path").data(boundsVar).enter().append( "path" )
//        .attr( "d", geoPath )
//		.attr( "stroke", "red")
//        .attr( "fill","none");
    
    // draw the frame 
    frameRect.selectAll("path").data(frameVar).enter().append( "path" )
        .attr( "d", geoPath )
        .attr( "id", function(d){return d.properties.name;})
		.attr( "stroke",function(d){return d.properties.stroke;})
        .attr( "stroke-width", 1.75)
        .attr( "fill", function(d){return d.properties.color;}) 
    
    

//    // make LNIES for the timeline
//	frameRect.selectAll("text").data(timelineVar).enter().append( "path" )
//        .attr( "d", geoPath )
//		.attr( "id", function(d){return d.properties.TEXT;}) // to change JSON x value into screen space
//		.attr("y", function(d) {
//            // any from the upper go to 1710
//            if (d.geometry.coordinates[1] > 1000) return yScale(1710) // JSON y --> screen space
//            // any from the lwer go to 80
//            if (d.geometry.coordinates[1] < 1000) return yScale(80) // JSON y --> screen space
//        return yScale(d.geometry.coordinates[1]); }) 
//        .classed("ticDot", true)
//		.on("mousemove", moveThru)
//		.on("click", clickThru)
//		.on("touchend", clickThru);
    
    
	// load the power data 
	powersGroup.selectAll("path").data(powerVar).enter().append( "path" )
		.attr( "d", geoPath )
		//.attr( "fill", function(d){return lookupColor(d.properties.color);} ) // fill with solid color
		.attr( "fill", function(d){return lookupGradient(d.properties.color);} ) // fill with softer, watercolor-like gradient image
		.attr( "stroke", "transparent")
		.attr( "fill-opacity","0.35")
		.attr( "stroke-width", powerLineWidth)
		.on("mousemove", mouseMove)
		.on("mouseout", mouseOut)
		.on("touchend", click)
		.on("click", click)
		.on("dblclick", dblclick);

	// load boundary lines for power data
	powerLines.selectAll("path").data(powerLineVar).enter().append( "path" )
		.attr( "d", geoPath )
		.attr( "stroke", powerColors[1])
		.style("stroke-linecap", "round")
		.attr( "stroke-width",powerLineWidth)
		.on("mousemove", moveThru);

	// load the place data 
	placesGroup.selectAll("path").data(placeVar).enter().append( "path" )
		.attr( "d", geoPath )
		.attr( "fill", "rgba(0,0,0,0.01)" )
		.attr( "stroke", "transparent")
		.attr( "stroke-width","0")
		.on("mousemove", moveThru)
		.on("mouseout", mouseOutThru)
		.on("touchend", clickThru)
		.on("click", clickThru)
		.on("dblclick", clickThru);

	// load the labels for the point events
	pointsLabel.selectAll("text").data(pointsVar).enter().append("text")
		.attr("x", function(d) {return xScale(d.geometry.coordinates[0] - coordinateSystemXoffset) + 1; }) // to change JSON x value into screen space
		.attr("y", function(d) {return yScale(d.geometry.coordinates[1]); }) // JSON y --> screen space
		.text( function(d) {  return d.properties.regime; })
		.attr("font-family", "sans-serif")
		.style("text-anchor", "front")
        .attr("font-variant", "normal")
        .attr("font-style", "italic")
		.attr("font-size", "2px")  // Math to scale text size by polygon area
        .attr( "pointer-events", "none" )
		.on("mousemove", moveThru)
		.on("click", clickThru)
		.on("touchend", clickThru);
    
    	// load the timeline lables
	timelineLabel.selectAll("text").data(timelineVar).enter().append("text")
		.attr("x", function(d) {return xScale(d.geometry.coordinates[0] - coordinateSystemXoffset)}) // to change JSON x value into screen space
		.attr("y", function(d) {return yScale(d.geometry.coordinates[1]); }) // JSON y --> screen space
//		.text("●")
//		.text( function(d) { return  d.properties.TEXT; }) 
		.text( function(d) { 
            if(d.properties.TEXT != 25){ // check if value is not 25
                if( d.properties.TEXT < 0){
                    return Math.abs(d.properties.TEXT) // remove negatives from  numeric axis labels
                } else {
                    return d.properties.TEXT
                }
            } else {return ""}
        })

//        .style("writing-mode","vertical-rl;")
//		.attr("font-family", "sans-serif")
//		.style("text-anchor", "middle")
//        .attr("font-variant", "normal")
//		.attr("font-size", "5px")  // Math to scale text size by polygon area   
        .attr("class", function(d) { 
            // set class based on ticval (rotate 50s)
            var ticVal = d.properties.TEXT;
            return ((ticVal%100) ? "tic50":"tic100 old-looking-numbers")
        });
    
//        // load the DOTS for the timeline
//	timelineDots.selectAll("text").data(timelineVar).enter().append("text")
//		.attr("x", function(d) {return xScale(d.geometry.coordinates[0] - coordinateSystemXoffset);}) // to change JSON x value into screen space
//		.attr("y", function(d) {return yScale(1710); }) // JSON y --> screen space
//		.text("●")
//        .classed("ticDot", true)
//		.on("mousemove", moveThru)
//		.on("click", clickThru)
//		.on("touchend", clickThru);
    
    // make DOTS for the timeline
	timelineDots.selectAll("text").data(timelineVar).enter().append("text")
		.attr("x", function(d) {return xScale(d.geometry.coordinates[0] - coordinateSystemXoffset);}) // to change JSON x value into screen space
//		.attr("y", function(d) {return yScale(1710); }) // JSON y --> screen space
		.attr("y", function(d) {
            // any from the upper go to 1710
            if (d.geometry.coordinates[1] > 1000) return yScale(1710) // JSON y --> screen space
            // any from the lwer go to 80
            if (d.geometry.coordinates[1] < 1000) return yScale(80) // JSON y --> screen space
        })
        .text("●")
        .classed("ticDot", true)
		.on("mousemove", moveThru)
		.on("click", clickThru)
		.on("touchend", clickThru);
    
    
    
	// load the labels for the power data
	powersLabel.selectAll("text").data(powerVar).enter().append("text")
		.attr("x", function(d) {return xScale(d.properties.INSIDE_X - coordinateSystemXoffset); }) // to change JSON x value into screen space
		.attr("y", function(d) {return yScale(d.properties.INSIDE_Y); }) // JSON y --> screen space
		.text( function(d) { 
            var thislabel = d.properties.regime
            thislabel = thislabel.replace("-NE","") // drop NE off the labels that have it (to replace with point event labels)

            // don't label tiny regimes
            if (d.properties.POLY_AREA > 2500 ){  return thislabel; }
        })
        // set font variant based on row height (single row in 12 units tall)
        .attr("font-variant",  function(d){
            if (d.properties.EXT_MAX_Y - d.properties.EXT_MIN_Y < 13){
               return "normal"
            } 
            else return "small-caps"
        }) 
    
        // set rotation based on row height (single row in 12 units tall)
        .attr("class",  function(d){
            var thisPolyHeight = d.properties.EXT_MAX_Y - d.properties.EXT_MIN_Y;
            var thisPolyWidth = d.properties.EXT_MAX_X - d.properties.EXT_MIN_X
            if (thisPolyHeight > thisPolyWidth){
               return "old-looking-font powersLabel verticalPower";
            } else return  "old-looking-font powersLabel " 

        }) 

		.style("text-anchor", "middle")
   
        .attr("font-style", "oblique ")
        .attr("letter-spacing", "0.25em") // note kerning not applied to firefox 		
        .attr("font-size", function(d){
            // if ro
            if (d.properties.EXT_MAX_Y - d.properties.EXT_MIN_Y < (rowHeight + 1)){
               return "2.5px"
            } 
            else {       
        
                var fontSize = Math.pow(d.properties.POLY_AREA/4.0, 0.2)-1 // Math to scale text size by polygon areas
                return fontSize + "px"
            }
        })  
        .attr( "pointer-events", "none" )
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
        .attr("id", function(d) {  return d.properties.id; })
		.attr( "stroke", powerColors[1])
		.attr( "stroke-width",powerLineWidth)
        .attr( "pointer-events", "none" )
		.on("mousemove", moveThru);

	// dahsed
	eventLinesH.selectAll("path").data(eventVar
		.filter(function(line){return (line.properties.lineType == "HV") || (line.properties.lineType== "HF") || (line.properties.lineType == "HR")||(line.properties.lineType == "HHB")||(line.properties.lineType == "HHA");}))
		.enter()
		.append("path")
		.attr( "d", geoPath )
		.attr( "stroke", powerColors[1])
		.attr( "stroke-width",powerLineWidth)
		.style("stroke-dasharray", ("1, 1.5"))
        .attr( "pointer-events", "none" )
		.on("mousemove", moveThru);

	// dotted
	eventLinesT.selectAll("path").data(eventVar
		.filter(function(line){return (line.properties.lineType == "TV") || (line.properties.lineType == "TF") || (line.properties.lineType == "TR")|| (line.properties.lineType == "HTB")|| (line.properties.lineType == "HTA");}))
		.enter()
		.append("path")
		.attr( "d", geoPath )
		.attr( "stroke", powerColors[1])
		.attr( "stroke-width",powerLineWidth*1.25)
		.style("stroke-dasharray", (".2, 1.5"))
		.style("stroke-linecap", "round")
        .attr( "pointer-events", "none" )
		.on("mousemove", moveThru);

	// event points
	eventPoints.selectAll("path").data(pointsVar)
		.enter()
		.append("path")
		.attr( "d", geoPath )
		.attr( "pointer-events", "none" )
		.on("mousemove", moveThru);

	// no line
	eventLinesN.selectAll("path").data(eventVar
		.filter(function(line){return (line.properties.lineType == "NL") || (line.properties.lineType == "HNB");}))
		.enter()
		.append("path")
		.attr( "d", geoPath )
        .attr( "pointer-events", "none" )
		.on("mousemove", moveThru);
    
    eventLinesN.selectAll("path").data(eventVar
		.filter(function(line){return (line.properties.lineType == "PE");}))
		.enter()
		.append("path")
		.attr( "d", geoPath )
        .attr( "stroke", "red")
		.on("mousemove", moveThru);
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
		rulerToggled = true;
		toggleRuler();
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
        .attr("height", 30* 3.1/scale)
        .attr("y", yFull(startY) - (30* 3.1/scale));  // does math based upon (pixel <-> chart space) conversion 


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
	// click selection labels
	d3.select("#year_label").text("click chart to select")
//	d3.select("#place_map").text("click map or chart to select")
    $("#placeSelector").val(0); // set place selector to default
    
	d3.select("#descriptive_text").text("")
	x = document.getElementById("regimeSelector");
  	x.options[0].text = "click on map/chart or select here";
    
	// click line/dot 
	d3.select(".verticalLine").attr("stroke", "transparent")
	d3.select(".dot").attr("fill", "transparent")
	d3.select(".horizontalLine").attr("fill", "transparent")


    
	// place row
	placesGroup.selectAll("path")  
		.attr( "fill", "rgba(0,0,0,0.01)" )
		.attr( "stroke", "transparent")

  	// map polygons
    // UPDATE MAP COLORS for new version of map d3
	samplePlaceGroup.selectAll("path")
			.style( "stroke", mapLandColor[0])
			.style( "stroke-width",mapLineWidth)
			.style("fill",mapLandColor[1])

	// power polygons
	powersGroup.selectAll("path")
		.attr( "stroke", powerColors[2])
		.attr( "stroke-width",powerLineWidth);

	// reset selector if not called by selector function
	if (!bool) {
		$("#regimeSelector").val('0');
        $("#placeSelector").val(0); // set place selector to default
           // click values

	} else {
        clickPlace = ''
        clickID = ''
    }
    //fullExtent(); // trigger full extent if clearing selection
}

//RESET CHART/MAP ZOOM
function fullExtent(){
	// reset slider
	/*
	$("[name=slider-stack]").filter("[value='"+1+"']").prop("checked",true);
	updateEra("1");
	*/
	// Reset Map
//	zoomMap.translate([0, 0]).scale(1);
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
		.attr("height", 20);

	bottomBuffer
	    .attr("y", visHeight - 10)
	    .attr("height",20);
    
    // reset compare window if on that page
    if (page == "compare.html"){   
//        console.log("zoom: "+zoomChart.scale());
//        comContainer.attr("scale("+zoomChart.scale()+")");
//        console.log("zoom");

        zoomCompare(1, 0, 0);
    }
}
// sets filter back to full view
function clearFilter() {
	$("#eraSelector").val('1');
	eraGrad1.attr("width", 0)
	eraGrad2.attr("width", 0)
	updateEra(1)

	$("#regionSelector").val('1');
    //$("#placeSelector").val(0); // set place selector to default
	regionGrad1.attr("height", 0)
	regionGrad2.attr("height", 0)
	updateRegion(1)
}



//for gradient fills
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


