wpAutoTermsDomReady( function( $ ){
    // Moves the summary out of the row actions, which are shown on hover only.
    function moveSummaries() {
        $( '.row-actions .inline-row-action-summary' ).each( function(){
            var pSpan = $(this).parent();
            var pTarget = pSpan.closest( '.row-actions' );
            $(this).detach();
            pSpan.remove();
            pTarget.before($(this));
        });
    }

    moveSummaries();
    // Quick Edit replaces the saved row with new markup from admin-ajax.php.
    $( document ).ajaxComplete( function( event, xhr, settings ){
        if ( settings && typeof settings.data === 'string' && settings.data.indexOf( 'action=inline-save' ) !== -1 ) {
            moveSummaries();
        }
    });
});
