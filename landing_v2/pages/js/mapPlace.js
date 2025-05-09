// set map svg
var mapSVG = d3.select( "#map" )
	.append( "svg" )
	.attr( "width", mapWidth)
	.attr( "height", mapHeight),

mapContainer = mapSVG.append("g");

var zoomMap = d3.behavior.zoom()
	// only scale up, e.g. between 1x and 20x
	.scaleExtent([1, 20])
	.on("zoom", function() {
		// the "zoom" event populates d3.event with an object that has
		// a "translate" property (a 2-element Array in the form [x, y])
		// and a numeric "scale" property
		var e = d3.event,
		// now, constrain the x and y components of the translation by the
		// dimensions of the viewport
		tx = Math.min(0, Math.max(e.translate[0], mapWidth - mapWidth * e.scale)),
		ty = Math.min(0, Math.max(e.translate[1], mapHeight - mapHeight * e.scale));
		// then, update the zoom behavior's internal translation, so that
		// it knows how to properly manipulate it on the next movement
		zoomMap.translate([tx, ty]);
		// and finally, update the <g> element's transform attribute with the
		// correct translation and scale (in reverse order)
		mapContainer.attr("transform", [
			"translate(" + [tx, ty] + ")",
			"scale(" + e.scale + ")"
		].join(" "));
	});


// ** glow ** from https://www.visualcinnamon.com/2016/06/glow-filter-d3-visualization.html
//Container for the gradients
var defs = mapSVG.append("defs");

//Filter for the outside glow
//note: double size and recenter filter canvas size so glow is not cut off see: https://stackoverflow.com/questions/6555600/gaussian-blur-cutoff-at-edges
var filter = defs.append("filter")
    .attr("id","glow")
    .attr("width","400%")
    .attr("height","400%")
    .attr("x","-200%")
    .attr("y","-200%");

filter.append("feGaussianBlur")
    .attr("stdDeviation","1.0")
    .attr("result","coloredBlur");

var feMerge = filter.append("feMerge");

feMerge.append("feMergeNode")
    .attr("in","coloredBlur");
feMerge.append("feMergeNode")
    .attr("in","SourceGraphic");

// ** end glow ** //

// then, call the zoom behavior on the svg element, which will add
// all of the necessary mouse and touch event handlers.
// remember that if you call this on the <g> element, the even handlers
// will only trigger when the mouse or touch cursor intersects with the
// <g> elements' children!
mapSVG.call(zoomMap).on("dblclick.zoom", null);

var mapProjection = d3.geo.vanDerGrinten4()  // choose the projection
	.scale(70) 
	.translate([mapWidth / 2, mapHeight / 1.65])
	.precision(.1);

var mapPath = d3.geo.path()
	.projection(mapProjection);

var graticule = d3.geo.graticule();

// insert sphere and graticule
mapContainer.append("path")  
	.datum({type: "GeometryCollection"})
	.attr("fill", "transparent")
	.attr("stroke", mapLandColor[0])
	.attr("stroke-width", "3px")
	.datum(graticule)
	.attr("stroke", "#777")
	.attr("stroke-width", ".5px")
	.attr("stroke-opacity", ".5")
	.attr("d", mapPath);

// insert land mass
mapContainer.insert("path", ".graticule")
    .datum(topojson.feature(world, world.objects.land))
    .attr("fill", mapLandColor[0])
    .attr("opacity", 0.85)
    .attr("d", mapPath);

var samplePlaceGroup = mapContainer.append( "g" );

var active = d3.select(null);

// insert place polygons
samplePlaceGroup.selectAll("path").data(samplePlaceData).enter().append("path" )
	.attr( "d", mapPath )
	.attr( "fill", powerColors[1]  )
	.attr( "stroke", mapLandColor[0])
	.attr( "stroke-width",mapLineWidth)
	.style("filter", "url(#glow)") // applying glow to features
	.on("mousemove", mapMove)
	.on("mouseout", mapOut)
	.on("mouseover", function(d) {d3.select(this).style("cursor", "pointer");})
	.on("click", function(d) {
		// UPDATE LABLELS
		if (d3.event.defaultPrevented) return;
		var tempName;
		placesGroup.selectAll("path")
				.filter(function(row) { 
					return row.properties.placeGRIDCODE == d.properties.placeID;})
					.each(function(rows) {
						tempName = rows.properties.name;
					})
		if  (!selectedPlaces.includes(tempName) && selectedPlaces.length<5) {
			selectedPlaces.push(tempName)
			// UPDATE MAP COLORS
			d3.select(this)
				.attr( "stroke",  mapLandColor[0])
				.attr( "stroke-width",mapLineWidth)
				.attr("fill",mapLandColor[2]);
			
            console.log(d.properties.placeID;)
            
			//UPDATE CHART COLORS AND ADD PLACE LABEL
			placesGroup.selectAll("path")
				.filter(function(row) { 
					return row.properties.placeGRIDCODE == d.properties.placeID;})
					.attr("stroke", placeColors[2])		// selected
					.attr("stroke-width","1")
					.each(function(rows) {
						numbersGroup.append('text')
						    .attr("class", "placeNum")
					        .attr("x", 0)
					        .attr("y", yScale(rows.properties.CENTROID_Y)-5)
					        .style("fill", placeColors[2])
					        .text(selectedPlaces.length);
					})
			// set labels
			d3.select("#place_label").text(d3.select("#place_label").text() + "    (" + selectedPlaces.length +")"+ tempName + " ")
		    d3.select("#place_map").text("Selected Places")
		    d3.select("#graph_label").text("");
			drawPlaceBar(selectedPlaces);
			drawWords(selectedPlaces);

		}
	});

// click again on same polygon to zoom out
function reset() {
	active.classed("active", false);
	active = d3.select(null);
	zoomMap.translate([0, 0]).scale(1);
	mapContainer.transition()
		.duration(750)
		.style("stroke-width", "1.5px")
		.attr("transform", "");
}