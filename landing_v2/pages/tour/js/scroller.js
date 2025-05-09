//check the current page to determine what the mouseover does
var path = window.location.pathname;
var page = path.split("/").pop();
/**
 * scroller - handles the details
 * of figuring out which section
 * the user is currently scrolled
 * to.
 *
 */
function scroller() {
  var windowHeight;
  var container = d3.select('body');
  // event dispatcher
// if (page=="chartofHistory.html"){
//    //if d3.v3
    var dispatch = d3.dispatch('active', "progress");
// } else {
//    // for d3.v4
//    var dispatch = d3.dispatch.call('active', "progress");
// }


  // d3 selection of all the
  // text sections that will
  // be scrolled through
  var sections = null;

  // array that will hold the
  // y coordinate of each section
  // that is scrolled through
  var sectionPositions = [];
  var currentIndex = -1;
  // y coordinate of
  var containerStart = 0;

  /**
   * scroll - constructor function.
   * Sets up scroller to monitor
   * scrolling of els selection.
   *
   * @param els - d3 selection of
   *  elements that will be scrolled
   *  through by user.
   */
  function scroll(els) {
    sections = els;

    // when window is scrolled call
    // position. When it is resized
    // call resize.
    d3.select(window)
      .on("scroll.scroller", position)
      .on("resize.scroller", resize);

    // manually call resize
    // initially to setup
    // scroller.
    resize();

    // hack to get position
    // to be called once for
    // the scroll position on
    // load.
      if (page=="chartofHistory.html" || page=="sandbox.html"){
        //if d3.v3
        d3.timer(function() {
          position();
          return true;
        });
      } else {
    let timer = d3.timer(function() {
      position();
      timer.stop();
    });
      }
  }
  /**
   * resize - called initially and
   * also when page is resized.
   * Resets the sectionPositions
   *
   */
  function resize() {
    // sectionPositions will be each sections
    // starting position relative to the top
    // of the first section.
    sectionPositions = [];
    var startPos;
    sections.each(function(d,i) {
      var top = this.getBoundingClientRect().top;
      if(i === 0) {
        startPos = top;
      }
      sectionPositions.push(top - startPos);
    });
    containerStart = container.node().getBoundingClientRect().top + window.pageYOffset;
  }

  /**
   * position - get current users position.
   * if user has scrolled to new section,
   * dispatch active event with new section
   * index.
   *
   */
  function position() {
    var pos = window.pageYOffset - 10 - containerStart; //changing the height of the active position
    var sectionIndex = d3.bisect(sectionPositions, pos);
    sectionIndex = Math.min(sections.size() - 1, sectionIndex);
//      console.log(sectionIndex)

    if (currentIndex !== sectionIndex) {
        
        if (page=="chartofHistory.html"|| page=="sandbox.html"){
            //if d3.v3
//            console.log("Dispatch Active")
            dispatch.active(sectionIndex);
        } else {
            // for d3.v4
           console.log("Dispatch Active" + sectionIndex)
           d3.dispatch.call('active',sectionIndex);
            
        }
      currentIndex = sectionIndex;
    }

    var prevIndex = Math.max(sectionIndex - 1, 0);
    var prevTop = sectionPositions[prevIndex];
    var progress = (pos - prevTop) / (sectionPositions[sectionIndex] - prevTop);
//      console.log(progress)
      
       if (page=="chartofHistory.html"){
            //if d3.v3
//            console.log("Dispatch Progress")
            dispatch.progress(currentIndex, progress);
        } else {
            // for d3.v4
//            console.log("Dispatch Progress")
            d3.dispatch.call('progress',currentIndex, progress);

        }

  }

  /**
   * container - get/set the parent element
   * of the sections. Useful for if the
   * scrolling doesn't start at the very top
   * of the page.
   *
   * @param value - the new container value
   */
  scroll.container = function(value) {
    if (arguments.length === 0) {
      return container;
    }
    container = value;
    return scroll;
  };

  // allows us to bind to scroller events
  // which will internally be handled by
  // the dispatcher.
  d3.rebind(scroll, dispatch, "on");

  return scroll;
}

//window.onload = (event) =>{
//   const tourElement = document.getElementById("graphic");
//   tourElement.scrollIntoView();
//};
