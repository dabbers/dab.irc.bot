"use strict";
const request = require('request');
function download(url, cb) {
    request({
        uri: url,
        method: "GET",
        timeout: 5000,
        followRedirect: true,
        maxRedirects: 5
    }, function (error, response, body) {
        if (error) {
            cb(undefined);
        }
        else {
            if (response.headers['content-type'].toLowerCase().indexOf("json") != -1) {
                cb(JSON.parse(body));
            }
            else {
                cb(body);
            }
        }
    });
}
exports.download = download;
//# sourceMappingURL=Functions.js.map