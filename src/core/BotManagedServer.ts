import * as Core from 'dab.irc.core/src';
import * as Manager from 'dab.irc.manager/src';
import * as Parser from 'dab.irc.parser/src';
import {Bot} from './Bot';
import {SenderChain} from './SenderChain';

export class BotManagedServer extends Manager.ManagedServer {

    constructor(bot:Bot, alias: string, context: Core.IConnectionContext, connection: Core.Connection,
            parser?: Parser.DynamicParser, chanManager?: Manager.ChannelManager) {
        super(alias, context, connection, parser, chanManager);

        this.bot = bot;
    }

    emit(event: string, ...args:any[]) {
        // Our ParserServer still relies on its own events for some things
        // as does ManagedServer. Make sure to emit events like normal first.
        super.emit.apply(super.emit, args);

        // inject the bot as a sender argument for the callbacks.
        // arguments should now be: event, sender, server (this), message
        args.splice(0, 0, event, new SenderChain(this.bot));
        this.bot.emit.apply(this.bot, args);
    }

    private bot : Bot;
}