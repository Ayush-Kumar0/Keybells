let heading = document.getElementById('heading-welcome');

let upperFlash = document.getElementById('upper-div-welcome');
let upperPara = document.getElementById('upperPara');
let upperFlashPara = 'Keeping in mind the recent upgrade , it is best that you be like a wizard in your typing speed .';

let lowerFlash = document.getElementById('lower-div-welcome');
let lowerPara = document.getElementById('lowerPara');
let lowerFlashPara = 'To begin the journey , login to your existing account , signup or continue to enter a giant name to proceed further .';

let login = document.getElementById('buttons-welcome');


lowerFlash.style.display = 'none';
login.style.display = 'none';
upperPara.innerHTML = '';
lowerPara.innerHTML = '';


const loadingSpeed = 30;

let fullyLoaded = false;
let skip = false;
let next = false;
window.addEventListener('click', (event) => {
    // event.preventDefault();
    if(fullyLoaded==false)
        skip = true;
    if (fullyLoaded==true)
        next = true;
});

var loadUpper = function (event) {
    let i = 0;
    let interval = setInterval(() => {
        if (i < upperFlashPara.length) {
            if (skip == true) {
                upperPara.innerHTML = upperFlashPara;
                i = upperFlashPara.length;
                fullyLoaded = true;
                skip = false;
            }
            else {
                upperPara.innerHTML = upperPara.innerHTML + upperFlashPara[i];
                i++;
            }            
        }
        else {
            fullyLoaded = true;
                skip = false;
            if(next==true)
                loadLower(interval);
        }
    }, loadingSpeed);
}

var loadLower = function (prevInterval) {
    clearInterval(prevInterval);
    fullyLoaded = false;
    next = false;

    upperFlash.style.display = 'none';
    lowerFlash.style.display = null;

    let j = 0;
    let interval = setInterval(() => {
        if (j < lowerFlashPara.length) {
            if (skip == true) {
                lowerPara.innerHTML = lowerFlashPara;
                j= lowerFlashPara.length;
                fullyLoaded = true;
                skip = false;
            }
            else {
                lowerPara.innerHTML = lowerPara.innerHTML + lowerFlashPara[j];
                j++;
            }  
        }
        else {
            fullyLoaded = true;
                skip = false;
            if (next == true)
                loadLogin(interval);
        }
    }, loadingSpeed);
}

var loadLogin = function (prevInterval) {
    if(prevInterval!=null)
        clearInterval(prevInterval);
    fullyLoaded = false;
    next = false;

    lowerFlash.style.display = 'none';
    login.style.display = null;
}

window.onload = event => {
    lowerFlash.style.display = 'none';
    login.style.display = 'none';
    upperPara.innerHTML = '';
    lowerPara.innerHTML = '';
    
    if (document.referrer.match('https://localhost:8000/user') || document.referrer.match('http://localhost:8000/user')){
        upperFlash.style.display = 'none';
        lowerFlash.style.display = 'none';
        login.style.display = null;
    }
    else
        loadUpper();
}