// Controls the menu bar
// for metisMenu (in the Vendor folder)
$(document).ready(function () {
            //expand the menu
            $('.mt').click(function (e) {
               e.preventDefault();
                $("#wrapper").toggleClass("toggled");
                $('.ct').delay("fast").fadeIn();
                $('.mt').hide();
            })
            // close the menu
            $('.ct').click(function (e) {
               e.preventDefault();
                $("#wrapper").toggleClass("toggled");
                $('.mt').delay("fast").fadeIn();
                $('.ct').hide();
            })
            

            //console.log("this is loading");
            $('.side').click(function (e) {
                //console.log('im being clicked');
                $(this).next().toggleClass('submenu');
                e.stopImmediatePropagation();
            })

            // if clicked make it active if not already
            // make all others not active
        });

