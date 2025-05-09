/**
 * scrollVis - encapsulates
 * all the code for the visualization
 * using reusable charts pattern:
 * http://bost.ocks.org/mike/chart/
 */


// constants to define the size colors
// and margins of the vis area.

//added the burnt orange color
var tourLineColor = '#CC5500';
var tourLineWidth = 2.5;

/*
var tourWidth = document.documentElement.clientWidth; // width minus scrollbar
var tourHeight = window.innerHeight-70; // tourHeight minus header
var windowAspectRatio = tourHeight/tourWidth;*/

//var width = document.documentElement.clientWidth
var width = (document.documentElement.clientWidth)*0.70; // 70% of width minus scrollbar. Must coordinate with #tourSVG margin-left in style.css
var height = document.documentElement.clientHeight-70; // height minus header
var newHeight = document.documentElement.clientHeight-70; // height minus header
var windowAspectRatio = height/width;

// main svg used for visualization
var svgTour = null;

// d3 selection that will be used
// for displaying visualizations
//var g = null;

var IH = 4310; // original image height
var IW = 6666; // original image width
var imgAspectRatio = IH/IW;
var xScaleTour;
// console.log("imgAspectRatio " + imgAspectRatio);
// console.log(width);
// console.log("windowAspectRatio " + windowAspectRatio);


if (windowAspectRatio < imgAspectRatio) { // image is full height
    var DIH = newHeight; // display height 
    var DIW = IW * (DIH / IH); // display width 
} else { // image is full width
    var DIW = width; // display width 
    var DIH = IH * (DIW / IW); // display height 
}

var margin = {top:(height-DIH)/2, left:(width-DIW)/2, bottom:40, right:0};

// resize functions
window.addEventListener("resize", redraw);

function redraw(){
    //console.log("resize")

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
    
//    xScale= newDIW/DIW ; // scale down original images

     xScaleTour= newDIW/DIW ; // scale down original images //do not use "xScale" as that var is used in the chart of bio.
//     console.log("scale:" + xScaleTour)
//     console.log("width " + newWidth)

//     d3.selectAll("#tourSVG")
//        .attr("width", "80%")


    d3.select(".openvis-title") // RESIZES THE IMAGE
     .attr("transform", "scale("+xScaleTour+") translate("+ margin.left+",0)")

    g.selectAll('rect') // RESIZES SOME CONTENT
      .attr("transform", "scale("+xScaleTour+") translate("+ margin.left+",0)")
      
    g.selectAll('text') // RESIZES THE WORDS
      .attr("transform", "scale("+xScaleTour+") translate("+ margin.left+",0)")
      

}

var scrollVis = function() {

    tourMargin = {top:(height-DIH)/2, left:(width-DIW)/2, bottom:40, right:0};
    // // console.log(DIW);

	// Keep track of which visualization
	// we are on and which was the last
	// index activated. When user scrolls
	// quickly, we want to call all the
	// activate functions that they pass.
	var lastIndex = -1;
	var activeIndex = 0;

	// main svg used for visualization
	// var svg = null; moved to global

	// d3 selection that will be used
	// for displaying visualizations
	    
    
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
            // create svgTour and give it a width and height
            svgTour = d3.select(this).selectAll("svgTour").data([d]);
            svgTour.enter().append("svg").attr("id", "tourSVG")
              .attr("width", DIW)
              .attr("height", DIH);
            
            thisTour = d3.selectAll("#tourSVG");
            thisTour.append("g")
//            svgTour.attr("transform", "translate(" + tourMargin.left + "," + tourMargin.top + ")")
 
//            thisTour.style("background-color", 'lightpink'); //for testing resize

            // this group element will be used to contain all
            // other elements.
            g = thisTour.select("g")
//            g=thisTour.attr("id", "tourG")



            setupVis();
            setupSections();
        });
    };

	/**
	* setupVis - creates initial elements for all
	* sections of the visualization.
	*/

    setupVis = function() {
        //openvis title
        g.append("image")
            .attr("class", "img openvis-title")
         	.attr("xlink:href", "biography/img/Biography_small2.jpg")
            .attr("id","tourIMG")
//            .attr("preserveAspectRatio","xMidYMid meet")
        	.attr("width", DIW)
        	.attr("height", DIH);


        g.selectAll(".openvis-title")
            .attr("opacity", 0);
      
        g.append('rect')
            .attr('class', 'time-title')
            .attr('x', DIW*0.177)
            .attr('y', DIW*0.030)
            .attr('height', DIH*0.940)
            .attr('width', 2)
            // .attr("fill", "red")
            .attr("fill", tourLineColor)
            .attr("opacity", 0)
            .attr("stroke-width", tourLineWidth);

        g.append("text")
            .attr("class", "time-title")
            .attr("x", DIW*0.17) // how far from left
            .attr("y", DIH*0.40)
            .attr("text-anchor", "end")
            .text("700 BC")
            .attr("opacity", 0)
            // .attr("fill", "red");
            .attr("fill", tourLineColor)
            .attr("font-weight", 600);

        // first lifespan line
        g.append('rect')
        	.attr('class', 'lifespan-title')
            .attr('x', DIW*0.106)
            .attr('y', DIH*0.6395)
            .attr('height', DIH*0.001)
            .attr('width', DIW*0.013)
            .attr("stroke", tourLineColor)
            .style("stroke-width", .75)
            .attr('fill',"none")
            .attr("opacity", 0);
        
         // first lifespan dots
         g.append('circle')
            .attr('class', 'lifespan-title')
            .attr('cx',DIW*0.097 )
            .attr('cy', DIH*0.6395 )
            .attr('r','0.75px')
            .style('fill', tourLineColor)
            .attr("opacity", 0);
         g.append('circle')
            .attr('class', 'lifespan-title')
            .attr('cx',DIW*0.10 )
            .attr('cy', DIH*0.6395 )
            .attr('r','0.75px')
            .style('fill', tourLineColor) 
            .attr("opacity", 0); 
        g.append('circle')
            .attr('class', 'lifespan-title')
            .attr('cx',DIW*0.103 )
            .attr('cy', DIH*0.6395 )
            .attr('r','0.75px')
            .style('fill', tourLineColor) 
            .attr("opacity", 0);  
        // second lifespan line
         g.append('rect')
        	.attr('class', 'lifespan-title')
            .attr('x', DIW*0.105)
            .attr('y', DIH*0.649)
            .attr('height', DIH*0.001)
            .attr('width', DIW*0.032)
            .attr("stroke", tourLineColor)
            .style("stroke-width", .75)
            .attr('fill',"none")
            .attr("opacity", 0);
        // lifespan image outline box line
        g.append('rect')
            .attr('class', 'lifespan-title')
            .attr('x', DIW*0.089)
            .attr('y', DIH*0.62)
            .attr('height', DIH*0.063)
            .attr('width', DIW*0.099)
            // .attr("stroke", "red")
            .attr("stroke", tourLineColor)
            .style("stroke-width", tourLineWidth/2)
            .attr('fill',"none")
            .attr("opacity", 0);

        g.append('rect')
            .attr('class', 'profession-title')
            .attr('x', DIW*0.02)
            .attr('y', DIH/2.25)
            .attr('height', DIH*.175)
            .attr('width', DIW - 36)
            // .attr("stroke", "red")
            .attr("stroke", tourLineColor)
            .style("stroke-width", tourLineWidth)
            .attr('fill',"none")
            .attr("opacity", 0);

        g.append("text")
            .attr("class", "profession-title")
            .attr('x', DIW*0.17)
            .attr('y', DIH/0.52)
            .text("Mathematician & Physicians")
            .attr("opacity", 0)
            // .attr("fill", "red");
            .attr("fill", tourLineColor);

        // empire outline

        // need to set scale for drawing polygon
//        var scaleX = d3.scale.linear()
        var scaleX = d3.scaleLinear()
            .domain([0,50]) //Give appropriate range in the scale
            .range([0,DIW]);

//        var scaleX = d3.scale.linear()
        var scaleX = d3.scaleLinear()
            .domain([0,50]) //Give appropriate range in the scale
            .range([DIH,0]);

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
        activateFunctions[2] = showlifespanTitle;
        activateFunctions[3] = showRegionTitle;
        activateFunctions[4] = showDigital;


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
    * These will be called when their
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
        //console.log("show title")
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
        g.selectAll(".lifespan-title") // from section above
            .transition()
            .duration(0)
            .attr("opacity", 0);
        g.selectAll(".profession-title")
            .transition()
            .duration(fadeDuration)
            .attr("opacity", 0)
        
         g.selectAll(".time-title")
            .transition()
            .duration(fadeDuration)
            .delay(400)
            .attr("opacity", 1)
            .attr("fill-opacity", 1.0);
    }

    function showlifespanTitle() {
        g.selectAll(".profession-title")
            .transition()
            .duration(fadeDuration)
            .attr("opacity", 0)
            .attr("fill-opacity", 0.0);

        g.selectAll(".time-title")
            .transition()
            .duration(fadeDuration)
            .attr("opacity", 0.0)
            .attr("fill-opacity", 0.0);

        g.selectAll(".lifespan-title")
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

        g.selectAll(".lifespan-title")
            .transition()
            .duration(fadeDuration)
            .attr("opacity", 0)
            .attr("fill-opacity", 0.0);

        g.selectAll(".profession-title")
            .transition()
            .duration(fadeDuration)
            .delay(400)
            .attr("opacity", 1.0)
            .attr("fill-opacity", 1.0);
    }
    
        function showDigital() {

        g.selectAll(".lifespan-title")
            .transition()
            .duration(fadeDuration)
            .attr("opacity", 0)
            .attr("fill-opacity", 0.0);

        g.selectAll(".profession-title")
            .transition()
            .duration(fadeDuration)
            .delay(400)
            .attr("opacity", 0.0)
            .attr("fill-opacity", 0.0);
            
            // note to overlay so nothing to show as 1.0 opacity.
        
    }

    
    /**
    * activate
    *
    * @param index - index of the activated section
    */
    tour.activate = function(index) {
        //console.log("activate")
        activeIndex = index;
        var sign = (activeIndex - lastIndex) < 0 ? -1 : 1;
        var scrolledSections = d3.range(lastIndex + sign, activeIndex + sign, sign);
        scrolledSections.forEach(function(i) {
            activateFunctions[i]();
        });
        lastIndex = activeIndex;
    };
    
    d3.dispatch.call('active',1);
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

    
    // return tour function
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
        
        //console.log("Scroll active")
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
//        console.log("progress");
        plot.update(index, progress);
    });
}

// display
display();
//redraw so it fits....
redraw();

