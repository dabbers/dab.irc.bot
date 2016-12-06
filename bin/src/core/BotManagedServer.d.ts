import * as Core from 'dab.irc.core/src';
import * as Manager from 'dab.irc.manager/src';
import * as Parser from 'dab.irc.parser/src';
import { Bot } from './Bot';
export declare class BotManagedServer extends Manager.ManagedServer {
    constructor(bot: Bot, alias: string, context: Core.IConnectionContext, connection: Core.Connection, parser?: Parser.DynamicParser, chanManager?: Manager.ChannelManager);
    emit(event: string, ...args: any[]): void;
    private bot;
}
