"use strict";
const Manager = require('dab.irc.manager/src');
const Parser = require('dab.irc.parser/src');
const SenderChain_1 = require('./SenderChain');
class BotManagedServer extends Manager.ManagedServer {
    constructor(bot, alias, context, connection, parser, chanManager) {
        super(alias, context, connection, parser, chanManager);
        this.bot = bot;
    }
    emit(event, ...args) {
        let arg2 = args.slice(0);
        arg2.splice(0, 0, event);
        super.emit.apply(this, arg2);
        let sc = null;
        if (args[1] instanceof Parser.ConversationMessage) {
            let m = args[1];
            sc = new SenderChain_1.SenderChain(SenderChain_1.SenderChain.proxyActionsForShortcuts(this.bot, m, this.alias));
        }
        else {
            sc = new SenderChain_1.SenderChain(this.bot);
        }
        args.splice(0, 0, event, new SenderChain_1.SenderChain(this.bot));
        this.bot.emit.apply(this.bot, args);
    }
}
exports.BotManagedServer = BotManagedServer;
//# sourceMappingURL=BotManagedServer.js.map