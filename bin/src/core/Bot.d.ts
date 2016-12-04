/// <reference types="node" />
import { EventEmitter } from 'events';
import * as Parser from 'dab.irc.parser/src';
import * as Core from 'dab.irc.core/src';
import * as Manager from 'dab.irc.manager/src';
import { BotGroup } from './BotGroup';
import { IBotModuleContext } from './IBotModuleContext';
import { ICommandable } from './ICommandable';
import { ExceptionTypes } from './ICommandable';
export declare class Bot extends Manager.ManagedUser implements Core.IModuleHandler<IBotModuleContext>, IBotModuleContext {
    modules: {
        [name: string]: Core.IModule<IBotModuleContext>;
    };
    readonly alias: string;
    readonly group: BotGroup;
    readonly isBot: boolean;
    constructor();
    load(name: string, noResume?: boolean): Core.IModuleHandler<IBotModuleContext>;
    unload(name: string, persist: boolean): Core.IModuleHandler<IBotModuleContext>;
    say(net: string, destination?: string, message?: string): IBotModuleContext;
    msg(net: string, destination?: string, message?: string): IBotModuleContext;
    notice(net: string, destination?: string, message?: string): IBotModuleContext;
    me(net: string, destination?: string, message?: string): IBotModuleContext;
    action(net: string, destination?: string, message?: string): IBotModuleContext;
    ctcp(net: string, destination: string, action: string, command: string, message?: string): IBotModuleContext;
    join(net: string, channel?: string, password?: string): IBotModuleContext;
    part(net: string, channel?: string, reason?: string): IBotModuleContext;
    raw(net: string, text?: string): IBotModuleContext;
    on(event: string, listener: Function): IBotModuleContext;
    once(event: string, listener: Function): IBotModuleContext;
    emit(event: string, ...args: any[]): IBotModuleContext;
    addListener(event: string, listener: Function): IBotModuleContext;
    removeListener(event: string, listener: Function): IBotModuleContext;
    removeAllListeners(event?: string): IBotModuleContext;
    listeners(event: string): Function[];
    eventNames(): (string | symbol)[];
    addCommand(command: string, options: any, cb: (sender: IBotModuleContext, server: Parser.ParserServer, channel: Core.Channel, message: Core.Message) => any): ICommandable;
    setCommand(command: string, options: any, cb: (sender: IBotModuleContext, server: Parser.ParserServer, channel: Core.Channel, message: Core.Message) => any): ICommandable;
    delCommand(command: string): ICommandable;
    addException(command: string, type: ExceptionTypes, match: string, seconds: number): ICommandable;
    listExceptions(command: string, type: ExceptionTypes): ICommandable;
    delException(command: string, type: ExceptionTypes, index: number): ICommandable;
    addLocationBind(command: string, server: string, channel: string, mode: string): ICommandable;
    listLocationBinds(command: string): ICommandable;
    delLocationBind(command: string, index: number): ICommandable;
    protected events: EventEmitter;
    protected _alias: string;
    protected _group: BotGroup;
    protected _commandable: ICommandable;
}
