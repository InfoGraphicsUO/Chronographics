function escapeQuotes(str) {
    return String(str).replace(/'/g, "\\'").replace(/"/g, '\\"');
}

function wikiLabelFromUrl(url) {
    // function to parse wikipedia article titles to grab 'modern' names
    if (!url || url === "unknown" || url.indexOf("wikipedia.org/wiki/") === -1) return "";
    var slug = url.split("/wiki/")[1];
    if (!slug) return "";
    slug = slug.split("#")[0].split("?")[0];
    try {
        slug = decodeURIComponent(slug);
    } catch (e) { /* keep raw slug */ }
    return slug.replace(/_/g, " ").trim();
}

function stripDiacritics(str) {
    // strips diacritics from people's names for easier searching
    return String(str)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function clearTimeline(){ 
    // fade everything,
    peopleGroup.selectAll(".people-lines, .circles, .timeline-text, .mouse-lines, .people-lines-background, .circles-background, .timeline-text-background")
        //.attr('pointer-events', 'none') // prevent mouse interaction while fading
        //.transition().duration(300) 
        //.style("opacity", 1e-6)//fade to near 0 before removing
        .remove();
    // no map on new page 
      //  if (page == "biographyMap.html"){ clearMapPeople(); }
//    mouseOut(); // if a tooltip was open, close it
//    document.getElementById("wikiLink").innerHTML = 'Click on a chart name to view their Wikipedia page, if available.';

}

//function fadeIn(){ 
//    // NOTE: sometimes the tooltip opens while things are fading, so close it (may be a cleaner way to do this) 
//    // fade everything,
//    peopleGroup.transition()
//        .duration(800)
////        .attr("opacity", 1.0) //we can't fade them in = 0 as the math messes up in the fade
//        .style("fill", "red");
////        .style("font-size", "2em");
//}

function applyChartNameVisibility() {
    if (!drawNames) { // if not drawing names, hide all names
        peopleGroup.selectAll(".timeline-text,.timeline-text-background")
            .classed("d-none", true) // d-none is bootstrap class for display: none
            .classed("hiddenGuy", true);
        return;
    }

    // so drawNames is true ... show all names
    peopleGroup.selectAll(".timeline-text,.timeline-text-background")
        .classed("d-none", false);

    if (currentFilterMatchSet) {
        // if there is a filter applied, show names that match the filter
        peopleGroup.selectAll(".timeline-text-background").classed("hiddenGuy", false); 
        peopleGroup.selectAll(".timeline-text").classed("hiddenGuy", true);
        peopleGroup.selectAll(".timeline-text")
            .filter(function(d) { return d && currentFilterMatchSet.has(d); })
            .classed("hiddenGuy", false);
    } else { // no filter so show all names
        peopleGroup.selectAll(".timeline-text,.timeline-text-background")
            .classed("hiddenGuy", false);
    }
}

function drawNameFunc() {
    // do draw names
    drawNames = document.getElementById("drawName_CB").checked;
    applyChartNameVisibility();
    // if(document.getElementById("drawName_CB").checked){
    //     drawNames = true;

    //     var idsToShow = currentFilterMatchSet ? Array.from(currentFilterMatchSet) : null;

    //     if (!idsToShow) {
    //         // show all names when no filters are active
    //         peopleGroup.selectAll(".timeline-text,.timeline-text-background")
    //             .classed("d-none", false)
    //             .classed("hiddenGuy", false);
    //     } else {
    //         // show only filtered names
    //         peopleGroup.selectAll(".timeline-text,.timeline-text-background")
    //             .classed("d-none", true)
    //             .classed("hiddenGuy", false);

    //         idsToShow.forEach(function(id) {
    //             peopleGroup.selectAll("#" + id + ".timeline-text,#" + id + ".timeline-text-background")
    //                 .classed("d-none", false)
    //                 .classed("hiddenGuy", false);
    //         });
    //     }

    // // remove names   
    // } else {
    //     drawNames = false;
    //    // peopleGroup.selectAll(".timeline-text-background,.timeline-text")
    //    // .classed("d-none",true);
    //     peopleGroup.selectAll(".timeline-text-background,.timeline-text")
    //      .classed("d-none",true)
    //      .classed("hiddenGuy", true);
    // }
}

    // console.log(checkBox.checked);
    // changeCase = true; // set the fact we DO want to redraw this case
    // drawNames = checkBox.checked; // change the value of the state
    

    // if (drawNames == false){
    //     peopleGroup.selectAll(".timeline-text-background, .timeline-text")
    //     //.attr('pointer-events', 'none') // prevent mouse interaction while fading
    //     //.transition().duration(300) 
    //     .style("opacity", 1e-6)//fade to near 0 before removing
    //     //.remove();
    // } else {
    //     // remove em all This slows it down. Perhaps find a better way of only adding what is needed
    //     peopleGroup.selectAll(".timeline-text-background, .timeline-text")
    //     //.attr('pointer-events', 'none') // prevent mouse interaction while fading
    //     //.transition().duration(300) 
    //     .style("opacity", 0.4)//fade to near 0 before removing
    //     //.remove();

    //     // add em all back
    //     //drawBackgroundLines();
    //     lookupCase(currentCase); // rerun the current case
    // }

    //

    // no map on new page 
      //  if (page == "biographyMap.html"){ clearMapPeople(); }
    
//}

function mouseOverChartSection(thisSection, d, section){
    d3.select(thisSection).attr("fill-opacity", 0.23)
    d3.select(thisSection).attr("stroke", "dimgrey")
   //console.log(sectionText[section]['label'])
    
    //get ruler
    
//    var rect = e.target.getBoundingClientRect();
//    var x = e.clientX - rect.left; //x position within the element.
    
//    console.log(d3.event.x) // NEED TO SCALE x for current zoom...
//    console.log(d3.event) // NEED TO SCALE x for current zoom...
    
    var hoverYearLabel = getHoverYearLabel();
    var tooltipHTML = sectionText[section]['label'] + "<br/>";
    if (hoverYearLabel) {
        tooltipHTML += hoverYearLabel + "<br/>";
    }
    tooltipHTML += "Era of " + findRuler(d3.event.x) + "<br/>";
    
    toolTip.html(tooltipHTML)
      .style("left", (d3.event.pageX) + "px")     
      .style("top", (d3.event.pageY) + "px");  

    toolTip.transition()
         .duration(100)    
         .style("opacity", .9);
}

function getHoverYearLabel() {
    if (!d3.event) return "";
    var mouse = d3.mouse(svg.node());
    if (!mouse) return "";
    var viewport = getChartViewport();
    var scale = (viewport.wide / outerWidth) * currentZoom;
    if (!scale) return "";
    var chartX = (mouse[0] - currentDragX) / scale;
    var dateValue = xScale.invert(chartX);
    if (!dateValue || isNaN(dateValue.getTime())) return "";

    var yearValue = dateValue.getFullYear();
    if (isNaN(yearValue)) return "";
    var roundedYear = Math.round(yearValue);
    if (roundedYear === 0) return "1 BC";
    if (roundedYear < 0) return Math.abs(roundedYear) + " BC";
    return "AD " + roundedYear;
}

function mouseOutChartSection(thisSection){
    d3.select(thisSection)
        .attr("fill-opacity", 0.13)
        .attr("stroke", "none");
    mouseOut();

}


function mouseOverSectionTitle(d){
    var sectionID = sectionText[d.section].label.replace(/\s/g, "") // name of section without spaces
    //console.log(sectionID)
    svg.select("rect[id='"+sectionID+"']").attr("fill-opacity", 0.23)
    svg.select("rect[id='"+sectionID+"']").attr("stroke", "dimgrey")
   //console.log(sectionText[section]['label'])
    var tooltipHTML = d.label

    toolTip.html(tooltipHTML)
      .style("left", (d3.event.pageX - 125) + "px")     
      .style("top", (d3.event.pageY) + "px");  

    toolTip.transition()
         .duration(100)    
         .style("opacity", .9);
}

function mouseOutSectionTitle(d){
    var sectionID = sectionText[d.section].label.replace(/\s/g, "") // name of section without spaces
    //console.log(sectionID)
    svg.select("rect[id='"+sectionID+"']")
        .attr("fill-opacity", 0.13)
        .attr("stroke", "none");
    mouseOut();

}

function isVaryingLineStyleActive() {
    // check if the varying line style filter is currently active
    var checkbox = document.getElementById("varyingLineStyle_CB");
    return (checkbox && checkbox.checked) || F_varyingLineStyle !== "";
}

function getPersonIndexLineImage(person) {
    // grab the image of both cases for the varying line style hover tooltip
    var caseCode = String(person.lineType || "").trim().toLowerCase();
    var caseMatch = caseCode.match(/\d+/);
    var caseNumber = caseMatch ? parseInt(caseMatch[0], 10) : null;

    if (caseCode.indexOf("case") === 0) {
        return caseCode + ".png";
    }
    if (caseNumber) {
        return "case" + caseNumber + ".png";
    }
    return "";
}

function getPersonVisualLineImage(person) {
    var visualCase = person.VisualCase || person.ExpectedVisualCase || "";
    return lookupVisualCaseImage(visualCase) || "";
}



 function mouseOverChartPeople(thisThing, key, fromDate, toDate, indexText){
//function mouseOverChartPeople(d, fromDate, toDate, indexText){
    //console.log("thisThing getBoundingClientRect().right:")
    temp = thisThing;
    //console.log(thisThing.getBoundingClientRect().right)

    // if the tooltip was triggered by a mouseover
    if (d3.event.pageX == undefined){
         // console.log("event undefined")
         newX = Math.round(thisThing.getBoundingClientRect().right) + 5;  
         newY =  Math.round(window.pageYOffset + thisThing.getBoundingClientRect().top - margin.top); // minus the header;
         // console.log("top: " + thisThing.getBoundingClientRect().top)
         // console.log("ctm: " + thisThing.getCTM().top)
         // console.log("ctm inverse: " + thisThing.getCTM().inverse)
         //console.log(allPeople[d][0].LineNumber)
         // newY = Math.round(thisThing.getBoundingClientRect().top);
    } else { // was triggered programmatically 
        newX = d3.event.pageX;
        newY = d3.event.pageY;
    }
    // console.log("New X,Y")
    // console.log(newX+ ", " + newY)
     
    var tooltipHTML = ""

    var G; // gender
    //if (allPeople[key][0].gender != null && allPeople[key][0].gender != '0' && allPeople[key][0].gender !='unsure') {
    if (allPeople[key][0].gender == "male" || allPeople[key][0].gender == "female"){
        G = allPeople[key][0].gender
        //capitalize
        G= G[0].toUpperCase() + G.substr(1)
    } else G = "Unknown";
    var P; // profession
    if (allPeople[key][0].profession !== undefined && allPeople[key][0].profession != "" && allPeople[key][0].profession != "X") {
        P = allPeople[key][0].profession;
    } else P = "";

    var A = ""; // age
    if (allPeople[key][0].LifeLength > 0) {
        if (allPeople[key][0].LifePrecision != "") A = "~ "
        A += allPeople[key][0].LifeLength;
    } else {
        if (allPeople[key][0].AproxAge === 60 || allPeople[key][0].AproxAge === 0 || isNaN(allPeople[key][0].AproxAge)) {
            A = "unknown";
        } else {
            A = "~ " + String(allPeople[key][0].AproxAge);
        }
    }


    var bornUncertainty ="";
    var thisCase = currentLineSystem === "visual" && allPeople[key][0].VisualCase ? allPeople[key][0].VisualCase : allPeople[key][0].lineType
    var tooltipCaseKey = allPeople[key][0].lineType || thisCase;
    var isEstimatedAge = allPeople[key][0].LifePrecision != "" || tooltipCaseKey == "case4" || tooltipCaseKey == "case5";
    if (A && A !== "unknown" && isEstimatedAge && A.indexOf("~") !== 0) {
        A = "~ " + A;
    }
    if (tooltipCaseKey == "case2" || tooltipCaseKey == "case4" || tooltipCaseKey == "case3" || tooltipCaseKey == "case8" || tooltipCaseKey == "case13") {
        bornUncertainty = "~ ";
    }

    var deathUncertainty ="";
    if (tooltipCaseKey == "case5" || tooltipCaseKey == "case7" || tooltipCaseKey == "case11" || tooltipCaseKey == "case14" || tooltipCaseKey == "case3" || tooltipCaseKey == "case8" || tooltipCaseKey == "case13") {
        deathUncertainty = "~ ";
    }
    
    var ageScale = 1.7; // to make the image wider if needed
    var ageWidth = (allPeople[key][0].AproxAge) * ageScale;
     
    // region
    var R = "";
    if (allPeople[key][0].Region != 0 || allPeople[key][0].Region == 'Unknown') {
        R = allPeople[key][0].Region
    } else {
         R = 'Unknown'
    };
//     var firstLine = thisCase + " " +
    var firstLine = "<span id='tooltip_topline'>"+allPeople[key][0].Name +" " + indexText + " " + P +"</span>";
    var lineStyleInfo = "";
    if (isVaryingLineStyleActive()) {
        // if the varying line style filter is active, show both styles with labels
        var indexImage = getPersonIndexLineImage(allPeople[key][0]);
        var visualImage = getPersonVisualLineImage(allPeople[key][0]);
        var indexLabel = currentLineSystem === "index" ? "<strong>Index</strong>" : "Index";
        var visualLabel = currentLineSystem === "visual" ? "<strong>Engraved chart</strong>" : "Engraved chart";
        var indexImg = indexImage ? "<img src='biography/img/" + indexImage + "' height='12px' />" : "";
        var visualImg = visualImage ? "<img src='biography/img/" + visualImage + "' height='12px' />" : "";

        if (indexImg || visualImg) {
            lineStyleInfo = "<span>Line style variation:</span>" +
                "<span style='display:block; margin-left:12px;'>" + indexLabel + ": " + indexImg + "</span>" +
                "<span style='display:block; margin-left:12px; margin-bottom:6px;'>" + visualLabel + ": " + visualImg + "</span>";
        }
    }
    

    
    var tooltipImage = currentLineSystem === "visual" ? lookupVisualCaseImage(thisCase) : "";
    if (!tooltipImage) {
        tooltipImage = thisCase + ".png";
    }
    var imgItem = "<img src='biography/img/" + tooltipImage + "' height='12px' width='" + ageWidth + "'> "
    
    
    var startDateText = "";
    var endDateText = "";
    var underText = ""
    
    if (fromDate < 0 && toDate > 0 ){
        startDateText = bornUncertainty + Math.abs(fromDate) + " BC ";
        endDateText = toDate;
    } else if (fromDate < 0 ){
        startDateText = bornUncertainty + Math.abs(fromDate) + " BC ";
        endDateText = deathUncertainty+ Math.abs(toDate)+ " BC";
    } else{
        startDateText = bornUncertainty;
        endDateText = deathUncertainty + toDate;
    } 
     

     


if (tooltipCaseKey == "case2" ||  tooltipCaseKey == "case8") {
    startDateText = "" // no text before line
    A = "unknown" // replace age

}

if (tooltipCaseKey == "case15" || thisCase == "L") {
    endDateText = "" // unknown death — line extent is symbolic, not a date
    A = "unknown";
    if (fromDate < 0) {
        startDateText = Math.abs(fromDate) + " BC ";
    } else {
        startDateText = fromDate;
    }
}
     
if (tooltipCaseKey == "case3"||  tooltipCaseKey == "case13") {
     startDateText = "" // no text before line
     endDateText = "" // no text after line
     A = "unknown" // replace age
     if (allPeople[key][0].AliveDate < 0 ){
         var underDate =  Math.abs(allPeople[key][0].AliveDate) + " BC"
     } 
    if (allPeople[key][0].AliveDate > 0 ) {
         var underDate = allPeople[key][0].AliveDate 
     }
     underText = "<br/><span style='padding-left:1.5em; margin-top:-2em;'>"+ underDate + "<br/></span>"
}
     
   var lastLine = "    Lifespan: " + A +" years<br/>Profession: " +  lookupProfessionCode(allPeople[key][0].profession) + "<br> Gender: " + G + " <br/>Region: " + R;  
     
    var showTimelineText = !isVaryingLineStyleActive();
    var timelineText = showTimelineText
        ? "<span id='tooltip_timeline_text'>" + startDateText + imgItem + endDateText + underText + "</span>"
        : "";
    tooltipHTML = firstLine + lineStyleInfo + timelineText + lastLine;  
    
    
    
    




          
     
     toolTip.html(tooltipHTML)
            .style("left", newX + "px")   
            .style("top", newY + "px");

//    toolTip.classed('old-looking-font',true);

    toolTip.transition()
         .duration(100)    
         .style("opacity", .9); 
}


/*
function lookupCase(inputCase) {
  switch (inputCase){
        case "drawAllPeople":
            return drawAllPeople();
        case "drawYoungPeople":
            return drawYoungPeople();
        case "unmatchedNames":
            return unmatchedNames();
        case "femalePeople":
            return femalePeople();
        case "examplePeople":
            return examplePeople();
        case "drawProfession":
            return drawProfession(currentProfession);
        case "drawCase":
            return drawCase(currentLineStyle);
        case "userFunction":
            return userFunction();
  }
}
*/


// for looking up colors to fill polygons. NOTE if changing, also change lookupColorRGBA()
function lookupColor(inputColor) {
	switch (inputColor){
		case "pink":
			return "lightpink";
		case "blue":
			return "lightskyblue";
		case "yellow":
			return "khaki";
		case "green":
			return "darkseagreen";
		default:
			return "transparent";
 }
}


// for looking up colors to fill polygons, adds 0.13 opacity, NOTE related to lookupColor()
function lookupColorRGBA(inputColor) {
  switch (inputColor){
    case "pink":
      return "rgba(255,182,193,0.13)";
    case "blue":
      return "rgba(135, 206, 250,0.13)";
    case "yellow":
      return "rgba(240, 230, 140,0.13)";
    case "green":
      return "rgba(143, 188, 143,0.13)";
    default:
      return "transparent";
 }
}


/*
function lookupSectionColor(inputSection) {
	switch (inputSection){
		case "Divines and Metaphysicians &cc":
			return lookupColor(pink);
		case "Mathematicians &cc Physicians":
			return lookupColor(blue);
		case "Artists Poets":
			return lookupColor(yellow);
		case "Orators and Critics &cc":
			return lookupColor(pink);
        case "Historians and Antiquaries Lawyers":
            lookupColor(green);
        case "Statesmen and Warriors":
			return lookupColor(yellow);
		default:
			return "black";
 }
}
*/


function setProfessionDropDownColors(){
  d3.selectAll(".pink-bg").style("background-color",lookupColorRGBA("pink"));
  d3.selectAll(".blue-bg").style("background-color",lookupColorRGBA("blue"));
  d3.selectAll(".green-bg").style("background-color",lookupColorRGBA("green"));
  d3.selectAll(".yellow-bg").style("background-color",lookupColorRGBA("yellow"));
}

function compilePeopleFilterPredicate(peopleFilter) {
    // Legacy compatibility: filters are now built from filterState, not executable strings.
    if (peopleFilter === true || !isFilterStateActive()) return null;
    return buildFilterPredicate(filterState);
}

/*
function getForegroundPeople(keys) {
    // use the cached match set to keep only the people that survived the current filter
    if (!currentFilterMatchSet) return keys;
    return keys.filter(function(key) {
        return currentFilterMatchSet.has(key);
    });
}
*/

// console.log("middle of JS")

function clearSelectedPeople(){
    mouseOut(); // close the tooltip
    d3.selectAll(".selectedGuy").classed("selectedGuy", false); 
    d3.selectAll(".selectedGuyText").classed("selectedGuyText", false); 
    d3.selectAll(".selectedGuyBox").classed("selectedGuyBox", false); 
    d3.selectAll("#clearSelectionButton").classed("disabled", true);
    //updateLink(''); //update link with a null
    d3.select("#selectedLink").remove();
    d3.select("#descriptive_text").html("Click a name to view text.");

    d3.selectAll(".s-list").remove(); // remove all the elements in the selector box 
    
    // empty out the click list
    clickList = [];
}

function restoreSelectedPeople() {
    // after a redraw, reapply the selected classes so previously selected people stay highlighted
    if (!clickList || clickList.length === 0) return;

    clickList.forEach(function(id) {
        peopleGroup.selectAll(".people-lines,.circles")
            .filter(function(s) {
                return s == id;
            })
            .classed("selectedGuy", true);

        peopleGroup.selectAll(".timeline-text,.timeline-text-background")
            .filter(function(s) {
                return s == id;
            })
            .classed("selectedGuyText", true);
    });
}

/*
function logChartReady(sourceLabel) {
    var now = new Date();
    // console.log(now.toUTCString() + " chart ready: " + sourceLabel);
}
*/


// person clicked in chart
function selectPerson(e){
        
     //console.log("e " + e)
	 //console.log("display name " + e.DisplayName)
     //console.log("link " + e.Link)
    // remove the selected class from existing selected guy (on chart and in list)
    //clearSelectedPerson();
    d3.selectAll("#clearSelectionButton").classed("disabled", false);
    // change color of the solid lines, solid dots, and timeline-text

    
    
     // select name from list
    var  id = e;// e.DisplayName.replace(/[\'\. ,:-]+/g, "-")
    thisGuy = document.getElementById(id)
//    thisGuy.scrollIntoView();
  
    // check if name is NOT in list
   if( clickList.indexOf(e) === -1) {

    
        clickList.push(e)
        //sort the people in the list
            clickList = clickList.sort((a, b) => d3.ascending(allPeople[a][0].Name, allPeople[b][0].Name)) // sort by name in index

       // highlight the person's lines and dots on the chart 
       peopleGroup.selectAll(".people-lines,.circles")
        .filter(function(s) {
                return (s == e); 
        }).classed("selectedGuy",true);
       
       // highlight the person's name on the chart 
        peopleGroup.selectAll(".timeline-text,.timeline-text-background")
        .filter(function(s) {
                return (s == e); 
        }).classed("selectedGuyText",true);

        //peopleGroup.selectAll(".selectedGuy").scrollIntoView;




        // if the name is in the list, scroll it to the top
        thisElement = document.getElementById("list-"+id)
    //    d3.selectAll("#list-"+id).classed("selectedGuy",true); 
    //    console.log(thisElement.offsetTop)
        var topPos  = thisElement.offsetTop;

        // scroll to person
    //    $("#filterResultsBox").animate({scrollTop:topPos-30},500);
        populateSelectionBox();
        // add the person's description
        setDescriptiveText(id) 

    } else { 
        // console.log("This person is already selected");
        // resultUnClicked(id);  // unselects the person if clicked
        setDescriptiveText(e) // keep them in the selection list and put their info in the description box
    
    }

    flyToPerson(id);
}



function populateSelectionBox(){
    var selectionList = d3.selectAll('#selectionResultsBox')
    selectionList.text("")// empty list
    selectionList.selectAll("element")
     .data(clickList)
     .enter().append("div")
     .html(function(thisGuy) { 
        return allPeople[thisGuy][0].Name + `<i class="fa fa-minus-square-o" aria-hidden="true" onclick="resultUnClicked('`+thisGuy+`')"></i>`; })
     .attr("id", function(thisGuy) { return "selectList-"+ thisGuy; })
//     .sort(d3.ascending)
//     .sort((a, b) => d3.descending(a.DisplayName, b.DisplayName)) // sort by displayname
     .attr('class','s-list selectedGuyBox')
     .attr('style','direction: ltr')
     .on("click", function(e){ 
//           setDescriptiveText(e)
            resultClicked()
     });
}


