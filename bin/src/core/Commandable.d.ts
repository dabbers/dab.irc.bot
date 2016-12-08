import * as Parser from 'dab.irc.parser/src';
import * as Core from 'dab.irc.core/src';
import { ICommandable } from './ICommandable';
import { ExceptionTypes } from './ICommandable';
import { SenderChain } from './SenderChain';
import { ICommandSettings } from './ManagedConfig';
import { ManagedServer } from 'dab.irc.manager/src';
export declare class Commandable implements ICommandable {
    constructor(host: ICommandable);
    onPrivmsg(sender: SenderChain, server: Parser.ParserServer, message: Core.Message): void;
    addCommand(command: string, options: ICommandSettings, cb: (sender: SenderChain, server: ManagedServer, message: Core.Message) => any): ICommandable;
    setCommand(command: string, options: ICommandSettings, cb: (sender: SenderChain, server: ManagedServer, message: Core.Message) => any): ICommandable;
    delCommand(command: string): ICommandable;
    addException(command: string, type: ExceptionTypes, match: string, secondsd: number): ICommandable;
    listExceptions(command: string, type: ExceptionTypes): ICommandable;
    delException(command: string, type: ExceptionTypes, index: number): ICommandable;
    addLocationBind(command: string, server: string, channel: string, mode: string): ICommandable;
    listLocationBinds(command: string): ICommandable;
    delLocationBind(command: string, index: number): ICommandable;
    private _host;
    private _commands;
    private _isDirty;
}
