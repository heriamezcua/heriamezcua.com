(function($) {
    var gridIso = function ($scope, $) {

   // ============================================================================
   // Isotope
   // More info: http://isotope.metafizzy.co
   // Note: "imagesloaded" blugin is required! https://imagesloaded.desandro.com/
   // ============================================================================

	// init Isotope
	var $container = $(".isotope-items-wrap-nui");
	$container.imagesLoaded(function() {
		$container.isotope({
			itemSelector: ".isotope-item",
			layoutMode: "packery",
			transitionDuration: "0.7s",
			percentPosition: true
		});

		setTimeout(function() {
			$container.isotope('layout'); // Refresh Isotope
			ScrollTrigger.refresh(true); // Refresh ScrollTrigger
		}, 500);
	});

	// Filter
	$(".ttgr-cat-list > li > a, .ttgr-cat-classic-list > li > a").on("click", function() {
		var selector = $(this).attr("data-filter");
		$container.isotope({
			filter: selector
		});

		// Refresh ScrollTrigger
		setTimeout(function() {
			ScrollTrigger.refresh(true);
		}, 500);

		return false;
	});

	// Filter item active
	var filterItemActive = $(".ttgr-cat-list > li > a, .ttgr-cat-classic-list > li > a");
	filterItemActive.on("click", function(){
		var $this = $(this);
		if ( !$this.hasClass("active")) {
			filterItemActive.removeClass("active");
			$this.addClass("active");
		}
	});


    };

    $(window).on('elementor/frontend/init', function () {
        elementorFrontend.hooks.addAction('frontend/element_ready/nui-portfolio-grid.default', gridIso);
    });

   
})(jQuery);