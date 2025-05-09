
var pymChild = null;  //******this plugin is for making dynamic iframes - unrelated to the mapping
var width = 1240; // 1240 or $("svg").parent().width() 
var height = 820; // $("svg").parent().height(); or 600 or width*2;

var svg = d3.select("svg");

console.log("hi")

var regionChartPercentDict = {}; // dict for region percentages
var regionGeogPercentDict = {}; // dict for region percentages

function parseData(url, callBack){
    
    // get CSV of region percentages
    d3.csv("https://pages.uoregon.edu/infographics/dev/timelineV2/pages/cartogram/csv/ChartRegionPercentages.csv", function(error, result) {
        if (error) {console.log(error); return;}
        
        callBack(result)
    })
    
    
    
}

function dataReady(data){
    
    for (var i = 0; i < data.length; i++)
        {
//            console.log(i)
            var region = data[i].Region.toLowerCase().replace(/\s/g, '');
            
            console.log(Intl.NumberFormat('en-US', {style:'percent'}).format(data[i].ChartAreaPercent));
            
            // get chart and actual geog percentages
            regionChartPercentDict[region] = Intl.NumberFormat('en-US', {style:'percent',maximumFractionDigits: 1,}).format(data[i].ChartAreaPercent);
            regionGeogPercentDict[region] = Intl.NumberFormat('en-US', {style:'percent',maximumFractionDigits: 1,}).format(data[i].ActualAreaPercent);
            //console.log(regionChartPercentDict)
        }
    
}
    
parseData('https://pages.uoregon.edu/infographics/dev/timelineV2/pages/cartogram/csv/ChartRegionPercentages.csv', dataReady)
          
// ** INSERT CHART SVG ** //
d3.text("https://pages.uoregon.edu/infographics/dev/timelineV2/pages/cartogram/img/TimelineCartogramComparison_4Jan23.svg", function(error, externalSVGText) {
         if (error) {console.log(error); return;}


    // insert SVG into site
document.getElementById('fourImages').innerHTML=externalSVGText;

    d3.selectAll("[id*=Tooltip]").text(" ") // blank the tooltip on load
    
    
    // selects all Chart's rectangles
    d3.selectAll("g[id*='regionPoly'] > rect", "g[id*='NewChart'] > rect")
//    d3.selectAll("rect[id*='America']")
      .on("mouseover", function(d,i) { 
           cartogramMouseover(this)

        })
      .on("mouseout", function(d,i) {
            var thisReg = this.id.split('_')[0]; // everything before the first underscore
            cartogramMouseout(thisReg)
	      })
    

    // selects all Chart's paths
    d3.selectAll("g[id*='regionPoly'] > path")
//    d3.selectAll("rect[id*='America']")
      .on("mouseover", function(d,i) { 
            cartogramMouseover(this)

        })
      .on("mouseout", function(d,i) {
            var thisReg = this.id.split('_')[0]; // everything before the first underscore
            cartogramMouseout(thisReg)
	      })
        

 // selects all Geographic Map features 
 // (NOTE: select for maps seems to not work in selector list, must use own select function)
d3.selectAll("g[id*='Resized'] > path")
    .on("mouseover", function(d,i){
        cartogramMouseover(this)
    })
    .on("mouseout", function(d,i) {
        var thisReg = this.id.split('_')[0]; // everything before the first underscore
        cartogramMouseout(thisReg)
    })
    
     // selects all Geographic Map features PATHS
    // (NOTE: select for maps seems to not work in selector list, must use own select function)
    d3.selectAll("g[id*='GeographicsSized'] > path")
    .on("mouseover", function(d,i){
        cartogramMouseover(this)
    })
    .on("mouseout", function(d,i) {
            var thisReg = this.id.split('_')[0]; // everything before the first underscore
            cartogramMouseout(thisReg)
	      })
    
    
    // selects all Geographic Map features POLYGONS
    // (NOTE: select for maps seems to not work in selector list, must use own select function)
    d3.selectAll("g[id*='GeographicsSized'] > polygon")
    .on("mouseover", function(d,i){
        cartogramMouseover(this)
    })
    .on("mouseout", function(d,i) {
            var thisReg = this.id.split('_')[0]; // everything before the first underscore
            cartogramMouseout(thisReg)
	      })
    
    function cartogramMouseover(thisThing){
        //            console.log(thisThing.id)
            var thisReg = thisThing.id.replaceAll(/\d+/g, '') // removes all numbers
            console.log(thisReg)
        
            var thisLabel = thisReg.replaceAll('_',' '); // replace underscore with spaces
            var thisChartPercent = (", "+regionChartPercentDict[thisLabel.toLowerCase().replaceAll('_','').replace(/\s/g, '')])
            d3.selectAll("[id*=Tooltip]").text(thisLabel) 
            
            var thisGeogPercent = (", "+regionGeogPercentDict[thisLabel.toLowerCase().replaceAll('_','').replace(/\s/g, '')])
            
//            d3.selectAll("[id*=Tooltip]").text(thisLabel) // label all tooltips
        
            // add various percentages
            d3.select("[id*=Tooltip_x5F_cartogram]").text(thisLabel+thisChartPercent)
            d3.selectAll("[id*=Tooltip_x5F_chart]").text(thisLabel+thisChartPercent) //all because chart is in "chartogram"
            d3.select("[id*=Tooltip_x5F_map]").text(thisLabel+thisGeogPercent)
            d3.select("[id*=Tooltip_x5F_chartogram]").text(thisLabel+thisGeogPercent)
        
                    
            var thisReg = thisThing.id.split('_')[0]; // everything before the first underscore
            // highlight the region on the chart
            d3.select(thisThing).classed("selectedRegion", true);
            //highlight the area on the map
			d3.selectAll("rect[id*="+thisReg+"]")//highlight the chart polygons
                    .classed("selectedRegion", true);
            d3.selectAll("path[id*="+thisReg+"]")//highlight the map paths
                    .classed("selectedRegion", true);
            d3.selectAll("polygon[id*="+thisReg+"]")//highlight the map polygons
                    .classed("selectedRegion", true);
    }
    
    function cartogramMouseout(thisReg){
            d3.selectAll("rect[id*="+thisReg+"]").classed("selectedRegion", false);
            d3.selectAll("path[id*="+thisReg+"]")// clear the map paths
                    .classed("selectedRegion", false);
            d3.selectAll("polygon[id*="+thisReg+"]")// clear the map polygons
                    .classed("selectedRegion", false);
            d3.selectAll("[id*=Tooltip]").text(" ") // blank the tooltip
    
    }
    
    
    }); // end SVG

//pymChild = new pym.Child();
