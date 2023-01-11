module.exports.myParas = function (req, res) {
    let options = {
        title: 'My Paragraphs',
        paras: [],
        score: '?',
        stars: '?',
        avgSpeed: '?'
    }
    const user = req.user;
    options.paras = user.myParas;
    options.score = user.netMyParasScore;
    options.stars = user.myParasStars;
    options.avgSpeed = user.avgMyParasWPM;

    res.render('myParas', options);
}