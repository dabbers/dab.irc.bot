import * as Parser from 'dab.irc.parser/src';
import * as Core from 'dab.irc.core/src';
import { ICommandable } from './ICommandable';
import { ExceptionTypes } from './ICommandable';
import { SenderChain } from './SenderChain';
export declare class Commandable implements ICommandable {
    constructor(host: ICommandable);
    addCommand(command: string, options: any, cb: (sender: SenderChain, server: Parser.ParserServer, message: Core.Message) => any): ICommandable;
    setCommand(command: string, options: any, cb: (sender: SenderChain, server: Parser.ParserServer, message: Core.Message) => any): ICommandable;
    delCommand(command: string): ICommandable;
    addException(command: string, type: ExceptionTypes, match: string, secondsd: number): ICommandable;
    listExceptions(command: string, type: ExceptionTypes): ICommandable;
    delException(command: string, type: ExceptionTypes, index: number): ICommandable;
    addLocationBind(command: string, server: string, channel: string, mode: string): ICommandable;
    listLocationBinds(command: string): ICommandable;
    delLocationBind(command: string, index: number): ICommandable;
    private _host;
}
