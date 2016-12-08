import {ConversationMessage} from 'dab.irc.parser/src';
import {Bot} from './Bot';
import {BotGroup} from './BotGroup';
import {IBotModuleContext} from './IBotModuleContext';

export class SenderChain {
    bot:Bot;
    group:BotGroup;

    // Only fill in group if group is the sender.
    // If you need access to the group, you can access group in the bot.
    // Bot should ALWAYS exist, since an event can't have a sender without a bot.
    constructor(bot:(Bot|SenderChain), group?:BotGroup) {
        if (bot instanceof SenderChain) {
            if (bot.group) throw new Error("Cannot have existing group in sender chain");

            this.bot = bot.bot;
        }
        else {
            this.bot = bot;
        }
        
        this.group = group;
    }

    static proxyActionsForShortcuts<Ty extends IBotModuleContext>(bot:Ty, m:ConversationMessage, alias:string) : Ty {
        return new Proxy<Ty>(bot, {
               get: (p, k) => {
                   switch(k) {
                       case "say":
                        case "msg":
                            return (net:string, destination:string, message:string) : IBotModuleContext => {
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
                            }
                        case "notice":
                            return (net:string, destination:string, message:string) : IBotModuleContext => {
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
                            }
                        case "me":
                        case "action":
                            return (net:string, destination:string, message:string) : IBotModuleContext => {
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
                            }
                        case "ctcp":
                            return (net:string, destination:string, action:string, command:string, message:string) : IBotModuleContext => {
                                if (!message) {
                                    message = command;
                                    command = action;
                                    action = destination;
                                    destination = net;
                                    net = alias;
                                }
                                return p.ctcp(net, destination, action, command, message);
                            }
                        case "join":
                            return (net:string, channel:string, password?:string) : IBotModuleContext => {
                                if (!password && !bot.hasNetwork(net)) {
                                    if (channel) {
                                        password = channel;
                                    }
                                    channel = net;
                                    net = alias;
                                }
                                return p.raw(net, "JOIN " + channel + ":" + password);
                            }
                        case "part":
                            return (net:string, channel:string, reason?:string) : IBotModuleContext => {
                                if (!reason && !bot.hasNetwork(net)) {
                                    if (channel) {
                                        reason = channel;
                                    }
                                    channel = net;
                                    net = alias;
                                }
                                return p.raw(net, "PART " + channel + ":" + reason);
                            }
                        case "raw":
                            return (net:string, text:string) : IBotModuleContext => {
                                if (!text) {
                                    text = net;
                                    net = alias;
                                }
                                return p.raw(net, text);
                            }
                        case "bots":
                            if (bot instanceof BotGroup) {
                                return new Proxy< {[alias:string]:Bot} >(bot.bots, {
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
                            if (bot instanceof Bot) {
                                return SenderChain.proxyActionsForShortcuts(bot.group, m, alias);
                            }
                            return undefined;
                        default:
                            return (<any>p)[k];
                   }
               } 
            });
    }


    get sender() :IBotModuleContext {
        return (this.group || this.bot);
    }
}