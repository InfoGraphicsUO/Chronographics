//d3.csv("./csv/placePageNums.csv", function(error, result) {
d3.csv("https://pages.uoregon.edu/infographics/timeline/pages/csv/placePageNums.csv", function(error, result) {
	for (var i = 0; i < result.length; i++)
	{
	    ppDict[result[i].place] = result[i].page;
	}
})


d3.csv("https://pages.uoregon.edu/infographics/dev/timelineV2/pages/csv/placeDescriptiveText.csv", function(error, result) {
	for (var i = 0; i < result.length; i++)
	{
	    textDict[result[i].name] = [result[i].index_text,result[i].index_section];
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

function findPage() {
	var place = document.getElementById("place_map").innerHTML.slice(7,-1);
	if (place in ppDict) {
		pageNum = ppDict[place] - 2; // offset
		document.getElementById("pdf").data = "./pdf/Priestley Joseph Description of a New Chart of History 1786.pdf#toolbar=0&navpanes=0&scrollbar=0&statusbar=0&messages=0&scrollbar=0&page=" + pageNum
	}
}

//d3.csv("./csv/placePageNums.csv", function(error, result) {
// d3.csv("https://pages.uoregon.edu/infographics/timeline/pages/csv/placeDescriptiveText.csv", function(error, result) {
// 	for (var i = 0; i < result.length; i++)
// 	{
// 	    ppDict[result[i].name] = [[result[i].indexSection],[result[i].indexText]]
// 	}
// })

function setDescriptiveText() {
	console.log("TEXT!")
	//if (document.getElementById("descriptive_text")){ // only run if on the section with a text element to fill
		document.getElementById("descriptive_text").innerHTML = "Click map or chart to view Priestley's place description.";
		var place = document.getElementById("place_map").innerHTML;
		 if (place in textDict) {

		 	// document.getElementById("descriptive_section").innerHTML = textDict[place][0];
		 	document.getElementById("descriptive_text").innerHTML = textDict[place][1];
		 } else {
		 	console.log(place + " not in textDict")
		 	document.getElementById("descriptive_text").innerHTML = "No descriptive text found for "+ place;
		 }
	//}
}

