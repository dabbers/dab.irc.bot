import { ConversationMessage } from 'dab.irc.parser/src';
import { Bot } from './Bot';
import { BotGroup } from './BotGroup';
import { IBotModuleContext } from './IBotModuleContext';
export declare class SenderChain {
    bot: Bot;
    group: BotGroup;
    constructor(bot: (Bot | SenderChain), group?: BotGroup);
    static proxyActionsForShortcuts<Ty extends IBotModuleContext>(bot: Ty, m: ConversationMessage, alias: string): Ty;
    readonly sender: IBotModuleContext;
}
