const Q = require('q');
const request = require('request-promise');
const download = require('image-downloader');
const uniqid = require('uniqid');
const minify = require('minify-images');

const service = {};

service.download = imgDownloader;
service.gsearch = googleit;

module.exports = service;

function googleit(url) {
    return request(url);
}

function imgDownloader(imgUrl, destination) {
    const deferred = Q.defer();
    const imgname = uniqid()+'.jpg';
    download.image({ url : imgUrl , dest : destination+imgname }).then(({ filename, image }) => {
        compress(destination,imgname).then((cimage)=>{ console.log('donexxxxxxxx'); deferred.resolve(imgname); }).catch((err)=> deferred.reject(err))
    }).catch((err) => {
        deferred.reject('Failed to save image');
    });
    return deferred.promise;
}

function compress(destination,imgname) {
    const deferred = Q.defer();
    minify.compress({
        src: destination ,
        dest: destination,
    }).then(files => {
        console.log(files);
        deferred.resolve(filepath);
    }).catch(error => {
        deferred.reject('Failed to compress image')
    });
    return deferred.promise;
}

