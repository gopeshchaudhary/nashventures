const express = require('express');
const url = require('url');
const Q = require('q');
const cheerio = require('cheerio');
const service = require('../services/search.service');

const googleUrl = `https://www.google.co.in/search?tbm=isch&q=`;
const downloadLocation = `/tmp/nasimages/`;

const router = express.Router();
router.get('/', search);

module.exports = router;

function init(req, res) {
    res.status(200).send('router working for search');
}

function search(req, res) {
    const query = url.parse(req.url, true).query;
    if (!query.q) {
        res.sendStatus(400);
    }
    service.gsearch(googleUrl+query.q.replace(/ /g,"+"))
        .then((html)=>{
            const $ = cheerio.load(html);
            let imgQue = new Array();
            $("img").each((i,img)=>{
                if($(img).attr('src').length){
                    (i<15)? imgQue.push(service.download($(img).attr('src'), downloadLocation)):'';
                }
            });
            Q.all(imgQue).then((allImages)=>{
                console.log(allImages);
            }).catch((err)=> { res.sendStatus(500) });
            res.status(200).send(JSON.stringify(imgQue)+imgQue.length);
        }).catch((err)=> { res.sendStatus(500) });
}
