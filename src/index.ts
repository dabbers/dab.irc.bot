import * as path from 'path';
require('source-map-support').install();

import {Core} from './core/core';
import * as request from 'request';
import * as functions from './core/Functions';
const settings = require('../../package.json');

(<any>global).Core = new Core();
(<any>global).die = () => {
    for(let group in (<any>global).Core.groups) {
        let nets = Object.keys((<any>global).bal.Core.groups[group]);

        for(let net in nets) (<any>global).Core.groups[group].disconnect(net);
    }

    setTimeout(function() { process.exit(0); }, 300);
}

(<any>global).download = (url:string, callback?:Function) => {
    functions.download(url, callback);
}




(<any>global).Core.init(settings.version, path.join( __dirname, "..", "..", "botconfig.json" ) );
setInterval( function() { (<any>global).Core.tick(); }, 60);

