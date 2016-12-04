import {EventEmitter} from 'events';
import * as Parser from 'dab.irc.parser/src';
import * as ircCore from 'dab.irc.core/src';

import {IModuleHandler} from 'dab.irc.core/src';
import {IBotModuleContext} from './IBotModuleContext';
import {ICommandable} from './ICommandable';
import {IGroupConfig} from './ManagedConfig';
import {IBotConfig} from './ManagedConfig';
import {Commandable} from './Commandable';
import {ExceptionTypes} from './ICommandable';
import {ModuleHandler} from './ModuleHandler';
import {Bot} from './Bot';
import {Core} from './Core';

export class BotGroup implements IModuleHandler<IBotModuleContext>, IBotModuleContext {

    public get modules(): {[name:string] : ircCore.IModule<IBotModuleContext> } {
        return (<ModuleHandler>this.moduleHandler).modules;
    }
    public get alias() : string {
        return this._alias;
    }
    public get isBot() : boolean {
        return false;
    }
    public get group() : BotGroup {
        return this;
    }

    public get bots() : { [name:string] : Bot} {
        return this._bots;
    }

    public settings : IGroupConfig;

    public load(name: string, noResume?:boolean) : IModuleHandler<IBotModuleContext> {
        return this.moduleHandler.load(name);
    }
    public unload(name: string, persist: boolean) : IModuleHandler<IBotModuleContext> {
        return this.moduleHandler.unload(name, persist);
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
    

    constructor(alias:string, config:IGroupConfig) {
        this._alias = alias;
        this.settings = JSON.parse(JSON.stringify(config));
        this._commandable = new Commandable(this);
        this.moduleHandler = new ModuleHandler(this);
        this.events = new EventEmitter();

    }

    addBot(bot:Bot) {
        if (this.bots[bot.alias]) {
            return;
        }

        

    }

    // Create a new instance of this module. Initialize and do things as needed
    init(context : Core) : void {
        for(var botAlias in this.settings.Bots) {
            
        }
    }
    // We are resuming a persisted state (either in memory or from disk)
    resume(context:Core, state : any) : void {

    }
    // Unloading this module. Return an optional state to store for reloading
    uninit() : any {

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

    addCommand(command:string, options:any, cb:(sender: IBotModuleContext, server:Parser.ParserServer, channel:ircCore.Channel, message:ircCore.Message) => any) : ICommandable {
        return this._commandable.addCommand(command, options, cb);
    }
    setCommand(command:string, options:any, cb:(sender: IBotModuleContext, server:Parser.ParserServer, channel:ircCore.Channel, message:ircCore.Message) => any) : ICommandable{
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
    private events :EventEmitter;
    protected _alias:string;
    private _commandable:ICommandable;
    protected moduleHandler:IModuleHandler<IBotModuleContext>;
    protected _bots:{ [name:string] : Bot} = {};
}