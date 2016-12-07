import * as Core from 'dab.irc.core/src';
import * as Parser from 'dab.irc.parser/src';

import {IBotModuleContext} from './IBotModuleContext';
import {BotGroup} from './BotGroup';
import {Bot} from './Bot';
import {SenderChain} from './SenderChain';


export class EventTracker {
    constructor(event:string, cb:Function) {
        this.event = event;
        this.cb = cb;
    }

    event:string;
    cb: Function;
}

export class ProxyGroup extends BotGroup {
    public addedCommands :string[] = [];
    public addedEvents : EventTracker[] = [];

    public realGroup : BotGroup;

    constructor(realGroup:BotGroup) {
        super(realGroup.alias, realGroup.settings);

        this.realGroup = realGroup;
    }   

    public fakeBots: { [name:string] : Bot};

    static createProxyGroup(realGroup: ProxyGroup) : BotGroup {
        return new Proxy<ProxyGroup>(new ProxyGroup(realGroup), {
            get: (proxy, name) => {
                switch(name) {
                    case "addCommand":
                        return function(command:string, options:any, fn:(sender: SenderChain, server:Parser.ParserServer, message:Core.Message) => any) {
                            let wrappedFunction = (function(fnc) { 
                                return (sender: SenderChain, server:Parser.ParserServer, message:Core.Message) => {
                                    fnc(new SenderChain(sender.bot, proxy), server, message);
                                };
                            })(fn);

                            proxy.realGroup.addCommand(command, options, fn);
                            proxy.addedCommands.push(command);
                        };
                    case "dispose":
                        return function() {
                            proxy.addedCommands.forEach( (v, i, a) => {
                                proxy.realGroup.delCommand(v);
                            });
                            proxy.addedEvents.forEach( (v, i, a) => {
                                proxy.realGroup.removeListener(v.event, v.cb);
                            });
                        }
                    case "on":
                        return function(event:string, fnc:Function) {
                            console.log("[ProxBot.ts] Todo: Wrap event callback functions in proxy bot/group");
                            proxy.realGroup.on(event, fnc);
                            proxy.addedEvents.push(new EventTracker(event, fnc));
                            return proxy;
                        }
                        case "bots": 

                    default:
                        return (<any>proxy.realGroup)[name];
                }
            }
        });
    }
}