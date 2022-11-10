let boxes = document.getElementsByClassName('box');
// console.log(boxes);

let i = 0;

async function completeHome(index){
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
        success:async (result, status, xhr) => {
            // console.log(result.data);
            countStars = result.data.stars;
            glowStars(box, stars);
        },
        error: (xhr, status, err) => {
            console.log('Error while sending ajax request to count stars');
        }
    });
}

for (let i = 0; i < boxes.length;i++)
    completeHome(i);



function glowStars(box,stars) {
    let one = document.querySelector(``);
}