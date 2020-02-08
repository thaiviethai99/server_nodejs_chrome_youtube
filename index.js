var express = require('express');
var fs = require('fs');
var cheerio = require('cheerio');
var bodyParser = require('body-parser');
var spawn = require('child_process').spawn;
const axios = require('axios');
var app = express();
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
async function doRequest(url) {
    return new Promise(function (resolve, reject) {
        axios.get(url).then((response) => {
            resolve(response.data);
        }).catch(error => reject(error));
    });
}

function myTrim(x) {
    return x.replace(/^\s+|\s+$/gm, '');
}
function convertNumber(labelValue) {

    // Nine Zeroes for Billions
    return Math.abs(Number(labelValue)) >= 1.0e+9

        ? Math.abs(Number(labelValue)) / 1.0e+9 + "B"
        // Six Zeroes for Millions 
        : Math.abs(Number(labelValue)) >= 1.0e+6

            ? Math.abs(Number(labelValue)) / 1.0e+6 + "M"
            // Three Zeroes for Thousands
            : Math.abs(Number(labelValue)) >= 1.0e+3

                ? Math.abs(Number(labelValue)) / 1.0e+3 + "K"

                : Math.abs(Number(labelValue));

}
app.get('/', async (req, res) => {
    let name = req.query.name;
    var apiKey = 'AIzaSyA7JyF9XS5cdW4bYKC2df1EjY2kmWQ_T6k';
    var url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${name}&type=channel&key=${apiKey}&maxResults=10`;
    var result = await doRequest(url);
    var countResult = result.pageInfo.totalResults;
    let jsonResult = { info: 0 };
    if (countResult > 0) {
        jsonResult = { info: 1 };
        var jsonItems = [];
        for (var i = 0; i < 10; i++) {
            let channelId = result['items'][i]['id']['channelId'];
            let title = result['items'][i]['snippet']['title'];
            let description = result['items'][i]['snippet']['description'];
            var thumbnailsUrl = result['items'][i]['snippet']['thumbnails']['default']['url'];
            var urlSub = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${apiKey}`;
            var resultSub = await doRequest(urlSub);
            var subscriberCount = resultSub.items[0].statistics.subscriberCount;
            var subscriberCountConvert = convertNumber(subscriberCount);
            var jsonItems2 = {
                channelId: channelId,
                title: title,
                description: description,
                subscriberCount: subscriberCount,
                subscriberCountConvert: subscriberCountConvert,
                thumbnailsUrl: thumbnailsUrl
            }
            jsonItems.push(jsonItems2);
        }
        jsonResult = { ...jsonResult, items: jsonItems };
    }
    return res.json(jsonResult);
});

var server = app.listen(81, function () {
    console.log('Magic happens on port 81 ');
});
exports = module.exports = app;