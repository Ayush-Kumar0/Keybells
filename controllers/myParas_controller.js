const multer = require('multer');


module.exports.myParas = function (req, res) {
    let options = {
        title: 'My Paragraphs',
        paras: [],
        score: '?',
        stars: '?',
        avgSpeed: '?'
    }
    const user = req.user;
    options.paras = user.myParas.reverse();
    options.score = user.netMyParasScore;
    options.stars = user.myParasStars;
    options.avgSpeed = user.avgMyParasWPM;

    res.render('myParas', options);
}

module.exports.addByText = async function (req, res) {
    // console.log(req.body);
    let submittedText = req.body['submitted-text'];
    if (submittedText.length < 15) {
        req.flash('error', 'Text must be at least 15 letters long.');
        return res.redirect('back');
    }
    else if (submittedText.length > 5000) {
        req.flash('error', 'Paragraph too Big');
        return res.redirect('back');
    }
    else {
        let myParasDetails = {
            paragraph: submittedText.replaceAll('\r\n', ' ').trim(),
            paraType: 'myParas',
            time: new Date(),
            grossSpeed: 0,
            netSpeed: 0,
            accuracy: 0,
            stars: 0,
            score: 0
        };
        let existing = await req.user.myParas.find(value => { return value.paragraph == submittedText; });
        if (existing) {
            req.flash('error', 'Paragraph already exists');
            return res.redirect('back');
        }

        req.user.myParas.push(myParasDetails);
        req.user.save(function (err, user) {
            if (err || !user) {
                req.flash('error', `Can't Add Paragraph`);
                return res.redirect('back');
            }
            else {
                req.flash('success', 'Paragraph Added');
                return res.redirect('/user/myParas');
            }
        });
    }
}


module.exports.addByFile = async function (req, res) {
    // let contentType = req.get('Content-Type');
    // let boundary = contentType.substring(contentType.indexOf('boundary=') + 9);

    let fileText = '';
    let compatible = true;

    await req.on('data', (data) => {
        try {
            if (data.length > 5000) {
                compatible = 'File too Big';
                return;
            }
            let content = data.toString().split('\r\n');
            content.splice(0, 4);
            content.pop();
            content.pop();
            fileText = content.join(' ').replaceAll('\t', ' ').replaceAll(/\s+/g, ' ').trim();
        }
        catch (err) {
            console.log('Error while file conversion');
            req.flash('error', 'File incompatible');
            fileText = '';
            compatible = false;
        }
    });
    // console.log(fileText, compatible);
    if (compatible === false) {
        return res.redirect('back');
    }
    else if (compatible === true) {
        if (fileText.length == 0) {
            req.flash('error', 'File empty/incompatible');
            return res.redirect('back');
        }
        let myParasDetails = {
            paragraph: fileText,
            paraType: 'myParas',
            time: new Date(),
            grossSpeed: 0,
            netSpeed: 0,
            accuracy: 0,
            stars: 0,
            score: 0
        };
        let existing = await req.user.myParas.find(value => { return value.paragraph == fileText; });
        if (existing) {
            req.flash('error', 'Paragraph already exists');
            return res.redirect('back');
        }

        req.user.myParas.push(myParasDetails);
        req.user.save(function (err, user) {
            if (err || !user) {
                req.flash('error', `Can't Add Paragraph`);
                return res.redirect('back');
            }
            else {
                req.flash('success', 'Paragraph Added');
                return res.redirect('/user/myParas');
            }
        });
    }
    else {
        req.flash('error', compatible);
        res.redirect('back');
    }
}

module.exports.fileTooBig = async function (req, res) {
    if (req.xhr)
        req.flash('error', 'File too Large');
    res.json({});
}


module.exports.deleteMyPara = async function (req, res) {
    if (req.xhr) {
        // console.log(req.body);
        const currentUser = req.user;
        let ind = -1;
        let foundPara = await currentUser.myParas.find((value, index) => {
            if (value.id == req.body.id) {
                ind = index;
                return true;
            }
            else
                return false;
        });

        if (ind == -1) {
            req.flash('error', `Couldn't delete Paragraph`);
            await res.json({
                data: {
                    deleted: false
                }
            });
        }
        else {
            await currentUser.myParas.splice(ind, 1);
            await currentUser.save(function (err, user) {
                if (err) { console.log('Error while deleting myPara', err); return; }
                else {
                    console.log('Deleted myPara');
                }
            });

            req.flash('success', 'Paragraph deleted');

            await res.json({
                data: {
                    deleted: true
                }
            });
        }
    }
}