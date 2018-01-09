const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const PORT = process.env.PORT || 5000;
const router = express.Router();

express()
    .use(bodyParser.urlencoded({extended: false}))
    .use(bodyParser.json())
    .use(express.static(path.join(__dirname, 'public')))
    .set('views', path.join(__dirname, 'views'))
    .set('view engine', 'ejs')
    .get('/', (req, res) => res.render('pages/index'))
    .use('/search', require('./controllers/search.controller'))
    .listen(PORT, () => console.log(`Listening on ${ PORT }`))
