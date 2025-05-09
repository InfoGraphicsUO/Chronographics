// Defines the bar graph size
var barMargin = {top: 40, right: 30, bottom: 100, left: 50},
    barWidth = 250 - barMargin.left - barMargin.right,
    barHeight = 220 - barMargin.top - barMargin.bottom;

// Creates the first bar graph container
var barContainer = d3.select("#bar-graph")
    .attr("width", barWidth + barMargin.left + barMargin.right)
    .attr("height", barHeight + barMargin.top + barMargin.bottom)
    .append("g")
    .attr("transform", "translate(" + barMargin.left + "," + barMargin.top + ")");

// Creates the second bar graph container
var barContainer2 = d3.select("#bar-graph2")
    .attr("width", barWidth + barMargin.left + barMargin.right)
    .attr("height", barHeight + barMargin.top + barMargin.bottom)
    .append("g")
    .attr("transform", "translate(" + barMargin.left + "," + barMargin.top + ")");

// Creates the third bar graph container
var barContainer3 = d3.select("#bar-graph3")
    .attr("width", barWidth + barMargin.left + barMargin.right)
    .attr("height", barHeight + barMargin.top + barMargin.bottom)
    .append("g")
    .attr("transform", "translate(" + barMargin.left + "," + barMargin.top + ")");

// Creates the third bar graph container
var barContainer4 = d3.select("#word-graph")
    .attr("width", barWidth + barMargin.left + barMargin.right)
    .attr("height", barHeight + barMargin.top + barMargin.bottom)
    .append("g")
    .attr("transform", "translate(" + barMargin.left + "," + barMargin.top + ")");
// zoom math implemented based on http://bl.ocks.org/shawnbot/6518285


var zoomBar = d3.behavior.zoom()
    .scaleExtent([1, 5]) // can change numbers to change how far it zooms
    .on("zoom", function() {
        zoomBar.translate([tx, ty]);
        barContainer4.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")")
  });

// disables double click zooming
barContainer4.call(zoomBar)
    .on("dblclick.zoom", null);

d3.select("#graph_label").text("Make a selection on the chart to show the graph.")
// Function for drawing the graph based on the chart size. 
// Currently called from the click function in mouseFunctions.js
function drawRowBar(data, regime, year) {
//    console.log(data+", "+ regime+", "+year);
    // define x
    var x = d3.scale.ordinal()
        .rangeRoundBands([0, barWidth], .1);

    // define y
    var y = d3.scale.linear()
        .range([barHeight, 0]);

    // x bar
    var xAxisBar = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    // y bar
    var yAxisBar = d3.svg.axis()
        .scale(y)
        .ticks(5)
        .orient("left");

    // maps the input data to the x/y coordinates
    x.domain(data.map(function(d) { return d.name; }));
    y.domain([0, d3.max(data, function(d) { return d.value; })]);

    // draws the x axis
    barContainer.append("g")
        .style("opacity", 0)
        .attr("class", "xaxis axis")
        .attr("transform", "translate(0," + barHeight + ")")
        .call(xAxisBar);

    // draws the y axis
    barContainer.append("g")
        .style("opacity", 0)
        .attr("class", "yaxis axis")
        .call(yAxisBar);

    // draws the bars
    barContainer.selectAll(".bar").data(data).enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(d.name); })
        .attr("y", function(d) { return y(d.value); })
        .attr("height", function(d) { return barHeight - y(d.value); })
        .attr("width", x.rangeBand())
        .attr("opacity", 0)
        .filter(function(d) {return d.name == regime})  // fills the selected regime a different color
            .style("fill", powerColors[0]);


    // now rotate text on x axis
    // solution based on idea here: https://groups.google.com/forum/?fromgroups#!topic/d3-js/heOBPQF3sAY
    // first move the text left so no longer centered on the tick
    // then rotate up to get 45 degrees.
    barContainer.selectAll(".xaxis text")  // select all the text elements for the xaxis
        .attr("transform", function(d) {
            return "translate(" + this.getBBox().height*-1 + "," + this.getBBox().height*-.3 + ")rotate(-45)";
        })
        .style("text-anchor", "end")
        .style("font-size", "10px");


    // now add titles to the axes
    barContainer.append("text")
        .style("opacity", 0)
        .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
        .attr("transform", "translate("+ (-barMargin.left/1.5) +","+ (barHeight/2) + ")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
        .text("% Chart Height")
        .style("font-size", "12px");


    barContainer.append("text")
        .style("opacity", 0)
        .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
        .attr("transform", "translate("+ (barWidth/2) + ",-29)")  // centre below axis
        .text("Chart Height of");

    barContainer.append("text")
        .style("opacity", 0)
        .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
        .attr("transform", "translate("+ (barWidth/2) + ",-9)")  // centre below axis
        .text(function(d){
            if (year < 0) {return "Largest Empires in " + Math.abs(year) + " B.C.E."}
            else {return "Largest Empires in " + year + " C.E."}
        });    

    // cascade transition
    /*
    barContainer.selectAll(".bar")
        .transition()
        .delay(function(d,i) { return 200 * (i + 1);})
        .duration(600)
        .attr("y", function(d) { return y(d.value); })
        .attr("height", function(d) { return barHeight - y(d.value); })
        .style("opacity", 1);
    */
    
    barContainer.selectAll("*")
        .transition()
        .duration(1000)
        .style("opacity", 1);

    function type(d) {
        d.value = +d.value; // coerce to number
        return d;
    }
}

// Function for drawing the graph based on the geographic size. 
// Currently called from the click function in mouseFunctions.js
function drawAreaBar(data, place, regime, year) {
    // defines x
    var x = d3.scale.ordinal()
        .rangeRoundBands([0, barWidth], .1);  // for spacing btw bars

    // defines y
    var y = d3.scale.linear()
        .range([barHeight, 0]);

    // defines x axis
    var xAxisBar = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    // defines y axis
    var yAxisBar = d3.svg.axis()
        .scale(y)
        .ticks(5)
        .orient("left");

    // map data to axis
    x.domain(data.map(function(d) { return d.name; }));
    y.domain([0, d3.max(data, function(d) { return d.value; })]);

    // add x axis
    barContainer2.append("g")
        .style("opacity", 0)
        .attr("class", "xaxis axis")
        .attr("transform", "translate(0," + barHeight + ")")
        .call(xAxisBar);

    // add y axis
    barContainer2.append("g")
        .style("opacity", 0)
        .attr("class", "yaxis axis")
        .call(yAxisBar);

    // add bars
    barContainer2.selectAll(".bar").data(data).enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(d.name); })
        .attr("y", function(d) { return y(d.value); })
        .attr("height", function(d) { return barHeight - y(d.value); })
        .attr("width", x.rangeBand())
        .attr("opacity", 0)
        .filter(function(d) {return d.name !== "Other"})    // for colors
            .style("fill", powerColors[0]);

    barContainer2.selectAll(".bar")
        .filter(function(d) {return d.name == "Selected Place"})    // for colors
            .style("fill", placeColors[2]);


    // now rotate text on x axis
    // solution based on idea here: https://groups.google.com/forum/?fromgroups#!topic/d3-js/heOBPQF3sAY
    // first move the text left so no longer centered on the tick
    // then rotate up to get 45 degrees.
    barContainer2.selectAll(".xaxis text")  // select all the text elements for the xaxis
        .attr("transform", function(d) {
            return "translate(" + this.getBBox().height*-1 + "," + this.getBBox().height*-.3 + ")rotate(-45)";
        })
        .style("text-anchor", "end");

    // now add titles to the axes
    barContainer2.append("text")
        .style("opacity", 0)
        .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
        .attr("transform", "translate("+ (-barMargin.left/1.5) +","+((barHeight/2))+")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
        .text("% Charted Land")
        .style("font-size", "12px");

    barContainer2.append("text")
        .style("opacity", 0)
        .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
        .attr("transform", "translate("+ (barWidth/2) + ",-29)")  // centre top
        .text("Geographic Area of Selected");

    barContainer2.append("text")
        .style("opacity", 0)
        .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
        .attr("transform", "translate("+ (barWidth/2) + ",-9)")  // centre top
        .text(function(d){
            if (year < 0) {
                thisText = ("Place and Empire in " + Math.abs(year) + " B.C.E")
                return thisText
            }
            else {
                 thisText = ("Place and Empire in " + year + " C.E.")
                 return thisText
            }
        });
        
    barContainer2.selectAll("*")
        .transition()
        .duration(1000)
        .style("opacity", 1);

    function type(d) {
        d.value = +d.value; // coerce to number
        return d;
    }
}


function drawPlaceBar(places) {
    var series = []; // create the data structure needed for high charts
    for (var i=0; i < regimes.length; i++) {  // iterate through all regimes (alphabetical)
        var sData = []; // create the series data array
        var regimeColor;
        for (var j=0; j < places.length; j++) { // iterate through the selected places
            var tempVal = 0; // temporary year value to add to
            for (var n=0; n < placeYears[places[j]].length; n++) { // iterate through the regime arrays for the selected places
                if (placeYears[places[j]][n][0] == [regimes[i]]) { // if the regime is the one being populated
                    tempVal += placeYears[places[j]][n][2] // add the number of years to the temp value
                }
            }
            sData.push(tempVal) //  populate with data
        }
        // iterate over each element in the array again to find the color
        // may be a faster way to do this
        for (var k = 0; k < powerVar.length; k++) {
            if (powerVar[k].properties.regime == regimes[i]) {
                regimeColor = graphColor(powerVar[k].properties.color);
            }
        }
        // add the data to the series
        series.push({
            name: regimes[i],
            data: sData,
            color: regimeColor
        })
    }

    Highcharts.chart('container-graph3', {
      exporting: { enabled: false },
      chart: {
        type: 'bar',
        backgroundColor: "#E8D5B6",
        spacingBottom: 0,
        height: 325
      },
      title: {
        text: 'How long was each regime in control of a place?',
         // text: null
        style: {
            display: 'none'
        }
      },
      legend: {
            enabled: false
      },
      xAxis: {
        categories: places,
        uniqueNames: false,
        labels: {
            style: {
                color: placeColors[2]
            }
        },
        tickColor: "rgb(0,0,0,.1)",
        lineColor: "rgb(0,0,0,.1)",
        gridLineColor: "rgb(0,0,0,.1)",
        opposite: true
      },
      yAxis: {
        min: 0,
        tickColor: "rgb(0,0,0,.1)",
        lineColor: "rgb(0,0,0,.1)",
        gridLineColor: "rgb(0,0,0,.1)",
        reversed: true,
        title: {
            text: 'Years in Power'
        },
      },
      tooltip: {
        headerFormat: '',
        useHTML: true,
        enabled: true,
        followPointer:true,
        pointFormat: '{series.name}<br><b>{point.y}</b> years ({point.percentage:.1f}%)',
        borderColor:null
    },
      plotOptions: {
        series: {
            stacking: 'normal',
            dataLabels: {
                //useHTML: true,
                enabled: true,
                format: '{series.name}',
                filter: {
                    property: 'percentage',
                    operator: '>',
                    value: 10
                },
                style: {
                    color: powerColors[1],
                    textOutline: '0px'
                },
                inside: true,
                allowOverlap: false
            },
          borderColor: '#3F3418'
        },
        bar: {
             pointPadding: 0 //reduce space between bars
        }
    },
      series: series,
      navigation: {
            buttonOptions: {
                symbolStroke: "silver",
                theme: {
                    fill: '#FFF4E2',
                    'stroke-width': 1,
                    stroke: 'silver',
                    r: 0,
                    states: {
                        hover: {
                            fill: '#E8D5B6'
                        },
                        select: {
                            stroke: '#039',
                            fill: '#E8D5B6'
                        }
                    }
                }
            }
        }

    });
}


// Function for drawing the graph based on the geographic size. 
// Currently called from the click function in mouseFunctions.js
function drawWords(places) {
    console.log(places);
    var maxW = 0;
    var color;
    barContainer4.selectAll("*").remove();
    data = [];
    for (p in places) {
            var sorted = placeYears[places[p]].sort(function(a,b) {
                    return a[1]-b[1]
                });
            data.push(sorted)
    }

    var content = barContainer4.append("g").attr("id", "drawing");
    var groups = content.selectAll().data(data)
      .enter()
      .append("g")
      .each(function(d, i) {

            var runningWidth = 0;
            d3.select(this).selectAll("text")
              .data(d)
              .enter()
              .append("text")
              .text(function(d) {
                return d[0];
              })
              .attr("font-family", "sans-serif")
              .style("font-size", function(d) { return 25+(d[2]/(2.2*(Math.log(10+d[2])))) + "px"; })
              .style('fill', function(d) { 
                for (var k = 0; k < powerVar.length; k++) {
                    if (powerVar[k].properties.regime == d[0]) {
                        return wordColor(powerVar[k].properties.color);
                    }
                }
              })
              .attr("x", function(d, j) {
                var w = this.getComputedTextLength() + 20,
                    x = runningWidth;
                runningWidth += w;
                return x;
              })
              .attr("y", 125 * (i+0.5)) // line heigh of bars
              .on("mouseover", function(d) { 
                    // set mouse
                    d3.select(this).style("cursor", "all-scroll"); 
                    // set tooltip to the info hovered overs
                    toolTip.transition()
                        .duration(100)    
                        .style("opacity", .9); 
                    toolTip.html(d[0] + "<br/>"  + (d[1]-500000) + " to " + ((d[1]-500000) + d[2]))
                        .style("left", (d3.event.pageX) + "px")   
                        .style("top", (d3.event.pageY - 28) + "px");
                    
                    })
             .on("mouseout", function(d) {
                toolTip.transition()    
                    .duration(300)    
             })

             if (runningWidth > maxW) {
                maxW = runningWidth
             }
        });
        var scale = 14 * barWidth/maxW;  // no idea why 14 works
        if (scale > 2) scale = 2; // fixes smallest places scaling too high
        barContainer4.transition()
            .duration(750)
            .attr("transform", "translate(" + [0,0] + ")scale(" + scale + ")");
    }