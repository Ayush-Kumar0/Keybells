window.onload = function (event) {
    localStorage.setItem(`previousPage`, '/user/custom');
}

// const totalHeight = innerHeight;
// const navHeight = document.getElementsByClassName('navv')[0].clientHeight;
// const mainHeight = totalHeight - navHeight;
// document.getElementsByClassName('main-section')[0].style.height = `${mainHeight}px`;

window.onload = async function (event) {
    await $.ajax({
        type: 'get',
        url: '/user/custom/getRandomInfo',
        data: {},
        success: await function (result) {
            // console.log(result);
            if (result.data) {
                document.getElementById('score').innerText = `Custom Score: ${result.data.netRandomScore}`;
                document.getElementById('stars').innerText = `Custom Stars: ${result.data.randomStars}`;
                document.getElementById('avgwpm').innerText = `Average Speed: ${result.data.avgRandomWPM}`;
                document.getElementById('tried').innerText = `Tried Count: ${result.data.tried}`;
            }
        },
        error: (xhr, status, err) => {
            document.getElementById('hideAsidee').style.visibility = 'hidden';
        }
    });
}