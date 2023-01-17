window.onload = function (event) {
    //Adjust the visible height
    const totalHeight = innerHeight;
    const navHeight = document.getElementsByClassName('navv')[0].clientHeight;
    const mainHeight = totalHeight - navHeight;
    if (document.getElementsByClassName('main-section')[0].style.height < mainHeight)
        document.getElementsByClassName('main-section')[0].style.height = `${mainHeight}px`;

    //Set the links to boxes
    localStorage.setItem(`previousPage`, '/user/myParas');
    for (let i = 0; i < boxes.length; i++)
        completeMyParas(i);

    document.getElementsByClassName('add')[0].addEventListener('click', popupOpen);
    document.querySelector(`img[alt="Close"]`).addEventListener('click', popupClose);
}

var boxes = document.getElementsByClassName('box');
// console.log(boxes);

async function completeMyParas(index) {
    let box = boxes[index];
    // Adding click and hover events
    box.addEventListener('mouseover', function (event) {
        box.classList.add('boxHover');
    });
    box.addEventListener('mouseout', function (event) {
        box.classList.remove('boxHover');
    });
    box.addEventListener('click', function (event) {
        // box.classList.remove('boxHover');
        box.classList.add('boxClicked');
    });
}


$(`img[alt="delete"]`).mouseover(function (event) {
    event.target.src = '/images/myParas/delete-hover.svg';
});
$(`img[alt="delete"]`).mouseout(function (event) {
    event.target.src = '/images/myParas/delete.svg';
});

var blurStyle = document.createElement('style');
blurStyle.innerText = ` body> *:not(.addPara){ filter: blur(4px); } `;

async function popupOpen(event) {
    document.getElementsByClassName('addPara')[0].classList.add('makeVisible');
    // document.head.append(`<style> body> *:not(.popup){ filter: blur(5px); } </style>`);
    document.head.appendChild(blurStyle);
    document.querySelector(`textarea[name="submitted-text"]`).focus();
}

async function popupClose(event) {
    document.getElementsByClassName('addPara')[0].classList.remove('makeVisible');
    document.head.removeChild(blurStyle);
}

async function deletePara(event) {
    document.location.reload();
}