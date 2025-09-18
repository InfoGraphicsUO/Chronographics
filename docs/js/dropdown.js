 // DROP DOWN MENUS
$(document).ready(function(){

//--------------------------------- regime selector ---------------------------------//	
	// get regimes from JSON
	$.each(powerVar, function (key, value) {
		regimes.push(value.properties.regime);
	});
	// delete duplicates
	regimes = $.uniqueSort(regimes);
	// sort regime alphabetical
	regimes.sort();

	// adds regimes to html dropdown
	$.each(regimes, function (key, value) {
		if (value != "FOOTER"){
                $("#regimeSelector").append($('<option></option>').val(value).html(value));
        }
	});

	// when selecting a regime
	$('#regimeSelector').change(function () {
		console.log("Selection")
		clearSelection(true); // true so that the selector isn't cleared as well
		// set label
		d3.select("#power_map").text("Empire: " + $("#regimeSelector").val())
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

//--------------------------------- sort selector ---------------------------------//	
 	var sorts = {"Original":1, "Saracens":2, "Alphabetical":3};
	
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
