const express = require('express');
const dotenv = require('dotenv').config();
const fs = require('fs');
const port = process.env.PORT || 3000;
// const expressLayouts = require('express-ejs-layouts');


const app = express();
const https = require('https');
const http = require('http');


const mongoose = require('mongoose');
const db = require('./config/mongoose');
const User = require('./models/user');
const Lesson = require('./models/lessons');
const Challenge = require('./models/challenges');

const cookieParser = require('cookie-parser');
const session = require('express-session');
const mongoStore = require('connect-mongo');

const passport = require('passport');
const passportLocal = require('./config/passport-local-strategy');
const passportGoogle = require('./config/passport-google-oauth2-strategy');

const connectFlash = require('connect-flash');
const noty = require('noty');
const middlewares = require('./config/middlewares');

const fileUpload = require('express-fileupload');


//Cookies
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//Storing cookie using mongo-store
app.use(session({
    name: 'Keybells session',
    //TODO: change this secret key in the end
    secret: 'dkfewiohg9295',
    saveUninitialized: false,
    resave: false,
    cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000 //7 days
    },
    store: new mongoStore(
        {
            client: mongoose.connection.getClient(),
            autoRemove: 'disabled'
        },
        function (err) {
            console.log(err || `Session cookie stored in db using mongoStore`);
        })
}));

//Use passport
app.use(passport.initialize());
app.use(passport.session());




//Static files
app.use(express.static('./assets'));
app.use(express.static('./uploads'));

//Setting views
app.set('view engine', 'ejs');
app.set('views', './views');

//Setting up layouts
// app.use(expressLayouts);
// app.set('layout', 'layouts/');
// app.set('layout extractStyles', true);
// app.set('layout extractScripts', true);



//Storing flash messages in session cookie
app.use(connectFlash());
app.use(middlewares.flash);

// Using express-fileupload
app.use(fileUpload());



//Setting up routes
app.use('/', require('./routes'));


// if (process.env.KEY_PATH && process.env.CERT_PATH) {
//     const key = fs.readFileSync(process.env.KEY_PATH);
//     const cert = fs.readFileSync(process.env.CERT_PATH);
//     const serverHTTPS = https.createServer({ key: key, cert: cert }, app);

//     //Connecting the server
//     serverHTTPS.listen(port, function (err) {
//         if (err) {
//             return console.log(`Error while connecting to HTTPs server on port : ${port}`);
//         }
//         console.log(`HTTPs Server running on port : ${port}`);
//     });
// }
// const serverHTTP = http.createServer(app);
// const port2 = process.env.PORT2 || 8001;
app.listen(port, function (err) {
    if (err) {
        return console.log(`Error while connecting to HTTP server on port : ${port}`);
    }
    console.log(`HTTP Server running on port : ${port}`);
});