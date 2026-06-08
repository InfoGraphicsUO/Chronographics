function getChartViewport() {
    var wide = container.width();
    var high = wide / CHART_ASPECT;

    if (high > container.height()){
        high = container.height();
        wide = high * CHART_ASPECT;
    }
    if (high > CHART_VIEWPORT_MAX_HEIGHT){
        high = CHART_VIEWPORT_MAX_HEIGHT;
        wide = high * CHART_ASPECT;
    }

    return {
        wide: wide,
        high: high
    };
}

function syncChartLoadingOverlaySize() {
    var overlay = document.getElementById("chartLoadingOverlay");
    if (!overlay) return;
    var size = getChartViewport();
    var scale = size.wide / outerWidth;
    overlay.style.width = size.wide + "px";
    overlay.style.height = size.high + "px";
    overlay.style.setProperty("--load-offset-x", (((startInX + endInX) / 2) * scale) + "px");
    overlay.style.setProperty("--load-offset-y", (((startInY + endInY) / 2) * scale) + "px");
}

// ~ ~ ~ Function to scale the main group ~  ~ ~
function applyChartTransform(scale) {
    // keep every chart layer on the same transform so zoom and pan stay aligned
    // scale is the current on screen zoom factor for the whole svg
    // currentdragx and currentdragy are the shared pan offsets in screen pixels
    var transformValue = "matrix(" + scale + ",0,0," + scale + "," + currentDragX + "," + currentDragY + ")";
    d3.select(".topGroup").attr("transform", transformValue);
    d3.select(".middleGroup").attr("transform", transformValue);
    d3.select(".bottomGroup").attr("transform", transformValue);
    d3.select(".peopleGroup").attr("transform", transformValue);
    d3.select(".categoryGroup").attr("transform", transformValue);
}

function clampPan(scale, viewport) {
    // keep the chart inside the visible frame so panning cannot drift past the edges
    // scale converts the chart size into screen space at the current zoom level
    var size = viewport || getChartViewport();
    var wide = size.wide;
    var high = size.high;

    var scaledWidth = outerWidth * scale;
    var scaledHeight = outerHeight * scale;

    // when the chart fits inside the viewport there is no legal pan range
    if (scaledWidth <= wide) {
        currentDragX = 0;
    } else {
        var minX = wide - scaledWidth;
        var maxX = 0;
        currentDragX = Math.max(minX, Math.min(maxX, currentDragX));
    }

    if (scaledHeight <= high) {
        currentDragY = 0;
    } else {
        var minY = high - scaledHeight;
        var maxY = 0;
        currentDragY = Math.max(minY, Math.min(maxY, currentDragY));
    }
}

function zoomChartTo(nextZoom, anchorX, anchorY) {
    if (!bioChartInteractionEnabled) return;
    // zoom around an anchor point so the chart stays under the cursor or centered slider
    // old scale is the current view before the zoom step and new scale is the target view
    var viewport = getChartViewport();
    var oldScale = (viewport.wide / outerWidth) * currentZoom;
    currentZoom = Math.max(1.0, Math.min(8.0, nextZoom));
    var newScale = (viewport.wide / outerWidth) * currentZoom;

    // anchor coordinates are in screen pixels so we convert them back into chart space
    if (oldScale > 0) {
        var anchorChartX = (anchorX - currentDragX) / oldScale;
        var anchorChartY = (anchorY - currentDragY) / oldScale;

        // move the chart so the same chart point stays under the same anchor after zoom
        currentDragX = anchorX - anchorChartX * newScale;
        currentDragY = anchorY - anchorChartY * newScale;
    }

    clampPan(newScale, viewport);
    sizeChange(currentZoom, viewport);
}

function sizeChange(factor, viewport) {
    // console.log("resizing")
    // console.log("x: " + currentDragX)
    // console.log("y: " + currentDragY)

    // Resize the timeline
    var size = viewport || getChartViewport();
    var wide = size.wide;
    var high = size.high;

    // factor is the user chosen zoom level and wide tracks the visible chart width
    // aspect keeps the chart shape stable instead of stretching to the container
    // scale converts the chart from its base size into the current viewport size
    var scale = (wide/outerWidth)*factor;
 //   var translateX = (wide*scale)/-2
//    d3.select(".topGroup").attr("transform", "scale(" + scale + ") translate(" + translateX + " 0)");
    clampPan(scale, size);
    applyChartTransform(scale);

    $("#svg-chart").height(high);
    syncChartLoadingOverlaySize();


    // //get label locations
    // d3.selectAll(".label-text").each(function(d,i) {
    //     labelLeft = d3.select(this).style("left") // get the left value (it's a string)
    //     labelLeft = labelLeft.substring(0, labelLeft.length - 2); // trim the "px" off

    //     labelTop = d3.select(this).style("top") // get the left value (it's a string)
    //     labelTop = labelTop.substring(0, labelTop.length - 2); // trim the "px" off
    //     console.log(labelTop*(1.0/aspect))
    //    // console.log(labelLeft*scale)
    //     //d3.select(this).style("color","green")
    //     // d3.select(this).style("left", xScale(parseDate("1798")*scale)+"px")
    //     d3.select(this).style("left", wide-25+"px")
    //     //d3.select(this).style("top", labelTop*(1.0/aspect)+"px")
    //     console.log(wide-25)

    //     //d3.select('#timeline').selectAll("div").style(d3.select(this).style("left"),500)
    //    // d3.select(this).style("left") = d3.select(this).style("left")*scale 
    //    //d3.selectAll(".label-text").style("left",+ labelLeft*scale + "px")
    // })
   

    
}

function syncZoomSlider(zoomValue) {
    // keep the slider UI in sync when zoom is changed programmatically
    if (!zoomSlider || !zoomSlider.noUiSlider) return;
    // guard against slider handlers re-triggering zoom logic
    isZoomSliderSyncing = true;
    zoomSlider.noUiSlider.set([zoomValue * 100]);
    isZoomSliderSyncing = false;
}

function findFlyToNode(personId) {
    // find the main chart node that represents this person
    if (!peopleGroup) return null;
    return peopleGroup
    // prefer visible chart elements first, fall back to any matching node
        .selectAll(".people-lines, .mouse-lines, .timeline-text")
        .filter(function(d) { return d === personId; })
        .node();
}

function flyToChartPosition(chartX, chartY) {
    // animate pan/zoom so the given chart point lands in the center of the viewport
    if (!flyToEnabled) return;
    var viewport = getChartViewport();
    var targetZoom = Math.max(currentZoom, flyToMinZoom);
    var targetScale = (viewport.wide / outerWidth) * targetZoom;
    var targetDragX = (viewport.wide / 2) - (chartX * targetScale);
    var targetDragY = (viewport.high / 2) - (chartY * targetScale);

    // capture the current view so we can tween from the existing pan/zoom
    var startZoom = currentZoom;
    var startDragX = currentDragX;
    var startDragY = currentDragY;
    var startTime = Date.now();
    var durationMs = Math.max(0, flyToDurationMs || 0);

    if (durationMs === 0) {
        currentZoom = targetZoom;
        currentDragX = targetDragX;
        currentDragY = targetDragY;
        clampPan(targetScale, viewport);
        applyChartTransform(targetScale);
        syncZoomSlider(currentZoom);
        return;
    }

    var timer = d3.timer(function() {
        // ease out for a smoother finish
        var elapsed = Date.now() - startTime;
        var t = Math.min(1, elapsed / durationMs);
        var eased = 1 - Math.pow(1 - t, 3);

        // interpolate zoom and pan together so the chart doesn't "slip" during the move
        currentZoom = startZoom + (targetZoom - startZoom) * eased;
        currentDragX = startDragX + (targetDragX - startDragX) * eased;
        currentDragY = startDragY + (targetDragY - startDragY) * eased;

        // reapply transform at the new zoom and clamp if we overshoot
        var scale = (viewport.wide / outerWidth) * currentZoom;
        clampPan(scale, viewport);
        applyChartTransform(scale);
        syncZoomSlider(currentZoom);

        if (t >= 1) {
            timer.stop();
            // keep the slider aligned with the final zoom level
            syncZoomSlider(currentZoom);
            return true;
        }
        return false;
    });
}

function flyToPerson(personId) {
    // helper that centers the chart on the selected person
    if (!flyToEnabled) return;
    if (!personId) return;

    // get the rendered bounding box and target its center
    var node = findFlyToNode(personId);
    if (!node || !node.getBBox) return;

    var bbox = node.getBBox();
    if (!bbox || !isFinite(bbox.x) || !isFinite(bbox.y)) return;

    var centerX = bbox.x + (bbox.width / 2);
    var centerY = bbox.y + (bbox.height / 2);
    flyToChartPosition(centerX, centerY);
}


