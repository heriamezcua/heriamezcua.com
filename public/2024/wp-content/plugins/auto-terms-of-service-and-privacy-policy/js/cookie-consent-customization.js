document.addEventListener('DOMContentLoaded', function () {

    var nameMappings = {
        'wpautoterms_cc_consent_type': 'consent_type',
        'wpautoterms_cc_website_name': 'website_name',
        'wpautoterms_cc_notice_banner_type': 'notice_banner_type',
        'wpautoterms_cc_color_palette': 'palette',
        'wpautoterms_cc_language': 'language',
        'wpautoterms_cc_notice_banner_reject_button_hide': 'notice_banner_reject_button_hide',
        'wpautoterms_cc_preferences_center_close_button_hide': 'preferences_center_close_button_hide',
        'wpautoterms_cc_page_refresh_confirmation_buttons': 'page_refresh_confirmation_buttons',
    };

    var callbacksField = 'wpautoterms_cc_callbacks';

    // The preview has the origin of its own URL, which is relative to this page
    function previewTarget() {
        var iframe = document.querySelector('iframe[name="previewFrame"]');
        if (!iframe || !iframe.contentWindow) {
            return null;
        }
        try {
            return {window: iframe.contentWindow, origin: new URL(iframe.getAttribute('src'), window.location.href).origin};
        } catch (e) {
            return null;
        }
    }

    // The preview applies the unsaved form fields over the saved configuration
    function sendToPreview() {
        var target = previewTarget();
        if (target) {
            target.window.postMessage(mapFields(), target.origin);
        }
    }

    function listenForChanges() {
        Object.keys(nameMappings).concat([callbacksField]).forEach(function (key) {
            let theElements = document.querySelectorAll('[name="' + key + '"]');

            Array.from(theElements).forEach(function (theElement) {
                theElement.addEventListener('change', sendToPreview);
            });
        });
    }

    function mapFields() {
        var config = {};
        Object.keys(nameMappings).forEach(function (key) {
            let configKey = nameMappings[key];
            let theElement = document.querySelectorAll('[name="' + key + '"]');
            if (theElement.length > 1) {
                theElement = document.querySelectorAll('[name="' + key + '"]:checked')[0];
            } else {
                theElement = theElement[0];
            }
            if(theElement) {
                if (theElement.type === 'checkbox') {
                    config[configKey] = theElement.checked;
                } else {
                    config[configKey] = theElement.value;
                }
            }
        });

        var callbacks = document.querySelector('[name="' + callbacksField + '"]');
        if (callbacks) {
            config.callbacks = callbacks.value;
        }

        config.demo = 'true';

        return config;
    }

    listenForChanges();

    // The Callbacks are run on the website as they are: a syntax error there only leaves them out, so it is reported before saving.
    // The code is only compiled, not run: it may use functions that exist on the website only. Saving reports code that is not an object.
    function callbacksError(code) {
        if (code.trim() === '') {
            return null;
        }
        try {
            new Function('var callbacks = ' + code + '\n;return callbacks;');
            return null;
        } catch (e) {
            return e && e.message ? e.message : String(e);
        }
    }

    var callbacksElement = document.querySelector('[name="' + callbacksField + '"]');
    if (callbacksElement && callbacksElement.form) {
        callbacksElement.form.addEventListener('submit', function (e) {
            var error = callbacksError(callbacksElement.value);
            if (error !== null && !window.confirm('The Callbacks are not valid JavaScript (' + error + ').\n\n' +
                'They are left out of your website until they are corrected. Save anyway?')) {
                e.preventDefault();
                callbacksElement.focus();
            }
        });
    }

    // Send the form fields once the preview has loaded, e.g. when the browser restored unsaved values
    var iframe = document.querySelector('iframe[name="previewFrame"]');
    if (iframe) {
        iframe.addEventListener('load', sendToPreview);
        try {
            if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete' && iframe.contentWindow.cookieconsent) {
                sendToPreview();
            }
        } catch (e) {
        }
    }

    jQuery("[data-codemirror]").each(function (_, x) {
        var target = x.id;
        var cm = CodeMirror.fromTextArea(x, {
            lineNumbers: true,
            mode: "css",
            hintOptions: {hint: CodeMirror.hint.css},
            styleActiveLine: true,
            matchBrackets: true,
            autoCloseBrackets: true,
            highlightSelectionMatches: {showToken: true, annotateScrollbar: true}
        });
    });


})
