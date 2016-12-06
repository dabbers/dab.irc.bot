import * as Parser from 'dab.irc.parser/src';
import * as Core from 'dab.irc.core/src';

import {IBotModuleContext} from './IBotModuleContext';
import {ICommandable} from './ICommandable';
import {ExceptionTypes} from './ICommandable';
import {SenderChain} from './SenderChain';


export class Commandable implements ICommandable {
    constructor(host:ICommandable) {
        this._host = host;
    }
    addCommand(command:string, options:any, cb:(sender: SenderChain, server:Parser.ParserServer, message:Core.Message) => any) : ICommandable {
        return this._host;
    }
    setCommand(command:string, options:any, cb:(sender: SenderChain, server:Parser.ParserServer, message:Core.Message) => any) : ICommandable {
        return this._host;
    }
    delCommand(command:string) : ICommandable {
        return this._host;
    }
    
    addException(command:string, type:ExceptionTypes, match:string, secondsd:number) : ICommandable {
        return this._host;
    }
    listExceptions(command:string, type:ExceptionTypes) : ICommandable {
        return this._host;
    }
    delException(command:string, type:ExceptionTypes, index:number) : ICommandable {
        return this._host;
    }

    addLocationBind(command:string, server:string, channel:string, mode:string) : ICommandable {
        return this._host;
    }
    listLocationBinds(command:string) : ICommandable {
        return this._host;
    }
    delLocationBind(command: string, index:number) {
        return this._host;
    }
    private _host:ICommandable;
} 