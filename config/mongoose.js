const mongoose = require('mongoose');

const dbName = process.env.DB_NAME || 'Keybells_DB';
mongoose.connect(`mongodb://0.0.0.0:27017/${dbName}`);

const db = mongoose.connection;

db.on('error', console.error.bind(console, `Error connecting to MongoDB`));

db.once('open', function () {
    console.log(`Connected to MongoDB database : ${dbName}`);
});

module.exports = db;