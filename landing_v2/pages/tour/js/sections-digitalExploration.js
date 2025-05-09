/**
 * scrollVis - encapsulates
 * all the code for the visualization
 * using reusable charts pattern:
 * http://bost.ocks.org/mike/chart/
 */

//added the burnt orange color
var tourLineColor = '#CC5500';
var tourLineWidth = 1.5;

var scrollVis = function() {
	// constants to define the size
	// and margins of the vis area.
	var width = 924;//600;
	var height = 700;//520;
	var margin = {top:0, left:20, bottom:40, right:10};

	// Keep track of which visualization
	// we are on and which was the last
	// index activated. When user scrolls
	// quickly, we want to call all the
	// activate functions that they pass.
	var lastIndex = -1;
	var activeIndex = 0;

	// main svg used for visualization
	var svg = null;

	// d3 selection that will be used
	// for displaying visualizations
	var g = null;
    
    
    // how fast everything should fade
    var fadeDuration = 400;


	// When scrolling to a new section
	// the activation function for that
	// section is called.
	var activateFunctions = [];
	// If a section has an update function
	// then it is called while scrolling
	// through the section with the current
	// progress through the section.
	var updateFunctions = [];

	/**
	* chart
	*
	* @param selection - the current d3 selection(s)
	*  to draw the visualization in. For this
	*  example, we will be drawing it in #vis  -> Note changed #vis to #intro-vis 
	*/
    var chart = function(selection) {
        selection.each(function(d) {
            // create svg and give it a width and height
            svg = d3.select(this).selectAll("svg").data([d]);
            svg.enter().append("svg").append("g");
            svg.attr("id", "tourSVG");

            svg.attr("width", width + margin.left + margin.right);
            svg.attr("height", height + margin.top + margin.bottom);


            // this group element will be used to contain all
            // other elements.
            g = svg.select("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            setupVis();
            setupSections();
        });
    };

	/**
	* setupVis - creates initial elements for all
	* sections of the visualization.
	*
	* @param wordData - data object for each word.
	* @param fillerCounts - nested data that includes
	*  element for each filler word type.
	* @param histData - binned histogram data

	*/
    setupVis = function() {
        // axis
//        g.append("g")
//            .attr("class", "x axis")
//            .attr("transform", "translate(0," + height + ")")
//            .call(xAxisBar);
//        g.select(".x.axis").style("opacity", 0);

        // axis
//        g.append("g")
//            .attr("class", "y axis")
//            .attr("transform", "translate(" + (width - margin.left) + "," + (height - margin.bottom ) + ")")
//            .call(yAxisHist);
//        g.select(".y.axis").style("opacity", 0);

        //openvis title
        g.append("image")
            .attr("class", "img openvis-title")
         	.attr("xlink:href", "img/digitizing_Process/digitize-process.png")
        	.attr("width", width)
        	.attr("height", height)
        	.attr("stroke", "black")
        	.style("border", "black");
        g.selectAll(".openvis-title")
            .attr("opacity", 0);

        g.append("image")
            .attr("class", "img excel-screenshot")
            .attr("xlink:href", "img/digitizing_Process/digitizingTour_excel.png")
            .attr("width", width)
            .attr("height", height)
            .attr("stroke", "black")
            .style("border", "black");
        g.selectAll(".excel-screenshot")
            .attr("opacity", 0);

        g.append("image")
            .attr("class", "img excel-Heruli")
            .attr("xlink:href", "img/digitizing_Process/digitizingTour_highlightedRegimes.png")
            .attr("width", width)
            .attr("height", height)
            .attr("stroke", "black")
            .style("border", "black");
        g.selectAll(".excel-Heruli")
            .attr("opacity", 0);

        g.append("image")
            .attr("class", "img gisMerged")
            .attr("xlink:href", "img/digitizing_Process/compare_gis_scan.png")
            .attr("width", width)
            .attr("height", height)
            .attr("stroke", "black")
            .style("border", "black");
        g.selectAll(".gisMerged")
            .attr("opacity", 0);

        g.append("image")
            .attr("class", "img showGraphical")
            .attr("xlink:href", "img/digitizing_Process/ascii-to-poly.png")
            .attr("width", width)
            .attr("height", height)
            .attr("stroke", "black")
            .style("border", "black");
        g.selectAll(".showGraphical")
            .attr("opacity", 0);

        g.append("image")
            .attr("class", "img cleanUp")
            .attr("xlink:href", "img/digitizing_Process/clean-up.png")
            .attr("width", width)
            .attr("height", height)
            .attr("stroke", "black")
            .style("border", "black");
        g.selectAll(".cleanUp")
            .attr("opacity", 0);
        
//        g.append("iframe")
//            .attr("class", "img ArcMap")
//            .attr("src", "https://uo-online.maps.arcgis.com/apps/instant/basic/index.html?appid=36c8f8057b08492d91c9fd4738ba12f8")  //src for  frame
//            .attr("width", 500)
//            .attr("height", 500);
//        g.selectAll(".ArcMap")
//            .attr("opacity", 0);



         g.append("image")
             .attr("class", "img ArcMap")
             .attr("xlink:href", "img/digitizing_Process/PriestleyInteractive.png")
             .attr("width", width)
             .attr("height", height)
             .attr("stroke", "black")
             .style("border", "black");
         g.selectAll(".ArcMap")
             .attr("opacity", 0);

        g.append("image")
            .attr("class", "img compare")
            .attr("xlink:href", "img/digitizing_Process/final-comparison.png")
            .attr("width", width)
            .attr("height", height)
            .attr("stroke", "black")
            .style("border", "black");
        g.selectAll(".compare")
            .attr("opacity", 0);


        // empire outline

        // need to set scale for drawing polygon
        var scaleX = d3.scale.linear()
            .domain([0,50]) //Give appropriate range in the scale
            .range([0,width]);

        var scaleY = d3.scale.linear()
            .domain([0,50]) //Give appropriate range in the scale
            .range([height,0]);

        var poly = [
        	{"x":18, "y":27},
            {"x":18,"y":25},
            {"x":15,"y":24},
            {"x":17,"y":22},
            {"x":19.5,"y":22},
            {"x":19.5,"y":19.5},
            {"x":17,"y":19},
            {"x":17,"y":16.5},
            {"x":21,"y":16.5},
            {"x":22,"y":14.5},
            {"x":26.5,"y":14.5},
            {"x":26.5,"y":27}
        ];

        var poly2 = [
                {"x":20, "y":39},
                {"x":26, "y":39},
                {"x":26, "y":37},
                {"x":20, "y":37}
            ];

        var poly3 = [
                {"x":19, "y":30.5},
                {"x":28, "y":30.5},
                {"x":28, "y":31.5},
                {"x":19, "y":31.5}
            ];

      	// map to scale
      	var newpoly = poly.map(function(d) { return [scaleX(d.x),scaleY(d.y)]; });

        var newpoly2 = poly2.map(function(d) { return [scaleX(d.x),scaleY(d.y)]; });

        var newpoly3 = poly3.map(function(d) { return [scaleX(d.x),scaleY(d.y)]; });

    	g.selectAll("polygon")
    		.data([newpoly, newpoly2, newpoly3])
    	    .enter().append("polygon")
    	    .attr("class", "empire-title")
    	    .attr("points",function(d) {
    	        // d is 2D array
    	        // default toString behavior for Array is join with comma        
            	return d.join(" ");
    	    })
    	    // .attr("stroke", "red")
            .attr("stroke", tourLineColor)
    	    .attr("stroke-width", 3)
    	    .attr("fill", "transparent");

        g.selectAll(".empire-title")
            .attr("opacity", 0);

        // Biography
       g.append("image")
            .attr("class", "img bio")
            .attr("xlink:href", "img/digitizing_Process/bioLineRules2.JPG")
            .attr("width", width)
            .attr("height", height)
            .attr("stroke", "black")
            .style("border", "black");
        g.selectAll(".bio")
            .attr("opacity", 0);
        
        // Life
       g.append("image")
            .attr("class", "img life")
            .attr("xlink:href", "img/digitizing_Process/bioLineRules.JPG")
            .attr("width", width)
            .attr("height", height)
            .attr("stroke", "black")
            .style("border", "black");
        g.selectAll(".life")
            .attr("opacity", 0);
        
        
//        // digital chart
//
//        g.append("image")
//            .attr("class", "img chart")
//         	.attr("xlink:href", "tour/img/new2.PNG")
//        	.attr("width", width)
//        	.attr("height", height);
//
//
//       	g.selectAll(".chart")
//            .attr("opacity", 0);
//
//
//         // digital chart selection
//        g.append("image")
//            .attr("class", " img select")
//         	.attr("xlink:href", "tour/img/select.gif")
//        	.attr("width", width)
//        	.attr("height", height);
//
//       	g.selectAll(".select")
//            .attr("opacity", 0);
//
//        // map
//        g.append("image")
//            .attr("class", "img map-title")
//         	.attr("xlink:href", "tour/img/map4.gif")
//        	.attr("width", width)
//        	.attr("height", height);  
        
//        g.selectAll(".map-title")
//            .attr("opacity", 0);

//        // bar chart
//        g.append("image")
//            .attr("class", "img bar")
//            .attr("xlink:href", "tour/img/placeBar.PNG")
//            .attr("width", width)
//            .attr("height", height)
//            .attr("opacity", 0);

        // histogram
//        var hist = g.selectAll(".hist").data(barData2);
//        hist.enter().append("rect")
//        .attr("class", "hist")
//            .attr("x", function(d) { return xHistScale(d.key); })
//            .attr("y", height - margin.bottom)
//            .attr("height", height - margin.bottom)
//            .attr("width", xHistScale.rangeBand())
//            .attr("fill", function(d, i) { return barData2[i].color; })
//            .attr("opacity", 0);
//     
//        g.append("text")
//        	.attr("class", "hist-text sub-title")
//        	.attr("x", width / 2)
//            .attr("y", height + 30)
//            .text("10 Largest Empires by Row Height");
//
//        g.selectAll(".hist-text")
//            .attr("opacity", 0);

//       var gradient = svg.append("defs")
//            .append("linearGradient")
//            .attr("id", "gradient")
//            .attr("x1", "100%")
//            .attr("y1", "0%")
//            .attr("x2", "100%")
//            .attr("y2", "100%")
//            .attr("spreadMethod", "pad");
//
//    	gradient.append("stop")
//    	    .attr("offset", "0%")
//    	    .attr("stop-color", "#FFF")
//    	    .attr("stop-opacity", 1);
//
//    	gradient.append("stop")
//    	    .attr("offset", "100%")
//    	    .attr("stop-color", "#EADBC0")
//    	    .attr("stop-opacity", 1);
//
//    	var gradient2 = svg.append("defs")
//            .append("linearGradient")
//            .attr("id", "gradient2")
//            .attr("x1", "100%")
//            .attr("y1", "100%")
//            .attr("x2", "0%")
//            .attr("y2", "100%");
//
//    	gradient2.append("stop")
//    	    .attr("offset", "0%")
//    	    .attr("stop-color", "#FFF")
//    	    .attr("stop-opacity", 1);
//
//    	gradient2.append("stop")
//    	    .attr("offset", "100%")
//    	    .attr("stop-color", "#EADBC0")
//    	    .attr("stop-opacity", 1);
//
//    	g.append('rect')
//        	.attr('class', 'border')
//    	    .attr({
//    	        'x': 10,
//    	        'y': 10,
//    	        'height': 10,
//    	        'width': width - 10
//    	    })
//    	    .style("fill", "url(#gradient)")
//    	    .attr("opacity", 0);
//
//    	g.append('rect')
//        	.attr('class', 'border')
//    	    .attr({
//    	        'x': width - 5,
//    	        'y': 20,
//    	        'height': height/2 - 20,
//    	        'width': 10
//    	    })
//    	    .style("fill", "url(#gradient2)")
//    	    .attr("opacity", 0);
//
//    	g.append('rect')
//        	.attr('class', 'border')
//    	    .attr({
//    	        'x': width - 5,
//    	        'y': 10,
//    	        'height': 10,
//    	        'width': 10
//    	    })
//    	    .style("fill", "white")
//    	    .attr("opacity", 0);
    }
    /**
    * setupSections - each section is activated
    * by a separate function. Here we associate
    * these functions to the sections based on
    * the section's index.
    *
    */
    setupSections = function() {
        // activateFunctions are called each
        // time the active section changes
        activateFunctions[0] = showTitle;
        activateFunctions[1] = showSpreadsheet;
        activateFunctions[2] = showExcel;
        activateFunctions[3] = showMerge;
        activateFunctions[4] = showASCII;
        activateFunctions[5] = showCleanUp;
        activateFunctions[6] = showArcMap;
        activateFunctions[7] = showCompare;
//        activateFunctions[6] = selectChart;
//        activateFunctions[7] = showMap;
        activateFunctions[8] = showBio;
        activateFunctions[9] = showLife;
//        activateFunctions[9] = showBar1;
//        activateFunctions[10] = showBar2;


        // updateFunctions are called while
        // in a particular section to update
        // the scroll progress in that section.
        // Most sections do not need to be updated
        // for all scrolling and so are set to
        // no-op functions.
        for(var i = 0; i <= 11; i++) {
            updateFunctions[i] = function() {};
        }
    };

    /**
    * ACTIVATE FUNCTIONS
    *
    * These will be called their
    * section is scrolled to.
    *
    * General pattern is to ensure
    * all content for the current section
    * is transitioned in, while hiding
    * the content for the previous section
    * as well as the next section (as the
    * user may be scrolling up or down).
    *
    */
    function showTitle() {       
        g.selectAll(".openvis-title")
            .transition()
            .duration(fadeDuration)
            // .delay(400)
            .attr("opacity", 1.0);

         g.selectAll(".excel-screenshot") // from section below
            .transition()
            .duration(fadeDuration)
            .attr("opacity", 0)
            .attr("fill-opacity", 0.0);


    }

    function showSpreadsheet() {
        g.selectAll(".openvis-title") // from section above
            .transition()
            .duration(fadeDuration)
            .attr("opacity", 0);

        g.selectAll(".excel-screenshot")
            .transition()
            .duration(fadeDuration)
            // .delay(400)
            .attr("opacity", 1)
        
         g.selectAll(".excel-Heruli") // from section below
            .transition()
            .duration(fadeDuration)
            .attr("opacity", 0)
            .attr("fill-opacity", 0);
    }


        function showExcel() {
        g.selectAll(".excel-screenshot") // from section above
            .transition()
            .duration(fadeDuration)
            .attr("opacity", 0);

        g.selectAll(".excel-Heruli")
            .transition()
            .duration(fadeDuration)
            // .delay(400)
            .attr("opacity", 1)
        
         g.selectAll(".gisMerged") // from section below
            .transition()
            .duration(fadeDuration)
            .attr("opacity", 0)
            .attr("fill-opacity", 0);
    }

        function showMerge() {
        g.selectAll(".excel-Heruli") // from section above
            .transition()
            .duration(fadeDuration)
            .attr("opacity", 0);

        g.selectAll(".gisMerged")
            .transition()
            .duration(fadeDuration)
            // .delay(400)
            .attr("opacity", 1)
        
         g.selectAll(".showGraphical") // from section below
            .transition()
            .duration(fadeDuration)
            .attr("opacity", 0)
            .attr("fill-opacity", 0);
    }


    function showASCII() {
        g.selectAll(".gisMerged") // from section above
            .transition()
            .duration(fadeDuration)
            .attr("opacity", 0);

        g.selectAll(".showGraphical")
            .transition()
            .duration(fadeDuration)
            // .delay(400)
            .attr("opacity", 1)

        g.selectAll(".cleanUp") // from section below
            .transition()
            .duration(fadeDuration)
            .attr("opacity", 0)
            .attr("fill-opacity", 0);
    }

    function showCleanUp() {

        g.selectAll(".showGraphical") // from section above
            .transition()
            .duration(fadeDuration)
            .attr("opacity", 0);

        g.selectAll(".cleanUp")
            .transition()
            .duration(fadeDuration)
            // .delay(400)
            .attr("opacity", 1)

        g.selectAll(".ArcMap") // from section below
            .transition()
            .duration(fadeDuration)
            .attr("opacity", 0)
            .attr("fill-opacity", 0);
    }

    function showArcMap() {
        g.selectAll(".cleanUp") // from section above
            .transition()
            .duration(fadeDuration)
            .attr("opacity", 0);

        g.selectAll(".ArcMap")
            .transition()
            .duration(fadeDuration)
            // .delay(400)
            .attr("opacity", 1)

        g.selectAll(".compare") // from section below
            .transition()
            .duration(fadeDuration)
            .attr("opacity", 0)
            .attr("fill-opacity", 0);
    }

    function showCompare() {
        g.selectAll(".ArcMap") // from section above
            .transition()
            .duration(fadeDuration)
            .attr("opacity", 0);

        g.selectAll(".compare")
            .transition()
            .duration(fadeDuration)
            // .delay(400)
            .attr("opacity", 1)

         g.selectAll(".bio") // from section below
             .transition()
             .duration(fadeDuration)
             .attr("opacity", 0)
             .attr("fill-opacity", 0);
    }

        function showBio() {
        g.selectAll(".compare") // from section above
            .transition()
            .duration(fadeDuration)
            // .delay(400)
            .attr("opacity", 0)

        g.selectAll(".bio")
            .transition()
            .duration(fadeDuration)
            // .delay(400)
            .attr("opacity", 1)

         g.selectAll(".life") // from section below
             .transition()
             .duration(fadeDuration)
             .attr("opacity", 0)
             .attr("fill-opacity", 0);
    }
    function showLife() {
        g.selectAll(".bio") // from section above
            .transition()
            .duration(fadeDuration)
            .attr("opacity", 0);

        g.selectAll(".life")
            .transition()
            .duration(fadeDuration)
            // .delay(400)
            .attr("opacity", 1)

    }



    /**
    * activate -
    *
    * @param index - index of the activated section
    */
    chart.activate = function(index) {
        activeIndex = index;
        var sign = (activeIndex - lastIndex) < 0 ? -1 : 1;
        var scrolledSections = d3.range(lastIndex + sign, activeIndex + sign, sign);
        scrolledSections.forEach(function(i) {
            activateFunctions[i]();
        });
        lastIndex = activeIndex;
    };

    /**
    * update
    *
    * @param index
    * @param progress
    */
    chart.update = function(index, progress) {
        updateFunctions[index](progress);
    };

    // return chart function
    return chart;
};


/**
 * display - called once data
 * has been loaded.
 * sets up the scroller and
 * displays the visualization.
 *
 * @param data - loaded tsv data
 */
function display(data) {
    // create a new plot and
    // display it
    var plot = scrollVis();
    d3.select("#intro-vis")
        .datum(data)
        .call(plot);

    // setup scroll functionality
    var scroll = scroller()
        .container(d3.select('#graphic'));

    // pass in .step selection as the steps
    scroll(d3.selectAll('.step'));

    // setup event handling
    scroll.on('active', function(index) {
        // highlight current step text
        

        // only changes opacity on chrome
        // hacky until we fix firefox issue
        // var browser = navigator.userAgent.toLowerCase().indexOf('chrome') > -1 ? 'chrome' : 'other';
        // if (browser == 'chrome') {
        //     d3.selectAll('.step')
        //     .style('opacity',  function(d,i) { return i == index ? 1 : 0.1; });
        // }
        // else {
        //     d3.selectAll('.step')
        //     .style('opacity',  function(d,i) { return i == index ? 1 : 1; });
        // }

        // activate current section
        plot.activate(index);
    });

    scroll.on('progress', function(index, progress){
        plot.update(index, progress);
    });
}

// display
display();
