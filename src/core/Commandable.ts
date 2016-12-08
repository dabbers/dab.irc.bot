import * as Parser from 'dab.irc.parser/src';
import * as Core from 'dab.irc.core/src';
import * as CoreStuff from './Core';
import {IBotModuleContext} from './IBotModuleContext';
import {ICommandable} from './ICommandable';
import {ExceptionTypes} from './ICommandable';
import {SenderChain} from './SenderChain';
import {ICommandSettings} from './ManagedConfig';
import {ManagedServer} from 'dab.irc.manager/src';
import {BotGroup} from './BotGroup';

export class Commandable implements ICommandable {
    constructor(host:ICommandable) {
        this._host = host;
        this._commands = {};
    }
    onPrivmsg(sender: SenderChain, server:Parser.ParserServer, message:Core.Message):void {
        let command = message.firstWord.toLocaleLowerCase();
        if (! this._commands[command]) {
            return;
        }

        this._commands[command].code(sender, server, message);
    }

    addCommand(command:string, options:ICommandSettings, cb:(sender: SenderChain, server:ManagedServer, message:Core.Message) => any) : ICommandable {
        if (!options) {
            options = JSON.parse(JSON.stringify((<any>global).Core.defaults.commandOptions));
        }

        command = command.toLocaleLowerCase();

        let defOpt = JSON.parse(JSON.stringify((<any>global).Core.defaults.commandOptions));

        for (let key in defOpt) {
            if (defOpt.hasOwnProperty(key) && (<any>options)[key] == undefined) {
                (<any>options)[key] = defOpt[key];
            }
        }

        options.timer *= 1000;

        if (options.persist) {
            this._isDirty = true;
        }

        options.code = cb;

        this._commands[command] = options;
        
        return this._host;
    }
    setCommand(command:string, options:ICommandSettings, cb:(sender: SenderChain, server:ManagedServer, message:Core.Message) => any) : ICommandable {
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
    private _commands: { [cmd:string] : ICommandSettings } = {};
    private _isDirty: boolean = false;
} 