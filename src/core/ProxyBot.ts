import * as Core from 'dab.irc.core/src';
import * as Parser from 'dab.irc.parser/src';

import {IBotModuleContext} from './IBotModuleContext';
import {Bot} from './Bot';
import {BotGroup} from './BotGroup';
import {ProxyGroup} from './ProxyGroup';

export class EventTracker {
    constructor(event:string, cb:Function) {
        this.event = event;
        this.cb = cb;
    }

    event:string;
    cb: Function;
}

export class ProxyBot extends Bot {
    public addedCommands :string[] = [];
    public addedEvents : EventTracker[] = [];

    public realBot : Bot;

    constructor(realBot:Bot, fakeGroup:ProxyGroup) {
        super(realBot.alias, realBot.group, realBot.settings);

        this.realBot = realBot;
        this._group = fakeGroup;
    }   

    static createProxyBot(realBot:Bot, fakeGroup: ProxyGroup) : Bot {

        return new Proxy<ProxyBot>(new ProxyBot(realBot, fakeGroup), {
            get: (proxy, name) => {
                switch(name) {
                    case "addCommand":
                        return function(command:string, options:any, fn:(sender: IBotModuleContext, server:Parser.ParserServer, message:Core.Message) => any) {
                            let wrappedFunction = (function(fnc) { 
                                return (sender: IBotModuleContext, server:Parser.ParserServer, message:Core.Message) => {
                                    fnc(proxy, server, message);
                                };
                            })(fn);

                            proxy.realBot.addCommand(command, options, wrappedFunction);
                            proxy.addedCommands.push(command);
                        };
                    case "dispose":
                        return function() {
                            proxy.addedCommands.forEach( (v, i, a) => {
                                proxy.realBot.delCommand(v);
                            });
                            proxy.addedEvents.forEach( (v, i, a) => {
                                proxy.realBot.removeListener(v.event, v.cb);
                            });
                        }
                    case "on":
                        return function(event:string, fnc:Function) {
                            console.log("[ProxBot.ts] Todo: Wrap event callback functions in proxy bot/group");
                            proxy.realBot.on(event, fnc);
                            proxy.addedEvents.push(new EventTracker(event, fnc));
                            return proxy;
                        }
                    default:
                        return (<any>proxy.realBot)[name];
                }
            }
        });
    }
}