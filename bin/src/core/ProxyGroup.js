"use strict";
const BotGroup_1 = require('./BotGroup');
class EventTracker {
    constructor(event, cb) {
        this.event = event;
        this.cb = cb;
    }
}
exports.EventTracker = EventTracker;
class ProxyGroup extends BotGroup_1.BotGroup {
    constructor(realGroup) {
        super();
        this.addedCommands = [];
        this.addedEvents = [];
        this.realGroup = realGroup;
    }
    static createProxyGroup(realGroup) {
        return new Proxy(new ProxyGroup(realGroup), {
            get: (proxy, name) => {
                switch (name) {
                    case "addCommand":
                        return function (command, options, fn) {
                            let wrappedFunction = (function (fnc) {
                                return (sender, server, channel, message) => {
                                    fnc(proxy, server, channel, message);
                                };
                            })(fn);
                            proxy.realGroup.addCommand(command, options, fn);
                            proxy.addedCommands.push(command);
                        };
                    case "dispose":
                        return function () {
                            proxy.addedCommands.forEach((v, i, a) => {
                                proxy.realGroup.delCommand(v);
                            });
                            proxy.addedEvents.forEach((v, i, a) => {
                                proxy.realGroup.removeListener(v.event, v.cb);
                            });
                        };
                    case "on":
                        return function (event, fnc) {
                            console.log("[ProxBot.ts] Todo: Wrap event callback functions in proxy bot/group");
                            proxy.realGroup.on(event, fnc);
                            proxy.addedEvents.push(new EventTracker(event, fnc));
                            return proxy;
                        };
                    case "bots":
                    default:
                        return proxy.realGroup[name];
                }
            }
        });
    }
}
exports.ProxyGroup = ProxyGroup;
//# sourceMappingURL=ProxyGroup.js.map