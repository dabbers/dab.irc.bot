import {EventEmitter} from 'events';
import * as Parser from 'dab.irc.parser/src';
import * as Core from 'dab.irc.core/src';
import * as Manager from 'dab.irc.manager/src';

import {BotGroup} from './BotGroup';
import {IBotModuleContext} from './IBotModuleContext';
import {ICommandable} from './ICommandable';
import {Commandable} from './Commandable';
import {ExceptionTypes} from './ICommandable';

export class Bot extends Manager.ManagedUser implements Core.IModuleHandler<IBotModuleContext>, IBotModuleContext {
    
    modules: {[name:string] : Core.IModule<IBotModuleContext> };
    public get alias() : string {
        return this._alias;
    }
    public get group() : BotGroup {
        return this._group;
    }

    public get isBot() : boolean {
        return true;
    }

    constructor() {
        super("", null, null);

        this._commandable = new Commandable(this);
        this.events = new EventEmitter();
    }

    public load(name: string, noResume?:boolean) : Core.IModuleHandler<IBotModuleContext> {

        return this;
    }
    public unload(name: string, persist: boolean) : Core.IModuleHandler<IBotModuleContext> {
        return this;
    }

    say(net:string, destination?:string, message?:string) : IBotModuleContext {
        return this;
    }
    msg(net:string, destination?:string, message?:string) : IBotModuleContext {
        return this;
    }
    notice(net:string, destination?:string, message?:string) : IBotModuleContext {
        return this;
    }
    me(net:string, destination?:string, message?:string) : IBotModuleContext {
        return this;
    }
    action(net:string, destination?:string, message?:string) : IBotModuleContext {
        return this;
    }
    ctcp(net:string, destination:string, action:string, command:string, message?:string) : IBotModuleContext {
        return this;
    }
    join(net:string, channel?:string, password?:string) : IBotModuleContext {
        return this;
    }
    part(net:string, channel?:string, reason?:string) : IBotModuleContext {
        return this;
    }
    raw(net:string, text?:string) : IBotModuleContext {
        return this;
    }

    ///
    /// Recreating the event listener methods
    ///
    on(event : string, listener: Function ) : IBotModuleContext {
        this.events.on(event, listener);
        return this;
    }
    once(event: string, listener: Function) : IBotModuleContext {
        this.events.once(event, listener);
        return this;
    }
    emit(event: string, ...args:any[]) : IBotModuleContext {
        args.splice(0, 0, event);

        this.events.emit.apply(this.events, args);
        return this;
    }
    addListener(event: string, listener: Function) : IBotModuleContext {
        this.on(event, listener);
        return this;
    }
    removeListener(event: string, listener: Function) : IBotModuleContext {
        this.events.removeListener(event, listener);
        return this;
    }
    removeAllListeners(event?: string) : IBotModuleContext {
        this.events.removeAllListeners(event);
        return this;
    }
    listeners(event: string) : Function[] {
        return this.events.listeners(event);
    }
    eventNames() : (string|symbol)[] {
        return this.events.eventNames();
    }
    ///
    /// End recreating event listener methods
    ///


    addCommand(command:string, options:any, cb:(sender: IBotModuleContext, server:Parser.ParserServer, channel:Core.Channel, message:Core.Message) => any) : ICommandable {
        return this._commandable.addCommand(command, options, cb);
    }
    setCommand(command:string, options:any, cb:(sender: IBotModuleContext, server:Parser.ParserServer, channel:Core.Channel, message:Core.Message) => any) : ICommandable{
        return this._commandable.setCommand(command, options, cb);
    }
    delCommand(command:string) : ICommandable {
        return this._commandable.delCommand(command);
    }
    
    addException(command:string, type:ExceptionTypes, match:string, seconds:number) : ICommandable {
        return this._commandable.addException(command, type, match, seconds);
    }

    listExceptions(command:string, type:ExceptionTypes) : ICommandable {
        return this._commandable.listExceptions(command, type);
    }
    delException(command:string, type:ExceptionTypes, index:number) : ICommandable {
        return this._commandable.delException(command, type, index);
    }

    addLocationBind(command:string, server:string, channel:string, mode:string) : ICommandable {
        return this._commandable.addLocationBind(command, server, channel, mode);
    }
    listLocationBinds(command:string) : ICommandable {
        return this._commandable.listLocationBinds(command);
    }
    delLocationBind(command: string, index:number) {
        return this._commandable.delLocationBind(command, index);
    }

    protected events :EventEmitter;
    protected _alias:string;
    protected _group:BotGroup;
    protected _commandable:ICommandable;
}