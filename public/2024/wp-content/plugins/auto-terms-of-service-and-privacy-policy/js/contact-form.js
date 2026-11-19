wpAutoTermsDomReady(function () {
    jQuery("[data-type=accordion]").accordion();
    var CONTACT_BUTTON = jQuery("#wpautoterms_contact_button");
    var HIDE_BUTTON = jQuery("#wpautoterms_form_container_hide");
    var CONTACT_FORM = jQuery("#wpautoterms_form_container");
    var SITE_INFORMATION_TEXTAREA = document.querySelector('#wpautoterms_site_information');
    var COPY_SITE_INFORMATION = jQuery('#wpautoterms_copy_site_information');
    CONTACT_BUTTON.click(function () {
        CONTACT_BUTTON.hide();
        CONTACT_FORM.show();
    });
    HIDE_BUTTON.click(function (e) {
        e.preventDefault();
        CONTACT_BUTTON.show();
        CONTACT_FORM.hide();
    });


    function initSiteInfo() {
        var SITE_URL = SITE_INFORMATION_TEXTAREA.getAttribute('data-site-url');
        var SITE_NAME = SITE_INFORMATION_TEXTAREA.getAttribute('data-site-name');
        var EMAIL = SITE_INFORMATION_TEXTAREA.getAttribute('data-email');
        var MESSAGE_PARTS = [];
        MESSAGE_PARTS.push("Site Name: " + SITE_NAME);
        MESSAGE_PARTS.push("Site URL: " + SITE_URL);
        MESSAGE_PARTS.push("Email: " + EMAIL);
        MESSAGE_PARTS.push("----");
        MESSAGE_PARTS.push("Site Information:");
        MESSAGE_PARTS.push("");
        MESSAGE_PARTS.push(wpautotermsContact.siteInfo[2]);

        var MESSAGE_TO_COPY = MESSAGE_PARTS.join("\n");
        SITE_INFORMATION_TEXTAREA.value = MESSAGE_TO_COPY;

        function selectSiteInfo() {
            SITE_INFORMATION_TEXTAREA.focus();
            SITE_INFORMATION_TEXTAREA.select();
            SITE_INFORMATION_TEXTAREA.setSelectionRange(0, 99999); // For mobile devices
        }

        function copySucceeded() {
            alert('Site Information copied to Clipboard.');
        }

        function copyFailed() {
            selectSiteInfo();
            alert('Site Information could not be copied automatically. The text is selected, ' +
                'please copy it manually (Ctrl+C, or Cmd+C on Mac).');
            // Dismissing the alert may drop the selection.
            selectSiteInfo();
        }

        COPY_SITE_INFORMATION.click(function () {
            selectSiteInfo();

            var copied = false;
            try {
                copied = document.execCommand("copy");
            } catch (e) {
                copied = false;
            }
            // navigator.clipboard is only available in secure contexts (https / localhost).
            if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
                navigator.clipboard.writeText(MESSAGE_TO_COPY).then(copySucceeded, function () {
                    if (copied) {
                        copySucceeded();
                    } else {
                        copyFailed();
                    }
                });
            } else if (copied) {
                copySucceeded();
            } else {
                copyFailed();
            }
        })
    }
    initSiteInfo();
});
