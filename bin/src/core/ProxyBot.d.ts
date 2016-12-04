import { Bot } from './Bot';
import { ProxyGroup } from './ProxyGroup';
export declare class EventTracker {
    constructor(event: string, cb: Function);
    event: string;
    cb: Function;
}
export declare class ProxyBot extends Bot {
    addedCommands: string[];
    addedEvents: EventTracker[];
    realBot: Bot;
    constructor(realBot: Bot, fakeGroup: ProxyGroup);
    static createProxyBot(realBot: Bot, fakeGroup: ProxyGroup): Bot;
}
