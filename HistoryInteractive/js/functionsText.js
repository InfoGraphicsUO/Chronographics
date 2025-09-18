// LOAD place page numbers //
//d3.csv("./csv/placePageNums.csv", function(error, result) {
d3.csv("/csv/placePageNums.csv", function(error, result) {
	for (var i = 0; i < result.length; i++)
	{
	    ppDict[result[i].place] = result[i].page;
	}
})

// LOAD geographic place descriptions. Note: Use csv UTF-8 to include French characters
d3.csv("csv/placeDescriptiveText.csv", function(error, result) {
	for (var i = 0; i < result.length; i++)
	{
	    textDict[result[i].place_name] = [result[i].index_section,result[i].index_text];
	}
})


//function openText() {
//	var place = document.getElementById("place_label").innerHTML.slice(7,-1);
//	if (place in ppDict) {
//		pageNum = ppDict[place] - 2; // offset
//		var textWindow = window.open("./pdf/Priestley Joseph Description of a New Chart of History 1786.pdf#page=" + pageNum, "textWindow", "width=700,height=800");
//	}
//	else {
//		var textWindow = window.open("./pdf/Priestley Joseph Description of a New Chart of History 1786.pdf#page=" + pageNum, "textWindow", "width=700,height=800");
//	}
//}



// Get place from dropdown, find page number, and set PDF to that page  //
function findPage() {
	var place = document.getElementById("place_label").innerHTML.slice(7,-1);
	if (place in ppDict) {
		pageNum = ppDict[place] - 2; // offset
		document.getElementById("pdf").data = "./pdf/Priestley Joseph Description of a New Chart of History 1786.pdf#toolbar=0&navpanes=0&scrollbar=0&statusbar=0&messages=0&scrollbar=0&page=" + pageNum
	}
}

// SET descriptive text in the element
function setDescriptiveText() {
	//console.log("TEXT!")
	//if (document.getElementById("descriptive_text")){ // only run if on the section with a text element to fill
		document.getElementById("descriptive_text").innerHTML = "Click map or chart to view Priestley's place description.";
	var place = $("#placeSelector").val(); // get value from selector
		 if (place in textDict && textDict[place][1]!="") {

		    
			document.getElementById("descriptive_text").innerHTML = "<span style='text-transform:uppercase'>" + textDict[place][0]+ "</span> — " + textDict[place][1];
             
	} else {
			console.log(place + " not in textDict")
		 	document.getElementById("descriptive_text").innerHTML = "No descriptive text found for "+ place;
		}

}


function findRuler(year){
    // find index of year closest number above the value
    var rulerIndex = rulerTicks.findIndex(d => d >= year) || rulerTicks[rulerTicks.length - 1]  
    var rulerName = rulerTickLabels[rulerIndex-1]
    return rulerName || "";  // return name or empty string if undefined
}

