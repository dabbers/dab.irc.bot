"use strict";
const fs = require('fs');
const watch = require("watchwithproxy");
class ManagedConfig {
    constructor(cfgPath) {
        this.isDirty = false;
        this.rawSettings = require(cfgPath);
        watch.Watcher.Watch(this.rawSettings, new watch.WatchOptions(), (s, p, o, n) => {
            this.isDirty = true;
        });
        this.path = cfgPath;
    }
    save() {
        if (this.isDirty) {
            fs.writeFile(this.path, JSON.stringify(this.rawSettings, null, 4), (err) => {
                console.log(err);
            });
        }
    }
    static createConfig(cfgPath) {
        let o = new ManagedConfig(cfgPath);
        let n = new Proxy(o, {
            set: (proxy, name, value) => {
                if (proxy.rawSettings[name] !== undefined && proxy.rawSettings.hasOwnProperty(name)) {
                    proxy.isDirty = true;
                    return proxy.rawSettings[name] = value;
                }
                else {
                    return proxy[name] = value;
                }
            },
            get: (proxy, name) => {
                if (proxy.rawSettings[name] !== undefined && proxy.rawSettings.hasOwnProperty(name)) {
                    return proxy.rawSettings[name];
                }
                else {
                    return proxy[name];
                }
            }
        });
        return n;
    }
    convertToproxy(obj) {
        if (obj === undefined || obj === null || obj instanceof String || obj instanceof Number) {
            return obj;
        }
        else if (obj instanceof Array) {
            for (let i = 0; i < obj.length; i++) {
            }
        }
        else {
            let keys = Object.keys(obj);
            for (let i in keys) {
            }
        }
    }
}
exports.ManagedConfig = ManagedConfig;
//# sourceMappingURL=ManagedConfig.js.map