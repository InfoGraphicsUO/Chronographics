// for place exploration

function clickRegion(d, i) {
	clearSelection();
	d3.select("#place_label").text(regionTickLabels2[i])

	var xs = []; var ys = []; // for map zoom to bounding box of regime

	placesGroup.selectAll("path").filter(function(rows) { 
		return regionTickLabels2[i] == rows.properties.region.toUpperCase();})
		.attr("stroke", placeColors[2])		// selected
		.attr("fill", placeColors[2])		// selected
		.attr("stroke-width","1")
		.attr("opacity","0.8")
		.attr("stroke-opacity","0.8")
		.each(function(p) {
			samplePlaceGroup.selectAll("path")
				.filter(function(s) { 
					return s.properties.placeID == p.properties.placeGRIDCODE; })
				.transition()
				.attr( "stroke", mapLandColor[0])
				.attr( "stroke-width", mapLineWidth)
				.attr("fill",  placeColors[2])
				.each(function(poly) {
					xs.push(this.getBBox().x)
					xs.push(this.getBBox().x + this.getBBox().width)
					ys.push(this.getBBox().y)
					ys.push(this.getBBox().y + this.getBBox().height)
				})
		});
			// get the max/min of the x/y
		var minX = Math.min.apply(null, xs),
			maxX = Math.max.apply(null, xs),
			minY = Math.min.apply(null, ys),
			maxY = Math.max.apply(null, ys);

		// the bounding box is the max/min of the y/x
		var bbox = [[minX,minY] , [maxX,maxY]];
		var dx = bbox[1][0] - bbox[0][0],
				dy = bbox[1][1] - bbox[0][1],
				x = (bbox[0][0] + bbox[1][0]) / 2,
				y = (bbox[0][1] + bbox[1][1]) / 2,
				//scale = 5,
				scale = Math.min(.6 / Math.max(dx / mapWidth, dy / mapHeight), 20), // max zoom is 20
				translate = [mapWidth / 2 - scale * x, mapHeight / 2 - scale * y];
			// make sure to adjust the zoom extent so that it can rezoom smoothly
			zoomMap.translate(translate).scale(scale);

			// zoom the map w/ transition
			mapContainer.transition()
				// delay so that double click works
				.delay(300)
				.duration(750)
				.style("stroke-width", 1.5 / scale + "px")
				.attr("transform", "translate(" + translate + ")scale(" + scale + ")");
}


function clickPlace(d) {  
	// https://stackoverflow.com/questions/16799116/handling-mouse-events-in-overlapping-svg-layers
	console.log("clickPlace()")
	if (d3.event.defaultPrevented) return;

	// save temp values
	tempPlace = d.properties.name;
	tempID = d.properties.placeGRIDCODE;
	tempRegion = d.properties.region;

	// error handling 
	if (tempPlace == undefined || tempPlace == "FOOTER") {
		tempPlace = '';
	}
	if (tempRegion == undefined) {
		tempRegion = '';
	}
    
    // only do stuff if not already done and not more than 5
	if  (!selectedPlaces.includes(d.properties.name) && selectedPlaces.length<5) {
		console.log("d.properties.name: " + d.properties.name)
	 	selectedPlaces.push(d.properties.name)
		// add number label to chart
		numbersGroup.append('text')
		    .attr("class", "placeNum")
	        .attr("x", 2)
	        .attr("y", d3.mouse(this)[1] - 5)
	        .style("fill", placeColors[2])
	        .text(selectedPlaces.length);

		// add the selected place to this list
		d3.select("#place_label").text(d3.select("#place_label").text() + "    (" + selectedPlaces.length +")"+ tempPlace + " ")

		//give the selected place a stroke
		placesGroup.selectAll("path")
			.filter(function(rows) { 
				return tempID == rows.properties.placeGRIDCODE;})
				.attr("stroke", placeColors[2])		// selected
				.attr("stroke-width","1");
	    
		// fill the selected place on the map
		samplePlaceGroup.selectAll("path")
			.filter(function(rows) { return rows.properties.placeID == tempID;})
			.attr( "stroke", placeColors[1])
			.attr( "stroke-width",mapLineWidth*4)
			.attr("fill", mapLandColor[2])
			.each(function(poly) {
				// add x/y values of bbox to arrays
				placeX.push(this.getBBox().x)
				placeX.push(this.getBBox().x + this.getBBox().width)
				placeY.push(this.getBBox().y)
				placeY.push(this.getBBox().y + this.getBBox().height)
			})

			// get the max/min of the x/y
		var minX = Math.min.apply(null, placeX),
			maxX = Math.max.apply(null, placeX),
			minY = Math.min.apply(null, placeY),
			maxY = Math.max.apply(null, placeY);

		// the bounding box is the max/min of the y/x
		var bbox = [[minX,minY] , [maxX,maxY]];

		var dx = bbox[1][0] - bbox[0][0],
				dy = bbox[1][1] - bbox[0][1],
				x = (bbox[0][0] + bbox[1][0]) / 2,
				y = (bbox[0][1] + bbox[1][1]) / 2,
				//scale = 5,
				scale = Math.min(.8 / Math.max(dx / mapWidth, dy / mapHeight), 20), // max zoom is 20
				translate = [mapWidth / 2 - scale * x, mapHeight / 2 - scale * y];
			// make sure to adjust the zoom extent so that it can rezoom smoothly
			zoomMap.translate(translate).scale(scale);

			// zoom the map w/ transition
			mapContainer.transition()
				// delay so that double click works
				.delay(300)
				.duration(750)
				.style("stroke-width", 1.5 / scale + "px")
				.attr("transform", "translate(" + translate + ")scale(" + scale + ")");

			//GRAPH STUFF ...
			d3.select("#graph_label").text("");
			drawPlaceBar(selectedPlaces);
			drawWords(selectedPlaces);
	}
}

function click(d) {
	//if (page != "chartofHistory.html"){  // disable click selection on the side-by-side chart
    	console.log("function click")
        if (d3.event.defaultPrevented) return;
        clearSelection();
        tempRegime = d.properties.regime;

        // set click labels
        d3.select("#place_label").text("Place: " + tempPlace+",")
        d3.select("#power_label").text("Empire: " + tempRegime+",")
        d3.select("#place_map").text(tempPlace)
        d3.select("#power_map").text(tempRegime)
        x = document.getElementById("regimeSelector");
  		x.options[0].text = tempRegime;
        d3.select("#year_label").text(mouseYear.toFixed())
        setDescriptiveText(); 
        // set lines and dot
        // year line
        d3.select(".verticalLine")
            .attr("transform", function () {
                return "translate(" + -margin.left + ",0)";})
            .attr("transform", function () {
                return "translate(" + (d3.mouse(this)[0] - margin.left) + ",0)";})
            .attr("stroke", lineColor);
        // place line
        d3.select(".horizontalLine")
            .attr("transform", function () {
                return "translate(" + [0][0] + ")";})
            .attr("transform", function () {
                return "translate(" + (d3.mouse(this)[0]-10) + "," + (d3.mouse(this)[1]-.5) +")";})
            .attr("fill", placeColors[2]);
        // spot clicked
        d3.select(".dot")
            .attr("transform", function () {
                return "translate(" + [0][0] + ")";})
            .attr("transform", function () {
                return "translate(" + d3.mouse(this) +")";})
            .attr("fill", placeColors[2]);

        var x = mouseYear + 500000;
        var regHeights = [];  // object in form of regHeights['regime'] = int(height)
        var rowData = [];  // final data structure for row bar graph
        var areaData = []; // final data structure for area bar graph
        var coords = [];  // coords of selected regime
        var height = 0;  // height of selected regime
        var tempHeight = 0;  // data manipulation for bar graph
        var areaRegime = 0;  // for area graph
        var areaPlace = 0;  // for area graph
        var xs = []; var ys = []; // for map zoom to bounding box of regime
        var totalHeight = 0; // for bar graph percent

        // define line on click vertical for collision algorithm
        var line = {
            "x": d3.mouse(this)[0],
            "y": 0,
            "height": places_json_bounds.features[0].geometry.coordinates[0][1][1],
            "width": .5
        }

        console.log("A")

        // find all power polygons on line
        powersGroup.selectAll("path")
            .each(function(reg) {
                // if line is on regime bounding box
                if (isCollide(line, this.getBBox())) {
                    // if this is the first polygon of a regime
                    if (typeof regHeights[reg.properties.regime] === 'undefined') {  
                        regHeights[reg.properties.regime] = this.getBBox().height; 
                    }
                    // if we already found a polygon of regime
                    else {
                        regHeights[reg.properties.regime] += this.getBBox().height;
                    }
                    // this is adding all of the coordinates of the selected regime to an array so we can link it to the map
                    if (reg.properties.regime === tempRegime) { 
                        coords.push(reg.geometry.coordinates[0]); 
                        d3.select(this)
                        .attr("stroke", powerColors[0])
                        .attr( "stroke-width", "2")
                    }
                // for bar graph percent
                totalHeight += this.getBBox().height
                }
            })
        // save percent height of selected regime
        tempHeight = (regHeights[tempRegime] / totalHeight) * 100;
        // set it to zero so it cannot be top 10
        regHeights[tempRegime] = 0;

        // for graph

        // // populate data structure needed for bar graph. divide by total area for percentage
        // for (regime in regHeights) {
        //     rowData.push({
        //         "name": regime,
        //         "value": (regHeights[regime] / totalHeight) * 100
        //     })
        // }
        // // sort biggest to smallest
        // rowData = rowData.sort(function(a, b){ return b.value - a.value; });  
        // rowData = rowData.slice(0,9);  // only take top 9
        // rowData.push({  // add back selected regime
        //     "name": tempRegime,
        //     "value": tempHeight
        // });
        // // re-sort 
        // rowData = rowData.sort(function(a, b){ return b.value - a.value; }); 

        console.log("B")

        // SELECT BY REGIME ON MAP 
        placesGroup.selectAll("path")
            .each(function(row) {  // iterate over rows
                for(i = 0; i < coords.length; i++) { // iterate over each polygon from selected regime
                    var y = row.geometry.coordinates[0][0][1] + .5;
                    // if(row.properties.placeGRIDCODE == 412){
                    // 	console.log("x, y: " + x + ", "+ y)
                    // 	console.log("coords[i]: " + coords[i])
                    // }
                    
                    //console.log("place gridcode: " +  row.properties.placeGRIDCODE)
                    if (pointInPolygon([x,y], coords[i])) {  // check if point clicked on is in the polygon
                        console.log("Row Found")
                        height+= row.geometry.coordinates[0][1][1] - row.geometry.coordinates[0][0][1]; // find height of row
                        samplePlaceGroup.selectAll("path")
                            .filter(function(s) { 
                            	//console.log("placeID: " + placeID)
                                return s.properties.placeID == row.properties.placeGRIDCODE; })
                            .transition()
                            .attr( "stroke", mapLandColor[0])
                            .attr( "stroke-width", mapLineWidth)
                            .style("fill",  powerColors[0])
                            .each(function(poly) {
                                // add to area
                                areaRegime += poly.properties.POLY_AREA;
                                // add x/y values of bbox to arrays
                                xs.push(this.getBBox().x)
                                xs.push(this.getBBox().x + this.getBBox().width)
                                ys.push(this.getBBox().y)
                                ys.push(this.getBBox().y + this.getBBox().height)
                            })
                    }
                }
        });

        // get the max/min of the x/y
        var minX = Math.min.apply(null, xs),
            maxX = Math.max.apply(null, xs),
            minY = Math.min.apply(null, ys),
            maxY = Math.max.apply(null, ys);

        // the bounding box is the max/min of the y/x
        var bbox = [[minX,minY] , [maxX,maxY]];

        console.log("C")

        // SELECT BY PLACE ON MAP
        samplePlaceGroup.selectAll("path")
            .filter(function(rows) { 
            	console.log("tempid: " + tempID)
            	return rows.properties.placeID == tempID;})
            .transition()
            .attr( "stroke", placeColors[1])
            .attr( "stroke-width",mapLineWidth*4)
            .style("fill", mapLandColor[2])
            .each(function(poly) {
                areaPlace = poly.properties.POLY_AREA;
                console.log("areaPlace: " + areaPlace)
                // math for bounding box zoom: https://bl.ocks.org/mbostock/4699541
                var dx = bbox[1][0] - bbox[0][0],
                    dy = bbox[1][1] - bbox[0][1],
                    x = (bbox[0][0] + bbox[1][0]) / 2,
                    y = (bbox[0][1] + bbox[1][1]) / 2;

                    console.log("x: " + x);
                    console.log("y: " + y);
                    //scale = 5,
                 var scale = Math.min(.6 / Math.max(dx / mapWidth, dy / mapHeight), 20), // max zoom is 20
                    translate = [mapWidth / 2 - scale * x, mapHeight / 2 - scale * y];
                // make sure to adjust the zoom extent so that it can rezoom smoothly
                zoomMap.translate(translate).scale(scale);

                // zoom the map w/ transition
                mapContainer.transition()
                    // delay so that double click works
                    .delay(300)
                    .duration(750)
                    .style("stroke-width", 1.5 / scale + "px")
                    .attr("transform", "translate(" + translate + ")scale(" + scale + ")");
        });

        console.log("D")    

        // manually push data for area chart. divide by total area for percentage
        areaData.push(
        {
            "name": "Selected Place",
            "value": 100 * (areaPlace/areaTotal)
        },
        {
            "name": "All " + tempRegime,
            "value": 100 * (areaRegime/areaTotal)
        });

        // BAR DATA INPUT
        d3.select("#graph_label").text("");
        drawRowBar(rowData, tempRegime, ~~(mouseYear));
        //drawAreaBar(areaData, " " + tempPlace, tempRegime, ~~(mouseYear)) // lazy hack adding space infront of year b/c some place/regimes are same
//        findPage()
        // setDescriptiveText()
        //createYearData()
        //combineYearData()
    //}

    console.log("E")   
}

// zoom to the selected place
function dblclick(d) {
	if (d3.event.defaultPrevented) return;
	tempRegime = d.properties.regime;
	clearSelection();

	// set click labels
	d3.select("#place_label").text("Place: " + tempPlace+",")
	d3.select("#power_label").text("Empire: " + tempRegime+",")
	d3.select("#place_map").text(tempPlace)
	d3.select("#power_map").text(tempRegime)
	x = document.getElementById("regimeSelector");
  	x.options[0].text = tempRegime;
	d3.select("#year_label").text(mouseYear.toFixed())
	setDescriptiveText(); 
	//findPage();


	// set lines and dot
	d3.select(".verticalLine")
		.attr("transform", function () {
			return "translate(" + -margin.left + ",0)";})
		.attr("transform", function () {
			return "translate(" + (d3.mouse(this)[0] - margin.left) + ",0)";})
		.attr("stroke", lineColor);

	d3.select(".horizontalLine")
		.attr("transform", function () {
			return "translate(" + [0][0] + ")";})
		.attr("transform", function () {
			return "translate(" + (d3.mouse(this)[0]-10) + "," + (d3.mouse(this)[1]-.5) +")";})
		.attr("fill", placeColors[2]);

	d3.select(".dot")
		.attr("transform", function () {
			return "translate(" + [0][0] + ")";})
		.attr("transform", function () {
			return "translate(" + d3.mouse(this) +")";})
		.attr("fill", placeColors[2]);

	// zoom to the selected place only
	samplePlaceGroup.selectAll("path")
		.filter(function(rows) { return rows.properties.placeID == tempID;})
		.attr( "stroke", placeColors[1])
		.attr( "stroke-width",mapLineWidth*4)
		.style("fill", mapLandColor[2])
		.each(function(poly) {
			// math for bounding box zoom: https://bl.ocks.org/mbostock/4699541
			var dx = this.getBBox().width,
				dy = this.getBBox().height,
				x = (this.getBBox().x + (this.getBBox().x + this.getBBox().width)) / 2,
				y = (this.getBBox().y + (this.getBBox().y + this.getBBox().height)) / 2,

				scale = Math.min((.5 / Math.max(dx / mapWidth, dy / mapHeight)), 20),  // max zoom is 20
				translate = [mapWidth / 2 - scale * x, mapHeight / 2 - scale * y];

			// adjust the zoom extent so that it can rezoom smoothly
			zoomMap.translate(translate).scale(scale);

			// zoom the map w/ transition
			mapContainer.transition()
				.duration(750)
				.style("stroke-width", 1.5 / scale + "px")
				.attr("transform", "translate(" + translate + ")scale(" + scale + ")");
	});
}

function mouseMove(d) {
	// set tooltip to the info hovered over
	tempRegime = d.properties.regime
	if (tempRegime == undefined) {
		tempRegime = '';
	}
    
    tempEra = findEra(mouseYear.toFixed())
	if (tempEra == undefined) {
		tempEra = '';
	}
 	
	toolTip.transition()
		.duration(100)    
		.style("opacity", .9); 
	toolTip.html("Year: " + mouseYear.toFixed() + "<br/>"  + "Era: " + tempEra + "<br/>" + "Place: " + tempPlace + "<br/>"  + "Empire: " + tempRegime + "<br/>"  + "Region: " + tempRegion)  
		.style("left", (d3.event.pageX) + "px")   
		.style("top", (d3.event.pageY - 28) + "px");
}

function toolYear() {
	// set tooltip to the info hovered over
    
    tempEra = findEra(mouseYear.toFixed())
	if (tempEra == undefined) {
		tempEra = '';
	}

	toolTip.transition()
		.duration(100)    
		.style("opacity", .9); 
    toolTip.html("Year: " + mouseYear.toFixed() + "<br/>"  + "Era: " + tempEra + "<br/>" + "Place: " + tempPlace + "<br/>"  + "Regime: " + tempRegime + "<br/>"  + "Region: " + tempRegion)  
		.style("left", (d3.event.pageX) + "px")   
		.style("top", (d3.event.pageY - 28) + "px");
}

function mouseOut(d) {
	// clear tooltip
    toolTip.style("pointer-events","none") // prevent tooltip from blocking mouse
	toolTip.transition()    
		.duration(300)    
		.style("opacity", 0); 
}
function mouseOutThru(d) {
	// https://stackoverflow.com/questions/16799116/handling-mouse-events-in-overlapping-svg-layers
	if (d3.event.defaultPrevented) return;
	tempRegime = '';
	// to lower level svg (regime)
	var e = d3.event;
	var prev = this.style.pointerEvents;
	this.style.pointerEvents = 'none';
	var el = document.elementFromPoint(d3.event.x, d3.event.y);
	if (el == null) {return;}
	var e2 = document.createEvent('MouseEvent');
	e2.initMouseEvent(e.type,e.bubbles,e.cancelable,e.view, e.detail,e.screenX,e.screenY,e.clientX,e.clientY,e.ctrlKey,e.altKey,e.shiftKey,e.metaKey,e.button,e.relatedTarget);
	el.dispatchEvent(e2);
	this.style.pointerEvents = prev;
}

function clickThru(d) {  
	// https://stackoverflow.com/questions/16799116/handling-mouse-events-in-overlapping-svg-layers
	if (d3.event.defaultPrevented) return;

	// save temp values
	tempPlace = d.properties.name;
	tempID = d.properties.placeGRIDCODE;
	tempRegion = d.properties.region;
	// error handling 
	if (tempPlace == undefined || tempPlace == "FOOTER") {
		tempPlace = '';
	}
	if (tempRegion == undefined) {
		tempRegion = '';
	}

	if (tempID == undefined) {
		tempID = '';
	}

	// to lower level svg (regime)
	var e = d3.event;
	var prev = this.style.pointerEvents;
	this.style.pointerEvents = 'none';
	var el = document.elementFromPoint(d3.event.x, d3.event.y);
	if (el == null) {return;}
	var e2 = document.createEvent('MouseEvent');
	e2.initMouseEvent(e.type,e.bubbles,e.cancelable,e.view, e.detail,e.screenX,e.screenY,e.clientX,e.clientY,e.ctrlKey,e.altKey,e.shiftKey,e.metaKey,e.button,e.relatedTarget);
	el.dispatchEvent(e2);
	this.style.pointerEvents = prev;
}

function clickThruBio(d) {  
	// https://stackoverflow.com/questions/16799116/handling-mouse-events-in-overlapping-svg-layers
	if (d3.event.defaultPrevented) return;

	// to lower level svg (regime)
	var e = d3.event;
	var prev = this.style.pointerEvents;
	this.style.pointerEvents = 'none';
	var el = document.elementFromPoint(d3.event.x, d3.event.y);
	if (el == null) {return;}
	var e2 = document.createEvent('MouseEvent');
	e2.initMouseEvent(e.type,e.bubbles,e.cancelable,e.view, e.detail,e.screenX,e.screenY,e.clientX,e.clientY,e.ctrlKey,e.altKey,e.shiftKey,e.metaKey,e.button,e.relatedTarget);
	el.dispatchEvent(e2);
	this.style.pointerEvents = prev;
}

function moveThru(d) {
	// save temp values
	tempPlace = d.properties.name;
	tempRegion = d.properties.region;
	// error handling
	if (tempPlace == undefined || tempPlace == "FOOTER") {
		tempPlace = '';
	}
	if (tempRegion == undefined) {
		tempRegion = '';
	}
	tempRegime = '';
	// to lower level svg
	var e = d3.event;
	var prev = this.style.pointerEvents;
	this.style.pointerEvents = 'none';
	var el = document.elementFromPoint(d3.event.x, d3.event.y);
	if (el == null) {return;}
	var e2 = document.createEvent('MouseEvent');
	e2.initMouseEvent(e.type,e.bubbles,e.cancelable,e.view, e.detail,e.screenX,e.screenY,e.clientX,e.clientY,e.ctrlKey,e.altKey,e.shiftKey,e.metaKey,e.button,e.relatedTarget);
	el.dispatchEvent(e2);
	this.style.pointerEvents = prev;
}

function moveThruBio(d) {
	// to lower level svg
	var e = d3.event;
	var prev = this.style.pointerEvents;
	this.style.pointerEvents = 'none';
	var el = document.elementFromPoint(d3.event.x, d3.event.y);
	if (el == null) {return;}
	var e2 = document.createEvent('MouseEvent');
	e2.initMouseEvent(e.type,e.bubbles,e.cancelable,e.view, e.detail,e.screenX,e.screenY,e.clientX,e.clientY,e.ctrlKey,e.altKey,e.shiftKey,e.metaKey,e.button,e.relatedTarget);
	el.dispatchEvent(e2);
	this.style.pointerEvents = prev;
}

function findEra(input){
    for (var i = 0; i < rulerTicks.length; i++) {
        if (rulerTicks[i] >= input) {
        return rulerTickLabels[i];  
    }
  }
}

function mapMove(d) {
	// sets tooltip for the mouse to display the place name of the hovered area
	toolTip.transition()   
		.duration(200)    
		.style("opacity", .9);    
	toolTip.html(d.properties.name)  
		.style("left", (d3.event.pageX) + "px")   
		.style("top", (d3.event.pageY - 28) + "px");  
}

function mapOut(d) {
	// clear map tooltip
	toolTip.transition()    
		.duration(300)    
		.style("opacity", 0); 
}

// http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
function pointInPolygon(point, vs) {
	var xi, xj, i, intersect,
		x = point[0],
		y = point[1],
		inside = false;
	for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
		xi = vs[i][0],
		yi = vs[i][1],
		xj = vs[j][0],
		yj = vs[j][1],
		intersect = ((yi > y) != (yj > y))
		  			&& (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
		if (intersect) inside = !inside;
	}
	return inside;
}


// https://stackoverflow.com/questions/2440377/javascript-collision-detection
function isCollide(a, b) {
	return !(
		((a.y + a.height) < (b.y)) ||
		(a.y > (b.y + b.height)) ||
		((a.x + a.width) < b.x) ||
		(a.x > (b.x + b.width))
	);
}

// CREATES YEAR/REGIME DATA STRUCTURE
// RUN IT IN THE CLICK FUNCTION (BOTTOM)
function createYearData() {
	// create dict
	var yearDataArea = {};
	var yearData = {};
	// iterate through years
	for (var i = 498800; i < 501800; i++) {
		// define line on click vertical for collision algorithm
		var yearLine = {
			"x": xScale(i - 500000), // convert to screen space
			"y": 0,
			"height": places_json_bounds.features[0].geometry.coordinates[0][1][1],
			"width": .5
		}
		yearData[i] = {};
		yearDataArea[i] = {};
		// find all power polygons on line
		powersGroup.selectAll("path")
			.each(function(reg) {
				// if line is on regime bounding box
				var powerBox = this.getBBox();
				if (isCollide(yearLine, this.getBBox())) {
					// if this is the first polygon of a regime
					if (typeof yearData[i][reg.properties.regime] === 'undefined') {  
						yearData[i][reg.properties.regime] = this.getBBox().height;
						placesGroup.selectAll("path")
							.each(function(row) {
								if (isCollide(powerBox, this.getBBox())) {
									samplePlaceGroup.selectAll("path")
									.filter(function(s) { 
										return s.properties.placeID == row.properties.placeGRIDCODE; })
									.each(function(poly) {
										yearDataArea[i][reg.properties.regime] = poly.properties.POLY_AREA
									})
								}
							})
					}
					// if we already found a polygon of regime
					else {
						yearData[i][reg.properties.regime] += this.getBBox().height;
						placesGroup.selectAll("path")
							.each(function(row) {
								if (isCollide(powerBox, this.getBBox())) {
									samplePlaceGroup.selectAll("path")
									.filter(function(s) { 
										return s.properties.placeID == row.properties.placeGRIDCODE; })
									.each(function(poly) {
										yearDataArea[i][reg.properties.regime] += poly.properties.POLY_AREA
									})
								}
							})
					}
				}
			})
	}

	var finalData = {};
	for (i in regimes) {
		finalData[regimes[i]] = {};
	}
	var finalDataArea = {};
	for (i in regimes) {
		finalDataArea[regimes[i]] = {};
	}
	//console.log(finalData)
	// iterate through years
	for (var i = 498800; i < 501800; i++) {
		for (power in yearData[i]) {
			finalData[power][i] = yearData[i][power]

		}
	}
	for (var i = 498800; i < 501800; i++) {
		for (power in yearDataArea[i]) {
			finalDataArea[power][i] = yearDataArea[i][power]

		}
	}
	// open and flatten data structure in new window
	// select all and paste into
	// https://jsonformatter.org/
	var winPrint = window.open('', '', 'left=0,top=0,width=800,height=600,toolbar=0,scrollbars=0,status=0');
	winPrint.document.write('var powerYears = ' + JSON.stringify(finalData));
	var winPrint2 = window.open('', '', 'left=0,top=0,width=800,height=600,toolbar=0,scrollbars=0,status=0');
	winPrint2.document.write('var powerYearsArea = ' + JSON.stringify(finalDataArea));
	winPrint.document.close();
	winPrint2.document.close();
}

function combineYearData() {
	// create dict
	var yearData = {};
	for (power in powerYears) {
		yearData[power] = 0;
		for (year in powerYears[power]) {
			yearData[power] += powerYears[power][year]
		}
		console.log(yearData[power])
	}
	
	// open and flatten data structure in new window
	// select all and paste into
	// https://jsonformatter.org/
	var winPrint = window.open('', '', 'left=0,top=0,width=800,height=600,toolbar=0,scrollbars=0,status=0');
	winPrint.document.write(JSON.stringify(yearData));
	winPrint.document.close();
}