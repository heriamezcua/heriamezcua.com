/**
 * Minify > Analytics tab: provider choice, Burst install flow and status panels.
 *
 * Relies on wp_optimize.send_command (send-command.js) for nonce handling and on
 * the generic minify save handler (minify.js) for the Google Analytics form.
 */

(function($) {

	'use strict';

	$(function() {

		var $root = $('#wpo-analytics');
		if (!$root.length) return;

		var labels = (window.wpo_analytics && window.wpo_analytics.labels) || {};

		var $choice = $('#wpo-analytics-choice');
		var $cards = $root.find('.wpo-analytics-card');
		var $burst_panel = $('#wpo-analytics-burst-panel');
		var $google_panel = $('#wpo-analytics-google-panel');
		var $success = $('#wpo-analytics-burst-success');
		var $button = $('#wpo-analytics-enable-burst');
		var $ga_form = $('#analytics-form');

		/**
		 * Provider matching the checked card. The radios carry the enable_analytics value:
		 * 'true' is Google Analytics, 'false' is Burst.
		 *
		 * @return {string} 'burst' or 'google'
		 */
		function selected_provider() {
			return ('true' === $root.find('input[name=enable_analytics]:checked').val()) ? 'google' : 'burst';
		}

		/**
		 * Show the panel matching the selected radio card.
		 *
		 * @param {string} provider 'burst' or 'google'
		 */
		function select_provider(provider) {
			$cards.each(function() {
				var $card = $(this);
				var card_provider = ('true' === $card.find('input[type=radio]').val()) ? 'google' : 'burst';
				$card.toggleClass('wpo-analytics-card--selected', card_provider === provider);
			});
			$burst_panel.toggle('burst' === provider);
			$google_panel.toggle('google' === provider);
		}

		$root.on('change', 'input[name=enable_analytics]', function() {
			select_provider(selected_provider());
			// Both radios belong to the GA form, which the generic minify save handler (minify.js) posts when
			// need_saving is true. Only a Google choice may be saved that way: picking Burst is applied by the
			// "Enable Burst" flow and must not be saved by another tab's "Save settings".
			$ga_form.data('need_saving', 'google' === selected_provider());
		});

		select_provider(selected_provider());

		/**
		 * Reflect progress in the button label: "Downloading Burst… (Step 1 of 3)"
		 *
		 * @param {string} step  Current step id
		 * @param {number} index Zero-based step index
		 * @param {number} total Total number of steps
		 */
		function set_progress_label(step, index, total) {
			var step_of = (labels.step_of || '(Step %1$s of %2$s)').replace('%1$s', index + 1).replace('%2$s', total);
			$button.text((labels[step] || step) + ' ' + step_of);
		}

		function reset_button() {
			$button.prop('disabled', false).text($button.data('label'));
		}

		/**
		 * Run the remaining install steps one after another.
		 *
		 * @param {Array}  steps Step ids, e.g. ['download', 'activate', 'configure']
		 * @param {number} index Step to run now
		 */
		function run_step(steps, index) {
			if (index >= steps.length) return;

			var step = steps[index];
			set_progress_label(step, index, steps.length);

			// Errors (WP_Error from the command) are shown by send_command through the WPO notices and
			// do not reach the callback. Track whether the callback ran so the button never stays disabled.
			var handled = false;

			wp_optimize.send_command('analytics_burst_step', {step: step}, function(response) {
				handled = true;
				if (!response || !response.success) {
					alert(wpoptimize.error_unexpected_response);
					reset_button();
					return;
				}

				if (index + 1 < steps.length) {
					run_step(steps, index + 1);
				} else {
					show_success(response.state ? response.state.tracking_method : '');
				}
			}, true, {
				// Downloading from WordPress.org can take a while on slow hosts.
				timeout: 180000
			}).fail(function() {
				alert(wpoptimize.error_unexpected_response);
			}).always(function() {
				if (!handled) reset_button();
			});
		}

		/**
		 * Replace the cards with the success panel.
		 *
		 * @param {string} tracking_method Label of Burst's tracking method, from the last step response
		 */
		function show_success(tracking_method) {
			if (tracking_method) $('#wpo-analytics-tracking-method').text(tracking_method);
			$ga_form.data('need_saving', false);
			$google_panel.find('.wpo-analytics__status, #wpo-analytics-turn-off').hide();
			// Burst is running now: warn about double tracking if the user switches back to Google.
			$('#wpo-analytics-burst-running').show();
			$choice.hide();
			$success.show();
			reset_button();
		}

		// Install only starts on an explicit click; nothing runs on radio change.
		$button.on('click', function(e) {
			e.preventDefault();
			if ($button.prop('disabled')) return;

			// The remaining steps are decided server-side and rendered on the button.
			var steps = String($button.data('steps') || '').split(',').filter(Boolean);
			if (!steps.length) return;

			$button.prop('disabled', true);
			run_step(steps, 0);
		});

		$('#wpo-analytics-switch-to-google').on('click', function(e) {
			e.preventDefault();
			$success.hide();
			$root.find('#wpo_analytics_provider_google').prop('checked', true).trigger('change');
			$choice.show();
		});

		// Google Analytics active: switch the script off but keep the saved tracking ID and options.
		$('#wpo-analytics-turn-off').on('click', function(e) {
			e.preventDefault();
			var $link = $(this);
			if ($link.data('busy')) return;
			$link.data('busy', true);
			var handled = false;

			wp_optimize.send_command('save_minify_settings', {enable_analytics: 'false'}, function(response) {
				handled = true;
				if (!response || !response.success) {
					$link.data('busy', false);
					alert(wpoptimize.error_unexpected_response);
					return;
				}
				// The status panel and the link are rendered server-side; reload to get the new state.
				window.location.reload();
			}, true).fail(function() {
				alert(wpoptimize.error_unexpected_response);
			}).always(function() {
				if (!handled) $link.data('busy', false);
			});
		});

	});

})(jQuery);
