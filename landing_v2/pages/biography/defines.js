// Define size variables
var margin = {top: 25, right: 50, bottom: 25, left: 25},
    padding = {top: 20, right: 10, bottom: 20, left: 10},
    outerWidth, outerHeight, innerWidth, innerHeight, 
    width, height;
var startX = margin.left, 
    startY = margin.top, 
    startInX = startX + padding.left, 
    startInY = startY + padding.top;
var endX, endY, endInX, endInY;

var notBlack = "#3F3418"; 
lineWidths = "0.4px";
backgroundLineWidths = "0.4px";
backgroundLineColor ="#c2c0bc";  // notBlack (does not blend well, or is too dark where stacked given transparency)
lineOffset = 0.9; // the distance for each line below the name
dotSize = 0.3;

function parseDate(dateString) {

        // 'dateString' must either conform to the ISO date format YYYY-MM-DD
        // or be a full year without month and day.
        // AD years may not contain letters, only digits '0'-'9'!
        // Invalid AD years: '10 AD', '1234 AD', '500 CE', '300 n.Chr.'
        // Valid AD years: '1', '99', '2013'
        // BC years must contain letters or negative numbers!
        // Valid BC years: '1 BC', '-1', '12 BCE', '10 v.Chr.', '-384'
        // A dateString of '0' will be converted to '1 BC'.
        // Because JavaScript can't define AD years between 0..99,
        // these years require a special treatment.

        var format = d3.timeParse("%Y-%m-%d"),
            date,
            year;

        // date = format.timeParse(dateString);
        // if (date !== null) return date;  // removed to update to v4

        // BC yearStrings are not numbers!
        if (isNaN(dateString)) {
            // Handle BC year
            // Remove non-digits, convert to negative number
            year = -dateString.replace(/[^0-9]/g, "");
        } else {
            // Handle AD year
            // Convert to positive number
            year = +dateString;
        }
        if (year < 0 || year > 99) {
            // 'Normal' dates
            date = new Date(year, 6, 1);
        } else if (year == 0) {
            // Year 0 is '1 BC'
            date = new Date(-1, 6, 1);
        } else {
            // Create arbitrary year and then set the correct year
            // For full years, I chose to set the date to mid year (1st of July).
            date = new Date(year, 6, 1); 
            
//            console.log(date)
            
//            var userTimezoneOffset = date.getTimezoneOffset() * 60000;
//            new Date(date.getTime() - userTimezoneOffset);
//            date = new Date(year, 6, 1).toString(); // trying to fix the date function.
//            console.log(date)
            
            date.setUTCFullYear(("0000" + year).slice(-4));
	   
        }
//        console.log(date)
        // Finally create the date
    
        
        return date;
    
    

}
 function toYear(date, bcString) {
        // bcString is the prefix or postfix for BC dates.
        // If bcString starts with '-' (minus),
        // if will be placed in front of the year.
        bcString = bcString || ""; //" BC"; // With blank!
        var year = date.getFullYear();
//        var year = date.getUTCFullYear(); // trying to fix timezone problem
//        if (year > 0) return year.toString();
        if (year > 0){
            //console.log(year.toString());
            return year.toString();
        } 
        if (bcString[0] == '-'){
            //console.log( bcString + -year);
            return bcString + -year;
        } 
        //console.log( -year + bcString);
        return -year + bcString;
     
    }


// Create dictionary for searching for people's page number
var ppDict = {};
//d3.csv("biography/text/namePage.csv", function(error, result) { // when live
// for dev to avoid CORS problems
d3.csv("https://pages.uoregon.edu/infographics/timeline/pages/biography/text/namePage.csv", function(error, result) {
    for (var i = 0; i < result.length; i++)
    {
        var person = result[i].name.toLowerCase().replace(/\s/g, '');
        ppDict[person] = result[i].page;
    }
})

function findPage(name) {
//    var person = name.toLowerCase().replace(/\s/g, '')
//    if (person in ppDict) {
//        var pageNum = ppDict[person] -1; // offset
//        console.log(pageNum)
//        // check if PDF can be reached
//        if($(document.getElementById("pdf")).length){
//          document.getElementById("pdf").data = "biography/text/full.pdf#toolbar=0&navpanes=0&scrollbar=0&statusbar=0&messages=0&scrollbar=0&page=" + pageNum;
//        }
//    }
}




// Create dictionary for searching for people's line number by category
// usefull for reorganizing the chart
var lnDict = {};
lnDict['Historians and Antiquaries Lawyers'] = 1;
lnDict['Orators and Critics &cc'] = 24;
lnDict['Artists Poets'] = 45;
lnDict['Mathematicians &cc Physicians'] = 73;
lnDict['Divines and Metaphysicians &cc'] = 105;
lnDict['Statesmen and Warriors'] = 135;
lnDict['blank'] = 0;




// function to allow bootstrap submenus
// https://www.w3schools.com/bootstrap/tryit.asp?filename=trybs_ref_js_dropdown_multilevel_css&stacked=h
$(document).ready(function(){
  $('.dropdown-submenu a.test').on("click", function(e){
    $(this).next('ul').toggle();
    e.stopPropagation();
    e.preventDefault();
  });
});


    var rulerTicks = [];
    var rulerTickLabels = [];
    // grabs the ruler and year from the csv. handled similar to the regions.

function findRuler(x){
    //console.log(x)
    for (let i = 0; i < rulerTicks.length - 1; i++) {
//        console.log(rulerTicks[i])
      if (x <= rulerTicks[i+1] && x > rulerTicks[i]) {
        // console.log("Here at indice " + (i) + " is " + x + "'s ruler, "+ rulerTickLabels[i]);
          return rulerTickLabels[i]
      }

    }
}


// get RULER era info for chart of BIO
 d3.csv("https://pages.uoregon.edu/infographics/timeline/pages/csv/rulers.csv", function(error, result) {
        for (var i = 0; i < result.length; i++)
        {
            rulerTicks.push(parseInt(result[i].startYear));
            rulerTickLabels.push(result[i].ruler);
        }
    })
    


