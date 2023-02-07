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
            let size = $(`input[name="avatar"]`)[0].files.item(0).size / 1024 / 1024;  //In megabytes
            if (size > 10) {
                $.ajax({
                    type: 'post',
                    url: '/user/profile/fileTooBig',
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
                avatarForm.submit();
        }
    }
}