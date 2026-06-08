function setFilterControlsEnabled(enabled) {
    var filterPanel = document.getElementById("filterControlsPanel");
    if (!filterPanel) return;
    filterPanel.classList.toggle("is-disabled", !enabled);
}

// var F_diffChartName="";
// F_* variables are left for older UI state / debugging; filterState is the source of truth.
var F_gender="";
var F_profession="";
var F_continent="";
var F_region="";
var F_LineStyle="";
var F_age="";
var F_alive="";

function buildFullFilterQuery(){
    // keep this var for older draw calls,  avoid rebuilding executable filter strings
    globalFilterString = isFilterStateActive() ? "__typed_filter_state__" : true;
}

function finishFilterApply() {
    restoreSelectedPeople();
    document.body.classList.remove('waiting');
    document.getElementById("loader").style.display = "none";
    setFilterControlsEnabled(true);
}

function applyCurrentFilters(options) {
    options = options || {};
    buildFullFilterQuery();
    setLoadingUI();
    setTimeout(function() {
        // redraw only when the SVG layer itself changes; most filters just hide/show existing nodes
        if (options.redraw) {
            refreshChartForCurrentFilters();
        } else {
            filterPeople(allPeople, globalFilterString);
            finishFilterApply();
        }
    }, 0);
}



// functions for drawing by filters
function drawAllPeople(){
    // console.log("All button")

    currentCase = "drawAllPeople";
    changeCase = false;

    // clear all filters and rebuild the chart from the full data set
    clearCheckBoxes();
    document.getElementById("userInput").value= "";
    applyCurrentFilters({ redraw: true });
    setTimeout(function() {
        d3.selectAll(".f-list").classed("d-none",false); // add the display-none class to names in the filter list
        d3.selectAll(".f-list").classed("d-block",true); // remove the display-block class to names in the filter list
        d3.select("#descriptive_text").html("Click a name to view text."); // clear text description
    }, 0);
}


$("#ageAprox_CB").change(function() {
    // console.log("Age Aprox CB clicked");
    drawYoungPeople(ageSlider.noUiSlider.get()[0],ageSlider.noUiSlider.get()[1]);
});

$("#varyingLineStyle_CB").change(function() {
    // filter to show people that have different cases index vs visual
    // console.log("Varying line style checkbox clicked");
    if (document.getElementById("varyingLineStyle_CB").checked == true) {
        F_varyingLineStyle = "(someGuy.VisualCase != '' && someGuy.ExpectedVisualCase != '' && someGuy.VisualCase != someGuy.ExpectedVisualCase)";
        filterState.varyingLineStyle = true;
    } else {
        F_varyingLineStyle = "";
        filterState.varyingLineStyle = false;
    }

    document.getElementById("userInput").value = "";
    filterState.text = "";
    applyCurrentFilters({ redraw: true });
});

function drawYoungPeople(minAge, maxAge){
    // console.log("age range: " + minAge + " to " + maxAge)

    //var minAge = document.getElementById("userMinInput").value;
    //var maxAge = document.getElementById("userMaxInput").value;

    if (minAge == 1 && maxAge == 100){
      //full age range, only 'certain' ages
      if (document.getElementById("ageAprox_CB").checked == true){
        F_age = "age";
        filterState.age = { min: 1, max: 100, exactOnly: true };
        currentCase = "drawYoungPeople";
        changeCase = false;
      } else{
          //full age range, all ages ('certain/uncertain')
         // clear slider
          currentCase = "";
          F_age = "";
          filterState.age = null;
      }

       
    } else if (minAge > 1 || maxAge < 100) {
            // console.log("age_CB clicked")
            // set radio button
            // document.getElementById("age_CB").checked = true;
            //update the current case values
            currentCase = "drawYoungPeople";
            changeCase = false; 
          
            F_age = "age";
            filterState.age = {
                min: parseInt(minAge),
                max: parseInt(maxAge),
                exactOnly: document.getElementById("ageAprox_CB").checked == true
            };

    }

    
    document.getElementById("userInput").value= "";
    filterState.text = "";
    applyCurrentFilters({ redraw: false });

       
}


function drawAliveDuring(minYear, maxYear){
    // console.log("alive during: " + minYear + " to " + maxYear)

    //var minYear = document.getElementById("userMinInput").value;
    //var maxYear = document.getElementById("userMaxInput").value;

    if (minYear == -1200 && maxYear == 1800){
        // clear slider
        currentCase = "";
        F_alive = "";
        filterState.alive = null;
    } else if (minYear > -1200 || maxYear < 1800) {
            //console.log("alive_CB clicked")
            // set radio button
            // document.getElementById("age_CB").checked = true;
            //update the current case values
            currentCase = "drawAliveDuring";
            changeCase = false; 
          
            F_alive = "alive";
            filterState.alive = { min: parseInt(minYear), max: parseInt(maxYear) };
    }

    
    document.getElementById("userInput").value= "";
    filterState.text = "";
    applyCurrentFilters({ redraw: false });

       
}


//function for drawing by gender
function drawGender(gender){
    //document.getElementById("gender_CB").checked = true;
    document.getElementById('gender_label').innerHTML = gender;

    if (gender == "Any"){
        F_gender = "";
        filterState.gender = null;
        currentCase = "";
        currentGender = "";
        changeCase = false;
    } else if (currentGender != gender || changeCase == true) {
        currentCase = "drawGender";
        changeCase = false;
        currentGender = gender;

        F_gender = gender;
        filterState.gender = gender.toLowerCase();
    }

    // console.log(F_gender)
    filterState.text = "";
    applyCurrentFilters({ redraw: false });
}


/*
function unmatchedNames(){
    //don't redraw if this is already the current case
    if (currentCase != "unmatchedNames" || changeCase == true){
        currentCase = "unmatchedNames";
        changeCase = false;
    }

    if (document.getElementById('name_CB').checked){
        //document.getElementById("currentFilter").innerHTML = "Names the appear differently on the chart and in the index";
        //clearTimeline();
         //if (globalFilterString != '') globalFilterString += ' && '
        F_diffChartName = "someGuy.Name != someGuy.DisplayName";
    }
     else {
        F_diffChartName = ''
     }
    //     globalFilterString = globalFilterString.replace("&& someGuy.Name != someGuy.DisplayName", "");
    //     globalFilterString = globalFilterString.replace("someGuy.Name != someGuy.DisplayName", "");
    // }
        buildFullFilterQuery();
        document.getElementById("userInput").value= "";
        setLoadingUI();
        setTimeout(function() {
            filterPeople(allPeople, globalFilterString);
            document.body.classList.remove('waiting');
            document.getElementById("loader").style.display = "none";
        }, 0);
}
*/

/*
function examplePeople(){
    // set radio button
    $("input[name=display_switch][value='example']").prop('checked', true);
    //don't redraw if this is already the current case
    if (currentCase != "examplePeople" || changeCase == true){
    currentCase = "examplePeople";
    changeCase = false;
    //document.getElementById("currentFilter").innerHTML = "Example group created by Preistley";
    //clearTimeline();
    document.getElementById("userInput").value= "";
    setLoadingUI();
    setTimeout(function() {
            filterPeople(allPeople, "someGuy.Name == 'Pindar' || someGuy.Name == 'Sophocles' || someGuy.Name == 'Xenophon' || someGuy.Name == 'Plato' || someGuy.Name == 'Terence'");
            document.body.classList.remove('waiting');
            document.getElementById("loader").style.display = "none";
        }, 0);
    }
}
*/

/*
function examplePeople2(){
    // set radio button
     $("input[name=display_switch][value='example']").prop('checked', true);
    //don't redraw if this is already the current case
    if (currentCase != "examplePeople2" || changeCase == true){
        currentCase = "examplePeople2";
        changeCase = false;
        //document.getElementById("currentFilter").innerHTML = "Example group created by Preistley";
        //clearTimeline();
        document.getElementById("userInput").value= "";
        setLoadingUI();
        setTimeout(function() {
            filterPeople(allPeople, "someGuy.Name == 'Herodotus' || someGuy.Name == 'Agis' || someGuy.Name == 'Thucydides' || someGuy.Name == 'Abul Pharai' || someGuy.Name == 'Alain' || someGuy.Name == 'Epaminondas' || someGuy.Name == 'Euclid' || someGuy.Name == 'Suidas' || someGuy.Name == 'Hesychius'");
            document.body.classList.remove('waiting');
            document.getElementById("loader").style.display = "none";
        }, 0);
        //drawLines();
    }
}
*/


// functions for drawing by case (line style), using the dropdown
function drawCase(num){
    // console.log("click line style") 
    // set radio button
   // document.getElementById("line_CB").checked = true;
   
   currentLineSelection = num;

   if (num == 0 || num == "0"){
        F_LineStyle = "";
        filterState.lineStyle = null;
        currentCase = "";
        currentGender = "";
        changeCase = false;
    } else {

        //don't redraw if this is already the current case
        if (currentCase != "drawCase" || currentLineStyle != num  || changeCase == true){
        currentCase = "drawCase";
            currentLineStyle = num;
            changeCase = false;
        } 
        //document.getElementById("currentFilter").innerHTML = "Life drawn as " + lookupLineStyle(num);
        //clearTimeline();
        F_LineStyle = String(num);
        filterState.lineStyle = num;

    }
    updateLineLabel();
    document.getElementById("userInput").value= "";
    filterState.text = "";
    applyCurrentFilters({ redraw: true });
       
}
// end drawing by case


//function for drawing by Profession dropdown
function drawProfession(professionCode){
    //form.elements["profession_label"][0].innerHTML = "New<br>Text";

    document.getElementById('profession_label').innerHTML = lookupProfessionCode(professionCode);
   // clear profession
   if (professionCode == "Any"){
        F_profession = "";
        filterState.profession = null;
        currentCase = "";
        currentProfession = "";
        changeCase = false;
    } else

    //don't redraw if this is already the current case
    if (currentCase != "drawProfession" || currentProfession != professionCode || changeCase == true ){
        currentCase = "drawProfession";
        changeCase = false;
        currentProfession = professionCode;

       
        //clearTimeline();
        F_profession = professionCode;
        filterState.profession = professionCode;
    }

        document.getElementById("userInput").value= "";
        filterState.text = "";
        applyCurrentFilters({ redraw: false });
    
}

//function for drawing by continent
function drawContinent(continent){

    document.getElementById('continent_label').innerHTML = continent;
    // set radio button
   if (continent == "Any"){
        F_continent = "";
        filterState.continent = null;
        currentCase = "";
        currentContinent = "";
        changeCase = false;
    } else 
   
    //don't redraw if this is already the current case
    if (currentCase != "drawContinent" || currentContinent != continent || changeCase == true ){
        currentCase = "drawContinent";
        changeCase = false;
        //document.getElementById("currentFilter").innerHTML = "Continent is " + continent;
        
        
        currentContinent = continent;
        //clearTimeline();
        F_continent = continent;
        filterState.continent = continent;

    }
        document.getElementById("userInput").value= "";
        filterState.text = "";
        applyCurrentFilters({ redraw: false });
}

//function for drawing by region
function drawRegion(region){

    document.getElementById('region_label').innerHTML = region;
    // set radio button
   if (region == "Any"){
        F_region = "";
        filterState.region = null;
        currentCase = "";
        currentRegion = "";
        changeCase = false;
       //selectRegion(null) // select on map
    } else 
   
    //don't redraw if this is already the current case
    if (currentCase != "drawRegion" || currentRegion != region || changeCase == true ){
        if (page=="twoCharts.html"){
            selectRegion(region) // select on map            
        }

        currentCase = "drawRegion";
        changeCase = false;
        //document.getElementById("currentFilter").innerHTML = "Continent is " + continent;
        
        
        currentRegion = region;
        //clearTimeline();
        F_region = region;
        filterState.region = region;

    }
        document.getElementById("userInput").value= "";
        filterState.text = "";
        applyCurrentFilters({ redraw: false });
}

// function for drawing by user entered text
function userNameFunction() {

    // set radio button
    $("input[name=display_switch][value='all']").prop('checked', true);
    currentCase = "userNameFunction";
    if (nameFilterTimeoutId) {
        clearTimeout(nameFilterTimeoutId);
    }

    nameFilterTimeoutId = setTimeout(function() {
        setLoadingUI();
        clearCheckBoxes();

        var x = document.getElementById("userInput").value;
        filterState.text = normalizeFilterText(x);
        buildFullFilterQuery();

        // console.log(x);
        setTimeout(function() {
            filterPeople(allPeople, globalFilterString);
            finishFilterApply();
        }, 0);
    }, nameFilterDebounceMs);
}

