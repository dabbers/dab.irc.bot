"use strict";
const path = require('path');
const ManagedConfig_1 = require('../src/core/ManagedConfig');
let cfg = require("./botconfig.json");
let pth = path.join(__dirname, "botconfig.json");
console.log(pth);
let tmp = ManagedConfig_1.ManagedConfig.createConfig(pth);
console.log(tmp.BotGroups['d*bot'].Bots["DaBot"].Nick);
console.log(tmp.Modules["PlexAnnounce"].test);
tmp.Modules["PlexAnnounce"].test = 13;
console.log(tmp.Modules["PlexAnnounce"].test);
console.log(tmp.isDirty);
tmp.save();
//# sourceMappingURL=index.js.map