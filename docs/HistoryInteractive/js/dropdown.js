 // DROP DOWN MENUS
$(document).ready(function(){

//--------------------------------- regime selector ---------------------------------//	
	// get regimes from JSON
	$.each(powerVar, function (key, value) {
        // add regimes *not* including "-NE" aka no empire
        if(!value.properties.regime.includes("-NE")){
		regimes.push(value.properties.regime);
        }
	});
	// delete duplicates
	regimes = $.uniqueSort(regimes);
	// sort regime alphabetical
	regimes.sort();

	// adds regimes to html dropdown
	$.each(regimes, function (key, value) {
		if (value != "FOOTER"){ // skip any regimes named "FOOTER"
               $("#regimeSelector").append($('<option></option>').val(value).html(value));
        }
	});

	// when selecting a regime
	$('#regimeSelector').change(function () {
		clearSelection(true); // true so that the selector isn't cleared as well
		// set label
		d3.select("#power_label").text("Empire: " + $("#regimeSelector").val())
		// select on chart
		powersGroup.selectAll("path")
			.filter(function(d){return (d.properties.regime == $("#regimeSelector").val());})
				.attr("stroke", powerColors[0] )
				.attr( "stroke-width","2")
	});
	// prevent from closing on click (fixes bug)
	$('#regimeSelector').on("click", function(e){
	    e.stopPropagation();
	});

//--------------------------------- place selector ---------------------------------//	
	// get places from JSON
	$.each(placeVar, function (key, value) {
		places.push(value.properties.name);
	});
	// delete duplicates
	places = $.uniqueSort(places);
	// sort places alphabetical
	places.sort();

	// adds places to html dropdown
	$.each(places, function (key, value) {
        if(!value.includes("-NE") && !parseInt(value)){ // skip any places with "-NE" or just an int
            $("#placeSelector").append($('<option></option>').val(value).html(value));
//            $("#placeSelector2").append($('<option></option>').val(value).html(value));
        }
	});

	// when selecting a place
	$('#placeSelector').change(function () {
        var thisSelectedPlace = $("#placeSelector").val()
        
        console.log($("#placeSelector").val())
        d3.select("#place_map").text(thisSelectedPlace)
        
        
		// set label
//		// only do stuff if not already done and not more than 5
//	if  (!selectedPlaces.includes($("#placeSelector").val()) && selectedPlaces.length<5) {
//	 	selectedPlaces.push($("#placeSelector").val())
//        
//        
		// add number label to chart
		

//		// add the selected place to this list
//		d3.select("#place_label").text(d3.select("#place_label").text() + "    (" + selectedPlaces.length +")"+ $("#placeSelector").val() + " ")
        
        
	   //SET descriptive text and clear regime and year
       setDescriptiveText();
  	   x = document.getElementById("regimeSelector");
  	   x.options[0].text = "click on map/chart or select here";
       d3.select("#year_label").text("click chart to select")
       
        
        
        	// Clear click line/dot 
	   d3.select(".verticalLine").attr("stroke", "transparent")
	   d3.select(".dot").attr("fill", "transparent")
	   d3.select(".horizontalLine").attr("fill", "transparent")
        
        
        // UPDATE CHART COLORS
		placesGroup.selectAll("path")
        	.attr( "stroke", "transparent") // reset places rows
			.attr( "stroke-width","0.75")
			.filter(function(d){return (d.properties.name == $("#placeSelector").val());}) // selected
				.attr("stroke", placeColors[2])		// selected
				.attr("stroke-width","1"); // selected

        
        // give the map place selected colors
		samplePlaceGroup.selectAll("path")
        	.style( "stroke", mapLandColor[0]) // reset other places
			.style( "stroke-width",mapLineWidth) // reset other places
			.style("fill", mapLandColor[1]) // reset other places
				.filter(function(d) { return (d.properties.name == $("#placeSelector").val());}) // selected
                 .style( "stroke",  mapLandColor[0]) // selected
			     .style( "stroke-width",mapLineWidth) // selected
			     .style("fill",placeColors[2]) // selected
                 .each(function(poly) {
                    console.log(poly)
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
        })

//		//GRAPH STUFF ...
//		d3.select("#graph_label").text("");
//		drawPlaceBar(selectedPlaces);
//	}
//	});
//		// when selecting a regime
//	$('#placeSelector2').change(function () {
//		// set label
//		// only do stuff if not already done and not more than 5
//	if  (!selectedPlaces.includes($("#placeSelector2").val()) && selectedPlaces.length<5) {
//	 	selectedPlaces.push($("#placeSelector2").val())
//		// add number label to chart
//		
//
//		// add the selected place to this list
//		d3.select("#place_label").text(d3.select("#place_label").text() + "    (" + selectedPlaces.length +")"+ $("#placeSelector2").val() + " ")
//
		//give the selected place a stroke
		placesGroup.selectAll("path")
			.filter(function(d){return (d.properties.name == $("#placeSelector").val());})
				.attr("stroke", placeColors[2])		// selected
				.attr("stroke-width","1")
				.each(function(place) {
					numbersGroup.append('text')
					    .attr("class", "placeNum")
				        .attr("x", 0)
				        .attr("y", yScale(place.properties.CENTROID_Y)-5)
				        .style("fill", placeColors[2])
				        .text(selectedPlaces.length);

				    samplePlaceGroup.selectAll("path")
						.filter(function(rows) { return rows.properties.placeID == place.properties.placeGRIDCODE;})
						.attr( "stroke", placeColors[1])
						.attr( "stroke-width",mapLineWidth*4)
						.attr("fill", mapLandColor[2])

				});
//
//		//GRAPH STUFF ...
//		d3.select("#graph_label").text("");
//		drawPlaceBar(selectedPlaces);
//	}
//	});
	// prevent from closing on click (fixes bug)
	$('#placeSelector').on("click", function(e){
	    e.stopPropagation();
	});
//	$('#placeSelector2').on("click", function(e){
//	    e.stopPropagation();
//	});

//--------------------------------- era selector ---------------------------------//	
 	var eras = {"All Eras":1, "Tribes":2, "Empires":3, "Nations":4, "Middle Ages":5, "Late Antiquity":6};
	
	// adds eras to html dropdown
	$.each(eras, function (key, value) {
		$("#eraSelector").append($('<option></option>').val(value).html(key));
	});

	// update era
	$('#eraSelector').change(function () {
		updateEra($("#eraSelector").val())
	});


	// prevent from closing on click (fixes bug)
	$('#eraSelector').on("click", function(e){
	    e.stopPropagation();
	});

//--------------------------------- region selector ---------------------------------//	
    // for selecting entire regions. Not currently in use
    
 	var regions = {"All Regions":1, "America":2, "Africa":3, "China":4, "India":5, "Persia":6, "Turky in Asia":7,"Turky":8, "Germany":9, "Turky in Europe":10, "Italy":11, "France":12, "Spain":13,"Great Britain":14, "Russia":15, "Poland":16, "Northern Crown":17};
//	
//	// adds regions to html dropdown
//	$.each(regions, function (key, value) {
//        $("#regimeSelector").append($('<option></option>').val(value).html(value));
//	});
//
//	// update 
//	$('#regionSelector').change(function () {
//		updateRegion($("#regionSelector").val())
//	});
//
//
//	// prevent from closing on click (fixes bug)
//	$('#regionSelector').on("click", function(e){
//	    e.stopPropagation();
//	});


//--------------------------------- sort selector ---------------------------------//	
 	// var sorts = {"Original":1, "Saracens":2, "Alphabetical":3};
 	var sorts = {"Original":1, "Saracens":2};
	
	// adds regions to html dropdown
	$.each(sorts, function (key, value) {
		$("#sortSelector").append($('<option></option>').val(value).html(key));
	});

	// update 
	$('#sortSelector').change(function () {
		updateData($("#sortSelector").val())
	});


	// prevent from closing on click (fixes bug)
	$('#sortSelector').on("click", function(e){
	    e.stopPropagation();
	});


//--------------------------------- dropdown functionality ---------------------------------//	
	$('.dropdown-submenu a.sub').on("click", function(e){
		$('.dropdown-submenu>ul').hide();
		$(this).next('ul').slideToggle(300);
		e.stopPropagation();
		e.preventDefault();
	});

	$('.dropdown-toggle').on("click", function(e){
	    $('.dropdown-submenu>ul').hide();
	});

	$('.dropdown-menu').on("click", function(e){
	    e.stopPropagation();
	});

	$('.dropdown-menu > li').click(function(e) { // limit click to children of mainmenue
        var $el = $('ul',this); // element to toggle
        $('.dropdown-menu > li > ul').not($el).slideUp(); // slide up other elements
        $el.stop(true, true).slideToggle(300); // toggle element
        return false;
    });

    $('.dropdown-menu > li > ul > li').click(function(e) {
        e.stopPropagation();  // stop events from bubbling from sub menu clicks
    });

    $("#wrapper").toggleClass("toggle");

});
