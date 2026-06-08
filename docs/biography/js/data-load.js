function loadBioData(){
    setLoadingUI();
    
    document.getElementById("filterResultsBox").innerHTML =  ""; 
// //console.log(ds);
//     ds.fetch({
//         success : function() {
//             var now = new Date();
//             console.log(now.toUTCString()+ " success")
//             // Go through the data, create a json
//             this.each(function(d){
  //enable buttons
  document.getElementById("loaderButton").style.display = 'none';
  document.getElementById("drawName_CB").disabled = false;
  document.getElementById("userInput").disabled = false;
  document.getElementById("gender_label").disabled = false;
  document.getElementById("profession_label").disabled = false;
  document.getElementById("continent_label").disabled = false;
    document.getElementById("case_system_label").disabled = false;
  if($('#region_label').length > 0) {
      document.getElementById("region_label").disabled = false;
     }
  document.getElementById("line_label").disabled = false;
    if (document.getElementById("varyingLineStyle_CB")) {
            document.getElementById("varyingLineStyle_CB").disabled = false;
    }
  document.getElementById("ageAprox_CB").disabled = false;
//  document.getElementById("clearFiltersButton").disabled = false;
  document.getElementById("clearFiltersButton").classList.remove("disabled");
  document.getElementById("fullExtentButton").disabled = false;
  ageSlider.removeAttribute('disabled');
  aliveSlider.removeAttribute('disabled');
  zoomSlider.removeAttribute('disabled');
  bioChartInteractionEnabled = true;

  // allow pointerevents (e.g. tooltips) on rectangles and data  
  $('.middleGroup').css('pointer-events', 'auto');

    // git
    d3.request("biography/csv/Chronographics Biographies(6_8_2026).csv") 
    //local dev
    //d3.request("https://pages.uoregon.edu/infographics/dev/timelineV2/pages/biography/csv/PriestleyBioData_Feb2_2023(2_20_2024).csv")
      .mimeType("text/csv")
      .response(function (xhr) { return d3.csvParse(xhr.responseText); })
      .get(function(data) {
          data.forEach(function(d){
                // check if this case is in the current MANUAL case filter
                // console.log(d["case"])
                var testCase="";
                if (d["case"] != "" && d["case"] != "none") {
                    testCase = parseInt(d["case"].match(/\d+/)[0]) // get the "case" as an integer
                } else {
                     testCase = false;
                    // while case is missing
                    // (d["case"]="case1")
                    // testCase = 1 // 
                }
                if(boolCases[testCase]){  

                    var someGuy = {} // dictionary for a single guy
                
                    // store ID a couple ways
                    someGuy["UO_ID"] = "ID" + parseInt(d["UO_ID"]);
                    var thisID = someGuy["UO_ID"]
                    someGuy["discrepancy"] = d["Discrepancy"] || d["discrepancy"] || "";
                    // someGuy["Watkins_ID"] = parseInt(d["Watkins_ID"]);
                    someGuy["BioName"] = d["Bio Name"];
                    someGuy["BioSource"] = d["BioSource"];
                    someGuy["Biography"] = d["Biography"];
                    // someGuy["Alternate_Name"] = d["Alternate_name"];
                    // someGuy["Alternate_ID"] = parseInt(d["Alternate_ID"]);
                    someGuy["DisplayName"] = d["NameOnChart"];
                    someGuy["Name"] = d["NameInIndex"]; 
                    // If displayName is null, get the name
                    if(someGuy["DisplayName"] == "") someGuy["DisplayName"]  = someGuy["Name"];     

                    // If DisplayName and Name are blank, this is a blank line. Skip it.
                    if(someGuy["DisplayName"] == "" && someGuy["Name"]== "") return false;
                    
                    // If Discrepancy is 1800, this person is only in the 1800 list, skip it.
                    if(someGuy["discrepancy"] == "1800") return false;

                    someGuy["DeathPrecision"] = d["DeathPrecision"];
                    someGuy["BornPrecision"] = d["BornPrecision"]; 
                    someGuy["BirthDate"] = parseInt(d["BirthDate"]);
                    someGuy["AproxBirthDate"] = parseInt(d["aproxBirthDate"]);
                    someGuy["LifePrecision"] = d["LifeLength Precision"]; 
                    someGuy["LifeLength"] = parseInt(d["LifeLength"]); 
                    someGuy["AlivePrecision"] = d["Alive precision"];
                    someGuy["AliveDate"] = parseInt(d["AliveDate"]);
                    someGuy["OnChartCategory"] = d["OnChartCategory"]; // add the full text for profession
                    someGuy["DeathDate"] = parseInt(d["DeathDate"]);
                    someGuy["AproxDeathDate"] = parseInt(d["aproxDeathDate"]);
                    if(d["Sex or gender V2"] != "missing from OpenRefine results"){
                        someGuy["gender"] = d[ "Sex or gender V2"];  // previously gender, "sex or gender"
                    }
                    
                    // profession codes
                     if(d["Index Category 1"] != ""){
                       someGuy["profession"] = normalizeProfessionCode(d["Index Category 1"].replace(/\.$/, "")); // remove periods  
                    }else if (d["OnChartCategory"] == "Statesmen and Warriors"){
                        someGuy["profession"] = "X"
                    } else {
                        // on chart but Priestley's index assigns no profession letter (not Statesmen)
                        someGuy["noIndexProfession"] = true;
                    }
                    
                    
                    //someGuy["lat"] = d["LAT BP"]; // previously LAT problem with |
                    //someGuy["lon"] = d["LON BP"]; //previously LON
                    someGuy["Region"] = d["Region_final"]//new
                    // If a future CSV adds continent back, use it; otherwise derive it from Region_final
                    someGuy["Continent"] = normalizeNullableValue(d["continent"]) || deriveContinentFromRegion(someGuy["Region"]); // current CSV derives continent from Region_final
                    if(normalizeNullableValue(d["country"]) !== ""){
                        someGuy["Country"] = d["country"] // previously countryName
                    }

                    someGuy["case"] = d["case"].trim(); // original case code from the data
                    someGuy["VisualCase"] = d["VisualCase"].trim(); // visual-case label used for display/menu grouping
                    someGuy["ExpectedVisualCase"] = lookupExpectedVisualCaseFromOriginalCase(someGuy["case"]);
                    someGuy["lineType"] = someGuy["case"]; // keep existing drawing logic on the original case code
                    someGuy["_caseNumber"] = parseIndexCaseNumber(someGuy); // cached for sortPeople / drawIndexPerson (avoids regex each pass)
                    someGuy["indexText"] = null; // in tab2 (TO DO, create indext when reading in data instead of on the fly)

                    // calculate aprox age
                    someGuy["AproxAge"]  = someGuy["AproxDeathDate"]- someGuy["AproxBirthDate"];

                    
                    // someGuy["Link"] = d["WikiLink"] // previously Wiki_Link
                    // //someGuy["Wikipedia2"] = d["Wikipedia"]

                    
                    if(d["WikiLink"] != ""){
                       // check for wikilink
                       someGuy["Link"] = d["WikiLink"] // previously Wiki_Link
                    }else if (d["Alternate Link"]!= ""){
                        //check for google book link
                        someGuy["Link"] = d["Alternate Link"]
                    } else {
                        someGuy["Link"] = "unknown"
                    }
                    someGuy["WikiLabel"] = wikiLabelFromUrl(someGuy["Link"]); // parse wikipedia article title to grab 'modern' name
                    someGuy["WikiLabelPlain"] = stripDiacritics(someGuy["WikiLabel"] || "").toLowerCase(); // strip accent marks for search queries
                    // Filter fields are cached once when the CSV is read instead of being rebuilt on each dropdown click
                    cachePersonFilterFields(someGuy);

        //            console.log (someGuy["Name"] + d["On Chart: Line #"] ); // debug

                    if(d["On Chart: Line #"] > 0 && someGuy["lineType"]!= ""){
                        //console.log("yes On Chart: Line #" + d["On Chart: Line #"])
                        someGuy["LineNumber"] = parseInt(d["On Chart: Line #"]) + parseInt(lnDict[d["OnChartCategory"]]);
                        allPeople[thisID] = new Array(); // set thisID as a key in the allPeople Dictionary
                        allPeople[thisID].push(someGuy); // put the values in the dictionary

                    } else { // we don't know where to draw it
                       // console.log("no On Chart: Line #" + d["On Chart: Line #"])

                        // noLineNumber.push(someGuy); // record who it was
                        // console.log (someGuy["Name"] + d["On Chart: Line #"] ); // debug
                        return false; // break out, don't try to draw it.
                    };
                }        
            });
            
            personKeys = Object.keys(allPeople); // cache keys once after all drawable people are loaded
            precomputeIndexDrawConfigs(); // cache getIndexCaseConfig() on each person before the first draw
            sortPeople(allPeople, true, { deferFilterList: true }); // draw chart first; name list fills in on next frame
            drawLines(); // draw all the lines and names
//            drawCase1();
//            drawCase2()

            document.getElementById("loader").style.display = "none";  /* turn off the loader */
            document.body.classList.remove('waiting');
                setFilterControlsEnabled(true);
                // logChartReady("loadBioData");

         // },
         // error: function(e) {
         //   // your error callback here!
         //   console.log("Error in reading data!!");
         //   console.log(e);
         //   document.getElementById("loader").style.display = "none";  /* turn off the loader */
         //   document.body.classList.remove('waiting');
         // }
     });
    var now = new Date();
    // console.log(now.toUTCString()+ " end of loadBioData()")
}

// LOAD people descriptions. 
// Note: Download from google sheets as XLS then save as csv UTF-8 to include French/special characters e.g check em dashes in  "JANSEN..."
// d3.csv("biography/csv/WatkinsData8_17_2023.csv") // when live
// // for dev to avoid CORS problems
// //Watkins
// //d3.request("https://pages.uoregon.edu/infographics/dev/timelineV2/pages/biography/csv/WatkinsData8_17_2023.csv")
//     .mimeType("text/csv")
//     .response(function (xhr) { return d3.csvParse(xhr.responseText); })
//     .get(function(data) {
//           data.forEach(function(d){
//               var id = d["WATKINS_ID"];      
//               watkinsDict[id] = [d["NAME"],d["BIO"],d["SOURCE"]];
//           })
//     });

//Aikin
// d3.csv("biography/csv/Alternate_Dictionary.csv") // when live
// //d3.request("https://pages.uoregon.edu/infographics/dev/timelineV2/pages/biography/csv/Alternate_Dictionary.csv")
//     .mimeType("text/csv")
//     .response(function (xhr) { return d3.csvParse(xhr.responseText); })
//     .get(function(data) {
//           data.forEach(function(d){
//               var id = d["ALTERNATE_ID"];
//               alternateDict[id] = [d["ALTERNATE_NAME"],d["BIO"],d["SOURCE"],d["Biography source"]];
//           })
//     });
           

// console.log("b");
// console.log("someGuy[DisplayName]", someGuy["DisplayName"]); // debug (list everyone!)

// second argument is kept for old callers, but filterState now decides what to keep in the chart
// third argument is optional: { skipMatchSetBuild: true } when sortPeople() already filled currentFilterMatchSet (e.g. refreshChartForCurrentFilters)
function filterPeople(thesePeople, peopleFilter, options) {
    options = options || {};
    var activeFilter = isFilterStateActive();
    var totalPeople = personKeys.length;
   
    if(activeFilter){ 

        // sortPeople() may have just built the match set; skip a second full scan when options.skipMatchSetBuild is set
        if (!options.skipMatchSetBuild) {
            buildCurrentFilterMatchSet();
        }

        people=[]; //clear out the current people list
        ////document.getElementById("filterResultsBox").innerHTML =""
        //var filterCount = 0;

        // console.log("filtering: " + Object.keys(thesePeople).length);
        // make all people invisible
        peopleGroup.selectAll(".people-lines,.circles,.mouse-lines").classed("hiddenGuy", true);
        if (drawNames) peopleGroup.selectAll(".timeline-text").classed("hiddenGuy", true);
        setAllFilterListRowsVisible(false);
       // d3.selectAll("#list-" + id).classed("hidden",true); // remove the display-block class from list name
        
        // add back those that match (use datum id — each person has multiple SVG nodes with the same id attribute)
        if (currentFilterMatchSet) {
            peopleGroup.selectAll(".people-lines,.circles,.mouse-lines")
                .filter(function(d) { return d && currentFilterMatchSet.has(d); })
                .classed("hiddenGuy", false);
            if (drawNames) {
                peopleGroup.selectAll(".timeline-text")
                    .filter(function(d) { return d && currentFilterMatchSet.has(d); })
                    .classed("hiddenGuy", false);
            }
            currentFilterMatchSet.forEach(function(id) {
                people.push(id);
                setFilterListRowVisible(id, true);
            });
        }

        // deal with the people filtered
        document.getElementById("numPeople").innerHTML =  people.length + " of " + totalPeople + " people";
        // if (people.length < 10) { console.log(people); } // for debug: print the people that match, only when fewer then 10
    } else {
        // no filter applied
        // Any = no filter
        currentFilterMatchSet = null;
        people = personKeys.slice();
        setAllFilterListRowsVisible(true);
        peopleGroup.selectAll(".people-lines,.circles,.mouse-lines").classed("hiddenGuy",false); // remove the display-none class from the chart
        if (drawNames) peopleGroup.selectAll(".timeline-text, .timeline-text-background").classed("hiddenGuy",false); // remove the display-none class for names 
       // if (!drawNames) peopleGroup.selectAll(".timeline-text").classed("d-none",true); // add the display-none class for names 

        document.getElementById("numPeople").innerHTML =  totalPeople + " people";
    }
   // document.getElementById("loader").style.display = "none"; 
    setFilterControlsEnabled(true);
}


// true when any typed filter control is active
function isPeopleFilterActive(peopleFilter) {
    return isFilterStateActive();
}

// third argument is optional: { deferFilterList: true } builds #filterResultsBox after the chart (initial load)
function sortPeople(thePeople, peopleFilter, options) {
    options = options || {};
    
   // clear out lists    
   people = [];
   unsure = [];
    visualPeople = [];
    
    var peopleFilterPredicate = buildFilterPredicate(filterState);
    currentFilterMatchSet = peopleFilterPredicate ? new Set() : null;
    
    var useVisualCases = currentLineSystem === "visual";
    var keepAllIndexCases = currentLineSystem === "index";
    var keys = personKeys.length ? personKeys : Object.keys(allPeople);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var person = allPeople[key][0];
        someGuy = person;

        var testCase = person._caseNumber;
        if (testCase === undefined || testCase === null) {
            testCase = parseIndexCaseNumber(person);
            person._caseNumber = testCase;
        }
        var matchesFilter = peopleFilterPredicate ? peopleFilterPredicate(person) : true;

        // build the set once here so later passes can reveal only the matching ids without rerunning the filter
        if (currentFilterMatchSet && matchesFilter) {
            currentFilterMatchSet.add(key);
        }

        if (useVisualCases) {
            people.push(key);
            if (matchesFilter) visualPeople.push(key);
        } else if (keepAllIndexCases || (boolCases[testCase] && matchesFilter)) {
            people.push(key);
            if (!isIndexCaseDrawable(testCase)) {
                unsure.push(key);
            }
        }
    }

    // console.log("All people: ")
    // console.log(Object.keys(allPeople).length) // all people read in
    // console.log("filtered people " + people.length) // list of those that are in this filter.
   //document.getElementById("numPeople").innerHTML = " " + people.length + "people";
    // document.getElementById("numPeople").innerHTML = "(" + allPeople.length + ")";

   
   //  // logs number of people in each category
   // console.log("1. solidLines " + solidLines.length)
   // console.log("2. threeBegin " + threeBegin.length)
   // console.log("3. threeBeginTwoEnd " + threeBeginTwoEnd.length)
   // console.log("4. oneBegin " + oneBegin.length)
   // console.log("5. oneEndUnder " + oneEndUnder.length)
   // console.log("6. solid2 (solid) " + solid2.length)
   // console.log("7. oneEnd " + oneEnd.length)
   // console.log("8. threeBeginOneEnd " + threeBeginOneEnd.length)
   // console.log("10. unsure2 " + unsure2.length)
   // console.log("11. oneEndUnder2 " + oneEndUnder2.length)
   // console.log("13. seven dots " + sevenDots.length)
   // console.log("14. oneEnd2 " + oneEnd2.length)
   // console.log("15. threeEnd " + threeEnd.length)
   // console.log("12. noLineNumber (not updated on redraw) " + noLineNumber.length)
   // console.log("9 (don't fit a case). people " + unsure.length)
	
   var numPeopleDrawn = people.length;
   //document.getElementById("numPeople").innerHTML = "(" + numPeopleDrawn + ")";
   document.getElementById("numPeople").innerHTML =  numPeopleDrawn + " people";

   
   // document.getElementById("filterResultsBox").innerHTML = people.map(function(thisGuy){
   //          //var id= thisGuy.DisplayName.replace(/[\'\. ,:-]+/g, "-")
   //              return "<element onClick='resultClicked()' class='d-block f-list' id='list-"+ thisGuy.UO_ID + "\'>" + thisGuy.DisplayName + "</element>"
   //          }).sort(function (a, b) {
   //                return a.DisplayName - b.DisplayName;
   //          }).join('');

    people = people.sort(function(a, b) {
        return d3.ascending(allPeople[a][0].Name, allPeople[b][0].Name);
    });

    // initial load: paint lifelines first, then populate the clickable name list
    if (options.deferFilterList) {
        scheduleFilterResultsListBuild();
    } else {
        buildFilterResultsList();
    }


   // // if there is a filter, put names in the results box.
   // if(peopleFilter == true){
   //  document.getElementById("filterResultsBox").innerHTML =  "No filter applied";

   // } else {
   // 		// clear out the selection box
   // 		document.getElementById("filterResultsBox").innerHTML =""
   // 		// add list to the selection box
   // 		for (i in people){

   // 			var thisGuyID= people[i].DisplayName.replace(/[\'\. ,:-]+/g, "-")
   // 			document.getElementById("filterResultsBox").innerHTML += "<element onClick='resultClicked()' id='list-"+ thisGuyID + "''>" + people[i].DisplayName + "</element><br>";

   // 		}
   //      // document.getElementById("filterResultsBox").innerHTML = "<element onClick='resultClicked()'>" +  people.map(a => a.DisplayName).sort().join("</element><br><element onClick='resultClicked()'>") + "</element>";
   // }




    return;
}

// fill #filterResultsBox with sorted index names (one div per person, id list-UO_ID)
function buildFilterResultsList() {
    var filterList = d3.select("#filterResultsBox");
    if (filterList.empty()) return;

    filterList.text("");
    filterList.selectAll("div.f-list").remove();
    filterListRowsById = {};

    // DocumentFragment avoids reflow on each append (faster than d3 enter for thousands of rows)
    var fragment = document.createDocumentFragment();
    for (var i = 0; i < people.length; i++) {
        var key = people[i];
        var row = document.createElement("div");
        row.className = "d-block f-list";
        row.id = "list-" + key;
        row.style.direction = "ltr";
        row.setAttribute("onclick", "resultClicked()");
        row.textContent = allPeople[key][0].Name;
        filterListRowsById[key] = row;
        fragment.appendChild(row);
    }
    filterList.node().appendChild(fragment);
    filterListDomBuilt = true;
}

// run buildFilterResultsList on the next animation frame so loadBioData can call drawLines() first
function scheduleFilterResultsListBuild() {
    if (filterListBuildHandle !== null) {
        cancelAnimationFrame(filterListBuildHandle);
    }
    filterListBuildHandle = requestAnimationFrame(function() {
        filterListBuildHandle = null;
        buildFilterResultsList();
    });
}

// store getIndexCaseConfig() on each person as _indexDrawConfig (read once at load, reused on every draw/redraw)
function precomputeIndexDrawConfigs() {
    var keys = personKeys.length ? personKeys : Object.keys(allPeople);
    for (var i = 0; i < keys.length; i++) {
        var person = allPeople[keys[i]][0];
        if (!person._indexDrawConfig) {
            var config = getIndexCaseConfig(person);
            if (config) {
                person._indexDrawConfig = config;
            }
        }
    }
}

