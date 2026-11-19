document.addEventListener('DOMContentLoaded', function () {

    var vendorScriptsInput = document.querySelector('input[name="wpautoterms_cc_vendor_scripts_b64"]');
    var addVendorScriptButton = document.querySelector('#add-vendor-script');
    var vendorScripts = [];
    var scriptTypes = {
        'strictly-necessary': 'Strictly Necessary',
        'functionality': 'Functionality',
        'tracking': 'Tracking and Performance',
        'targeting': 'Targeting and Advertising'
    };

    // Markup without a <script> tag (e.g. <noscript><img>) cannot be held back until consent
    // Leading HTML comments (e.g. "<!-- Hotjar -->") may precede inline code, as in the plugin's PHP code
    function isMarkupWithoutScript(code) {
        code = String(code || '');
        if (/<script/i.test(code)) {
            return false;
        }
        return code.replace(/^(?:\s*<!--[\s\S]*?-->)+/, '').trim().charAt(0) === '<';
    }

    // A <script> tag without its closing </script> is not added to the website, as in the plugin's PHP code
    function hasIncompleteScript(code) {
        code = String(code || '');
        var open = /<script\b/ig, close = /<\/script\s*>/ig, match;
        while ((match = open.exec(code))) {
            close.lastIndex = match.index;
            match = close.exec(code);
            if (!match) {
                return true;
            }
            open.lastIndex = match.index + match[0].length;
        }
        return false;
    }

    // Stored scripts the website gets nothing of, reported by the page
    var droppedCodes = Array.isArray(window.wpautotermsDroppedVendorScripts) ? window.wpautotermsDroppedVendorScripts : [];

    function isDropped(code) {
        return droppedCodes.indexOf(code) !== -1 || hasIncompleteScript(code);
    }

    function deleteVendorScript(id) {
        vendorScripts = vendorScripts.filter((item) => item.id !== id);
        renderVendorScripts(vendorScripts);
        saveObjectToInput(vendorScripts, vendorScriptsInput);
    }


    var initVendorScripts = function () {
        return new Promise(function (resolve, reject) {
            if (vendorScriptsInput) {
                try {
                    vendorScripts = JSON.parse(b64_to_utf8(vendorScriptsInput.value));
                } catch (e) {
                    vendorScripts = [];
                    saveObjectToInput(vendorScripts, vendorScriptsInput);
                }
                resolve(vendorScripts);
            }
        });
    };

    var addVendorScript = function (items) {
        try {
            var {script_name, script_type, script_code} = items;

            // Validate required fields
            var nameValue = script_name.value ? script_name.value.trim() : '';
            var codeValue = script_code.value ? script_code.value.trim() : '';
            // script_type is the checked radio button, or null when no Type is selected
            var typeValue = script_type && script_type.value ? script_type.value : '';
            var typeRadios = document.querySelectorAll('input[name="wpautoterms_vendor_script_type"]');

            if (!nameValue) {
                alert('Please enter a Name for the vendor script.');
                script_name.focus();
                return false;
            }

            if (!typeValue) {
                alert('Please select a Type for the vendor script.');
                if (typeRadios.length > 0) {
                    typeRadios[0].focus();
                }
                return false;
            }

            if (!codeValue) {
                alert('Please enter Script code for the vendor script.');
                script_code.focus();
                return false;
            }

            if (isMarkupWithoutScript(codeValue)) {
                alert('Please enter the <script> code of the vendor script. Other HTML, such as <noscript> or <img>, cannot wait for consent and is not added to your website.');
                script_code.focus();
                return false;
            }

            if (hasIncompleteScript(codeValue)) {
                alert('A <script> tag in the Script code has no closing </script> tag, so that script would not be added to your website. Please paste the complete code of the vendor script.');
                script_code.focus();
                return false;
            }

            vendorScripts.push(
                {
                    id: getUniqueID(),
                    script_name: nameValue,
                    script_type: typeValue,
                    script_code: codeValue
                }
            );
            saveObjectToInput(vendorScripts, vendorScriptsInput);
            renderVendorScripts();

            // Clear the form for the next script. The Type radios are only unchecked:
            // their value attributes are the stored types and must never change.
            script_name.value = '';
            script_code.value = '';
            for (var i = 0; i < typeRadios.length; i++) {
                typeRadios[i].checked = false;
            }

            return true;

        } catch (e) {
            return false;
        }

    }

    addVendorScriptButton.addEventListener('click', function (e) {
        var script_name = document.querySelector('input[name="wpautoterms_vendor_script_name"]');
        var script_type = document.querySelector('input[name="wpautoterms_vendor_script_type"]:checked');
        var script_code = document.querySelector('textarea[name="wpautoterms_vendor_script_code"]');

        addVendorScript({script_name, script_type, script_code});
    });
    // "Save Changes" with a filled in "Add vendor script" form would lose the script that is not added yet:
    // it is added first, and the form is not submitted when it is not valid (the reason is shown).
    var addForm = addVendorScriptButton.form;
    if (addForm) {
        addForm.addEventListener('submit', function (e) {
            var script_name = document.querySelector('input[name="wpautoterms_vendor_script_name"]');
            var script_type = document.querySelector('input[name="wpautoterms_vendor_script_type"]:checked');
            var script_code = document.querySelector('textarea[name="wpautoterms_vendor_script_code"]');
            // NOTE: a checked Type alone is not a started script, a radio button can't be unchecked by the user
            var pending = (script_name && script_name.value.trim()) || (script_code && script_code.value.trim());
            if (pending && !addVendorScript({script_name, script_type, script_code})) {
                e.preventDefault();
            }
        });
    }
    // Enter in the "Add vendor script" fields would submit the whole form and lose the script that is not added yet
    Array.from(document.querySelectorAll('input[name="wpautoterms_vendor_script_name"],input[name="wpautoterms_vendor_script_type"]'))
        .forEach(function (input) {
            input.addEventListener('keydown', function (e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    addVendorScriptButton.click();
                }
            });
        });
    var addShakeEffect = function (vendorScriptId) {
        var theRow = document.querySelector('tr[data-vendor-id="' + vendorScriptId + '"]')
        theRow.classList.add('shake-now');
        setTimeout(function () {
            theRow.classList.remove('shake-now');
        }, 1000);
    }
    var moveButtons = function (vendorScript, direction = 'up') {
        var scripts = vendorScripts;

        var theButton = document.createElement('button');
        theButton.type = 'button';
        theButton.className = 'button button-primary button-small mr-1';
        var index = scripts.findIndex((item) => item.id === vendorScript.id);
        switch (direction) {
            default:
            case 'up':
                theButton.innerHTML = 'Move Up';
                theButton.addEventListener('click', function () {

                    if (index > 0) {
                        var temp = scripts[index - 1];
                        scripts[index - 1] = scripts[index];
                        scripts[index] = temp;
                        renderVendorScripts(scripts);
                        saveObjectToInput(scripts, vendorScriptsInput);
                        addShakeEffect(vendorScript.id);
                    }
                });

                if (index > 0) {
                    return theButton;
                }
                break;
            case 'down':
                theButton.innerHTML = 'Move Down';
                theButton.addEventListener('click', function () {
                    if (index < scripts.length - 1) {
                        var temp = scripts[index + 1];
                        scripts[index + 1] = scripts[index];
                        scripts[index] = temp;
                        renderVendorScripts(scripts);
                        saveObjectToInput(scripts, vendorScriptsInput);
                        addShakeEffect(vendorScript.id);
                    }
                })
                if (index < scripts.length - 1) {
                    return theButton;
                }
                break;
        }
        return document.createElement('div');
    }

    var typeCell = function (vendorScript) {
        var td = document.createElement('td');
        if (scriptTypes.hasOwnProperty(vendorScript.script_type)) {
            td.textContent = vendorScript.script_type;
            return td;
        }
        // Saved without a Type by an earlier version: the script never loads until a Type is chosen
        var warning = document.createElement('p');
        warning.className = 'description';
        warning.style.color = '#d63638';
        warning.textContent = 'No Type: this script never loads. Choose a Type, then click Save Changes.';
        var select = document.createElement('select');
        var option = document.createElement('option');
        option.value = '';
        option.textContent = '- Select Type -';
        select.appendChild(option);
        Object.keys(scriptTypes).forEach(function (type) {
            option = document.createElement('option');
            option.value = type;
            option.textContent = scriptTypes[type];
            select.appendChild(option);
        });
        select.addEventListener('change', function () {
            if (!select.value) {
                return;
            }
            vendorScript.script_type = select.value;
            saveObjectToInput(vendorScripts, vendorScriptsInput);
            renderVendorScripts();
        });
        td.appendChild(warning);
        td.appendChild(select);
        return td;
    };

    var renderVendorScripts = function (vendorScriptsPassed) {
        var scripts = vendorScripts;
        if (vendorScriptsPassed) {
            scripts = vendorScriptsPassed;
        }

        var table = document.querySelector('#vendor-scripts table');
        var tableBody = document.querySelector('#vendor-scripts table tbody');

        tableBody.textContent = '';
        scripts.forEach((vendorScript) => {
            var tr = document.createElement('tr');
            tr.setAttribute('data-vendor-id', vendorScript.id)
            var td = document.createElement('td');
            td.textContent = vendorScript.script_name;
            tr.appendChild(td);
            tr.appendChild(typeCell(vendorScript));
            td = document.createElement('td');
            if (isMarkupWithoutScript(vendorScript.script_code)) {
                var markupWarning = document.createElement('p');
                markupWarning.className = 'description';
                markupWarning.style.color = '#d63638';
                markupWarning.textContent = 'No <script> tag: this code is not added to your website. Delete it and add the <script> code of the vendor.';
                td.appendChild(markupWarning);
            } else if (isDropped(vendorScript.script_code)) {
                var droppedWarning = document.createElement('p');
                droppedWarning.className = 'description';
                droppedWarning.style.color = '#d63638';
                droppedWarning.textContent = 'Incomplete <script> tag (e.g. no closing </script>): this code is not added to your website, or only in part. Delete it and add the complete code of the vendor.';
                td.appendChild(droppedWarning);
            }
            var code = document.createElement('textarea');
            code.disabled = true;
            code.cols = 30;
            code.rows = 10;
            code.value = vendorScript.script_code;
            td.appendChild(code);
            tr.appendChild(td);
            td = document.createElement('td');
            td.appendChild(moveButtons(vendorScript, 'down'));
            td.appendChild(moveButtons(vendorScript, 'up'));
            tr.appendChild(td);
            var deleteButton = document.createElement('button');
            deleteButton.type = 'button';
            deleteButton.className = 'button button-cancel button-small';
            deleteButton.textContent = 'Delete';
            deleteButton.onclick = function () {
                var pleaseConfirm = confirm('Are you sure you want to delete this Vendor Script?');
                if (pleaseConfirm) {
                    return deleteVendorScript(vendorScript.id);
                }
            }
            td = document.createElement('td');
            td.appendChild(deleteButton);
            tr.appendChild(td);
            tableBody.appendChild(tr);
        });

        table.classList.toggle('hidden', scripts.length === 0);

    }


    initVendorScripts().then(function (vendorScripts) {
        renderVendorScripts(vendorScripts);

    });

});