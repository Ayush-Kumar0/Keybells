const asidee = document.getElementsByClassName('asidee');
const hideAsidee = document.getElementById('hideAsidee');
hideAsidee.addEventListener('mouseover', () => {
    Array.from(asidee).forEach(element => {
        element.style.visibility = 'visible';
        (hideAsidee.children.item(0)).setAttribute('src', '/images/eye-solid.svg');
    });
});
hideAsidee.addEventListener('mouseout', () => {
    Array.from(asidee).forEach(element => {
        element.style.visibility = 'hidden';
        hideAsidee.children.item(0).setAttribute('src', '/images/eye-slash-solid.svg');
    });
});


window.onscroll = function (event) {
    const navv = document.getElementsByClassName('navv')[0];
    let height = navv.getClientRects()[0].height;
    let y = navv.getClientRects()[0].y;
    if (y < -navv.clientHeight) {
        hideAsidee.style.top = '0px';
        asidee[0].style.top = '0px';
        return;
    }
    // console.log(y);
    hideAsidee.style.top = Number.parseInt(y) + height + 'px';
    asidee[0].style.top = Number.parseInt(y) + height + 'px';
}