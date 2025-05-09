var imgHeight = 800, imgWidth = 1020,      // Image dimensions (don't change these)
    width =  1580, height = 1260,             // Dimensions of cropped region
    translate0 = [-15,-75], scale0 = 1;  // Initial offset & scale

comContainer = d3.select( "#zoom" ).append("svg")
    .attr("width",  width + "px")
    .attr("height", height + "px")
    .style("fill", "#f5f8fd");


comContainer.append("rect")
    .attr("class", "overlay")
    .attr("width", width + "px")
    .attr("height", height + "px");

comContainer = comContainer.append("g")
    .attr("transform", "translate(" + translate0 + ")scale(" + scale0 + ")")
    .append("g");

comContainer.append("image")
    .attr("width",  imgWidth + "px")
    .attr("height", imgHeight + "px")
    .attr("xlink:href", "img/orig2.jpg");

function zoomCompare(zoomScale, tx, ty) {
//  console.log("zoom: " + zoomScale);
 
// orig scale function    
//  comContainer.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    
    if (zoomScale > 4.5){ // cap zoom at level 4
        zoomScale = 4.5
    }
          
        if (zoomScale > 1){

            ty = ty-(zoomScale * 100); //shfit the image up
        }
        comContainer.attr("transform", "translate(" + [(tx), (ty)] + ")scale(" + zoomScale + ")");

//        console.log("translate: tx:" + tx + " ty:" + ty + ", scale: " + zoomScale);
    
   
    
    
    
    
    // scale only
//    comContainer.attr("transform", "scale(" + d3.event.scale + ")");
  
    
}
