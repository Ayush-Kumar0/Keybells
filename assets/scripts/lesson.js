window.onload = function (event) {
    localStorage.setItem(`previousPage`, '/user/lesson');
}

let boxes = document.getElementsByClassName('box');
// console.log(boxes);
let totalStars = 0, progress = 0;
var lessonIds = [];
var unlockedLessons = 0;

async function complete() {
    await $.ajax({
        type: 'get',
        url: '/user/lesson/getLessonIds',
        data: {},
        success: async (result, status, xhr) => {
            // console.log(result.data);
            if (result && result.data) {
                lessonIds = result.data.lessonIds;
                unlockedLessons = Number.parseInt(result.data.unlockedLessons);
            }
        },
        error: (xhr, status, err) => {
            console.log('Error while sending ajax request to get Lesson Ids');
        }
    });
    for (let i = 0; i < lessonIds.length; i++)
        await completeHome(i, `/user/type?which=lesson&id=${lessonIds[i]}`, lessonIds[i]);
    for (let i = lessonIds.length; i < boxes.length; i++)
        await completeHome(i, "#");
}

complete();

async function completeHome(index, url, id) {
    console.log(index, url);
    let box = boxes[index];

    // Adding links to each level
    // let level = box.children.item(index).innerHTML.trim();
    let level = index + 1;
    // box.children.item(0).setAttribute(`href`, `/user/type?which=lesson&level=${level}`);
    box.children.item(0).setAttribute(`href`, url);


    // Adding click and hover events
    if (index < unlockedLessons) {
        box.classList.remove(`locked`);
        let aTag = box.children.item(0);
        aTag.children.item(1).remove();
        let starsEl = document.createElement(`div`);
        starsEl.classList.add(`stars-container`);
        starsEl.innerHTML = `<div class="one"><i class="stars fas fa-star fa-3x"></i></div>
                            <div class="two"><i class="stars fas fa-star fa-3x"></i></div>
                            <div class="three"><i class="stars fas fa-star fa-3x"></i></div>
                            <div class="four"><i class="stars fas fa-star fa-3x"></i></div>
                            <div class="five"><i class="stars fas fa-star fa-3x"></i></div>`;
        aTag.appendChild(starsEl);

        // box.style.filter = `brightness(100%)`;
        box.classList.add(`boxFilter`);

        box.addEventListener('mouseover', function (event) {
            box.classList.add('boxHover');
        });
        box.addEventListener('mouseout', function (event) {
            box.classList.remove('boxHover');
        });
        box.addEventListener('click', function (event) {
            // box.classList.remove('boxHover');
            box.classList.add('boxClicked');
        });

        if (index < unlockedLessons - 1) {
            let countStars = 0;
            await $.ajax({
                type: 'get',
                url: '/user/lesson/countLessonStars',
                data: {
                    level: Number.parseInt(level),
                    id: id
                },
                success: async (result, status, xhr) => {
                    // console.log(result.data);
                    countStars = result.data.stars;
                    glowStars(box, countStars);

                    totalStars += Number.parseInt(countStars);
                    if (index == unlockedLessons - 2) {
                        displayStar();
                        displayProgress();
                        await displayScoreAndWPM();
                    }
                },
                error: (xhr, status, err) => {
                    console.log('Error while sending ajax request to count stars');
                }
            });
        }
    }
}


function glowStars(box, stars) {
    let starsContainer = box.children.item(0).children.item(1);

    for (let i = 0; i < stars; i++) {
        let star = starsContainer.children.item(i);
        star.style.color = 'gold';
    }
}


function displayStar() {
    let ele = document.getElementById('stars');

    ele.innerText = 'Lesson Stars : ' + totalStars;
}


function displayProgress() {
    let ele = document.getElementById('progress');

    let progress = 1.0 * totalStars / (boxes.length * 5) * 100;
    progress = progress.toFixed(2);
    ele.innerText = 'Progress : ' + progress + '%';
}


async function displayScoreAndWPM() {
    await $.ajax({
        type: 'post',
        url: '/user/lesson/getScoreAndWPM',
        data: {},
        success: function (result, status, xhr) {
            let eleScore = document.getElementById('score');
            let eleWPM = document.getElementById('avgwpm');

            eleScore.innerText = 'Lesson Score : ' + result.data.score;
            eleWPM.innerText = 'Average Speed : ' + result.data.avgWPM;
        },
        error: function (xhr, status, err) {
            console.log(`Error while sending score and wpm request`);
        }
    });
}