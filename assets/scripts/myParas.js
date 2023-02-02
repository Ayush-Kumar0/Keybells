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
    const mouseOverEvent = function (event) {
        box.classList.add('boxHover');
    }
    box.addEventListener('mouseover', mouseOverEvent);
    box.addEventListener('mouseout', function (event) {
        box.classList.remove('boxHover');
    });

    $(`img[alt="delete"]`).mouseover(function (event) {
        event.target.src = '/images/myParas/delete-hover.svg';
        box.removeEventListener('mouseover', mouseOverEvent);
        box.classList.remove('boxHover');
    });
    $(`img[alt="delete"]`).mouseout(function (event) {
        event.target.src = '/images/myParas/delete.svg';
        box.addEventListener('mouseover', mouseOverEvent);
    });
}


var blurStyle = document.createElement('style');
blurStyle.innerText = ` body> *:not(.addPara){ filter: blur(0px) brightness(40%) opacity(100%); } `;

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


async function deletePara(event, id) {
    //Ajax request to delete the paragraph
    $.ajax({
        type: 'post',
        url: `/user/myParas/deleteMyPara`,
        data: {
            id: id
        },
        success: (result, status, xhr) => {
            //Reload the page after it has been deleted successfully
            window.location.reload();
        },
        error: (xhr, status, err) => { }
    });
}

$(`input[value="Submit File"]`).click(function (event) {
    event.preventDefault();
    let size = $(`input[name="submitted-file"]`)[0].files.item(0).size / 1024 / 1024;  //In megabytes
    if (size > 50) {
        $.ajax({
            type: 'post',
            url: '/user/myParas/fileTooBig',
            data: {},
            success: (result, status, xhr) => {
                document.location.reload();
            },
            error: (xhr, status, err) => {
                document.location.reload();
            }
        });
    }
    else
        $(`.fileDiv>form`).submit();
});