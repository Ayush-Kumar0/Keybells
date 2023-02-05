const signout = document.querySelector(`a[href="/user/sign-out"]`);
if (signout) {
    signout.addEventListener('click', function (event) {
        localStorage.clear();
    });
}