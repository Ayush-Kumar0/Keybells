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
}

var boxes = document.getElementsByClassName('box');
// console.log(boxes);

let totalStars = 0, progress = 0;

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