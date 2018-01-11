const express = require('express');
const url = require('url');
const Q = require('q');
const cheerio = require('cheerio');
const service = require('../services/search.service');

const googleUrl = `https://www.google.co.in/search?tbm=isch&q=`;
const downloadLocation = `/tmp/nasimages/`;
const tmpLocation = `/tmp/nasimages/tmp/`;

const router = express.Router();
router.get('/', search);
router.get('/list', getHistory);
router.get('/images', getImages);

module.exports = router;

function search(req, res) {
    const query = url.parse(req.url, true).query;
    if (!query.q) {
        res.sendStatus(400);
    }
    service.refreshLoc(downloadLocation);  // ORDER OF CALLING refreshLoc() !important
    service.refreshLoc(tmpLocation);
    service.gsearch(googleUrl + query.q.toString().replace(/ /g, "+"))
        .then((html) => {
            const $ = cheerio.load(html);
            let imgQue = new Array();
            $("img").each((i, img) => {
                if ($(img).attr('src').length) {
                    (i < 15) ? imgQue.push(service.download($(img).attr('src'), tmpLocation)) : '';
                }
            });
            return Q.all(imgQue);
        }).then((allImages) => {
        return service.save2DB(query.q, allImages);
    }).then((dbres) => {
        console.log(dbres);
        return service.compress(downloadLocation, tmpLocation);
    }).then((filesDone) => {
        service.deleteLoc(tmpLocation);
        return service.bwfilter(filesDone);
    }).then((filesDone) => {
        res.status(200).send(JSON.stringify({'msg': 'Successfully Completed Image Search'}));
    }).catch((err) => {
        res.sendStatus(500)
    });
}

function getHistory(req, res) {
    service.retrieve4DB().then((history) => {
        res.status(200).send(JSON.stringify({'data': history}));
    }).catch((err) => {
        res.sendStatus(500);
    });
}

function getImages(req, res) {
    const query = url.parse(req.url, true).query;
    if (!query.id) {
        res.sendStatus(400);
    }
    service.getHistoryData(query.id).then((historyImages) => {
        res.status(200).send(JSON.stringify({'data': historyImages}));
    }).catch((err) => {
        res.sendStatus(500);
    });
}

