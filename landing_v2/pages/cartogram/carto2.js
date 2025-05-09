
var pymChild = null;  //******this plugin is for making dynamic iframes - unrelated to the mapping
var width = 1240; // 1240 or $("svg").parent().width() 
var height = 800; // $("svg").parent().height(); or 600 or width*2;

var svg = d3.select("svg");

var colorMap = {};

//console.log("w:"+ width);
//console.log("h:"+ height);
	
var projection = d3.geo.equirectangular()
    //.scale(100)
    .translate([width/2, height/2.7])
    .center([30.6, 13.9])
    .precision(.1);

// TOOL TIP
//var tooltip = d3.select("body").append("div")
//    .append("div")
//    .style("position", "absolute")
//    .style("z-index", "9999")
//    .style("visibility", "hidden")
//    .style("background", "#000")
//    .text("a simple tooltip, ya");

//d3.csv("https://pages.uoregon.edu/infographics/dev/timelineV2/pages/cartogram/csv/dGrid_12_1_2022.csv", function(error, shift1) { 
d3.csv("https://pages.uoregon.edu/infographics/dev/timelineV2/pages/cartogram/csv/dGrid_diffs_only_12_1_2022.csv", function(error, shift1) { 
//d3.csv("https://pages.uoregon.edu/infographics/dev/timelineV2/pages/cartogram/csv/dGrid_Apr2.csv", function(error, shift1) { 

	var countries = polygon.features.length;
	var lines = degree.features.length;

	function modifypoly(polyline,shift){   //	***********create cartogram using deformation grid************
		var l1 = polyline;
		var len = l1.length;
		var i;
		var j;
		temparr = [];
		resultarr = [];

		var xintermed1;
		var xintermed2;
		var yintermed1;
		var yintermed2;
		var xfinal;
		var yfinal;
			
		var xinterp = d3.scale.linear();
		var yinterp = d3.scale.linear();
				
		for (j = 0; j < len; j++) {    //*****adjust the points one-by-one*****
			
			var x1y1 = (Math.floor(l1[j][1]*50/180) + 50)*100 + Math.floor(l1[j][0]*50/180) + 50;
			var x1y2 = (Math.floor(l1[j][1]*50/180) + 50 + 1)*100 + Math.floor(l1[j][0]*50/180) + 50;		
			var x2y1 = (Math.floor(l1[j][1]*50/180) + 50)*100 + Math.floor(l1[j][0]*50/180) + 50 + 1;
			var x2y2 = (Math.floor(l1[j][1]*50/180) + 50 + 1)*100 + Math.floor(l1[j][0]*50/180) + 50 + 1;				
			
            console.log(shift[x1y1])
            
			xinterp
				.domain([Math.floor(l1[j][0]*50/180), Math.floor(l1[j][0]*50/180)+1])
				.range([shift[x1y1].dx,shift[x2y1].dx]);
			xintermed1 = xinterp(l1[j][0]*50/180);

			xinterp
				.range([shift[x1y2].dx,shift[x2y2].dx]);
			xintermed2 = xinterp(l1[j][0]*50/180);
				
			xinterp
				.range([shift[x1y1].dy,shift[x2y1].dy]);
			yintermed1 = xinterp(l1[j][0]*50/180);	
											
			xinterp
				.range([shift[x1y2].dy,shift[x2y2].dy]);
			yintermed2 = xinterp(l1[j][0]*50/180);				
			

			
			yinterp
				.domain([Math.floor(l1[j][1]*50/180), Math.floor(l1[j][1]*50/180) + 1])
				.range([xintermed1,xintermed2]);
			xfinal = +yinterp(l1[j][1]*50/180);
			
			yinterp					
				.range([yintermed1,yintermed2]);
			yfinal = +yinterp(l1[j][1]*50/180);

			l1[j][0] = +l1[j][0] + xfinal;
			l1[j][1] = +l1[j][1] + yfinal;
			
//            //original bounds
//			if (l1[j][0] > 180){l1[j][0] = 179.99;}
//			if (l1[j][1] > 180){l1[j][1] = 179.99;}
//			if (l1[j][0] > 180){l1[j][0] = 179.99;}
//			if (l1[j][1] > 180){l1[j][1] = 179.99;}	
//
//			if (l1[j][0] < -180){l1[j][0] = -179.99;}
//			if (l1[j][1] < -180){l1[j][1] = -179.99;}
//			if (l1[j][0] < -180){l1[j][0] = -179.99;}
//			if (l1[j][1] < -180){l1[j][1] = -179.99;}			
            
            // new bounds
            if (l1[j][0] > 180){l1[j][0] = 179.99;}
			if (l1[j][1] > 180){l1[j][1] = 179.99;}
			if (l1[j][0] > 180){l1[j][0] = 179.99;}
			if (l1[j][1] > 180){l1[j][1] = 179.99;}	

			if (l1[j][0] < -180){l1[j][0] = -179.99;}
			if (l1[j][1] < -180){l1[j][1] = -179.99;}
			if (l1[j][0] < -180){l1[j][0] = -179.99;}
			if (l1[j][1] < -180){l1[j][1] = -179.99;}	
            
		}
			
		return l1;				
	} // end modifypoly
	
	
	
	var k = -1;
	var j = -1;
	var temppolygon = JSON.parse(JSON.stringify(polygon));   // make a copy of the basemap
	var polygon2 = JSON.parse(JSON.stringify(polygon));		

	var tempdegree = JSON.parse(JSON.stringify(degree));
	var degree2 = JSON.parse(JSON.stringify(degree));	

	while (k++ < (countries - 1)) {	  //***************deform the countries one-by-one
//        console.log(temppolygon.features[k].geometry.coordinates[0])
//        console.log(polygon2.features[k].geometry.coordinates[0])
//        console.log(shift1)
		  polygon2.features[k].geometry.coordinates[0] = modifypoly(temppolygon.features[k].geometry.coordinates[0],shift1);  
	}

	while (j++ < (lines - 1)) {	  //***************deform the lines one-by-one
		  degree2.features[j].geometry.coordinates[0] = modifypoly(tempdegree.features[j].geometry.coordinates[0],shift1);  
	}

	k = -1;
	j = -1;

	while (k++ < (countries - 1)) {     //**************** convert geographic coordinates to SVG coordinates to prevent D3 from resampling
		  polygon.features[k].geometry.coordinates[0] = polygon.features[k].geometry.coordinates[0].map(projection);
		  polygon2.features[k].geometry.coordinates[0] = polygon2.features[k].geometry.coordinates[0].map(projection);	
	}

		while (j++ < (lines - 1)) {     //**************** convert geographic coordinates to SVG coordinates to prevent D3 from resampling
		  degree.features[j].geometry.coordinates[0] = degree.features[j].geometry.coordinates[0].map(projection);
		  degree2.features[j].geometry.coordinates[0] = degree2.features[j].geometry.coordinates[0].map(projection);	
	}


	// svg.append("text")
	// 	.attr("x", 50)
	// 	.attr("y", 55)
	// 	.attr("text-anchor","start")
	// 	.text("Cycle between views")
	// 	.style("font-size","30px")
	// 	.on("click", function(d){
	// 		mapshift(3);
	// 	});

	function mapshift(n) {		//switch display veiw
		
		// d3.selectAll(".circle") // unselected cicle
		// 	.transition()
		// 	.duration(500)
		// 	.style("fill","white")
		// 	.style("stroke","dimgray")
		// 	.attr("r",2);
			
		// d3.select(".circle" + n) // selected circle
		// 	.transition()
		// 	.duration(500)
		// 	.style("fill","black")
		// 	.style("stroke","dimgray")
		// 	.attr("r",3);
	
		// depending on the current mapVersion, draw the other, and then change the 
		if (n==1) {
			mapVersion = 2; 
			map2();
			return mapVersion;
		}
		if (n==2) {
			mapVersion = 1;
			map1();
			return mapVersion;
		}
		if (n==3) {running = true; play();}

	}
					
	var pathn = d3.geo.path().projection(null);

	var pathd = d3.geo.path().projection(null);

	var regions = [];
	
	
	
	for (i = 0; i < polygon.features.length; i++) {
		regions.push(polygon.features[i].properties.Region);
	}


	Array.prototype.unique = function() {
	  return this.filter(function (value, index, self) { 
	    return self.indexOf(value) === index;
	  });
	}

	regions = regions.unique();
	regions = regions.sort();

	//Create an array of colors foreach country from the D3 pallete "categorry 20" with minor adjustments
	var palette = d3.scale.category20();
//	console.log(regions[regions.length]);
	for (i = 0; i < regions.length - 1; i++) {
		colorMap[regions[i]] = palette(i);
//		console.log(regions[i])
	}

	colorMap['Turky in Asia'] = '#00d2d2'
	colorMap['Turky in Europe'] = '#d7d700'

	var gridfill = svg.selectAll("g")     // draw the grid fill only (under the countres)
       .data(degree.features)
       .enter()
       .append("path")
       .attr("d", pathd)
       .style("stroke-width", 0)
       .style("fill", "oldlace")
//       .on("click", function(d){
//			mapshift(mapVersion);
//		});
    
    

	var worldmap = svg.selectAll("g")      //plot the map
       .data(polygon.features)
       .enter()
       .append("path")
       .attr("d", pathn)
       .each(function(d) {
       		d3.select(this)
       			.style("fill", function(d) { 
       					if (d.properties.Region == null)
       						{ return "lightgrey" }
       					else {return colorMap[d.properties.Region]}
       				})
       			.style("stroke", function(d) { 
       					if (d.properties.Region == null)
       						{ return "lightgrey" }
       					else {return "colorMap[d.properties.Region]"}
       				})
       			.attr("class",function(d) {
       			if (d.properties.Region != null) 
       				 { return "mapPoly"+d.properties.Region.replace(/\s+/g, "-")}
       			})
            //d3.select(this).on("mouseover", console.log(d.properties.Region))
            //if (d.properties.Region != null) console.log(d.properties.Region)
           })

       .style("stroke-width", 1)
       .style("vector-effect", "non-scaling-stroke") // keep the lines from disappearing when scaled.
       .text(function(d) { return d; })
       .on("mouseover", function(d, i) {
           
            var thisReg = d.properties.Region; // region without spaces
            console.log(thisReg);
            if (thisReg != null){ 
                //console.log(d.properties.Region)
               d3.select("#tooltip").text(thisReg)  // update the tooltip
               d3.selectAll(".mapPoly"+thisReg.replace(/\s+/g, "-"))  //highlight this map polygon (need to select all the countries in the region)
                   .style("fill", "#3F3418")
                   .style("stroke-width", "2.5px");
                // highlight the corresponding area on the chart
                d3.select("#"+thisReg.replace(/\s+/g, "\\ ")) 
                    .style("stroke", "#3F3418")
                    .style("stroke-width", "1.5px");

                //return tooltip.style("visibility", "visible");}
            }else{
                d3.select("#tooltip").text("Omitted from the chart")
            }
       })
       .on("mouseout", function(d){
       	var thisReg = d.properties.Region; // region without spaces
	       	
	           // change tooltip
	           d3.select("#tooltip").text("‎")
	        if (thisReg != null){
	            //unhighlight the corresponding area on the chart
	            d3.select("#"+thisReg.replace(/\s+/g, "\\ ")).style("stroke", "none"); 
	           
	           // unhighlight the map
	           d3.selectAll(".mapPoly"+thisReg.replace(/\s+/g, "-")).style("fill", function(d) { 
	       					if (thisReg == null)
	       						{ return "oldlace" }
	       					else {return colorMap[thisReg]}
	       		})
	//           
	 //           return tooltip.style("visibility", "hidden");});
	//       .on('mouseover', function(d, i) {
	//          if (d.properties.Region != null) console.log(d.properties.Region);
			}
        })
//        .on("click", function(d){
//			mapshift(mapVersion);
//		});
//    

	var gridlines = svg.selectAll("g")     // plot the grid lines only (over the countries)
       .data(degree.features)
       .enter()
       .append("path")
       .attr("d", pathd)
       .style("stroke", "#777")
       .style("stroke-width", 1)
       .attr("stroke-opacity", ".5")
       .attr("pointer-events", "none")
       .style("fill", "none")
       .style("vector-effect", "non-scaling-stroke"); // keep the lines from disappearing when scaled.
/*
	legend = svg.append("g")
	    .attr("class","legend")
	    .attr("transform","translate(10, 180)")
	    .style("font-size","14.5px")
	    .attr("fill", "transparent")
	    .call(d3.legend)
	
*/
	var running = false; // default state
	var mapVersion = 1; //default map

	gridfill.data(degree.features).transition().duration(2000).attr("d", pathd);
	gridlines.data(degree.features).transition().duration(2000).attr("d", pathd);
	worldmap.data(polygon.features).transition().duration(2000).attr("d", pathn);
    //************map transitions*********************
	function map1(){
		running = false;
		gridfill.data(degree.features).transition().duration(2000).attr("d", pathd);
		gridlines.data(degree.features).transition().duration(2000).attr("d", pathd);
		worldmap.data(polygon.features).transition().duration(2000).attr("d", pathn);
	}

	function map2(){
		running = false;
		gridfill.data(degree2.features).transition().duration(2000).attr("d", pathd);
		gridlines.data(degree2.features).transition().duration(2000).attr("d", pathd);
		worldmap.data(polygon2.features).transition().duration(2000).attr("d", pathn);
	}

	function play(){
				if (running == false) {
					return;
				}
				gridfill.data(degree2.features).transition().duration(2000).attr("d", pathd);
				gridlines.data(degree2.features).transition().duration(2000).attr("d", pathd);
				worldmap.data(polygon2.features).transition().duration(2000).attr("d", pathn);
				
				window.setTimeout(function() {
					gridfill.data(degree.features).transition().duration(2000).attr("d", pathd);
					gridlines.data(degree.features).transition().duration(2000).attr("d", pathd);
					worldmap.data(polygon.features).transition().duration(2000).attr("d", pathn);
				}, 4000);
				
				window.setTimeout(play, 8000);	
	}
    
//    function handleMouseOver(){
//        console.log("over")
//    }
	

// ** INSERT CHART SVG ** //
//d3.xml("cartogram/img/TimelineRegions.svg").mimeType("image/svg+xml").get(function(error, xml) {
//  if (error) throw error;
//  document.getElementById('chartImage').appendChild(xml.documentElement);
//    
//});

//var chartSvg = d3.select("chartImage");
//d3.select("#America").style("stroke", "red");
//
//document.getElementById("chartImage")
//  .addEventListener('mouseover', function(e) {
//  e.currentTarget.setAttribute('fill', '#ff00cc');
//});

//var chart_svg = d3.select("chartImage")
//var chart_svg = d3.select("chartImage")

// ** INSERT CHART SVG ** //
d3.text("https://pages.uoregon.edu/infographics/dev/timelineV2/pages/cartogram/img/TimelineRegions.svg", function(error, externalSVGText) {
         if (error) {console.log(error); return;}

       document.getElementById('chartImage').innerHTML=externalSVGText;
    
//        d3.select("polygon#America").style("stroke", "red"); selects one by name
    
//    // selects all region group as one
//    d3.select("#regions")
//      .on("mouseover", function(d) {   
//            d3.select(this).style("stroke", "red");
//        })
//       .on("mouseout", function(d) {   
//            d3.select(this).style("stroke", "none");
//        });
    
    d3.selectAll(".st17").attr("pointer-events", "none")// one of the label classes
    
    
    // selects all regions group
    // NOTE: be sure to add the class "regionPoly" to every region in the SVG if it's changed.
    d3.selectAll(".regionPoly")
      .on("mouseover", function(d,i) { 
        
            var thisReg = this.id;
            console.log(thisReg)
            // highlight the region on the chart
            d3.select(this)
                .style("stroke", "#3F3418")
                .style("stroke-width", "1.5px"); 
            d3.select("#tooltip").text(thisReg) // change the tooltip
            //highlight the area on the map
			d3.selectAll(".mapPoly"+thisReg.replace(/\s+/g, "-"))  //highlight this map polygon (need to select all the countries in the region)
                   .style("fill", "#3F3418")
                   .style("stroke-width", "2.5px");
        })
       .on("mouseout", function(d,i) {   
       		var thisReg = this.id;
            d3.select(this).style("stroke", "none");
            d3.select("#tooltip").text("‎")
            d3.selectAll(".mapPoly"+thisReg.replace(/\s+/g, "-")).style("fill", function(d) { 
	       					if (thisReg == null)
	       						{ return "oldlace" }
	       					else {return colorMap[thisReg]}
	       		})
                   
        });

});
// worldmap.selectAll("Path").style("stroke", "red");

    
    $( "#distortButton").click(function() {
    mapshift(mapVersion);
        if (mapVersion==1) {
            $( "#distortButton").text(" Distort map ")
		}
		if (mapVersion==2) {
			$( "#distortButton").text("Restore map")
		}
        
});
});



   
// Currently works for chrome.
// // **  CHECK FOR CHROME ** //
// // please note, 
// // that IE11 now returns undefined again for window.chrome
// // and new Opera 30 outputs true for window.chrome
// // but needs to check if window.opr is not undefined
// // and new IE Edge outputs to true now for window.chrome
// // and if not iOS Chrome check
// // so use the below updated condition
// var isChromium = window.chrome;
// var winNav = window.navigator;
// var vendorName = winNav.vendor;
// var isOpera = typeof window.opr !== "undefined";
// var isIEedge = winNav.userAgent.indexOf("Edge") > -1;
// var isIOSChrome = winNav.userAgent.match("CriOS");

// if (isIOSChrome) {
//    // is Google Chrome on IOS
// } else if(
//   isChromium !== null &&
//   typeof isChromium !== "undefined" &&
//   vendorName === "Google Inc." &&
//   isOpera === false &&
//   isIEedge === false
// ) {
//    // is Google Chrome
//     d3.select("#tooltip").text("This feature is not currently supported by Chrome. Please view this page in Firefox or Edge.") // change the tooltip
// } 
// // else { 
//    // not Google Chrome 
// //}

pymChild = new pym.Child();
