const signout = document.querySelector(`a[href="/user/sign-out"]`);
signout.addEventListener('click', function (event) {
    localStorage.clear();
});