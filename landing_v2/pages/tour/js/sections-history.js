/**
 * scrollVis - encapsulates
 * all the code for the visualization
 * using reusable charts pattern:
 * http://bost.ocks.org/mike/chart/
 */


// constants to define the size
// and margins of the vis area.
// constants to define the size
//added the burnt orange color
var tourLineColor = '#CC5500';
var tourLineWidth = 2.5;
var tourPlaceRegimeColor = '#570d9e';
var tourEmpireColor = '#3E792F'


// main svg used for visualization
var svg = null;

// d3 selection that will be used
// for displaying visualizations
var g = null;

var width = (document.documentElement.clientWidth)*0.70; // 70% of width minus scrollbar. Must coordinate with #tourSVG margin-left in style.css
var newHeight = document.documentElement.clientHeight-70; // height minus header
var windowAspectRatio = height/width;

var IH = 735; // original image height
var IW = 1149; // original image width
var imgAspectRatio = IH/IW;
var xScale;

//if window is portrait, full width
//if window is landscape, full height
if (windowAspectRatio < imgAspectRatio) { // image is full height
    var DIH = newHeight; // display height 
    var DIW = IW * (DIH / IH); // display width 
} else { // image is full width
    var DIW = width; // display width 
    var DIH = IH * (DIW / IW); // display height 
}

// // if it is so wide, it is taller than the window, full height
// if(DIH > newHeight){
    
// }

var margin = {top:(height-DIH)/2, left:(width-DIW)/2, bottom:40, right:0};

// resize functions
window.addEventListener("resize", redraw);


function redraw(){
    console.log("resize")

    newWidth = (document.documentElement.clientWidth)*0.70; // 70% of width minus scrollbar
    newHeight = document.documentElement.clientHeight-70; // height minus header
    newWindowAspectRatio = newHeight/newWidth;

//    console.log("imgAspectRatio " + imgAspectRatio);
//    console.log(newWidth);
//    console.log("newWindowAspectRatio " + newWindowAspectRatio);

    if (newWindowAspectRatio < imgAspectRatio) { // image is full height
        var newDIH = newHeight; // display height 
        var newDIW = IW * (newDIH / IH); // display width 
    } else { // image is full width
        var newDIW = newWidth; // display width 
        var newDIH = IH * (newDIW / IW); // display height 
    }

//    console.log("newDIW " + newDIW)
//    margin = {top:(newHeight-newDIH)/2, left:(newWidth-newDIW)/4, bottom:40, right:0};
//    console.log(margin)

     xScale= newDIW/DIW ; // scale down original images
//     console.log("scale:" + xScale)
//     console.log("width " + width)

     // should do it all at ounce, but the translate it off... :(
     // d3.selectAll("#tourSVG")
        // .attr("transform", "translate("+ margin.left+",0) scale("+xScale+") translate("+ -1*margin.left+",0)") // works in console, but not in code...

    d3.selectAll(".openvis-title") // RESIZES THE IMAGE
     .attr("transform", "scale("+xScale+") translate("+ margin.left+",0)")

    g.selectAll('rect') // RESIZES SOME CONTENT
      .attr("transform", "scale("+xScale+") translate("+ margin.left+",0)")
      
    g.selectAll('text') // RESIZES THE WORDS
      .attr("transform", "scale("+xScale+") translate("+ margin.left+",0)")
      
    g.selectAll('polygon') // RESIZES the roman empire regime polygon
      .attr("transform", "scale("+xScale+") translate("+ margin.left+",0)")

}


var scrollVis = function() {

     // console.log(DIW);


	// Keep track of which visualization
	// we are on and which was the last
	// index activated. When user scrolls
	// quickly, we want to call all the
	// activate functions that they pass.
	var lastIndex = -1;
	var activeIndex = 0;

   
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
	* tour (formerly chart)
	*
	* @param selection - the current d3 selection(s)
	*  to draw the visualization in. For this
	*  example, we will be drawing it in #vis  -> Note changed #vis to #intro-vis 
	*/
    var tour = function(selection) {
        selection.each(function(d) {
//            console.log("each: "+ d)
//            console.log("width: "+ DIW)
//            console.log("height: "+ DIH)
            // create svg and give it a width and height
            svg = d3.select(this).selectAll("svg").data([d]);
            svg.enter().append("svg").append("g");
            svg.attr("id", "tourSVG");
            svg.attr("width", DIW);
            svg.attr("height", DIH);
           // svg.attr("transform", "translate(" + margin.left + "," + margin.top + ")")


            // this group element will be used to contain all
            // other elements.
            g = svg.select("g")

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

        //openvis title
        g.append("image")
            .attr("class", "img openvis-title")
            .attr("id", "tourImage")
         	.attr("xlink:href", "img/Chart_of_history_no_background2.png")
            // .attr("preserveAspectRatio","xMinYMin meet")
            // .attr("y","0")
            // .attr("viewBox", "0 0 100 100")
            .attr("width", DIW)
            .attr("height", DIH);


        g.selectAll(".openvis-title")
            .attr("opacity", 0);
      
        g.append('rect')
            .attr('class', 'time-title')
            .attr({
                'x': DIW*0.18, // how far from left
                'y': DIH*0.043,
                'height': DIH*0.905,
                'width': 2
            })
            // .attr("fill", "red")
            .attr("fill", tourLineColor)
            .attr("opacity", 0)
            .attr("stroke-width", tourLineWidth)
            .classed("tour-shadow",true);


        // g.append("text")
        //     .attr("class", "time-title")
        //     .attr("x", DIW*0.165) // how far from left
        //     .attr("y", DIH*0.45)
        //     .attr("text-anchor", "end")
        //     .text("700 BC")
        //     .attr("opacity", 0)
        //     // .attr("fill", "red");
        //     .attr("fill", tourLineColor)
        //     .attr("font-weight", 600);

        g.append('rect')
        	.attr('class', 'place-title')
            .attr({
                'x': DIW*0.022,
                'y': DIH*0.755,
                'height': DIH*0.0095,
                'width': DIW*0.94
            })
            // .attr("stroke", "red")
            .attr("stroke", tourPlaceRegimeColor)
            .style("stroke-width", tourLineWidth)
            .attr('fill',"none")
            .attr("opacity", 0)
            .classed("tour-shadow",true);

        g.append('rect')
            .attr('class', 'region-title')
            .attr({
                'x': DIW*0.022,
                'y': DIH*0.694,
                'height': DIH*0.072,
                'width':  DIW*0.958
            })
            // .attr("stroke", "red")
            .attr("stroke", tourPlaceRegimeColor)
            .style("stroke-width", tourLineWidth)
            .attr('fill',"none")
            .attr("opacity", 0)
            .classed("tour-shadow",true);

        // g.append("text")
        //     .attr("class", "region-title")
        //     .text("France")
        //     .attr({
        //         'x': DIW*0.45,
        //         'y': DIH*0.665,
        //         "opacity": 0,
        //         "font-weight": 800,
        //         "fill": tourLineColor
        //     });

        // empire outline

        // need to set scale for drawing polygon
        var scaleXpoly = d3.scale.linear()
            .domain([0,50]) //Give appropriate range in the scale
            .range([0,DIW]);

        var scaleYpoly = d3.scale.linear()
            .domain([0,50]) //Give appropriate range in the scale
            .range([DIH,0]);

        var poly = [
        	{"x":17.6, "y":26.7},  //top left, go counter-clockwise
            {"x":17.6,"y":24},
            {"x":13,"y":21.5},
            {"x":16.9,"y":19.8},
            {"x":19.4,"y":19.8},
            {"x":19.4,"y":16.3},
            {"x":17.0,"y":16.3},
            {"x":17.0,"y":11.6},
            {"x":20.6,"y":11.6},
            {"x":21.4,"y":9},
            {"x":26.2,"y":9},
            {"x":26.2,"y":26.7}
        ];
        //top box
        var poly2 = [
                {"x":17.9, "y":43.1},
                {"x":26.4, "y":43.1},
                {"x":26.4, "y":41.1},
                {"x":17.9, "y":41.1}
            ];
        //middle 
        var poly3 = [
                {"x":19, "y":32.9},
                {"x":28, "y":32.9},
                {"x":28, "y":31.5},
                {"x":19, "y":31.5}
            ];

      	// map to scale
      	var newpoly = poly.map(function(d) { return [scaleXpoly(d.x),scaleYpoly(d.y)]; });

        var newpoly2 = poly2.map(function(d) { return [scaleXpoly(d.x),scaleYpoly(d.y)]; });

        var newpoly3 = poly3.map(function(d) { return [scaleXpoly(d.x),scaleYpoly(d.y)]; });

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
            .attr("stroke", tourEmpireColor)
    	    .attr("stroke-width", tourLineWidth)
    	    .attr("fill", "transparent")
            .attr("transform", "scale(1.1)")
            // .attr("transform", "translate(" + 0  + "," + 0 + ")");

        g.selectAll(".empire-title")
            .attr("opacity", 0)
            .classed("tour-shadow",true);


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
        activateFunctions[1] = showTime;
        activateFunctions[2] = showPlaceTitle;
        activateFunctions[3] = showRegionTitle;
        activateFunctions[4] = showEmpireTitle;
        activateFunctions[5] = showDigital;
//        activateFunctions[5] = showChart;
//        activateFunctions[6] = selectChart;
//        activateFunctions[7] = showMap;
//        activateFunctions[8] = showBio;
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
        g.selectAll(".time-title") // from section below
            .transition()
            .duration(fadeDuration)
            .delay(400)
            .attr("opacity", 0)
            .attr("fill-opacity", 0.0);
        
        g.selectAll(".openvis-title")
            .transition()
            .duration(fadeDuration)
            .attr("opacity", 1.0);


    }

    function showTime() {
        g.selectAll(".place-title") // from section above
            .transition()
            .duration(0)
            .attr("opacity", 0);

        g.selectAll(".region-title")
            .transition()
            .duration(fadeDuration)
            .attr("opacity", 0);
        
         g.selectAll(".time-title")
            .transition()
            .duration(fadeDuration)
            .delay(400)
            .attr("opacity", 1)
            .attr("fill-opacity", 1.0);
        


    }

    function showPlaceTitle() {
        g.selectAll(".region-title")
            .transition()
            .duration(fadeDuration)
            .attr("opacity", 0)
            .attr("fill-opacity", 0.0);

        g.selectAll(".time-title")
            .transition()
            .duration(fadeDuration)
            .attr("opacity", 0.0)
            .attr("fill-opacity", 0.0);

        g.selectAll(".place-title")
            .transition()
            .duration(fadeDuration)
            .delay(400)
            .attr("opacity", 1);
    }

    function showRegionTitle() {
        g.selectAll(".empire-title")
            .transition()
            .duration(fadeDuration)
            .attr("opacity", 0);

        g.selectAll(".place-title")
            .transition()
            .duration(fadeDuration)
            .attr("opacity", 0)
            .attr("fill-opacity", 0.0);

        g.selectAll(".region-title")
            .transition()
            .duration(fadeDuration)
            .delay(400)
            .attr("opacity", 1.0)
            .attr("fill-opacity", 1.0);
    }

    function showEmpireTitle() {
//        console.log("4")
        g.selectAll(".region-title")
            .transition()
            .duration(400)
            .attr("opacity", 0)
            .attr("fill-opacity", 0.0);

        g.selectAll(".chart")
            .transition()
            .duration(400)
            .style("opacity", 0);

        g.selectAll(".empire-title")
            .transition()
            .duration(fadeDuration)
            .delay(400)
            .attr("opacity", 1.0);
            // .classed("tour-shadow",true);

    }    
    
    function showDigital() {
        g.selectAll(".chart")
            .transition()
            .duration(400)
            .style("opacity", 0);


        g.selectAll(".empire-title")
            .transition()
            .duration(fadeDuration)
            .delay(400)
            .attr("opacity", 0.0);
            // .classed("tour-shadow",true);

        // note to overlay so nothing to show as 1.0 opacity.
    }



    /**
    * activate -
    *
    * @param index - index of the activated section
    */
    tour.activate = function(index) {
//        console.log("activate")
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
    tour.update = function(index, progress) {
//        console.log("progress")
        updateFunctions[index](progress);
    };

    // return chart function
    return tour;
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
//redraw so it fits....
redraw();