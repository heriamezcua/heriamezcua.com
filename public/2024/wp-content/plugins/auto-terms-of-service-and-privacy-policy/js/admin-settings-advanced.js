(function () {
    // Advanced Settings has no menu entry: highlight the "Settings" submenu item instead.
    // Select it by its page slug, the link text is translated.
    function highlightSettingsMenu() {
        var settingsLink = document.querySelector('#menu-posts-wpautoterms_page ul a[href$="page=wpautoterms_settings"]');
        if (!settingsLink) {
            return;
        }
        settingsLink.classList.add('current');
        if (settingsLink.parentNode) {
            settingsLink.parentNode.classList.add('current');
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', highlightSettingsMenu);
    } else {
        highlightSettingsMenu();
    }
})();
