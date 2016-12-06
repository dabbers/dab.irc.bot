import * as Parser from 'dab.irc.parser/src';
import * as ircCore from 'dab.irc.core/src';
import * as Manager from 'dab.irc.manager/src';
import { IModuleHandler } from 'dab.irc.core/src';
import { IBotModuleContext } from './IBotModuleContext';
import { ICommandable } from './ICommandable';
import { IGroupConfig } from './ManagedConfig';
import { ExceptionTypes } from './ICommandable';
import { Bot } from './Bot';
import { Core } from './Core';
export declare class BotGroup implements IModuleHandler<IBotModuleContext>, IBotModuleContext {
    readonly modules: {
        [name: string]: ircCore.IModule<IBotModuleContext>;
    };
    readonly alias: string;
    readonly isBot: boolean;
    readonly group: BotGroup;
    readonly bots: {
        [name: string]: Bot;
    };
    tick(): void;
    settings: IGroupConfig;
    load(name: string, noResume?: boolean): IModuleHandler<IBotModuleContext>;
    unload(name: string, persist: boolean): IModuleHandler<IBotModuleContext>;
    say(net: string, destination?: string, message?: string): IBotModuleContext;
    msg(net: string, destination?: string, message?: string): IBotModuleContext;
    notice(net: string, destination?: string, message?: string): IBotModuleContext;
    me(net: string, destination?: string, message?: string): IBotModuleContext;
    action(net: string, destination?: string, message?: string): IBotModuleContext;
    ctcp(net: string, destination: string, action: string, command: string, message?: string): IBotModuleContext;
    join(net: string, channel?: string, password?: string): IBotModuleContext;
    part(net: string, channel?: string, reason?: string): IBotModuleContext;
    raw(net: string, text?: string): IBotModuleContext;
    constructor(alias: string, config: IGroupConfig);
    addBot(bot: Bot): void;
    botCanExecute(bot: Bot, svralias: (string | Manager.ManagedServer), channel: (string | ircCore.Channel)): boolean;
    getBotExecutor(serverAlias: (string | Manager.ManagedServer), channel: (string | ircCore.Channel)): Bot;
    init(context: Core): void;
    resume(context: Core, state: any): void;
    uninit(): any;
    on(event: string, listener: Function): IBotModuleContext;
    once(event: string, listener: Function): IBotModuleContext;
    emit(event: string, ...args: any[]): IBotModuleContext;
    addListener(event: string, listener: Function): IBotModuleContext;
    removeListener(event: string, listener: Function): IBotModuleContext;
    removeAllListeners(event?: string): IBotModuleContext;
    listeners(event: string): Function[];
    eventNames(): (string | symbol)[];
    addCommand(command: string, options: any, cb: (sender: IBotModuleContext, server: Parser.ParserServer, message: ircCore.Message) => any): ICommandable;
    setCommand(command: string, options: any, cb: (sender: IBotModuleContext, server: Parser.ParserServer, message: ircCore.Message) => any): ICommandable;
    delCommand(command: string): ICommandable;
    addException(command: string, type: ExceptionTypes, match: string, seconds: number): ICommandable;
    listExceptions(command: string, type: ExceptionTypes): ICommandable;
    delException(command: string, type: ExceptionTypes, index: number): ICommandable;
    addLocationBind(command: string, server: string, channel: string, mode: string): ICommandable;
    listLocationBinds(command: string): ICommandable;
    delLocationBind(command: string, index: number): ICommandable;
    private events;
    protected _alias: string;
    private _commandable;
    protected moduleHandler: IModuleHandler<IBotModuleContext>;
    protected _bots: {
        [name: string]: Bot;
    };
    protected _channelManager: {
        [alias: string]: Manager.ChannelManager;
    };
}
