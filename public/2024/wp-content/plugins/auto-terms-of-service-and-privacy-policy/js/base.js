(function () {
    var handlers = [];
    var ran = false;
    var domReady = false;
    // jQuery may load late: merged / deferred, or delayed until the first user interaction
    // (e.g. WP Rocket "Delay JavaScript execution"). Handlers only run once jQuery is available.
    var jQueryFastPollPeriod = 5000;  // Poll quickly for this long after DOM ready / user interaction
    var jQueryFastPollInterval = 50;
    var jQuerySlowPollInterval = 500; // Afterwards back off
    var jQueryMaxWait = 5 * 60 * 1000; // Stop polling eventually so no timer runs forever
    var interactionEvents = ['keydown', 'mousedown', 'mousemove', 'touchstart', 'scroll', 'wheel'];

    // Safe jQuery getter - returns jQuery if available, otherwise null
    function getjQuery() {
        return (typeof jQuery !== 'undefined') ? jQuery : null;
    }

    // Run a single handler; an exception must not stop the remaining handlers.
    // The error is rethrown asynchronously so it still reaches the console / error monitoring.
    function callHandler(fn, $) {
        try {
            fn($);
        } catch (e) {
            setTimeout(function () {
                throw e;
            }, 0);
        }
    }

    function runHandlers() {
        if (ran) {
            return;
        }
        ran = true;
        var $ = getjQuery();
        var list = handlers;
        handlers = [];
        for (var i = 0; i < list.length; i++) {
            callHandler(list[i], $);
        }
    }

    function now() {
        return new Date().getTime();
    }

    // Waits for jQuery; handlers never run without it. Polls quickly at first, then backs off,
    // re-checks on the first user interaction and on window load, and stops polling after jQueryMaxWait.
    function waitForjQuery() {
        var started = now();
        var fastUntil = started + jQueryFastPollPeriod;
        var timer = null;
        var done = false;
        // Plain object: old browsers treat it as useCapture=true, both when adding and removing.
        var listenerOptions = {passive: true};

        function removeInteractionListeners() {
            for (var i = 0; i < interactionEvents.length; i++) {
                window.removeEventListener(interactionEvents[i], onInteraction, listenerOptions);
            }
        }

        function check() {
            if (done) {
                return true;
            }
            if (!getjQuery()) {
                return false;
            }
            done = true;
            if (timer !== null) {
                clearTimeout(timer);
                timer = null;
            }
            removeInteractionListeners();
            window.removeEventListener('load', check, false);
            runHandlers();
            return true;
        }

        function schedule() {
            if (timer !== null) {
                clearTimeout(timer);
                timer = null;
            }
            var t = now();
            if (t - started >= jQueryMaxWait) {
                // Give up polling; a later first interaction or window load still re-checks.
                return;
            }
            timer = setTimeout(function () {
                timer = null;
                if (!check()) {
                    schedule();
                }
            }, t < fastUntil ? jQueryFastPollInterval : jQuerySlowPollInterval);
        }

        // Delayed scripts are usually loaded right after the first interaction:
        // re-check now, then poll quickly again (once - the listeners are removed on the first event).
        function onInteraction() {
            removeInteractionListeners();
            if (check()) {
                return;
            }
            started = now();
            fastUntil = started + jQueryFastPollPeriod;
            schedule();
        }

        for (var i = 0; i < interactionEvents.length; i++) {
            window.addEventListener(interactionEvents[i], onInteraction, listenerOptions);
        }
        window.addEventListener('load', check, false);
        schedule();
    }

    // Called when DOM is ready - waits for jQuery if needed
    function onDomReady() {
        if (domReady) {
            return;
        }
        domReady = true;

        // If jQuery is already available, run immediately
        if (getjQuery()) {
            runHandlers();
            return;
        }
        waitForjQuery();
    }

    // Handlers must not run before the DOM is parsed: notice containers are printed at the end of the body.
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', onDomReady);
    } else {
        // DOM already parsed (script loaded deferred / delayed)
        onDomReady();
    }

    function wpAutoTermsDomReady(fn) {
        if (ran) {
            callHandler(fn, getjQuery());
        } else {
            handlers.push(fn);
        }
    }

    window.wpAutoTermsDomReady = wpAutoTermsDomReady;

    // Error fallback - if another script's error broke the ready chain, still start once the DOM is parsed.
    // Never runs handlers before the DOM is parsed and still respects the jQuery wait.
    window.addEventListener('error', function () {
        if (!ran && document.readyState !== 'loading') {
            onDomReady();
        }
    });
})();
