const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const PORT = process.env.PORT || 5000;
const MongoDBURI = 'mongodb://dbuser:12345@ds247327.mlab.com:47327/nashventures';
const downloadLocation = `/tmp/nasimages/`;


mongoose.connect(MongoDBURI, {useMongoClient: true});
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on('connected', console.log.bind(console, 'MONGODB CONNECTION ESTABLISHED:'));
db.on('disconnected', console.log.bind(console, 'MONGODB CONNECTION DROPPED:'));
db.on('error', console.error.bind(console, 'MONGODB CONNECTION ERROR:'));
process.on("SIGINT", () => {
    mongoose.connection.close(() => {
        console.log.bind(console, 'MONGODB DEFAULT CONNECTION DISCONNECTED');
        process.exit(0);
    })
});

express()
    .use(cors())
    .use(bodyParser.urlencoded({extended: false}))
    .use(bodyParser.json())
    .use(express.static(path.join(__dirname, 'public')))
    .use('/images', express.static(downloadLocation))
    .set('views', path.join(__dirname, 'views'))
    .set('view engine', 'ejs')
    .get('/', (req, res) => res.render('pages/index'))
    .use('/search', require('./controllers/search.controller'))
    .listen(PORT, () => console.log(`Listening on ${ PORT }`))
