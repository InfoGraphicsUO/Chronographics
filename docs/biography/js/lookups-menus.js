function lookupProfessionCode(inputProfession) {
    switch (inputProfession){
        case "Any":
            return "Any";
        case "NoIndexProfession":
            return "No index profession";
        case "HPAll":
            return "Heathen philosophers (all)";
        case "HP Ion":
            return "Heathen philosopher - Ionic sect";
        case "HP Soc":
            return "Heathen philosopher - Socratic";
        case "HP Cyr":
            return "Heathen philosopher - Cyrenaic";
        case "HP Meg":
            return "Heathen philosopher - Megaric";
        case "HP Eleat":
            return "Heathen philosopher - Eleatic";
        case "HP Eleack":
            return "Heathen philosopher - Eleack";
        case "HP Ac":
            return "Heathen philosopher - Academic";
        case "HP Per":
            return "Heathen philosopher - Peripatetic";
        case "HP Sto":
            return "Heathen philosopher - Stoic";
        case "HP Cyn":
            return "Heathen philosopher - Cynic";
        case "HP Ital":
            return "Heathen philosopher - Italic";
        case "HP Scept":
            return "Heathen philosopher - Sceptic";
        case "HP Ep":
            return "Heathen philosopher - Epicurean";
        case 'D':
            return 'Christian divine';
        case 'F':
            return 'Christian father';
        case 'J':
            return 'Jewish prophet or rabbi'; // note adapted from "Jew"
        case 'Met':
            return 'Metaphysician';
        case 'Moh':
            return 'Mohammedan doctor';
        case 'Mor':
            return 'Moralist';
        case 'Po':
            return 'Pope';
        case 'Pol':
            return 'Political writer';
        case 'HP':
            return 'Heathen philosopher';
        case 'Chy':
            return 'Chemist';
        case 'M':
            return 'Mathematician';
        case 'Ph':
            return 'Physician';
        case 'Act':
            return 'Actor';
        case 'Ar':
            return 'Architect';
        case 'Eng':
            return 'Engraver';
        case 'Engineer':
            return 'Engineer';
        case 'Mu':
            return 'Musician';
        case 'P':
            return 'Poet';
        case 'Pa':
            return 'Painter';
        case 'Pr':
            return 'Printer';
        case 'St':
            return 'Statuary';
        case 'Bel':
            return 'Belles lettres';
        case 'Cr':
            return 'Critic';
        case 'Or':
            return 'Orator';
        case 'Ant':
            return 'Antiquary';
        case 'Ch':
            return 'Chronologer';
        case 'Geo':
            return 'Geographer';
        case 'H':
            return 'Historian';
        case 'L':
            return 'Lawyer';
        case 'Trav':
            return 'Traveller';
        case 'X':
            return 'Statesman or warrior';
            
            
            
        default:
            return "";
    }
}

function lookupLineStyle(inputLineStyle) {
    switch (inputLineStyle){
        case 1:
            return "Solid line (case1 or 6)";
        case 2:
            return "3 starting dots (case2)";
        case 3:
            return "3 starting dots and 2 ending (case3)";
        case 4:
            return "1 dot beneath beginning (case4)";
        case 5:
            return "1 dot beneath ending (case5 or 11)";
        case 7:
            return "1 dot end (case7 or 14)";
        case 8:
            return "3 starting dots and 1 ending (case8)";
        case 13:
            return "Seven dots (case13)";
        case 14:
            return "1 dot end 2 (case14)";
        case 15:
            return "2 dot end (case15)";
        default:
            return "";
    }
}

function lookupVisualLineStyle(inputVisualCase) {
    switch (inputVisualCase) {
        case "A":
            return "3 dots line 2 dots";
        case "B":
            return "7 dots";
        case "C":
            return "solid line";
        case "D":
            return "3 dots solid line";
        case "E":
            return "3 dots solid line 1 dot under end";
        case "F":
            return "3 dots solid line 1 dot after end";
        case "G":
            return "solid line 1 dot under end";
        case "H":
            return "1 dot under start solid line";
        case "I":
            return "1 dot under start solid line 1 dot under end";
        case "J":
            return "1 dot under start solid line 1 dot after end";
        case "K":
            return "solid line 1 dot after end";
        case "L":
            return "solid line 3 dots after";
        case "M":
            return "solid line 1 dot after end";
        case "N":
            return "one dot under before solid line 3 dots after";
        default:
            return "";
    }
}

function lookupExpectedVisualCaseFromOriginalCase(inputCase) {
    // for finding differences between original index cases vs new visual cases
    var caseCode = String(inputCase || "").trim().toLowerCase();
    var caseCodeToVisualCase = {
        "case1": "C",
        "case2": "D",
        "case3": "A",
        "case4": "H",
        "case5": "I",
        "case6": "G",
        "case8": "F",
        "case11": "G",
        "case13": "B",
        "case14": "M",
        "case15": "L"
    };

    return caseCodeToVisualCase[caseCode] || "";
}

function lookupVisualCaseImage(inputVisualCase) {
    // mapping for visual case images
    var visualCaseToImage = {
        A: "case3.png",
        B: "case13.png",
        C: "case1.png",
        D: "case2.png",
        E: "CaseE.png",
        F: "case5.png",
        G: "case5.png",
        H: "case4.png",
        I: "CaseI.png",
        J: "caseJ.png",
        K: "case14.png",
        L: "case15.png",
        M: "case14.png",
        N: "CaseN.png"
    };

    return visualCaseToImage[inputVisualCase] || "";
}

var indexLineChoices = [
    { value: 0, label: "Any", image: "" },
    { value: 1, label: "Death year and life span", image: "biography/img/case1.png" },
    { value: 2, label: "Death year", image: "biography/img/case2.png" },
    { value: 3, label: "Flourished year", image: "biography/img/case3.png" },
    { value: 4, label: "Death year and approx life span", image: "biography/img/case4.png" },
    { value: 5, label: "Approx death year & approx life span", image: "biography/img/case5.png" },
    { value: 7, label: "Birth year and approx death year", image: "biography/img/case7.png" },
    { value: 8, label: "Approx death year", image: "biography/img/case8.png" },
    { value: 13, label: "Approx flourished year", image: "biography/img/case13.png" },
    { value: 15, label: "Birth year", image: "biography/img/case15.png" }
];

var visualLineChoices = [
    { value: 0, label: "Any", image: "" },
    { value: "A", label: "Exact flourished year", image: "biography/img/case3.png" },
    { value: "B", label: "Approx flourished year", image: "biography/img/case13.png" },
    { value: "C", label: "Exact death year & exact lifespan", image: "biography/img/case1.png" },
    { value: "D", label: "Exact death year", image: "biography/img/case2.png" },
    { value: "E", label: "Approx death year", image: "biography/img/CaseE.png" },
    { value: "F", label: "Died after (death year exact)", image: "biography/img/case5.png" },
    { value: "G", label: "Approx death year + exact lifespan", image: "biography/img/case5.png" },
    { value: "H", label: "Exact death year + approx lifespan", image: "biography/img/case4.png" },
    { value: "I", label: "Approx death year + approx lifespan", image: "biography/img/CaseI.png" },
    { value: "J", label: "Died after + approx lifespan", image: "biography/img/caseJ.png" },
    { value: "K", label: "Died after + exact/above lifespan", image: "biography/img/case14.png" },
    { value: "L", label: "Exact birth year", image: "biography/img/case15.png" },
    { value: "M", label: "Exact birth year + alive after", image: "biography/img/case14.png" },
    { value: "N", label: "Approx birth year", image: "biography/img/CaseN.png" }
];

function getCurrentLineChoices() {
    return currentLineSystem === "visual" ? visualLineChoices : indexLineChoices;
}

function getLineChoiceLabel(selection) {
    var choices = getCurrentLineChoices();
    for (var i = 0; i < choices.length; i += 1) {
        if (choices[i].value === selection) {
            return choices[i].label;
        }
    }
    return "";
}

function updateLineSystemLabel() {
    var button = document.getElementById("case_system_label");
    if (!button) return;
    var label = currentLineSystem === "visual" ? "Engraved Chart" : "Index";
    button.innerHTML = label + '<span class="caret"></span>';
}

function updateLineLabel() {
    var button = document.getElementById("line_label");
    if (!button) return;
    if (currentLineSelection === 0 || currentLineSelection === "0" || currentLineSelection === "") {
        button.innerHTML = "Any<span class=\"caret\"></span>";
        return;
    }

    var label = currentLineSystem === "visual" ? lookupVisualLineStyle(currentLineSelection) : lookupLineStyle(currentLineSelection);
    if (!label) {
        label = String(currentLineSelection);
    }

    button.innerHTML = label + '<span class="caret"></span>';
}

function buildLineMenu() {
    var menu = document.getElementById("lineMenu");
    if (!menu) return;

    var choices = getCurrentLineChoices();
    var html = "";

    choices.forEach(function(choice) {
        var imageHtml = choice.image ? '<img src="' + choice.image + '" width="30%"> ' : "";
        html += "<li><a tabindex=\"-1\" onclick='drawCase(" + JSON.stringify(choice.value) + ")'>" + imageHtml + choice.label + "</a></li>";
    });

    menu.innerHTML = html;
    updateLineSystemLabel();
    updateLineLabel();
}

function refreshChartForCurrentFilters() {
    clearTimeline();
    sortPeople(allPeople, globalFilterString); // also builds currentFilterMatchSet when globalFilterString is a filter
    if (currentLineSystem === "visual") {
        drawVisualPeople();
    } else {
        drawIndexChartPasses(globalFilterString);
    }
    filterPeople(allPeople, globalFilterString, { skipMatchSetBuild: true }); // match set already built in sortPeople()
    finishFilterApply();
    // logChartReady("refreshChartForCurrentFilters");
}

function setLineSystem(mode, redrawChart) {
    if (mode !== "index" && mode !== "visual") return;

    if (currentLineSystem === mode) {
        return;
    }

    currentLineSystem = mode;
    currentLineSelection = 0;
    currentLineStyle = "";
    F_LineStyle = "";
    filterState.lineStyle = null;
    changeCase = true;
    currentCase = "drawCase";
    buildLineMenu();
    if (redrawChart !== false) {
        setLoadingUI();
        buildFullFilterQuery();
        setTimeout(function() {
            refreshChartForCurrentFilters();
        }, 0);
    }
}


