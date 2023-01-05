const totalHeight = innerHeight;
const navHeight = document.getElementsByClassName('navv')[0].clientHeight;
const mainHeight = totalHeight - navHeight;
document.getElementsByClassName('main-section')[0].style.height = `${mainHeight}px`;