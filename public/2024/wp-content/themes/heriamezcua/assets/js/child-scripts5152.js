// Table of Content
// =================
// Detect browser
// Detect mobile device
// Page transitions
// Smooth Scrollbar
// Magic cursor
// Image lazy loading
// Main menu (classic)
// Overlay menu 
// Portfolio slider (full screen)
// Portfolio carousel
// Blog carousel
// Content carousel
// Testimonials slider
// Isotope
// lightGallery
// Page header
// Next project
// GSAP ScrollTrigger plugin
// Portfolio interactive
// Portfolio list
// Portfolio grid
// tt-Gallery
// Accordion
// Sidebar (classic)
// Sliding sidebar
// Scrolling text
// Scroll between anchors 
// Scroll to top 
// Defer videos
// Forms
// Miscellaneous
//




// (function ($) {
// 	'use strict';




// LIGHT THEME

// 	// ======================================================================
// 	// Template style switch
// 	// NOTE: Remove this if you do not want to use the template light style.
// 	// ======================================================================

// 	// Display style switch button
// 	$("#body-inner").prepend('<div class="tt-style-switch"><div class="tt-stsw-dark"><i class="far fa-moon"></i></div><div class="tt-stsw-light"><i class="fas fa-sun"></i></div></div>');

// 	// Hide magic cursor on button hover
// 	if ($("body").hasClass("tt-smooth-scroll")) {
// 		$(".tt-style-switch").on("mouseenter", function () {
// 			gsap.to($ball, { duration: 0.3, scale: 0, opacity: 0 });
// 		}).on("mouseleave", function () {
// 			gsap.to($ball, { duration: 0.3, scale: 1, opacity: $ballOpacity });
// 		});
// 	}

// 	// Click on style switch
// 	$(".tt-style-switch").on("click", function () {
// 		$("body").toggleClass("tt-light-style-on");
// 		$("body").hasClass("tt-light-style-on") ? (localStorage.setItem("lightstyle", "true"),
// 			$(".tt-style-switch").addClass("is-dark")) : (localStorage.setItem("lightstyle", "false"),
// 				$(".tt-style-switch").removeClass("is-dark"));

// 		location.reload();
// 	});

// 	// localStorage
// 	var nui_url = nui_object_name.nui_string;
// 	var nui_url_child = nui_object_name_child.nui_string_child;
// 	var d = localStorage.getItem("lightstyle");
// 	d == "true" ? ($("body").addClass("tt-light-style-on"),
// 		$(".tt-style-switch").addClass("is-dark")) : ($("body").removeClass("tt-light-style-on"),
// 			$(".tt-style-switch").removeClass("is-dark"));

// 	// Toggle light stylesheet
// 	if ($("body").hasClass("tt-light-style-on")) {
// 		$("head").append('<link id="tt-light-style" rel="stylesheet" href="' + nui_url + '/includes/css/light-style.css">');
// 		$("head").append('<link id="tt-light-style-child" rel="stylesheet" href="' + nui_url_child + '/child-light-style.css">');
// 	} else {
// 		$("#tt-light-style").remove();
// 	}



// 	// Hover fix for iOS
// 	// ==================
// 	$("*").on("touchstart", function () {
// 		$(this).trigger("hover");
// 	}).on("touchend", function () {
// 		$(this).trigger("hover");
// 	});

// })(jQuery); 