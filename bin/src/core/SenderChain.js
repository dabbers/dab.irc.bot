"use strict";
const Bot_1 = require('./Bot');
const BotGroup_1 = require('./BotGroup');
class SenderChain {
    constructor(bot, group) {
        if (bot instanceof SenderChain) {
            if (bot.group)
                throw new Error("Cannot have existing group in sender chain");
            this.bot = bot.bot;
        }
        else {
            this.bot = bot;
        }
        this.group = group;
    }
    static proxyActionsForShortcuts(bot, m, alias) {
        return new Proxy(bot, {
            get: (p, k) => {
                switch (k) {
                    case "say":
                    case "msg":
                        return (net, destination, message) => {
                            if (!message) {
                                if (!destination) {
                                    message = net;
                                    destination = m.destination.target;
                                    net = alias;
                                }
                                else {
                                    message = destination;
                                    destination = net;
                                    net = alias;
                                }
                            }
                            return p.say(net, destination, message);
                        };
                    case "notice":
                        return (net, destination, message) => {
                            if (!message) {
                                if (!destination) {
                                    message = net;
                                    destination = m.destination.target;
                                    net = alias;
                                }
                                else {
                                    message = destination;
                                    destination = net;
                                    net = alias;
                                }
                            }
                            return p.notice(net, destination, message);
                        };
                    case "me":
                    case "action":
                        return (net, destination, message) => {
                            if (!message) {
                                if (!destination) {
                                    message = net;
                                    destination = m.destination.target;
                                    net = alias;
                                }
                                else {
                                    message = destination;
                                    destination = net;
                                    net = alias;
                                }
                            }
                            return p.ctcp(net, destination, "PRIVMSG", "ACTION", message);
                        };
                    case "ctcp":
                        return (net, destination, action, command, message) => {
                            if (!message) {
                                message = command;
                                command = action;
                                action = destination;
                                destination = net;
                                net = alias;
                            }
                            return p.ctcp(net, destination, action, command, message);
                        };
                    case "join":
                        return (net, channel, password) => {
                            if (!password && !bot.hasNetwork(net)) {
                                if (channel) {
                                    password = channel;
                                }
                                channel = net;
                                net = alias;
                            }
                            return p.raw(net, "JOIN " + channel + ":" + password);
                        };
                    case "part":
                        return (net, channel, reason) => {
                            if (!reason && !bot.hasNetwork(net)) {
                                if (channel) {
                                    reason = channel;
                                }
                                channel = net;
                                net = alias;
                            }
                            return p.raw(net, "PART " + channel + ":" + reason);
                        };
                    case "raw":
                        return (net, text) => {
                            if (!text) {
                                text = net;
                                net = alias;
                            }
                            return p.raw(net, text);
                        };
                    case "bots":
                        if (bot instanceof BotGroup_1.BotGroup) {
                            return new Proxy(bot.bots, {
                                get: (p, k) => {
                                    if (p[k]) {
                                        return SenderChain.proxyActionsForShortcuts(p[k], m, alias);
                                    }
                                    return undefined;
                                }
                            });
                        }
                        return undefined;
                    case "group":
                        if (bot instanceof Bot_1.Bot) {
                            return SenderChain.proxyActionsForShortcuts(bot.group, m, alias);
                        }
                        return undefined;
                    default:
                        return p[k];
                }
            }
        });
    }
    get sender() {
        return (this.group || this.bot);
    }
}
exports.SenderChain = SenderChain;
//# sourceMappingURL=SenderChain.js.map