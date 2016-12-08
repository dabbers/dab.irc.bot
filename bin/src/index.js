"use strict";
const path = require('path');
require('source-map-support').install();
const core_1 = require('./core/core');
const functions = require('./core/Functions');
const settings = require('../../package.json');
global.Core = new core_1.Core();
global.die = () => {
    for (let group in global.Core.groups) {
        let nets = Object.keys(global.bal.Core.groups[group]);
        for (let net in nets)
            global.Core.groups[group].disconnect(net);
    }
    setTimeout(function () { process.exit(0); }, 300);
};
global.download = (url, callback) => {
    functions.download(url, callback);
};
global.Core.init(settings.version, path.join(__dirname, "..", "..", "botconfig.json"));
setInterval(function () { global.Core.tick(); }, 60);
//# sourceMappingURL=index.js.map