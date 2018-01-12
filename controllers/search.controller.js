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

// Search Handler For Image Search From Google

function search(req, res) {
    const query = url.parse(req.url, true).query;
    if (!query.q) {
        res.sendStatus(400);
    }
    service.refreshLoc(downloadLocation);  // ORDER OF CALLING refreshLoc() !important          // Refresh the download location
    service.refreshLoc(tmpLocation);                                            // Refresh the temp location
    service.gsearch(googleUrl + query.q.toString().replace(/ /g, "+"))
        .then((html) => {
            const $ = cheerio.load(html);                                       // Parsing the DOM
            let imgQue = new Array();                                               // DataStructure to hold all images Promises
            $("img").each((i, img) => {
                if ($(img).attr('src').length) {
                    (i < 15) ? imgQue.push(service.download($(img).attr('src'), tmpLocation)) : '';             // Pushing to DataStructure
                }
            });
            return Q.all(imgQue);                                                                        // Running all image Downloads in parallel
        }).then((allImages) => {
        return service.save2DB(query.q, allImages);                                                       // Saving the images to history
    }).then((dbres) => {
        console.log(dbres);                                                                                 // Compressing the images
        return service.compress(downloadLocation, tmpLocation);
    }).then((filesDone) => {
        service.deleteLoc(tmpLocation);                                                                     // Deleting the temp downloads
        return service.bwfilter(filesDone);                                                                 // Applying the B&W Filter
    }).then((filesDone) => {
        res.status(200).send(JSON.stringify({'msg': 'Successfully Completed Image Search'}));               // Finally send response
    }).catch((err) => {
        res.sendStatus(500);                                                    // On Error Send Internal Server Error
    });
}

// Image Search History Handler

function getHistory(req, res) {                                                                 // Sending the History of Image Search
    service.retrieve4DB().then((history) => {                                           // Retrieving the images
        res.status(200).send(JSON.stringify({'data': history}));
    }).catch((err) => {
        res.sendStatus(500);                                      // On Error Send Internal Server Error
    });
}

// Get ImageList Handler

function getImages(req, res) {                                                          // Sending the selected image List
    const query = url.parse(req.url, true).query;
    if (!query.id) {
        res.sendStatus(400);
    }
    service.getHistoryData(query.id).then((historyImages) => {                                  //  Getting the history Data
        res.status(200).send(JSON.stringify({'data': historyImages}));
    }).catch((err) => {
        res.sendStatus(500);                                      // On Error Send Internal Server Error
    });
}

