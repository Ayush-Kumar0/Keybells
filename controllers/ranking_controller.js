module.exports.ranking = function (req, res) {
    res.render('ranking', { username: req.user.username });
}