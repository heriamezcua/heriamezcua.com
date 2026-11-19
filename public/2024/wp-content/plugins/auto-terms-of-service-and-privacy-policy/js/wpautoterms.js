wpAutoTermsDomReady(function ($) {
    // Guard against double initialization (e.g. the script printed twice by an optimization plugin).
    if (window.wpautotermsNoticesInitialized) {
        return;
    }
    // base.js only runs handlers once jQuery is available.
    $ = $ || window.jQuery;
    window.wpautotermsNoticesInitialized = true;
    // NOTE: Safari caps cookies written by JavaScript at 7 days, the same lifetime everywhere;
    var COOKIE_EXPIRE_DAYS = 7;

    function maxZIndex() {
        return Math.max.apply(null,
            $.map($('body *'), function (e, n) {
                if ($(e).css('position') !== 'static')
                    return parseInt($(e).css('z-index')) || 1;
            }));
    }

    function getShadowProperty(e, modifier, prop, def) {
        var v = window.getComputedStyle($(e)[0], modifier)
            .getPropertyValue(prop);
        return typeof v === "undefined" ? def : v;
    }

    var oldBottomValue = parseInt(getShadowProperty("body", ":after", "bottom", 0));
    var topContainer = $("#wpautoterms-top-fixed-container");
    var bottomContainer = $("#wpautoterms-bottom-fixed-container");
    var z = maxZIndex();
    topContainer.css('z-index', z - (-1));
    bottomContainer.css('z-index', z - (-2));
    var topStaticContainer = $("#wpautoterms-top-static-container");
    $("body").prepend(topStaticContainer);
    topStaticContainer.css("margin-top", parseInt(getShadowProperty("body", ":before", "height", 0)) + "px");
    $("#wpautoterms-bottom-static-container").css("margin-bottom", parseInt(getShadowProperty("body", ":after", "height", 0)) + "px");

    function recalcContainers() {
        $("#wpautoterms-top-fixed-style,#wpautoterms-bottom-fixed-style").remove();
        var h = $("head");
        var topContainer = $("#wpautoterms-top-fixed-container");
        var bottomContainer = $("#wpautoterms-bottom-fixed-container");
        if (topContainer.length) {
            h.append('<style id="wpautoterms-top-fixed-style">body:before{top:' +
                parseInt(topContainer.height()) + 'px !important;}</style>');
        }
        if (bottomContainer.length) {
            h.append('<style id="wpautoterms-bottom-fixed-style">body:after{bottom:' +
                (oldBottomValue + parseInt(bottomContainer.height())) + 'px !important;}</style>');
        }
    }

    function setCookie(name, value, expire, path, domain) {
        var d = new Date();
        var names = String(name).split(',');
        var values = String(value).split(',');
        var suffix = "; path=" + (path || "/") + (domain ? "; domain=" + domain : "");
        d.setTime(d.getTime() + (expire * 24 * 60 * 60 * 1000));
        // NOTE: index loops, "for in" also visits Array.prototype additions of legacy libraries.
        for (var idx = 0; idx < names.length; idx++) {
            name = names[idx];
            value = values[idx];
            document.cookie = name + "=" + encodeURIComponent(value) + "; expires=" + d.toUTCString() + suffix;
        }
    }

    function deleteCookie(name, path, domain) {
        document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=" + (path || "/") +
            (domain ? "; domain=" + domain : "");
    }

    function getCookie(name) {
        name = name.toLowerCase();
        var cookies = document.cookie.split(';');
        for (var k = 0; k < cookies.length; k++) {
            var el = cookies[k].split('=');
            if (el[0].trim().toLowerCase() === name) {
                // The value may contain "=", setCookie() encodes it.
                var value = el.slice(1).join('=');
                try {
                    return decodeURIComponent(value);
                } catch (e) {
                    return value;
                }
            }
        }
        return null;
    }

    // wp-util may still be loading when jQuery is already available (scripts delayed until user interaction).
    function whenTemplatesReady(fn) {
        var waited = 0;
        (function check() {
            if (typeof wp !== "undefined" && typeof wp.template === "function") {
                fn();
            } else if (waited < 10000) {
                waited += 50;
                setTimeout(check, 50);
            } else {
                console.error("[WPAutoTerms][UpdateNotice] wp.template is not available");
            }
        })();
    }

    function populateUpdateBox(data) {
        var TEMPLATE = wp.template("wpautoterms-update-notice");
        var container = $("#wpautoterms-update-notice-placeholder");
        container.show();
        for (var k = 0; k < data.length; k++) {
            $(TEMPLATE(data[k])).appendTo(container);
        }
        $(document.body).trigger("post-load");
        // The notices change the fixed containers' height.
        recalcContainers();
    }

    function handleUpdatesBox() {
        if (typeof wpautoterms_js_update_notice === "undefined") {
            return;
        }
        if (wpautoterms_js_update_notice.disable) {
            return;
        }
        var detectorCookie = wpautoterms_js_update_notice.cache_detector_cookie;
        // Must match the path/domain the server uses for the cache detector cookie.
        var detectorPath = wpautoterms_js_update_notice.cache_detector_path || "/";
        var detectorDomain = wpautoterms_js_update_notice.cache_detector_domain || "";
        if (detectorPath !== "/" || detectorDomain) {
            // Remove the stale host-only path=/ cookie set by older versions, it would shadow the real one.
            deleteCookie(detectorCookie, "/", "");
        }
        // The page was generated for this request only when it echoes the token this request carried.
        // Tokens of older versions ("0"/"1") are not unique, a cached page may echo them too.
        var dc = getCookie(detectorCookie);
        var isCached = dc === null || dc.length < 8 || dc !== wpautoterms_js_update_notice.cache_detector_value;
        var token = Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
        setCookie(detectorCookie, token, COOKIE_EXPIRE_DAYS, detectorPath, detectorDomain);
        if (isCached) {
            $.post(wpautoterms_js_update_notice.ajaxurl, {
                action: wpautoterms_js_update_notice.action
            }).done(function (response) {
                if (typeof response !== "object") {
                    console.error("[WPAutoTerms][UpdateNotice] Response is not an object", response);
                } else {
                    whenTemplatesReady(function () {
                        populateUpdateBox(response.data);
                        bindClose();
                    });
                }
            }).fail(function (error) {
                console.error("[WPAutoTerms][UpdateNotice] Query error", error);
            });
        } else {
            var data = wpautoterms_js_update_notice.data;
            if (data == null || typeof data === "undefined") {
                return;
            }
            whenTemplatesReady(function () {
                populateUpdateBox(data);
                bindClose();
            });
        }
    }

    recalcContainers();
    handleUpdatesBox();

    // The site's home path, so the sites of a subdirectory network keep their own dismissals.
    function noticeCookiePath() {
        var args = typeof wpautoterms_js_cookies_notice !== "undefined" ? wpautoterms_js_cookies_notice :
            (typeof wpautoterms_js_update_notice !== "undefined" ? wpautoterms_js_update_notice : null);
        return (args && args.cookie_path) || "/";
    }

    function handleClose() {
        var t = $(this);
        setCookie(t.data("cookie"), t.data("value"), COOKIE_EXPIRE_DAYS, noticeCookiePath());
        var p1 = $(this).parent();
        var p2 = p1.parent();
        p1.remove();
        try {
            if (p2.html().length < 1) {
                p2.remove();
            }
        } catch(e){

        }

        recalcContainers();
    }

    function bindClose() {
        $(".wpautoterms-notice-close").off("click", handleClose).on("click", handleClose);
    }

    function closeCookieNotice() {
        if (typeof wpautoterms_js_cookies_notice === "undefined") {
            return;
        }
        if (!wpautoterms_js_cookies_notice.disable && getCookie(wpautoterms_js_cookies_notice.cookie_name) != 1) {
            var entries = document.querySelectorAll("." + wpautoterms_js_cookies_notice.class);
            for (var k = 0; k < entries.length; ++k) {
                var el = entries[k];
                el.style.display = null;
            }
        }
    }

    bindClose();
    closeCookieNotice();
    // Recalculate once the cookie notice is shown, otherwise its fixed container is measured while still hidden.
    recalcContainers();
});
