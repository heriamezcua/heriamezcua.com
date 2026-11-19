(function($){
	$(document).ready(function () {
		content = $('.fox009-color-tag-cloud');
		content.find('.tag-show-more')
			.removeClass('extra_tag_hide')
			.addClass('extra_tag_show')
			.text('')
			.click(function() {
				content.find('.extra_tag_hide')
					.removeClass('extra_tag_hide')
					.addClass('extra_tag_show');
				content.find('.tag-show-more')
					.removeClass('extra_tag_show')
					.addClass('extra_tag_hide');
				return false;
			});
		content.find('.tag-show-less')
			.text('')
			.click(function() {
				content.find('.extra_tag_show')
					.removeClass('extra_tag_show')
					.addClass('extra_tag_hide');
				content.find('.tag-show-more')
					.removeClass('extra_tag_hide')
					.addClass('extra_tag_show');
				return false;
			});
		content.find('a[href!="#"].no_link')
			.click(function(){
				return false;
			});
		content.find('a[class*="sty_bd_"]')
			.each(function(){
				$(this).hover(
					function(){
						$(this).css('background-color', $(this).css('border-color'));
					},
					function(){
						$(this).css('background-color', '#fff');
					}
				);
			});
	});
}(jQuery));