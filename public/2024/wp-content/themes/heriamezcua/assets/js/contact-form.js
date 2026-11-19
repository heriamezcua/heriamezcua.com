document.addEventListener('DOMContentLoaded', function() {
    var submitButtonHtml = `
        <button type="submit" class="tt-btn tt-btn-primary margin-top-30 wpcf7-form-control has-spinner wpcf7-submit">
            <div data-hover="Send Message">Send Message</div>
            <span class="tt-btn-icon"><i class="fas fa-paper-plane"></i></span>
        </button>
    `;
    var placeholder = document.getElementById('custom-submit-button');
    if (placeholder) {
        placeholder.innerHTML = submitButtonHtml;
    }
});