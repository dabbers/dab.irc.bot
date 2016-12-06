"use strict";
const Manager = require('dab.irc.manager/src');
class BotManagedServer extends Manager.ManagedServer {
    constructor(bot, alias, context, connection, parser, chanManager) {
        super(alias, context, connection, parser, chanManager);
        this.bot = bot;
    }
    emit(event, ...args) {
        super.emit.apply(super.emit, args);
        args.splice(0, 0, event, this.bot);
        this.bot.emit.apply(this.bot, args);
    }
}
exports.BotManagedServer = BotManagedServer;
//# sourceMappingURL=BotManagedServer.js.map