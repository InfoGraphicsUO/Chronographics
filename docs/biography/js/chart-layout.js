// ~ = ~ = ~ = ~ = ~ SVG elements ~ = ~ = ~ = ~ = ~ //

// The timeline SVG
var svg =  d3.select("#timeline")
    .append("svg")
    .attr("id", "svg-chart")
    .attr("width", "100%")
    .attr("height", "100%");
var chart = $("#svg-chart");
var container = chart.parent(),
    containerParent = container.parent();

// Math out the parts of the plot
// using fixed layout coordinates so the chart always lays out this size consistently between viewport sizes
var CHART_ASPECT = 1.8;
var CHART_BASE_WIDTH = 1450;
var CHART_BASE_HEIGHT = Math.round(CHART_BASE_WIDTH / CHART_ASPECT);
var CHART_VIEWPORT_MAX_HEIGHT = 685;

function setChartLayoutDimensions() {
    aspect = CHART_ASPECT;
    outerWidth = CHART_BASE_WIDTH;
    outerHeight = CHART_BASE_HEIGHT;
    width = outerWidth - margin.left - margin.right;
    height = outerHeight - margin.top - margin.bottom;
    innerWidth = width - padding.left - padding.right;
    innerHeight = height - padding.top - padding.bottom;
    endX = startX + width;
    endY = startY + height;
    endInX = startInX + innerWidth;
    endInY = startInY + innerHeight;
    categoryX = endInX + padding.right + (margin.right / 9);
}

setChartLayoutDimensions();

var numRows = 164;




