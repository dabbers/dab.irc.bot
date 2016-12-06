import { Bot } from './Bot';
import { BotGroup } from './BotGroup';
import { IBotModuleContext } from './IBotModuleContext';
export declare class SenderChain {
    bot: Bot;
    group: BotGroup;
    constructor(bot: Bot, group: BotGroup);
    readonly sender: IBotModuleContext;
}
