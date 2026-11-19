wpAutoTermsDomReady(function () {
    wpautotermsCountry.initCountrySelector = function () {
        var COUNTRIES = jQuery("[data-type='country-selector']");
        // Initialize only once: a second init would bind a second change handler with its own saved state.
        if (COUNTRIES.length < 1 || COUNTRIES.data("wpautoterms-country-init")) {
            return;
        }
        COUNTRIES.data("wpautoterms-country-init", true);
        var LOCALES = [wpautotermsCountry.locale.split("_")[0]];
        var savedOptions = {};
        var selectedCountry = wpautotermsCountry.country;

        function sortSelect(selector, languages) {
            var el = jQuery(selector);
            var selected = el.val();
            var options = el.find("option");
            var arr = options.map(function (idx, x) {
                return [[x.innerText, x.value]];
            }).get();
            arr.sort(function (x, y) {
                return x[0].localeCompare(y[0], languages);
            });

            options.each(function (idx, x) {
                x.value = arr[idx][1];
                x.innerText = arr[idx][0];
            });
            el.val(selected);
        }

        var STATE_INPUT = jQuery("[data-type='state-selector']");
        var stateRow = jQuery("[data-type='state-row']");
        if (stateRow.length < 1) {
            stateRow = STATE_INPUT.parent().parent();
        }
        if (selectedCountry) {
            savedOptions[selectedCountry] = wpautotermsCountry.state;
        }

        function updateStates() {
            var states = wpautotermsStates.states[COUNTRIES.val()] || [];
            var state = STATE_INPUT.val();
            if (state !== null) {
                savedOptions[selectedCountry] = STATE_INPUT.val();
            }
            if (states.length < 1) {
                stateRow.hide();
                STATE_INPUT.html("");
                STATE_INPUT.val("");
                // STATE_INPUT.removeAttr("required");
                return;
            }
            stateRow.show();
            // STATE_INPUT.attr("required", "required");
            var options = states.map(function (x) {
                return '<option value="' + x + '">' + (wpautotermsStates.translations[x] || x) + '</option>';
            });
            selectedCountry = COUNTRIES.val();
            STATE_INPUT.html(options.join("\n"));
            sortSelect(STATE_INPUT, LOCALES);
            // Use the saved state only if it is one of this country's states (it may be empty or stale),
            // otherwise the select would show a blank value and post nothing.
            var savedState = savedOptions.hasOwnProperty(selectedCountry) ? savedOptions[selectedCountry] : null;
            if (savedState && states.indexOf(savedState) >= 0) {
                STATE_INPUT.val(savedState);
            } else {
                STATE_INPUT.val(STATE_INPUT.find("option:first").val());
            }
        }

        var options = Object.keys(wpautotermsStates.states).map(function (x) {
            return '<option value="' + x + '">' + (wpautotermsStates.translations[x] || x) + '</option>';
        });
        COUNTRIES.html(options.join("\n"));
        sortSelect(COUNTRIES, LOCALES);
        if (!wpautotermsStates.states.hasOwnProperty(selectedCountry) && COUNTRIES.data("allow-empty")) {
            // No country set: a select with no choice posts nothing, which would store the first country.
            COUNTRIES.prepend(jQuery("<option>").val("").text(wpautotermsCountry.selectCountry || "\u2014"));
            selectedCountry = "";
        }
        COUNTRIES.val(selectedCountry);
        COUNTRIES.show();
        STATE_INPUT.show();
        COUNTRIES.change(updateStates).trigger("change");
    };
    if (jQuery("[data-type='country-selector']").length > 0) {
        wpautotermsCountry.initCountrySelector();
    }
});
