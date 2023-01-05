let boxes = document.getElementsByClassName('box');
// console.log(boxes);

let totalStars = 0, progress = 0;

async function completeHome(index) {
    let box = boxes[index];

    // Adding links to each level
    // let level = box.children.item(index).innerHTML.trim();
    let level = index + 1;
    box.parentElement.setAttribute(`href`, `/user/type?which=lesson&level=${level}`);


    // Adding click and hover events
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


    let countStars = 0;
    await $.ajax({
        type: 'get',
        url: '/user/countLessonStars',
        data: {
            level: Number.parseInt(level)
        },
        success: async (result, status, xhr) => {
            // console.log(result.data);
            countStars = result.data.stars;
            glowStars(box, countStars);

            totalStars += Number.parseInt(countStars);
            if (level == boxes.length) {
                displayStar();
                displayProgress();
                displayScoreAndWPM();
            }
        },
        error: (xhr, status, err) => {
            console.log('Error while sending ajax request to count stars');
        }
    });
}

for (let i = 0; i < boxes.length; i++)
    completeHome(i);



function glowStars(box, stars) {
    let starsContainer = box.children.item(1);

    for (let i = 0; i < stars; i++) {
        let star = starsContainer.children.item(i);
        star.style.color = 'gold';
    }
}


function displayStar() {
    let ele = document.getElementById('stars');

    ele.innerText = 'Stars : ' + totalStars;
}


function displayProgress() {
    let ele = document.getElementById('progress');

    let progress = 1.0 * totalStars / (boxes.length * 5) * 100;
    progress = progress.toFixed(2);
    ele.innerText = 'Progress : ' + progress + '%';
}


function displayScoreAndWPM() {
    $.ajax({
        type: 'post',
        url: '/user/getScoreAndWPM',
        data: {},
        success: function (result, status, xhr) {
            let eleScore = document.getElementById('score');
            let eleWPM = document.getElementById('avgwpm');

            eleScore.innerText = 'Score : ' + result.data.score;
            eleWPM.innerText = 'Average Speed : ' + result.data.avgWPM;
        },
        error: function (xhr, status, err) {
            console.log(`Error while sending score and wpm request`);
        }
    });
}