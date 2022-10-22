const express = require('express');
const port = 8000;
const expressLayouts = require('express-ejs-layouts');
const app = express();

//Static files
app.use(express.static('./assets'));

//Setting views
app.set('view engine', 'ejs');
app.set('views', './views');

//Setting up layouts
app.use(expressLayouts);
app.set('layout', 'layouts/');
app.set('layout extractStyles', true);
app.set('layout extractScripts', true);

//Setting up routes
app.use('/', require('./routes'));







//Connecting the server
app.listen(port, 'localhost', function (err) {
    if (err) {
        return console.log(`Error while connecting to server on port : ${port}`);
    }
    console.log(`Server running on port : ${port}`);
});