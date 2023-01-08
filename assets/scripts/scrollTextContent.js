var text = document.getElementById('text'), next;
var textYMiddle = Number.parseInt(text.getClientRects()[0].y) + Number.parseInt(text.getClientRects()[0].height) / 2;
// console.log(textYMiddle);

var prevY = 0; // Stores Y-coordinate of previous Letter
var lines = 0; // Stores number of lines before next Letter

export const scroller = function () {
    next = document.getElementsByClassName('next')[0];
    let nextY = next.getClientRects()[0].y;
    let nextHeight = 1 + Number.parseInt(next.getClientRects()[0].height);

    // console.log(nextY);

    if (prevY != nextY) {
        // Update number of previous lines
        lines++;

        // Scroll the text-area
        if (nextHeight * lines >= textYMiddle)
            text.scroll(0, nextHeight * lines - textYMiddle);

        // Updating prevY
        next = document.getElementsByClassName('next')[0];
        nextY = next.getClientRects()[0].y;
        prevY = nextY;
    }
}