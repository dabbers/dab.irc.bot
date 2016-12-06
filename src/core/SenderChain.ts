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

    get sender() :IBotModuleContext {
        return (this.group || this.bot);
    }
}