// *** AGE SLDIER ***
var ageSlider = document.getElementById('ageSlider');
noUiSlider.create(ageSlider, {
  start: [1,100],
  tooltips: [true, true],
  connect: true,
  // tooltips: [true],
  step: 1,
  range: {
    'min': 1,
    'max': 100
  },
  format: { //integer values only
    from: function(value) {
      return parseInt(value);
  },
    to: function(value) {
      return parseInt(value);
    }
  }
});

//mergeTooltips(slider, 15, ' - '); // not working

ageSlider.noUiSlider.on('end',function(values, handle){
  //document.getElementById("age_CB").checked = true;
  drawYoungPeople(values[0], values[1])
  // console.log("age range: " + values[0] + " to "+ values[1]);
});

mergeTooltips(ageSlider, 15, ' - ');

// *** END AGE SLIDER ***

// *** ALIVE DUIING SLDIER ***
var aliveSlider = document.getElementById('aliveSlider');
noUiSlider.create(aliveSlider, {
  start: [-1200,1800],
  tooltips: [true, true],
  connect: true,
  // tooltips: [true],
  step: 1,
  range: {
    'min': -1200,
    'max': 1800
  },
  format: { //integer values only
    from: function(value) {
      // 'from' the formatted value.
      // Receives a string, should return a number.
        
     if(value.includes(" BC")){
         // if negative, remove substring and change value to negative 
         var fromYear = -1 * (parseInt(value.split(" BC")[0]))
         // console.log
        return fromYear
     } else {
       // if positive, no change
       return parseInt(value)
     }
  },
    to: function(value) {
      // 'to' the formatted value. Receives a number.
        
        if (value > 0 ){
            // if positive, no change
            return parseInt(value)
        } else {
            // if negative, use BC
            return parseInt(Math.abs(value)) + ' BC'
        }
    }
  }
});
mergeTooltips(aliveSlider, 50, ' - ');

//mergeTooltips(slider, 15, ' - '); // not working

aliveSlider.noUiSlider.on('end',function(values, handle){
  //document.getElementById("alive_CB").checked = true;
    // console.log(values)
    var fromYear;
    if( typeof values[0] === 'string' && values[0].includes(" BC")){
         // if negative, remove substring and change value to negative 
         fromYear = -1 * (parseInt(values[0].split(" BC")[0]))
         // console.log(fromYear)
     } else {
       // if int/positive, no change
        fromYear = parseInt(values[0])
     }
    
    var toYear;
    if( typeof values[1] === 'string' && values[1].includes(" BC")){
         // if negative, remove substring and change value to negative 
         toYear = -1 * (parseInt(values[1].split(" BC")[0]))
         // console.log(toYear)
     } else {
       // if int/positive, no change
        toYear = parseInt(values[1])
     }
    
    
  drawAliveDuring(fromYear, toYear)
  // console.log("alive during: " + fromYear + " to "+ toYear);
});
// *** END ALIVE DUIING SLIDER ***

// *** ZOOM SLDIER ***
var zoomSlider = document.getElementById('zoomSlider');
    noUiSlider.create(zoomSlider, {
      start: [1.0],
      tooltips: [true],
      connect: true,
      // tooltips: [true],
      step: 0.1,
      range: {
        'min': 1,
        'max': 8
      },
      format: {
        // 'to' the formatted value. Receives a number.
        to: function (value) {
            return (value*100.0).toFixed(0)+('%');
        },
        // 'from' the formatted value.
        // Receives a string, should return a number.
        from: function (value) {
            val = (value.replace('%', ''))/100.0
            return Number(val);
        }
     },
});

//mergeTooltips(slider, 15, ' - '); // not working

zoomSlider.noUiSlider.on('slide',function(values, handle){
        if (isZoomSliderSyncing) return;
    var sliderZoom = values[0].replace('%', '')/100.0
    if (Math.abs(sliderZoom - currentZoom) < 0.0001) return;
    var viewport = getChartViewport();
    zoomChartTo(sliderZoom, viewport.wide / 2, viewport.high / 2)
  // console.log("slide currentZoom: " + currentZoom);
  // console.log("slide zoom factor: " + values[0]);
});

zoomSlider.noUiSlider.on('set',function(values, handle){
        if (isZoomSliderSyncing) return;
    var sliderZoom = values[0].replace('%', '')/100.0
    if (Math.abs(sliderZoom - currentZoom) < 0.0001) return;
    var viewport = getChartViewport();
    zoomChartTo(sliderZoom, viewport.wide / 2, viewport.high / 2)
  // console.log("set currentZoom: " + currentZoom);
  // console.log("set zoom factor: " + values[0]);
});
// *** END ZOOM SLIDER ***

// clear all checkboxes when script is loaded, after the slider is setup
clearCheckBoxes();
setTimeout(buildLineMenu, 0);

