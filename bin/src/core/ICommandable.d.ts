import * as Parser from 'dab.irc.parser/src';
import * as Core from 'dab.irc.core/src';
import { SenderChain } from './SenderChain';
import { ICommandSettings } from './ManagedConfig';
export declare enum ExceptionTypes {
    Channels = 0,
    Users = 1,
    Chanmodes = 2,
    Levels = 3,
}
export interface ICommandable {
    commands: {
        [cmd: string]: ICommandSettings;
    };
    addCommand(command: string, options: ICommandSettings, cb: (sender: SenderChain, server: Parser.ParserServer, message: Core.Message) => any): ICommandable;
    setCommand(command: string, options: ICommandSettings, cb: (sender: SenderChain, server: Parser.ParserServer, message: Core.Message) => any): ICommandable;
    delCommand(command: string): ICommandable;
    addException(command: string, type: ExceptionTypes, match: string, secondsd: number): ICommandable;
    listExceptions(command: string, type: ExceptionTypes): ICommandable;
    delException(command: string, type: ExceptionTypes, index: number): ICommandable;
    addLocationBind(command: string, server: string, channel: string, mode: string): ICommandable;
    listLocationBinds(command: string): ICommandable;
    delLocationBind(command: string, index: number): ICommandable;
}
