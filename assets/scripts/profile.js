window.onload = function (event) {
    let avatarAnchor = document.getElementById('avatarAnchor');
    let avatarForm = document.getElementById('avatarForm');
    let chooseFile = document.getElementById('chooseFile');
    if (avatarForm) {
        avatarAnchor.onclick = (event) => {
            event.preventDefault();
            chooseFile.click();
        }
        chooseFile.onchange = (event) => {
            avatarForm.submit();
        }
    }
}