const totalHeight = innerHeight;
const navHeight = document.getElementsByClassName('navv')[0].clientHeight;
const mainHeight = totalHeight - navHeight;
document.getElementsByClassName('main-section')[0].style.height = `${mainHeight}px`;

var storedCustomParagraphs = [];
var shownParagraphs = [];

window.onload = async function (event) {
    localStorage.setItem(`previousPage`, '/user/custom');

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

    if (localStorage.minLength)
        document.querySelector(`input[name='minLength']`).value = localStorage.minLength;
    if (localStorage.maxLength)
        document.querySelector(`input[name='maxLength']`).value = localStorage.maxLength;
    if (localStorage.minCount)
        document.querySelector(`input[name='minCount']`).value = localStorage.minCount;
    if (localStorage.maxCount)
        document.querySelector(`input[name='maxCount']`).value = localStorage.maxCount;
    if (localStorage.count)
        document.querySelector(`input[name='count']`).value = localStorage.count;


    await fetchCustomParagraphs();
    await renderHistory(0);
}

document.getElementById('genPara').addEventListener('click', function (event) {
    event.preventDefault();
    const minLength = document.querySelector(`input[name='minLength']`);
    const maxLength = document.querySelector(`input[name='maxLength']`);
    const minCount = document.querySelector(`input[name='minCount']`);
    const maxCount = document.querySelector(`input[name='maxCount']`);
    if (Number.parseInt(minLength.value) > Number.parseInt(maxLength.value) || Number.parseInt(minCount.value) > Number.parseInt(maxCount.value)) {
        // Don't submit the form
        return;
    }
    else {
        if (1 <= minLength.value && minLength.value <= 15)
            localStorage.minLength = minLength.value;
        if (1 <= maxLength.value && maxLength.value <= 15)
            localStorage.maxLength = maxLength.value;
        if (10 <= minCount.value && minCount.value <= 500)
            localStorage.minCount = minCount.value;
        if (10 <= maxCount.value && maxCount.value <= 500)
            localStorage.maxCount = maxCount.value;
        // Submit the form
        document.querySelector(`.custAndRand form`).submit();
    }
});
document.getElementById('genFacts').addEventListener('click', function (event) {
    event.preventDefault();
    const count = document.querySelector(`input[name='count']`);
    if (1 <= count.value && count.value <= 15) {
        localStorage.count = count.value;
        //Submit the form
        document.querySelector(`.facts form`).submit();
    }
});

// For History

async function fetchCustomParagraphs() {
    await $.ajax({
        type: 'get',
        url: '/user/custom/getAllRandomParagraphs',
        data: {},
        success: result => {
            if (result) {
                storedCustomParagraphs = result.data.random;
                return;
            }
            else
                return;
        },
        error: (xhr, status, err) => {
            console.log('Error while fetching All Custom Paragraphs');
            return;
        }
    });
}

async function renderHistory(page) {
    shownParagraphs = [];
    if (storedCustomParagraphs.length > 0) {
        document.getElementsByClassName('history')[0].style.display = 'flex';
        // Every page contains maximum 20 lists
        const table = document.querySelector(`.history table`);

        for (let i = page; i < page + 20 && i < storedCustomParagraphs.length; i++) {
            let obj = storedCustomParagraphs[i];
            shownParagraphs.push(obj._id);
            // console.log(obj);

            let para = firstKWords(obj.paragraph, 9);
            if (para != obj.paragraph)
                para += ' ...';

            const trow = document.createElement('tr');
            trow.innerHTML = `<td><a class="serials">${i + 1}<img src="/images/custom/circle-play-solid.png" /></a></td>
                        <td>${para}</td >
                        <td>${obj.score}</td>
                        <td>${obj.stars}</td>
                        <td>${obj.netSpeed}wpm</td>
                        <td>${Number.parseInt(obj.accuracy).toFixed(0)}%</td>
                        <td>${formatTime(obj.time)}</td>`;
            table.appendChild(trow);
        }

        // Add onclick event listeners to Sr.No. to render history paragraphs
        await addLinks();
    }
}

function formatTime(date) {
    date = new Date(date);
    let dat = date.getDate();
    let mon = date.getMonth() + 1;
    let year = date.getYear() + 1900;
    let hour = date.getHours();
    let min = date.getMinutes();
    let ampm = 'am';
    if (hour == 0)
        hour = 12;
    if (hour > 12) {
        hour %= 12;
        ampm = 'pm';
    }
    if (min < 10) {
        min = '0' + min;
    }
    return '' + dat + '/' + mon + '/' + year + '<br>' + hour + ':' + min + ampm;
}

function firstKWords(st, k) {
    k = Number.parseInt(k);
    let ans = '';
    let words = st.split(" ");
    for (let i = 0; i < k && i < words.length; i++) {
        ans += words[i] + ' ';
    }
    ans = ans.trim();
    return ans;
}

async function addLinks() {
    for (let i = 0; i < 20 && i < shownParagraphs.length; i++) {
        document.getElementsByClassName('serials')[i].setAttribute('href', `/user/type/renderHistoryPara?id=${shownParagraphs[i]}`);
    }
}