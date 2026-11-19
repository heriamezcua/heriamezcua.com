(function($) {
    var contentpostCarousel = function ($scope, $) {


    	// =======================================================================================
		// Blog carousel
		// Source: https://swiperjs.com/
		// =======================================================================================

		if ($(".tt-blog-carousel").length) {
		$(".tt-blog-carousel").each(function() {
			var $ttBlogCarousel = $(this);

			// Data attributes
			// ================
			var $dataSimulateTouch = $ttBlogCarousel.data("simulate-touch");
			var $autoplay = $ttBlogCarousel.data("autoplay") ? { delay: $ttBlogCarousel.data("autoplay"), } : $ttBlogCarousel.data("autoplay");
			var $dataLoop = $ttBlogCarousel.data("loop") ? { loopedSlides: 3, } : $ttBlogCarousel.data("loop");

			if ($ttBlogCarousel.is("[data-speed]")) {
				var $dataSpeed = $ttBlogCarousel.data("speed");
			} else {
				var $dataSpeed = 900; // by default
			}

			if ($ttBlogCarousel.is("[data-pagination-type]")) {
				var $dataPaginationType = $ttBlogCarousel.data("pagination-type");
			} else {
				var $dataPaginationType = "bullets"; // by default (bullets/fraction/progressbar)
			}

			// Init Swiper
			// =============
			var $ttBlogCarouselSwiper = new Swiper($ttBlogCarousel.find(".swiper")[0], {
				// Parameters
				direction: "horizontal",
				slidesPerView: 1,
				spaceBetween: 30,
				longSwipesRatio: 0.3,
				mousewheel: false,
				keyboard: false,
				preloadImages: false, // Needed for lazy loading
				watchSlidesProgress: true, // Needed for lazy loading (if slidesPerView is "auto" or more than 1)
				preventInteractionOnTransition: false, // No actions during transition
				grabCursor: true,
				simulateTouch: $dataSimulateTouch,
				speed: $dataSpeed,
				autoplay: $autoplay,
				loop: $dataLoop,

				lazy: {
					loadPrevNext: false,
					loadOnTransitionStart: true,
				},

				breakpoints: {
					// when window width is 1025px or larger
					1025: {
						slidesPerView: 3,
						spaceBetween: 0,
					},

					// when window width is 769px or larger
					769: {
						slidesPerView: 2,
						spaceBetween: 0,
					}
				},

				// Navigation (arrows)
				navigation: {
					nextEl: $ttBlogCarousel.find(".tt-blc-nav-next")[0],
					prevEl: $ttBlogCarousel.find(".tt-blc-nav-prev")[0],
					disabledClass: "tt-blc-nav-arrow-disabled",
				},

				// Pagination
				pagination: {
					el: $ttBlogCarousel.find(".tt-blc-pagination")[0],
					type: $dataPaginationType,
					modifierClass: "tt-blc-pagination-",
					dynamicBullets: true,
					dynamicMainBullets: 1,
					clickable: true,
				},

				// Events
				on: {
					lazyImageReady: (swiper) => { // Lazy load + slidesPerView:"auto" fix.
						$ttBlogCarouselSwiper.update()
					}
				}

			});

		});

	}


    };

    $(window).on('elementor/frontend/init', function () {
        elementorFrontend.hooks.addAction('frontend/element_ready/nui-post-carousel.default', contentpostCarousel);
    });

   
})(jQuery);