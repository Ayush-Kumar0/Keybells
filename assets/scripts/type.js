import { scroller } from "./scrollTextContent.js";

var i = -1; // Indicates till which letter(index) typing has been done
let key = "";

const envelope = document.getElementsByClassName('envelope')[0];
const keyboard = document.getElementsByClassName('keyboard')[0];

const left = [`Q`, `W`, `E`, `R`, `T`, `A`, `S`, `D`, `F`, `G`, `Z`, `X`, `C`, `V`, `B`];
const right = [`Y`, `U`, `I`, `O`, `P`, `H`, `J`, `K`, `L`, `N`, `M`];


let envelopeLetters = []; //Stores all the div of letters in type.ejs

window.onload = async event => {
    // To refresh the page as new
    await $.ajax({
        url: '/user/type/refresh',
        success: function () {
            i = -1;

            for (let i = 0; i < envelope.childElementCount; i++) {
                for (let j = 0; j < envelope.children.item(i).childElementCount; j++) {
                    envelopeLetters.push(envelope.children.item(i).children.item(j));
                    // console.log(envelope.children.item(i).children.item(j));
                }
            }

            highlightNext(i + 1);
            highlightNextKey(i + 1);
        },
        error: function (xhr, status, error) {
            console.log("Error:", error);
        }
    });
};



//TODO: Use queue for checking valid typing , queue contails the keydown events
async function keydownHandler(event) {
    if (i >= envelopeLetters.length - 1)
        return;

    // event.preventDefault();
    if (event.key == 'CapsLock')
        return;
    else if (event.key == 'Backspace') {
        await $.ajax({
            type: 'post',
            url: '/user/type/backspace',
            data: {
                // Sending the index which needs to be removed
                indexDone: i,
                prevCorrect: async function () {
                    if (envelopeLetters.at(i).classList.contains('wrongDone'))
                        return false;
                    else if (envelopeLetters.at(i).classList.contains('done'))
                        return true;
                    else
                        return true;
                }
            },
            success: (result, status, xhr) => {
                i = Number.parseInt(result.data.index); //i represents till which index typing has been done
                console.log(result);
                if (i >= -1) {
                    //Highlighting keyboard keys
                    //Changes to be made in 'i+1' and 'i+2'
                    dehighlightDoneKey(i + 2);
                    highlightNextKey(i + 1);

                    //Highlighting paragraph letters
                    dehighlightNext(i + 2);
                    dehighlightDone(i + 1);
                    highlightNext(i + 1);
                }
                else
                    i = -1;
            },
            error: (xhr, status, error) => {
                console.log(`Some error while sending AJAX request of backspace : `, error);
            }
        });
    }
    else {
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
                url: '/user/type/changes',
                data: {
                    'keyPressed': key,
                    'indexPressed': (i + 1)
                },
                success: (result, status, xhr) => {
                    // console.log(result);
                    i = Number(result.data.indexDone);
                    highlightDone(i, result.data.correct);
                    highlightNext(i + 1);
                    dehighlightDoneKey(i);
                    highlightNextKey(i + 1);
                    key = key.split(' ', 1)[0];
                    if (i == envelopeLetters.length - 1)
                        popupAction();
                },
                error: (xhr, status, error) => {
                    console.log(`Some error while sending AJAX request : `, error);
                    key = key.split(' ', 1)[0];
                }
            });
        }
    }
}

function popupAction() {
    let popup = document.getElementsByClassName('fade-in-down')[0];

    $.ajax({
        type: 'POST',
        url: '/user/type/getUserLessonInfo',
        data: '',
        success: (result, status, xhr) => {
            console.log(result.data);
            popup.children.item(0).innerHTML = 'Gross Speed : ' + result.data.grossSpeed;
            popup.children.item(1).innerHTML = 'Net Speed : ' + result.data.netSpeed;
            popup.children.item(2).innerHTML = 'Accuracy : ' + result.data.accuracy.toFixed();
            popup.children.item(3).innerHTML = 'Stars : ' + result.data.stars;

            popup.classList.add('animate');
            let blurStyle = document.createElement('style');
            blurStyle.innerText = ` body> *:not(.popup, #nav){ filter: blur(5px); } `;
            // document.head.append(`<style> body> *:not(.popup){ filter: blur(5px); } </style>`);
            document.head.appendChild(blurStyle);
        },
        error: (xhr, status, err) => {
            console.log(`Some error while sending AJAX request to get UserLessonInfo : `, err);
        }
    });
}

let pause = false; // Checks if typing action is paused
window.addEventListener('keydown', async (event) => {
    if (pause == false) {
        await keydownHandler(event);
    }

    // To initialize variables for text scrolling purpose
    scroller();
});



//Highlighting the letter which is done typing
function highlightDone(n, correct) {
    let nthLetter = envelopeLetters.at(n);
    if (!nthLetter)
        return;

    // console.log("highlightDone: ", nthLetter);
    if (correct === true) {
        nthLetter.classList.toggle('done'); //Make it done
        let audio = new Audio(`/music/key2.ogg`);
        audio.loop = false;
        audio.play();
    }
    else {
        nthLetter.classList.toggle('wrongDone'); //Incorrect key pressed
        let audio = new Audio(`/music/key1.ogg`);
        audio.loop = false;
        audio.play();
    }

    if (nthLetter.classList.contains('next'))
        nthLetter.classList.toggle('next'); //Remove "next class"
}

//Dehighlighting the done key
function dehighlightDone(n) {
    let nthLetter = envelopeLetters.at(n);
    if (!nthLetter)
        return;

    if (nthLetter.classList.contains('done'))
        nthLetter.classList.toggle('done');
    if (nthLetter.classList.contains('wrongDone'))
        nthLetter.classList.toggle('wrongDone');
}


//Highlighting the next letter which needs to be typed
function highlightNext(n) {
    let nthLetter = envelopeLetters.at(n);
    if (!nthLetter)
        return;

    // console.log("highlightNext: ", nthLetter);
    nthLetter.classList.toggle('next'); //Make it next
}

//Dehighlighting the next key
function dehighlightNext(n) {
    let nthLetter = envelopeLetters.at(n);
    if (!nthLetter)
        return;

    // console.log("highlightNext: ", nthLetter);
    if (nthLetter.classList.contains('next'))
        nthLetter.classList.toggle('next'); //Make it next
}



//Removing the highlight form the key which is already typed
function dehighlightDoneKey(n) {
    let nthLetter = envelopeLetters.at(n);
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
    let nthLetter = envelopeLetters.at(n);
    if (!nthLetter)
        return;

    if (nthLetter.children.item(0).classList.contains(`space`) && !$("#space").hasClass('nextKey')) {
        //Space encountered
        $("#space").toggleClass('nextKey');
    } else {
        // Letter encountered
        let keys = getKeysIds(nthLetter);
        if (keys[1] && !$(`#${keys[1]}`).hasClass('nextKey'))
            $(`#${keys[1]}`).toggleClass('nextKey');

        // For 'shift' and 'control'
        if (keys[0] && !$(`#${keys[0]}`).hasClass('nextKey'))
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



// Toggling the value of pause to enable or disable typing
let pauseBtn = document.querySelector(`img[alt='pause']`);
pauseBtn.addEventListener('click', async function (event) {
    event.preventDefault();
    if (pause == false)
        pauseBtn.setAttribute('src', '/images/type/play.svg');
    else
        pauseBtn.setAttribute('src', '/images/type/pause.svg');

    await $.ajax({
        type: 'post',
        url: '/user/type/pause',
        data: { 'pause': pause },
        success: (result, status, xhr) => {
            pause = result.data.pause;
        },
        error: (xhr, status, error) => {
            console.log('Error while pausing.');
        }
    });
});


let resetBtn = document.querySelector(`img[alt='reset']`);
resetBtn.addEventListener('click', async function (event) {
    event.preventDefault();
    window.location.reload();
});


let backBtn = document.querySelector(`img[alt='back']`);
backBtn.addEventListener('click', function (event) {
    event.preventDefault();
    const prev = localStorage.getItem('previousPage');
    if (prev)
        window.location.assign(prev);
    else
        window.location.assign('/user');
});