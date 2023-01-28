module.exports.challenges = function (req, res) {
    let options = {
        username: req.user.username
    };
    res.render('challenges', options);
}