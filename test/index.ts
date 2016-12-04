import * as path from 'path';
import {ManagedConfig} from '../src/core/ManagedConfig';

let cfg = require("./botconfig.json");
let pth = path.join(__dirname, "botconfig.json");

console.log(pth);

let tmp = ManagedConfig.createConfig(pth);

console.log(tmp.BotGroups['d*bot'].Bots["DaBot"].Nick);

console.log(tmp.Modules["PlexAnnounce"].test);
tmp.Modules["PlexAnnounce"].test = 13;
console.log(tmp.Modules["PlexAnnounce"].test);

console.log(tmp.isDirty);

tmp.save();