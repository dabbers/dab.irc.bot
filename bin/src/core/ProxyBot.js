"use strict";
const Bot_1 = require('./Bot');
class EventTracker {
    constructor(event, cb) {
        this.event = event;
        this.cb = cb;
    }
}
exports.EventTracker = EventTracker;
class ProxyBot extends Bot_1.Bot {
    constructor(realBot, fakeGroup) {
        super();
        this.addedCommands = [];
        this.addedEvents = [];
        this.realBot = realBot;
        this._group = fakeGroup;
    }
    static createProxyBot(realBot, fakeGroup) {
        return new Proxy(new ProxyBot(realBot, fakeGroup), {
            get: (proxy, name) => {
                switch (name) {
                    case "addCommand":
                        return function (command, options, fn) {
                            let wrappedFunction = (function (fnc) {
                                return (sender, server, channel, message) => {
                                    fnc(proxy, server, channel, message);
                                };
                            })(fn);
                            proxy.realBot.addCommand(command, options, wrappedFunction);
                            proxy.addedCommands.push(command);
                        };
                    case "dispose":
                        return function () {
                            proxy.addedCommands.forEach((v, i, a) => {
                                proxy.realBot.delCommand(v);
                            });
                            proxy.addedEvents.forEach((v, i, a) => {
                                proxy.realBot.removeListener(v.event, v.cb);
                            });
                        };
                    case "on":
                        return function (event, fnc) {
                            console.log("[ProxBot.ts] Todo: Wrap event callback functions in proxy bot/group");
                            proxy.realBot.on(event, fnc);
                            proxy.addedEvents.push(new EventTracker(event, fnc));
                            return proxy;
                        };
                    default:
                        return proxy.realBot[name];
                }
            }
        });
    }
}
exports.ProxyBot = ProxyBot;
//# sourceMappingURL=ProxyBot.js.map