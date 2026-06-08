function clearCheckBoxes(){
    //document.getElementById("drawName_CB").checked = true;
    //document.getElementById("name_CB").checked = false;
    resetTypedFilterState();
    F_gender = "";
    document.getElementById('gender_label').innerHTML = "Any ";
    F_profession = "";
    document.getElementById('profession_label').innerHTML = "Any  ";
    currentLineSelection = 0;
    currentLineStyle = "";
    F_LineStyle = "";
    F_varyingLineStyle = "";
    document.getElementById('line_label').innerHTML = "Any  ";
    document.getElementById("varyingLineStyle_CB").checked = false;
    // document.getElementById("age_CB").checked = false;
    F_age="";
    ageSlider.noUiSlider.set([0, 0]);
    ageSlider.noUiSlider.set([1, 100]);
//    zoomSlider.noUiSlider.set([100]);
    
    document.getElementById("ageAprox_CB").checked = false;
    aliveSlider.noUiSlider.set([0, 0]);
    aliveSlider.noUiSlider.set([-1200, 1800]);

    continent_CB = "";
    document.getElementById('continent_label').innerHTML = "Any  ";
    if($('#region_label').length > 0) {
      document.getElementById("region_label").innerHTML =" Any  ";
      F_region = "";
    }
    
    if(currentCase != "userNameFunction") document.getElementById("userInput").value= "";
    mouseOut(); // close the tooltip

}

function resultUnClicked(e){
    // console.log(e) // debug
    var  id = e;
    
    mouseOut(); // close the tooltip
    // console.log("unselecting id: "+id) // debug
    
    
    // remove name from the click list
    clickList = clickList.filter(function(thisGuy) { return thisGuy !== id })
    // repopulate the selection box from the clickList
    populateSelectionBox()
    
    // remove highlight from the person's line and text on the chart 
        peopleGroup.selectAll(".people-lines,.circles,.timeline-text,.timeline-text-background")
      .filter(function(s) {
                return (s == id); 
      })
        .classed("selectedGuy",false)
        .classed("selectedGuyText",false);
    ;
    
    setDescriptiveText('-99')
    
    //e.stopPropagation(); // don't bubble up clicking on parent

}


// person clicked in list
function resultClicked(){
    
   //console.log("event: " + event) // debug
   //console.log("clickity") // debug
    if (!flyToEnabled) {
        fullExtentBio(); // when clicking in the list, set the chart to full extent
    }

    // get the ID and replace any special characters
    // var  id = event.target.innerHTML.replace(/[\'\. ,:-]+/g, "-")
    var  id = event.target.id.split("-")[1] // split the list ID on the hyphen, and keep everything after it 
    //console.log("id: "+id) // debug

    if (id){ // if it has an id (which the link does not), do stuff
         //remove any existing active class 
        //clearSelectedPerson() 
        //console.log("id exists")
        
        clickObject = peopleGroup.select("#"+ id +".mouse-lines")

        // console.log(clickObject) // debug
        clickObject.dispatch('click'); 
        clickObject.dispatch('mouseover'); 

        //highlight class the target text
       // event.target.className += " selectedGuy";
        
        // add the person's description
        setDescriptiveText(id) 
    }
    
}


function fullExtentBio(){
    if (!bioChartInteractionEnabled) return;
    // reset the chart back to its full view and zero pan so the user starts centered
    currentZoom = 1.0;
    currentDragX =  0.0;
    currentDragY = 0.0;
    zoomSlider.noUiSlider.set([100]);
//    var scale = (wide/outerWidth)*currentZoom;
    
//    d3.select(".topGroup").attr("transform", "scale(" + currentZoom + ") translate(" + currentDragX + " " + currentDragY+ ")");
//    d3.select(".middleGroup").attr("transform", "scale(" + currentZoom + ") translate(" + currentDragX + " " + currentDragY+ ")");
//    d3.select(".bottomGroup").attr("transform", "scale(" + currentZoom + ") translate(" + currentDragX + " " + currentDragY+ ")");
//    d3.select(".peopleGroup").attr("transform", "scale(" + currentZoom + ") translate(" + currentDragX + " " + currentDragY+ ")");
//    d3.select(".categoryGroup").attr("transform", "scale(" + currentZoom + ") translate(" + currentDragX + " " + currentDragY+ ")");
    
}

svg.on("wheel", function(d){
    if (!bioChartInteractionEnabled) return;
    //console.log("zoom zoom")
    d3.event.preventDefault(); // prevent default page scroll

    // zoom should keep the point under the mouse fixed in place
    var rect = this.getBoundingClientRect();
    var mouseX = d3.event.clientX - rect.left;
    var mouseY = d3.event.clientY - rect.top;

    // old scale is the current transform before the wheel step
    // wheel delta is turned into a small zoom step and then clamped
    var nextZoom = (d3.event.wheelDelta < 0) ? currentZoom - 0.2 : currentZoom + 0.2;
    zoomChartTo(nextZoom, mouseX, mouseY);

    zoomSlider.noUiSlider.set([currentZoom * 100]);

      // sizeChange(currentZoom);
      //console.log(currentZoom)
      //zoom(direction === 'up' ? d : d.parent);

    //   var translateX = d3.event;
    //   var translateY = d3.event;
//      console.log(d3.event)
//      console.log(translateY)

});

// const delta = 0.5;
let dragStartX;
let dragStartY;
let dragStartPanX;
let dragStartPanY;


/*
 function redraw() {
     return svg.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")");
 }
*/

// SET descriptive text in the element
function setDescriptiveText(UOID) {
	// console.log("looking for UOID: " + UOID)
    
    if(UOID == "-99"){
        document.getElementById("descriptive_text").innerHTML = "Click another name to view text.";
        return false;
    }
    

        
    //watkinsID = allPeople[UOID][0].Watkins_ID
    var alternateName= ""
    var link = (allPeople[UOID][0].Link) ? allPeople[UOID][0].Link : '';
    var biography = allPeople[UOID][0].Biography
    var source = allPeople[UOID][0].BioSource
    var BioName = allPeople[UOID][0].BioName

    //console.log(link)
    var linkText = ''
    
    // get link info
    if(link !="" && link !="0"){

            if(link.indexOf("google") !== -1){
                thisImg = "<i class='fa fa-link'></i>"
                thisLinkType = 'to Google'
            } else if(link.indexOf("wikipedia") !== -1){
                thisImg = "<i class='fa fa-link'></i>"
                thisLinkType = 'to Wikipedia'
            }
        
            linkText ='<span id="selectedLink"><a class="p-0" target="_blank" title="Open link ' + thisLinkType +' in new window" href="'+ link +'">&nbsp;'+thisImg+'<span class="linkArrow">&#8599;</span></a></span>'
    } 
    
              
    var pName = "<span style='text-transform:uppercase'>" + allPeople[UOID][0].Name + "</span>";

    
    // // check description from Watkins
	// if (typeof watkinsID != 'undefined' && watkinsID in watkinsDict) {
    //     // NOTE: when dictionary is built, watkinsDict[ID][0] is name, watkinsDict[ID][1] is description, watkinsDict[ID][2] is source
        
    //     // SET NAME
    //     // add Watkins name if different
    //     if (allPeople[UOID][0].Name.toUpperCase() !=  watkinsDict[watkinsID][0].toUpperCase()){
    //         alternateName = " or <span style='text-transform:uppercase'>" + watkinsDict[watkinsID][0] + "</span>"
    //     }
        
       
    //     //set description
    //     document.getElementById("descriptive_text").innerHTML = pName + alternateName + linkText + "<br>"+ watkinsDict[watkinsID][1] + "<br>— " + watkinsDict[watkinsID][2]+" (Watkins)";
             
	// } else if(allPeople[UOID][0].alterrnateID != '' && allPeople[UOID][0].alterrnateID !== undefined) { // check for an Alternate description
    //     var alterrnateID = allPeople[UOID][0].Alternate_ID
    //     console.log("alterrnateID " + alterrnateID)
    //     // NOTE: when dictionary is built, alternateDict[ID][0] is name, alternateDict[ID][1] is description, alternateDict[ID][2] is the entry's source, alternateDict[ID][3] is text which was used
        

        
        // SET NAME
        // add Alternate name if bio name is different
        // allPeople[UOID][0].Name is the name in the field "Name"
        // allPeople[UOID][0].alternateName is the name in the field "alternateName"
        // NOTE: lost the bio text title with this setup, the old sheets
        // console.log(BioName)
        var biographyText = (biography || "").trim();
        var sourceText = (source || "").trim();

        if (BioName && BioName != "" && allPeople[UOID][0].Name.toUpperCase() !=  BioName.toUpperCase()){
            alternateName = ` or <span style='text-transform:uppercase'>${BioName} </span>`
        }

        var wikiLabel = (allPeople[UOID][0].WikiLabel || "").trim();
        var modernNameLine = "";
        if (wikiLabel !== "") {
            var indexUpper = allPeople[UOID][0].Name.toUpperCase();
            var bioUpper = (BioName || "").toUpperCase();
            var wikiUpper = wikiLabel.toUpperCase();
            if (wikiUpper !== indexUpper && wikiUpper !== bioUpper) {
                // if 'modern' name on wikipedia is different from the names we have, display it
                modernNameLine = "<br><em>Also known today as:</em> " + wikiLabel;
            }
        }

        if (biographyText !== "") {
            var sourceLine = sourceText !== "" ? "<br>—(" + sourceText + ")" : "";
            // set description
            document.getElementById("descriptive_text").innerHTML = pName + alternateName + modernNameLine + linkText + "<br>" + biographyText + sourceLine;
        } else {
                // console.log("No descriptive text found")
                // set description
                document.getElementById("descriptive_text").innerHTML = pName + alternateName + modernNameLine + linkText + "<br>No descriptive text found. Click another name to view text.";
        }

       
}


//panning
svg.call(d3.drag() // call specific function when circle is dragged
     .on("start", dragstarted)
     .on("drag", dragged)
     .on("end", dragended));


function dragstarted(d) {
    if (!bioChartInteractionEnabled) return;
    // console.log("drag start")
//    console.log(d3.event)
  d3.select(this).style("cursor", "move"); 
    dragStartX = d3.event.x;
    dragStartY = d3.event.y;
    dragStartPanX = currentDragX;
    dragStartPanY = currentDragY;
}

function dragged() {
    if (!bioChartInteractionEnabled) return;
    if (currentZoom <= 1.0) {
        // at full zoom out there is no room to pan so dragging should do nothing
        // reset the pan values so tiny pointer movement cannot leave drift behind
        currentDragX = 0;
        currentDragY = 0;
        var viewport = getChartViewport();
        applyChartTransform((viewport.wide / outerWidth) * currentZoom);
        return;
    }

    // use the original drag start position so the pan offset stays stable across events
    // d3.event.x and d3.event.y are the current pointer position in svg screen space
    currentDragX = dragStartPanX + (d3.event.x - dragStartX);
    currentDragY = dragStartPanY + (d3.event.y - dragStartY);

    var viewport = getChartViewport();
    // scale must match the zoom math used everywhere else so drag and zoom agree
    var scale = (viewport.wide / outerWidth) * currentZoom;

    // clamp after the move so the chart cannot overshoot the viewport and snap back
    clampPan(scale, viewport);
    applyChartTransform(scale);
  }

function dragended(d) {
    d3.select(this).style("cursor", "pointer");  
//  if (!d3.event.active) simulation.alphaTarget(.03);
//  d.fx = null;
//  d.fy = null;
}



/*
function changeFont(thisFont){
    // console.log(thisFont)
    const collection = document.getElementsByClassName("timeline-text");
//    const collection2 = document.getElementsByClassName("timeline-text-background");

    for (let i = 0; i < collection.length; i++) {
            collection[i].style.fontFamily = thisFont;
//            collection2[i].style.fontFamily = thisFont;
    }

    switch(thisFont){
        case  "STIX Two Text":
           for (let i = 0; i < collection.length; i++) {
               collection[i].style.letterSpacing= "0.2px";
//               collection2[i].style.letterSpacing= "0.2px";
            }
            break;
        case  "PT Serif":
           for (let i = 0; i < collection.length; i++) {
               collection[i].style.letterSpacing= "0.2px";
//               collection2[i].style.letterSpacing= "0.2px";
            }
            break;
        default:
            for (let i = 0; i < collection.length; i++) {
                collection[i].style.letterSpacing= "0px";
//                collection2[i].style.letterSpacing= "0px";
            }


    }

}
*/



sizeChange(currentZoom);
window.addEventListener("load", function() {
    sizeChange(currentZoom);
});
d3.select(window).on("resize", function() {
    sizeChange(currentZoom);
});

setProfessionDropDownColors();


// console.log("end of JS");
