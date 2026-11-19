wpAutoTermsDomReady(function () {
    jQuery(".wpautoterms-box-enable-button a.button[data-type='enable']").click(function () {
        var b = jQuery(this);
        // NOTE: "disabled" does not stop clicks on a link, and the server toggles the kit on every request:
        // a double click would enable and then disable it again.
        if (b.data("wpautoterms-busy")) {
            return false;
        }
        b.data("wpautoterms-busy", true);
        b.attr("disabled", "disabled");
        var id = b.attr("id");
        var s = jQuery("#status_" + id);
        jQuery.post(ajaxurl, {
            action: id,
            nonce: wpautotermsCommon.nonce[id]
        }).done(function (response) {
            if (typeof response !== "object") {
                alert(response);
            } else {
                var enabled = !!response.enabled;
                b.text(wpautotermsComplianceKits.buttonText[response.enabled]);
                s.text(wpautotermsComplianceKits.statusText[response.enabled]).toggleClass('enabled', enabled)
                    .toggleClass('disabled', !enabled);
                wpautoterms.setNotice(wpautotermsComplianceKits.boxData[id].noticeText[response.enabled],
                    "updated notice is-dismissible");
            }
        }).fail(function (error) {
            console.log(error);
            alert(error.statusText);
        }).always(function () {
            b.removeAttr("disabled");
            b.data("wpautoterms-busy", false);
        });
    });
});
