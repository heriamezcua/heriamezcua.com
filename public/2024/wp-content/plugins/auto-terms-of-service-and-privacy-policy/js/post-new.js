wpAutoTermsDomReady(function ($) {
    var CREATE_SELECTOR = $("#legal-page-create-selector").show();
    
    $('#post').attr('novalidate', true);

    $("[data-type='dismiss-button']").click(function (e) {
        var el = $(e.currentTarget);
        var parent = el.closest(".wpautoterms-is-dismissible");
        if (!parent.length) {
            console.error("wpautoterms-is-dismissible parent not found.");
            return;
        }
        parent.hide();
        if ($("[data-type='permanent-dismiss'][data-name='" + el.data('name') + "']").prop('checked')) {
            $.post(ajaxurl, {
                action: 'settings_warning_disable',
                nonce: wpautotermsCommon.nonce['settings_warning_disable'],
                state: 1
            })
        }
    });

    var PAGE_ID = wpautotermsPostNew.page_id;
    // NOTE: only legal pages with a wizard, "custom" and unknown pages use the regular editor and need its title.
    if (PAGE_ID.length > 0 && Object.prototype.hasOwnProperty.call(wpautotermsPostNew.dependencies, PAGE_ID)) {
        var legalPageDep = wpautotermsPostNew.dependencies[PAGE_ID];
        var CONTAINER = $('#legal-page-container');

        function updateDependencies() {
            for (var section in legalPageDep) {
                var s = jQuery("#" + section);
                var args = legalPageDep[section];
                var state;
                var c = jQuery("#" + args[0] + ":visible");
                if (c.length) {
                    if (typeof (args[1]) === "boolean") {
                        state = c.prop("checked");
                    } else {
                        state = c.val();
                    }
                }
                var show = args[2] === "show";
                if (state !== args[1]) {
                    show = !show;
                }
                if (show) {
                    s.show();
                } else {
                    s.hide();
                }
                updateSectionRequirements(section, show);
            }
        }

        function updateSectionRequirements(sectionId, visible) {
            // jQuery("#" + sectionId + " input[type=radio]").prop("required", visible);
        }

        var hidden = wpautotermsPostNew.hidden[PAGE_ID];
        if (hidden && hidden.length) {
            $(hidden.map(function (x) {
                return "#" + x;
            }).join(",")).hide();
        }
        CONTAINER.find("input[type=radio],input[type=checkbox]").click(updateDependencies);
        
        // CONTAINER.find("input[type=radio]:visible").prop("required", true);
        
        CONTAINER.find("input[type='submit'],button[type='submit']").click(function (e) {
            CONTAINER.find("input[type=radio]").each(function () {
                var t = $(this);
                var v = t.val();
                if (v === "yes") {
                    t.val("legal-page-radio-yes");
                } else if (v === "no") {
                    t.val("legal-page-radio-no");
                }
            });
            return true;
        });
        // countries.js already initializes the selector; initCountrySelector() is idempotent.
        if (typeof wpautotermsCountry !== "undefined" && typeof wpautotermsCountry.initCountrySelector === "function") {
            wpautotermsCountry.initCountrySelector();
        }
        updateDependencies();
        $("input[name=post_title]:not([data-wpautoterms])").remove();
    }
});
