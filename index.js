const port = 8000;
const express = require('express');
// const expressLayouts = require('express-ejs-layouts');
const app = express();
const mongoose = require('mongoose');
const db = require('./config/mongoose');
const User = require('./models/user');

const cookieParser = require('cookie-parser');
const session = require('express-session');
const mongoStore = require('connect-mongo');
const passport = require('passport');
const passportLocal = require('./config/passport-local-strategy');
const passportGoogle = require('./config/passport-google-oauth2-strategy');


//Cookies
app.use(express.urlencoded());
app.use(cookieParser());

//Storing cookie using mongo-store
app.use(session({
    name: 'Swiftkey_Cookie',
    //TODO: change this secret key in the end
    secret: 'dkfewiohg9295',
    saveUninitialized: false,
    resave: false,
    cookie: {
        maxAge: 4 * 60 * 60 * 1000 //4 hours
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

//Setting views
app.set('view engine', 'ejs');
app.set('views', './views');

//Setting up layouts
// app.use(expressLayouts);
// app.set('layout', 'layouts/');
// app.set('layout extractStyles', true);
// app.set('layout extractScripts', true);







//Setting up routes
app.use('/', require('./routes'));

//Connecting the server
app.listen(port, 'localhost', function (err) {
    if (err) {
        return console.log(`Error while connecting to server on port : ${port}`);
    }
    console.log(`Server running on port : ${port}`);
});