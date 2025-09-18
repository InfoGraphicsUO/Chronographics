// CUSTOM AXIS FUNCTIONS FOR FORMATING
function customAxisPlace(g) {
	g.call(axisPlace);
	g.select(".domain").remove();
	g.selectAll("text")
		.attr('x', visWidth - 90)	// needed to tinker with numbers
		.style("font-size", zoomChart.scale()*1.1 + 4 + "px") // text size from zoom
		.style("text-anchor", "middle")
		.style("fill", mapLandColor[1])
		.style("font-style", "italic");
}

function customAxisRegion(g) {
	g.call(axisRegion);
	g.select(".domain").remove();
	g.selectAll("text")
		.attr("y", -visWidth - 5)	// needed to tinker with numbers
		.attr('x', 0)
		.style("text-anchor", "middle")
		.style("alignment-baseline", "ideographic")
		.attr("transform", "rotate(90)")
		.style("font-size", zoomChart.scale()*1.2 + 5 + "px") // text size from zoom
		.call(wrap, 1)
		.on("click", clickRegion);
}

// zoomed out region ticks
function customAxisRegionTicks(g) {
	g.call(axisRegionTicks);
	g.select(".domain").remove();
	g.selectAll(".tick line")
		.attr("x1", visWidth)
		.attr("x2", +visWidth - 30) 	// needed to tinker with numbers
		.attr("stroke", notBlack)
		.attr("stroke-width", ".5")
		.attr("vector-effect", "non-scaling-stroke"); // keep the lines from disappearing when scaled.
}

// zoomed in region ticks
function customAxisRegionTicksZ(g) {
	g.call(axisRegionTicks);
	g.select(".domain").remove();
	g.selectAll(".tick line")
		.attr("x1", visWidth)
		.attr("x2", visWidth - (100 + 10*zoomChart.scale()))	// needed to tinker with numbers
		.attr("stroke", notBlack)
		.attr("stroke-width", ".5")
		.attr("vector-effect", "non-scaling-stroke"); // keep the lines from disappearing when scaled.
}

function customAxisRuler(g) {
	g.call(axisRuler);
	g.select(".domain").remove();
	g.selectAll("text")
		.style("font-size", zoomChart.scale()*.8 + 2 + "px") // text size from zoom
//		.style("fill", "red") for debugging
		.attr("y", +2)
		.attr("x", +95)
		.style("text-anchor", "start")
		.style("alignment-baseline", "ideographic")
		.attr("transform", "rotate(-90)")		// needed to tinker with numbers
	g.selectAll(".tick line")
		.attr("y1", - 115)
		.attr("y2", - 115 - (.8*zoomChart.scale()))	// needed to tinker with numbers
		.attr("stroke", notBlack)
		.attr("stroke-width", ".5")
		.attr("vector-effect", "non-scaling-stroke"); // keep the lines from disappearing when scaled.
}

function customAxisRulerZ(g) {
	g.call(axisRuler);
	g.select(".domain").remove();
	g.selectAll("text")
		.style("font-size", zoomChart.scale()*.8 + 3 + "px") // text size from zoom
//		.style("fill", "green") // for debugging
		.attr("y", + 2)
		.attr("x", +95)
		.style("text-anchor", "start")
		.style("alignment-baseline", "ideographic")
		.attr("transform", "rotate(-90)")		// needed to tinker with numbers
	g.selectAll(".tick line")
		.attr("y1", - 150)
		.attr("y2", - 150 - (.8*zoomChart.scale()))	// needed to tinker with numbers
		.attr("stroke", notBlack)
		.attr("stroke-width", ".5")
		.attr("vector-effect", "non-scaling-stroke"); // keep the lines from disappearing when scaled.
}

//tall 100 year lines
function customAxisTop(g) {
	g.call(axisTop);
	g.select(".domain").remove();
	//g.selectAll(".tick line")
	// 	.attr("stroke", notBlack)
	// 	.attr("opacity", "0.8")
	// 	.attr("stroke-width", ".15")
	// 	.attr("vector-effect", "non-scaling-stroke"); // keep the lines from disappearing when scaled.
	g.selectAll("text")
		.style("background", "white")
		.style("font-size", zoomChart.scale()*1.5 + 6 + "px")
		.attr("y", -visHeight + 3)
		.attr('x', + 0);	// needed to tinker with numbers
}

// 50 year ticks
function customAxisTopTicks(g) {
	g.call(axisTopTicks);
	g.select(".domain").remove();
	g.selectAll(".tick line")
		.attr("stroke", "none")
		.attr("vector-effect", "non-scaling-stroke") // keep the lines from disappearing when scaled.
		.attr("y1", -visHeight)
		.attr("y2", -visHeight + 2);	// needed to tinker with numbers
	g.selectAll("text")
		.text("50")
		.attr("transform", function(d) {
                return "rotate(90)" 
                })	// rotate
		.style("font-size", zoomChart.scale()*1.5 + 2 + "px")
		.attr("x", -visHeight + 4 + (zoomChart.scale()*0.75))
		.attr("y", (zoomChart.scale()*-0.75));	// needed to tinker with numbers
}

// 10 year ticks - top
function customAxisTopTicksZ(g) {
	g.call(axisTopTicksZ);
	g.select(".domain").remove();
	g.selectAll(".tick line")
		.attr("stroke", notBlack)
		.attr("stroke-width", "3")
		.attr("vector-effect", "non-scaling-stroke") // keep the lines from disappearing when scaled.
		.attr("text-anchor", "start")
		.attr("y1", -visHeight + zoomChart.scale()*1.5 + 7)
		.attr("y2", -visHeight + zoomChart.scale()*1.5 + 10);


}

// 100 year
function customAxisBottom(g) {
	g.call(axisBottom);
	g.select(".domain").remove();
	g.selectAll(".tick line")
		.attr("stroke", notBlack)
		.attr("stroke-width", ".15")
		.attr("vector-effect", "non-scaling-stroke") // keep the lines from disappearing when scaled.
	g.selectAll("text")
		.style("font-size", zoomChart.scale()*1.5 + 5 + "px")
		.attr("y", - 90)		// needed to tinker with numbers
		.attr('x', + 0);	// needed to tinker with numbers
}

// 50 year
function customAxisBottomTicks(g) {
	g.call(axisBottomTicks);
	g.select(".domain").remove();
	g.selectAll(".tick line")
		.attr("stroke", "none")
		.attr("stroke-width", ".8")
		.attr("vector-effect", "non-scaling-stroke") // keep the lines from disappearing when scaled.
		.attr("y1", -90)
		.attr("y2", -92);	// needed to tinker with numbers
	g.selectAll("text")
		.text("50")
		.attr("transform", function(d) {
                return "rotate(90)" 
                })	// rotate
		.style("font-size", zoomChart.scale()*1.5 + 3 + "px")
		.attr("y", (zoomChart.scale()*-0.5))	// needed to tinker with numbers	
		.attr('x', - 85);	// swap x and y if rotated
		
}
// 10 year - bottom
function customAxisBottomTicksZ(g) {
	g.call(axisBottomTicksZ);
	g.select(".domain").remove();
	g.selectAll(".tick line")
		.attr("stroke", notBlack)
		.attr("stroke-width", "3")
		.attr("vector-effect", "non-scaling-stroke") // keep the lines from disappearing when scaled.
		.attr("y1", -95)
		.attr("y2", -98);

}

function toggleEra() {
	eraToggled = !eraToggled; // switch bool
	if (eraToggled) {
		regionAxisGroup.call(customAxisRegion);
		// only display place row labels at a certain zoom extent b/c otherwise they are illegible
		// can be easily changed in the if statement
		if (zoomChart.scale() > 3) {
			regionTicksGroup.call(customAxisRegionTicksZ); 
			placeAxisGroup.call(customAxisPlace);
			rightBuffer
				// these numbers need to match those in the zoom section in chart.js
				.attr("width", 10 +10* 10/zoomChart.scale())		
				.attr("x", xFull(endYear) - (10 +10* 10/zoomChart.scale()))
		}
		else {
			regionTicksGroup.call(customAxisRegionTicks); 
			rightBuffer
				// these numbers need to match those in 
                // the toggleEra() function in functionsAxis.js 
                // and the fullExtent() function in functions.js
				.attr("width", 10* 3/zoomChart.scale())		
				.attr("x", xFull(endYear) - (10* 3/zoomChart.scale()));
		}
	}
 	else { // remove axis
		placeAxisGroup.selectAll("*").remove();
		regionAxisGroup.selectAll("*").remove();
		regionTicksGroup.selectAll("*").remove();
		rightBuffer
			.attr("width", 0)
			.attr("x", xFull(endYear));
    }
}

function toggleRuler() {
	rulerToggled = !rulerToggled; // switch bool
	if (rulerToggled) {
		// different buffer size for different zooms
		//rulerAxisGroup.call(customAxisRuler);
		if (zoomChart.scale() > 4) {
			rulerAxisGroup.call(customAxisRulerZ);
	        bottomBuffer
	            .attr("height", 45* 4/zoomChart.scale())
	            .attr("y", yFull(axisRegion.scale().domain()[0]) - (45* 4/zoomChart.scale()));  // does math based upon (pixel <-> chart space) conversion 
	        }
	    else {
	    	rulerAxisGroup.call(customAxisRuler);
	        bottomBuffer
	            .attr("height", 39* 3/zoomChart.scale())
	            .attr("y", yFull(axisRegion.scale().domain()[0]) - (39* 3/zoomChart.scale()));  // does math based upon (pixel <-> chart space) conversion 
	        
	    	}
    }
 	else { // remove axis
		rulerAxisGroup.selectAll("*").remove();
		bottomBuffer
            .attr("height", 30* 3.1/zoomChart.scale())
            .attr("y", yFull(axisRegion.scale().domain()[0]) - (30* 3.1/zoomChart.scale()));  // does math based upon (pixel <-> chart space) conversion 
  }
}

// wrapping long text
//https://bl.ocks.org/mbostock/7555321
function wrap(text, width) {
	text.each(function() {
	var text = d3.select(this),
		words = text.text().split(/\s+/).reverse(),
	    word,
	    line = [],
	    lineNumber = 0,
	    lineHeight = 1.1, // ems
	    y = text.attr("y"),
	    dy = parseFloat(text.attr("dy")),
	    tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
	while (word = words.pop()) {
		line.push(word);
		tspan.text(line.join(" "));
		if (tspan.node().getComputedTextLength() > width) {
		    line.pop();
		    tspan.text(line.join(" "));
		    line = [word];
		    tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
		}
	}
	});
}

function type(d) {
	d.value = +d.value;
	return d;
}

