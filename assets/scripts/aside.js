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
