import * as Core from 'dab.irc.core/src';
import * as Manager from 'dab.irc.manager/src';
import * as Parser from 'dab.irc.parser/src';
import {Bot} from './Bot';
import {SenderChain} from './SenderChain';
import {IBotModuleContext} from './IBotModuleContext';

export class BotManagedServer extends Manager.ManagedServer {

    constructor(bot:Bot, alias: string, context: Core.IConnectionContext, connection: Core.Connection,
            parser?: Parser.DynamicParser, chanManager?: Manager.ChannelManager) {
        super(alias, context, connection, parser, chanManager);

        this.bot = bot;
    }

    emit(event: string, ...args:any[]) {
        // args[0] = server, args[1] = message
        // Our ParserServer still relies on its own events for some things
        // as does ManagedServer. Make sure to emit events like normal first.
        let arg2:any[] = args.slice(0);
        arg2.splice(0,0, event);
        
        super.emit.apply(this, arg2);


        // inject the bot as a sender argument for the callbacks.
        // arguments should now be: event, sender, server (this), message
        let sc:SenderChain = null;
        if (args[1] instanceof Parser.ConversationMessage) {
            let m = (<Parser.ConversationMessage>args[1]);
            sc = new SenderChain(SenderChain.proxyActionsForShortcuts(this.bot, m, this.alias));
        }
        else {
            sc = new SenderChain(this.bot);
        }
        args.splice(0, 0, event, sc);
        this.bot.emit.apply(this.bot, args);
    }

    private bot : Bot;
}