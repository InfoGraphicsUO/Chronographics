var imgHeight = 1000, imgWidth = 1050,      // Image dimensions (don't change these)
    width =  400, height = 400,             // Dimensions of cropped region
    translate0 = [-40,-300], scale0 = 1;  // Initial offset & scale

magContainer = d3.select( "#zoom" ).append("svg")
    .attr("width",  width + "px")
    .attr("height", height + "px");

magContainer.append("rect")
    .attr("class", "overlay")
    .attr("width", width + "px")
    .attr("height", height + "px");

magContainer = magContainer.append("g")
    .attr("transform", "translate(" + translate0 + ")scale(" + scale0 + ")")
    .append("g");

magContainer.append("image")
    .attr("width",  imgWidth + "px")
    .attr("height", imgHeight + "px")
    .attr("xlink:href", "img/orig.jpg");

function zoom() {
  magContainer.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
//  console.log("translate: " + d3.event.translate + ", scale: " + d3.event.scale);
}
