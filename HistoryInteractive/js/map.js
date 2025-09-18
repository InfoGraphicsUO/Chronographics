// set map svg
if (document.getElementById("map").offsetWidth < mapWidth){
    mapWidth = document.getElementById("map").offsetWidth;
    mapHeight = mapWidth /2;
}

var mapSVG = d3.select( "#map" )
    .append( "svg" )
    .attr( "width", mapWidth)
    .attr( "height", mapHeight)

var mapContainer = mapSVG.append("g");

if (page=="twoCharts.html"){
    //if d3.v3
    var zoomMap = d3.zoom()
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
} else {
    //if d3.v3
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
}


// pencil and fill from // ** glow ** from https://www.visualcinnamon.com/2016/06/glow-filter-d3-visualization.html
//Container for the gradients
var defs = mapSVG.append("defs");

var colors = [];

function transparent(color, alpha) {
  var rgb = d3.rgb(color);
  return "rgba(" + [rgb.r, rgb.g, rgb.b, alpha].join(",") + ")";
}

// ** end color  ** //

// ** glow ** from https://www.visualcinnamon.com/2016/06/glow-filter-d3-visualization.html

////Container for the gradients
//var defs = mapSVG.append("defs");
//
////Filter for the outside glow
////note: double size and recenter filter canvas size so glow is not cut off see: https://stackoverflow.com/questions/6555600/gaussian-blur-cutoff-at-edges
// var filter = defs.append("filter")
//     .attr("id","glow")
//     .attr("width","200%")
//     .attr("height","200%")
//     .attr("x","-100%")
//     .attr("y","-100%");

// filter.append("feGaussianBlur")
//     .attr("stdDeviation","0.5")
//     .attr("result","coloredBlur"); // why is this red?

// var feMerge = filter.append("feMerge");

// feMerge.append("feMergeNode")
//     .attr("in","coloredBlur");
// feMerge.append("feMergeNode")
//     .attr("in","SourceGraphic");

// // ** end glow ** //

// then, call the zoom behavior on the svg element, which will add
// all of the necessary mouse and touch event handlers.
// remember that if you call this on the <g> element, the even handlers
// will only trigger when the mouse or touch cursor intersects with the
// <g> elements' children!
//mapSVG.call(zoomMap).on("dblclick.zoom", null);

//
//var projection = d3.geoAlbersUsa();
//var path = d3.geoPath().projection(projection);

if (page == "twoCharts.html"){
    //if d3 v4  and "https://d3js.org/d3-geo-projection.v2.min.js"
    var mapProjection = d3.geoVanDerGrinten4()  // choose the projection
	.scale(70) 
	.translate([mapWidth / 2, mapHeight / 1.65])
	.precision(.1);
    
    var mapPath = d3.geoPath()
	.projection(mapProjection)
    
    var graticule = d3.geoGraticule();
} else {
    //if d3 v3 and "https://d3js.org/d3-geo-projection.v2.min.js"
    //  note: for "dist/js//d3.geo.projection.v0.min.js" use d3.geo.vanDerGrinten4()
	var mapProjection = d3.geoVanDerGrinten4()  // choose the projection
		.scale(70) 
		.translate([mapWidth / 2, mapHeight / 1.65])
		.precision(.1);
	   
	   var mapPath = d3.geo.path()
		.projection(mapProjection);
	   var graticule = d3.geo.graticule();

}




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
    .attr("opacity", 0.9)
    .attr("d", mapPath);

if (page == "twoCharts.html"){
    var regionGroup = mapContainer.append( "g" );
} else {
    var samplePlaceGroup = mapContainer.append( "g" );
}

var active = d3.select(null);


var fillCol
if (page == "biographyMap.html"){
    fillCol = selectedGuyColor;
} else {
    fillCol = powerColors[1]; 
}


// clip each place
//  samplePlaceData.forEach(function(d,i){
//    // circular <use> doesn't work in FF
//    defs.append("clipPath")
//      .attr("id", "clip" + i)
//      .append("path")
//        .attr("d", path(d));
//
//  });

 if (page == "twoCharts.html"){
    // insert region polygons
    // NOTE if winding needs to be reversed, feature by feature: https://observablehq.com/@bumbeishvili/rewind-geojson
    regionGroup.selectAll("path").data(regionBioData).enter().append("path" )
        .attr( "d", mapPath )
        .attr( "fill", mapLandColor[1])
        .attr( "stroke", mapLandColor[0])
        .attr( "stroke-width",mapLineWidth)
        // .style("filter", "url(#glow)") // applying glow to features


    regionGroup.selectAll("path")   
//    .on("mousemove", mapMove)
//	.on("mouseout", mapOut)
//	.on("mouseover", function(d) {d3.select(this).style("cursor", "pointer");})
	.on("click", function(d) {
        console.log("region" + d.properties.Region)
 
        drawRegion(d.properties.Region)// filter chart
        
        regionGroup.selectAll("path")
			.style( "fill", mapLandColor[1]) // reset region color
//			.attr( "stroke-width","0.75")
			.filter(function(d2) { 
				return d2.properties.Region == d.properties.Region})
			.style("fill", placeColors[2])		// selected
    
        // ZOOM TO BOUNDING BOX
		// https://bl.ocks.org/mbostock/4699541
		// try to implement https://bl.ocks.org/mbostock/9656675
		if (active.node() === this) return reset();		// handling click again stuff
		active.classed("active", false);
		active = d3.select(this).classed("active", true);

		// get bounding box
		var bounds = mapPath.bounds(d),
			dx = bounds[1][0] - bounds[0][0],
			dy = bounds[1][1] - bounds[0][1],
			x = (bounds[0][0] + bounds[1][0]) / 2,
			y = (bounds[0][1] + bounds[1][1]) / 2,
			scale = Math.min((.5 / Math.max(dx / mapWidth, dy / mapHeight)), 20),  // max zoom is 20
			translate = [mapWidth / 2 - scale * x, mapHeight / 2 - scale * y];

//		// zoom to bounding box so that rescaling will be smooth on mouse scroll 
//		zoomMap.translate(translate).scale(scale);

		// transition to bounding box on map
		mapContainer.transition()
			.duration(750)
			.style("stroke-width", 1.5 / scale + "px")
			.attr("transform", "translate(" + translate + ")scale(" + scale + ")");
        
    });
     
 } else {
//    console.log("hi")
   samplePlaceGroup.selectAll("path").data(samplePlaceData).enter().append("path" )
        .attr( "d", mapPath )
         .style("fill", function(d){
           return transparent(fillCol, 0.95);
         })

    samplePlaceGroup.selectAll("path")   
    .on("mousemove", mapMove)
	.on("mouseout", mapOut)
	.on("mouseover", function(d) {d3.select(this).style("cursor", "pointer");})
	.on("click", function(d) {
        console.log("map clicked")
		// UPDATE LABLELS
		if (d3.event.defaultPrevented) return;
		clearSelection();
		// set labels
		// d3.select("#place_label").text("Place: " + d.properties.name+" ")
		//d3.select("#place_map").text(d.properties.name)
        $("#placeSelector").val(d.properties.name) // set place selector
        clickID = d.properties.placeID
		setDescriptiveText();

    
		// UPDATE MAP COLORS
		// reset other places
		samplePlaceGroup.selectAll("path")
			.style( "stroke", mapLandColor[0])
			.style( "stroke-width",mapLineWidth)
			.style("fill", mapLandColor[1])

//                console.log("hi")
        
		d3.select(this)
			.style( "stroke",  mapLandColor[0])
			.style( "stroke-width",mapLineWidth)
			.style("fill",placeColors[2]);


		//UPDATE CHART COLORS
		placesGroup.selectAll("path")
		  .attr( "fill", "rgba(0,0,0,0.01)" )
		  .attr( "stroke", "transparent")
		  .attr( "stroke-width","0")
			.filter(function(rows) {

//                console.log(d.properties.placeID)
				return rows.properties.placeGRIDCODE == clickID;})
				.attr("stroke", placeColors[2])		// selected
				.attr("stroke-width","1");

        

		// ZOOM TO BOUNDING BOX
		// https://bl.ocks.org/mbostock/4699541
		// try to implement https://bl.ocks.org/mbostock/9656675
		if (active.node() === this) return reset();		// handling click again stuff
		active.classed("active", false);
		active = d3.select(this).classed("active", true);

		// get bounding box
		var bounds = mapPath.bounds(d),
			dx = bounds[1][0] - bounds[0][0],
			dy = bounds[1][1] - bounds[0][1],
			x = (bounds[0][0] + bounds[1][0]) / 2,
			y = (bounds[0][1] + bounds[1][1]) / 2,
			scale = Math.min((.5 / Math.max(dx / mapWidth, dy / mapHeight)), 20),  // max zoom is 20
			translate = [mapWidth / 2 - scale * x, mapHeight / 2 - scale * y];

		// zoom to bounding box so that rescaling will be smooth on mouse scroll 
		zoomMap.translate(translate).scale(scale);

		// transition to bounding box on map
		mapContainer.transition()
			.duration(750)
			.style("stroke-width", 1.5 / scale + "px")
			.attr("transform", "translate(" + translate + ")scale(" + scale + ")");

		//findPage()
		setDescriptiveText();
	});

 } 

function selectRegion(selectedRegion){
    if(selectedRegion==null){
        resetRregionMap();
                // update label
        if($('#region_label').length > 0) {
          document.getElementById("region_label").innerHTML ="Any  ";
         }
    } else {
        console.log(selectedRegion)
        //UPDATE CHART COLORS
		regionGroup.selectAll("path")
			.attr( "fill", mapLandColor[1]) // reset region color
			.attr( "stroke", mapLandColor[0])
			.attr( "stroke-width",mapLineWidth)

			.filter(function(d) { 
                if( d.properties.Region == selectedRegion){
            
                    // get bounding box
                    var bounds = mapPath.bounds(d),
                        dx = bounds[1][0] - bounds[0][0],
                        dy = bounds[1][1] - bounds[0][1],
                        x = (bounds[0][0] + bounds[1][0]) / 2,
                        y = (bounds[0][1] + bounds[1][1]) / 2,
                        scale = Math.min((.5 / Math.max(dx / mapWidth, dy / mapHeight)), 20),  // max zoom is 20
                        translate = [mapWidth / 2 - scale * x, mapHeight / 2 - scale * y];

            //		// zoom to bounding box so that rescaling will be smooth on mouse scroll 
         //   		zoomMap.translate(translate).scale(scale);

                    // transition to bounding box on map
                    mapContainer.transition()
                        .duration(750)
                        .style("stroke-width", 1.5 / scale + "px")
                        .attr("transform", "translate(" + translate + ")scale(" + scale + ")");
            
                }
                return d.properties.Region == selectedRegion
            })
             .attr("fill", placeColors[2])		// selected
			 .attr( "stroke", mapLandColor[2]) // selected
			 .attr( "stroke-width",mapLineWidth/2) // selected
        
        // update label
        if($('#region_label').length > 0) {
          document.getElementById("region_label").innerHTML =selectedRegion;
         }
    }
}

// insert people dots
function drawPeopleOnMap(thesePeople){
    var bioPeople = mapContainer.append( "g" ).attr("class", "mapPeopleGroup");
bioPeople.selectAll("path").data(thesePeople).enter().append("circle")
        .attr("class", "mapPeople")
        .attr("r", "0.4px")
		.attr("fill", function(d) { return lookupSectionColor(d["OnChartCategory"]);}) // green fill
        .attr( "stroke", "maroon")
		.attr( "stroke-width", 0.05)
        .attr("transform", function(d) {return "translate(" + mapProjection([d["lon"],d["lat"]]) + ")";})       
        .on("mouseover", function(d) {
           var GP;
			    if (d["gender"] != null && d["profession"] != null){
			        GP = " (" + d["gender"] + ", " + lookupProfessionCode(d["profession"]) + ")";
			    } else if(d["gender"] != null && d["profession"] == null){
			        GP = " (" + d["gender"] + ")";
			    } else if(d["gender"] == null && d["profession"] != null){
			        GP = " (" + lookupProfessionCode(d["profession"]) + ")";
			    } else GP = "";
		    toolTip.transition()
		         .duration(100)    
		         .style("opacity", .9); 
               
	    	toolTip.transition()
				.duration(100)    
				.style("opacity", .9); 
	    	toolTip.html(d["Name"] + "<br/>" + d["OnChartCategory"] + " " + GP)  
				.style("left", (d3.event.pageX) + "px")   
				.style("top", (d3.event.pageY - 28) + "px");
	    })
	    .on("mouseout", mouseOut);
}


function clearMapPeople(){ 
    d3.selectAll(".mapPeopleGroup").selectAll(".mapPeople").remove();
}

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

function resetRregionMap() {
	active.classed("active", false);
	active = d3.select(null);
	mapContainer.transition()
		.duration(750)
		.style("stroke-width", "1.5px")
		.attr("transform", "");
    
    regionGroup.selectAll("path")
			.attr( "fill", mapLandColor[1]) // reset region color
}