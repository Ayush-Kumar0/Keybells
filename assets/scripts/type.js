var i = -1; // Indicates till which letter(index) typing has been done
const envelope = document.getElementsByClassName('envelope')[0];
const keyboard = document.getElementsByClassName('keyboard')[0];

const left = [`Q`, `W`, `E`, `R`, `T`, `A`, `S`, `D`, `F`, `G`, `Z`, `X`, `C`, `V`, `B`];
const right = [`Y`, `U`, `I`, `O`, `P`, `H`, `J`, `K`, `L`, `N`, `M`];


highlightNext(i + 1);
highlightNextKey(i + 1);

window.onload = function () {
    $.ajax({
        type: 'post',
        url: '/user/typeRefresh',
        success: (result, status, xhr) => {
            console.log('Window refreshed and reset');
        },
        error: (xhr, status, error) => {
            console.log('Error while sending AJAX request on refresh:', error);
        }
    });
}

let key = "";
window.addEventListener('keydown', (event) => {
    event.preventDefault();
    if (event.key == 'Shift' || event.key == 'Control' || event.key == 'Alt')
        key = event.key;
    else {
        if (key == "")
            key = event.key;
        else {
            if (event.shiftKey || event.ctrlKey || event.altKey)
                key += " " + event.key;
            else
                key = event.key;
        }

        // Sending AJAX request to the server
        $.ajax({
            type: 'post',
            url: '/user/typeChanges',
            data: {
                'keyPressed': key,
                'indexPressed': (i + 1)
            },
            success: (result, status, xhr) => {
                console.log(result);
                i = Number(result.data.indexDone);
                highlightDone(i, result.data.correct);
                highlightNext(i + 1);
                dehighlightDoneKey(i);
                highlightNextKey(i + 1);
                key = key.split(' ', 1)[0];
            },
            error: (xhr, status, error) => {
                console.log(`Some error while sending AJAX request : `, error);
                key = key.split(' ', 1)[0];
            }
        });
    }

});



//Highlighting the letter which is done typing
function highlightDone(n, correct) {
    let nthLetter = envelope.children.item(n);
    if (!nthLetter)
        return;

    // console.log("highlightDone: ", nthLetter);
    if (correct === true)
        nthLetter.classList.toggle('done'); //Make it done
    else
        nthLetter.classList.toggle('wrongDone'); //Incorrect key pressed

    if (nthLetter.classList.contains('next'))
        nthLetter.classList.toggle('next'); //Remove "next class"
}


//Highlighting the next letter which needs to be typed
function highlightNext(n) {
    let nthLetter = envelope.children.item(n);
    if (!nthLetter)
        return;

    // console.log("highlightNext: ", nthLetter);
    nthLetter.classList.toggle('next'); //Make it next
}



//Removing the highlight form the key which is already typed
function dehighlightDoneKey(n) {
    let nthLetter = envelope.children.item(n);
    if (!nthLetter)
        return;

    if (nthLetter.children.item(0).classList.contains(`space`)) {
        //Space encountered
        if ($(`#space`).hasClass('nextKey')) {
            $("#space").toggleClass('nextKey');
        }
    } else {
        // Letter encountered
        let keys = getKeysIds(nthLetter);
        if (keys[1] && $(`#${keys[1]}`).hasClass('nextKey')) {
            $(`#${keys[1]}`).toggleClass('nextKey');
        }
    }

    if ($(`#l-shift`).hasClass('nextKey'))
        $(`#l-shift`).toggleClass('nextKey');
    if ($(`#r-shift`).hasClass('nextKey'))
        $(`#r-shift`).toggleClass('nextKey');
    if ($(`#l-control`).hasClass('nextKey'))
        $(`#l-control`).toggleClass('nextKey');
    if ($(`#r-control`).hasClass('nextKey'))
        $(`#r-control`).toggleClass('nextKey');
}



//Highlighting the key which needs to be typed next
function highlightNextKey(n) {
    let nthLetter = envelope.children.item(n);
    if (!nthLetter)
        return;

    if (nthLetter.children.item(0).classList.contains(`space`)) {
        //Space encountered
        $("#space").toggleClass('nextKey');
    } else {
        // Letter encountered
        let keys = getKeysIds(nthLetter);
        if (keys[1])
            $(`#${keys[1]}`).toggleClass('nextKey');

        // For 'shift' and 'control'
        if (keys[0])
            $(`#${keys[0]}`).toggleClass('nextKey');
    }
}




function getKeysIds(nthLetter) {
    let key = nthLetter.textContent.trim();
    let keyCode = key.charCodeAt(0);

    if (key == 'tab')
        return [null, 'tab'];
    else if (key == 'caps-lock')
        return [null, 'caps-lock'];
    else if (key == 'backspace')
        return [null, 'backspace'];
    else if (key == `enter`)
        return [null, `enter`];
    // Capital Letters
    else if (keyCode >= 65 && keyCode <= 90) {
        if (left.find(ele => { return ele == key }) != undefined)
            return ['r-shift', key.toLowerCase()];
        else
            return ['l-shift', key.toLowerCase()];
    }
    // Small Letters
    else if (keyCode >= 97 && keyCode <= 122) {
        return [null, key];
    }
    // Numbers
    else if (keyCode >= 48 && keyCode <= 57) {
        return [null, key];
    }
    // Something else
    else {
        if (key == '`')
            return [null, 'tilde'];
        else if (key == `~`)
            return ['r-shift', 'tilde'];
        else if (key == `!`)
            return ['r-shift', '1'];
        else if (key == `@`)
            return ['r-shift', '2'];
        else if (key == `#`)
            return ['r-shift', '3'];
        else if (key == `$`)
            return ['r-shift', '4'];
        else if (key == '%')
            return ['r-shift', '5'];
        else if (key == `^`)
            return ['l-shift', '6'];
        else if (key == '&')
            return ['l-shift', '7'];
        else if (key == '*')
            return ['l-shift', '8'];
        else if (key == '(')
            return ['l-shift', '9'];
        else if (key == ')')
            return ['l-shift', '0'];
        else if (key == '-')
            return [null, 'hyphen'];
        else if (key == '_')
            return ['l-shift', 'hyphen'];
        else if (key == '=')
            return [null, 'equal'];
        else if (key == '+')
            return ['l-shift', 'equal'];
        else if (key == '[')
            return [null, 'l-bigbracket'];
        else if (key == '{')
            return ['l-shift', 'l-bigbracket'];
        else if (key == ']')
            return [null, 'r-bigbracket'];
        else if (key == '}')
            return ['l-shift', 'r-bigbracket'];
        else if (key == '\\')
            return [null, 'backslash'];
        else if (key == '|')
            return ['l-shift', 'backslash'];
        else if (key == ';')
            return [null, 'semi-colon'];
        else if (key == ':')
            return ['l-shift', 'semi-colon'];
        else if (key == `'`)
            return [null, `quote`];
        else if (key == `"`)
            return ['l-shift', `quote`];
        else if (key == `,`)
            return [null, `comma`];
        else if (key == `<`)
            return ['l-shift', `comma`];
        else if (key == `.`)
            return [null, `dot`];
        else if (key == `>`)
            return ['l-shift', `dot`];
        else if (key == `/`)
            return [null, `slash`];
        else if (key == `?`)
            return ['l-shift', `slash`];
        else
            return [null, null];
    }
}