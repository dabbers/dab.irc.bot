import {EventEmitter} from 'events';
import * as Parser from 'dab.irc.parser/src';
import * as ircCore from 'dab.irc.core/src';
import * as Manager from 'dab.irc.manager/src';

import {IModuleHandler} from 'dab.irc.core/src';
import {IBotModuleContext} from './IBotModuleContext';
import {ICommandable} from './ICommandable';
import {IDelayedCommandConfig} from './ManagedConfig';
import {IBotConfig} from './ManagedConfig';
import {BotGroup} from './BotGroup';
import {Core} from './Core';
import {Commandable} from './Commandable';
import {ExceptionTypes} from './ICommandable';
import {BotManagedServer} from './BotManagedServer';
import {ModuleHandler} from './ModuleHandler';
import {SenderChain} from './SenderChain';

export class Bot extends Manager.ManagedUser implements ircCore.IModuleHandler<IBotModuleContext>, IBotModuleContext {
    
    public get modules(): {[name:string] : ircCore.IModule<IBotModuleContext> } {
        return (<ModuleHandler>this.moduleHandler).modules;
    }

    public get alias() : string {
        return this._alias;
    }
    public get group() : BotGroup {
        return this._group;
    }

    public get isBot() : boolean {
        return true;
    }

    public tick() : void {
        for(let i in this.servers) {
            this.servers[i].connection.tick();
        }
    }

    public settings : IBotConfig;

    public servers: { [alias: string] : BotManagedServer } = {};

    constructor(alias: string, group: BotGroup, settings: IBotConfig) {
        super(settings.Nick, settings.Ident, null);

        this.name = Core.config.OwnerNicks + "'s bot";
        this._group = group;
        this._alias = alias;
        this.settings = settings;

        this._commandable = new Commandable(this);
        this.events = new EventEmitter();
        this.moduleHandler = new ModuleHandler(this);

        for(let modid in this.settings.Modules) {
            this.load(this.settings.Modules[modid]);
        }
        let onconnect = (sender:IBotModuleContext, server:Manager.ManagedServer, message:ircCore.Message) => {
            for(let chanidx in this.settings.Channels[server.alias]) {
                this.servers[server.alias].connection.write("JOIN " + this.settings.Channels[server.alias][chanidx]);
            }

            for(var cmd in this.settings.Commands[server.alias]) {
                let cm = this.settings.Commands[server.alias][cmd];

                if ((<any>cm).delay) {
                    setTimeout(function(svr, cmd) { return function() {
                        svr.connection.write(cmd);
                    }}(this.servers[server.alias], (<IDelayedCommandConfig>cm).command),  (<IDelayedCommandConfig>cm).delay);
                }
                else {
                    this.servers[server.alias].connection.write(cm);
                }
            }
        }
        this.on(Parser.Numerics.ENDOFMOTD, onconnect);
        this.on(Parser.Numerics.ERR_NOMOTD, onconnect);

        this.on(Parser.Events.PRIVMSG, (sender:IBotModuleContext, server:Manager.ManagedServer, message:ircCore.Message) => {
            let m = (<Parser.ConversationMessage>message);

            if (m.ctcp == true && m.messageTags["intent"] == "VERSION") {
                this.ctcp(server.alias, m.from.target, "NOTICE", "VERSION", "dab.irc.bot v" + Core.version);
            }
        });
        this.on(Parser.Events.JOIN, (sender:IBotModuleContext, server:Manager.ManagedServer, message:ircCore.Message) => {
            // Make sure we're the ones joining
            let m = (<Parser.ChannelUserChangeMessage>message);
            if (message.from.target != this.nick) {
                return;
            }
		    
            // Is this channel already in the config?
            if (this.settings.Channels[server.alias] && this.settings.Channels[server.alias].filter((ch) => ch==m.destination.target).length > 0) {
                return;
            }

            // Is this a group stored channel?
            let groupNetworkSetting = this.group.settings.Networks.filter(function (net) { return net.Network == server.alias; });
            if (groupNetworkSetting.length !=0 && groupNetworkSetting[0].Channels.filter( (ch) => ch == m.destination.target).length != 0) {
                return;
            }

            // Make sure the network exists in our channel array first
            if (!this.settings.Channels[server.alias]) {
                this.settings.Channels[server.alias] = [];
            }

            // Store this channel. Our config object will automatically save.
            this.settings.Channels[server.alias].push(m.destination.target);
        });
        this.on(Parser.Events.PART, (sender:IBotModuleContext, server:Manager.ManagedServer, message:ircCore.Message) => {
            if (message.from.target != this.nick) {
                return;
            }

            let m = (<Parser.ChannelUserChangeMessage>message);

            for(let i = 0; i < this.settings.Channels[server.alias].length; i++) {
                if (this.settings.Channels[server.alias][i] == m.destination.target) {
                    this.settings.Channels[server.alias].splice(i,1);
                    break;
                }
            }
        });
    }

    connect(alias:string, server:BotManagedServer) {
        this.servers[alias] = server;
    }

    disconnect(alias:string, quitmsg:string = "dab.irc.bot framework v" + Core.version) {
        if (this.servers[alias]) {
            this.servers[alias].connection.write("QUIT :" + quitmsg);
        }
    }

    // Create a new instance of this module. Initialize and do things as needed
    init(context : Core) : void {

    }
    // We are resuming a persisted state (either in memory or from disk)
    resume(context:Core, state : any) : void {
        
    }
    // Unloading this module. Return an optional state to store for reloading
    uninit() : any {

    }

    public load(name: string, noResume?:boolean) : IModuleHandler<IBotModuleContext> {
        return this.moduleHandler.load(name);
    }
    public unload(name: string, persist: boolean) : IModuleHandler<IBotModuleContext> {
        return this.moduleHandler.unload(name, persist);
    }

    say(net:string, destination:string, message:string) : IBotModuleContext {
        return this.msg(net, destination, message);
    }
    msg(net:string, destination:string, message:string) : IBotModuleContext {
        return this.raw(net, "PRIVMSG " + destination + " :" + message);
    }
    notice(net:string, destination:string, message:string) : IBotModuleContext {
        return this.raw(net, "NOTICE " + destination + " :" + message);
    }
    me(net:string, destination:string, message:string) : IBotModuleContext {
        return this.action(net, destination, message);
    }
    action(net:string, destination:string, message:string) : IBotModuleContext {
        return this.ctcp(net, destination, "PRIVMSG", "ACTION", message);
    }
    ctcp(net:string, destination:string, action:string, command:string, message:string) : IBotModuleContext {
        return this.raw(net, action + " " + destination + " :\001" + command + " " + message + "\001");;
    }
    join(net:string, channel:string, password?:string) : IBotModuleContext {
        return this.raw(net, "JOIN " + channel + " " + password);
    }
    part(net:string, channel:string, reason?:string) : IBotModuleContext {
        return this.raw(net, "PART " + channel + " :" + (reason|| "") );
    }
    raw(net:string, text:string) : IBotModuleContext {
        this.servers[net].connection.write(text);
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


    addCommand(command:string, options:any, cb:(sender: SenderChain, server:Parser.ParserServer, message:ircCore.Message) => any) : ICommandable {
        return this._commandable.addCommand(command, options, cb);
    }
    setCommand(command:string, options:any, cb:(sender: SenderChain, server:Parser.ParserServer, message:ircCore.Message) => any) : ICommandable{
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
    protected moduleHandler:IModuleHandler<IBotModuleContext>;
}