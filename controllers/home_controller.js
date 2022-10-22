//Homepage
module.exports.home = function (req, res) {
    let options = {
        layout: 'layouts/layout',
        title: 'Homepage'
    };
    res.render('home', options);
};