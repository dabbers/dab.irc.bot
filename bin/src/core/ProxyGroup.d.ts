import { BotGroup } from './BotGroup';
import { Bot } from './Bot';
export declare class EventTracker {
    constructor(event: string, cb: Function);
    event: string;
    cb: Function;
}
export declare class ProxyGroup extends BotGroup {
    addedCommands: string[];
    addedEvents: EventTracker[];
    realGroup: BotGroup;
    constructor(realGroup: BotGroup);
    fakeBots: {
        [name: string]: Bot;
    };
    static createProxyGroup(realGroup: ProxyGroup): BotGroup;
}
