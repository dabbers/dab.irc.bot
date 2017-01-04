import {EventEmitter} from 'events';
import * as Parser from 'dab.irc.parser/src';
import * as ircCore from 'dab.irc.core/src';
import * as Manager from 'dab.irc.manager/src';

import {IModuleHandler} from 'dab.irc.core/src';
import {IBotModuleContext} from './IBotModuleContext';
import {ICommandable} from './ICommandable';
import {IGroupConfig} from './ManagedConfig';
import {IBotConfig} from './ManagedConfig';
import {INetworkConfig} from './ManagedConfig';
import {ICommandSettings} from './ManagedConfig';
import {Commandable} from './Commandable';
import {ExceptionTypes} from './ICommandable';
import {ModuleHandler} from './ModuleHandler';
import {Bot} from './Bot';
import {BotManagedServer} from './BotManagedServer';
import {BotConnectionContext} from './BotConnectionContext';
import {SenderChain} from './SenderChain';
import * as coreStuff from './Core';

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

    public get commands(): { [cmd:string] : ICommandSettings }  {
        return this._commandable.commands;
    }

    public tick() : void {
        for(let i in this.bots) {
            this.bots[i].emit('tick');
        }
    }
    hasNetwork(alias:string) : boolean {
        return (this._channelManager[alias] != undefined);
    }
    get networks(): {[alias:string]:Manager.ChannelManager} { 
        return this._channelManager;
    }
    public settings : IGroupConfig;

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
        return this.raw(net, action + " " + destination + " :\x01" + command + " " + message + "\x01");;
    }
    join(net:string, channel:string, password?:string) : IBotModuleContext {
        return this.raw(net, "JOIN " + channel + " " + password);
    }
    part(net:string, channel:string, reason?:string) : IBotModuleContext {
        return this.raw(net, "PART " + channel + " :" + (reason|| "") );
    }
    raw(net:string, text:string) : IBotModuleContext {
        for(let bot in this.bots) {
            this.rawBot(net, this.bots[bot], text);
        }
        return this;
    }

    rawBot(net:string, bot:Bot, text:string) :IBotModuleContext {
        bot.servers[net].connection.write(text);
        return this;
    }
    
    constructor(alias:string, config:IGroupConfig) {
        this._alias = alias;
        this.settings = JSON.parse(JSON.stringify(config));
        this._commandable = new Commandable(this);
        this.moduleHandler = new ModuleHandler(this);
        this.events = new EventEmitter();

        this.on('tick', this.tick);

        let apl = (sender: SenderChain, server:Manager.ManagedServer, message:ircCore.Message) => {
            (<Commandable>this._commandable).onPrivmsg(sender, server, message);
        };

        this.on(Parser.Events.PRIVMSG, apl);

        let rawCmd = this.settings.RawCommandPrefix || (this.settings.CommandPrefix + this.settings.CommandPrefix);
        let rawOptions : ICommandSettings = {
            locationbinds : undefined,
            level: 3,
            allowpm: true,
            persist: false,
            timer: 0,
            hidden: true,
            exceptions: undefined,
            code: undefined
        };
        let rawCode = (sender: SenderChain, server:Manager.ManagedServer, message:ircCore.Message) => {

            let bot = sender.bot;

            let group = sender.group; // alias/shortcut
            let channel = (<Parser.ConversationMessage>message).destination;
            const Core = coreStuff.Core;

            try {
                var re = eval( message.tokenized.splice(4).join(" ") );
                
                if (re != undefined && re != null) {
                    var lines = re.toString().split("\n");
                    
                    for(var i in lines)
                    {
                        bot.say(server.alias, channel.target, lines[i]);
                    }
                }
            }
            catch(exception) {
                bot.say(server.alias, channel.target, "[RAWERR] " + exception);
            }
        };
        this.addCommand(rawCmd, rawOptions, rawCode);
        this.addCommand("test", (<any>global).Core.defaults.commandOptions, (s,ser,me) => {s.bot.say(ser.alias, (<Parser.ConversationMessage>me).destination.target, "test")});

        let loginCmd = "login";
        let loginOptions : ICommandSettings = {
            locationbinds : undefined,
            level: 3,
            allowpm: true,
            persist: false,
            timer: 0,
            hidden: true,
            exceptions: undefined,
            code: undefined
        };
        let loginCode =  (sender: SenderChain, server:Manager.ManagedServer, message:ircCore.Message) => {
            let m = (<Parser.ConversationMessage>message);
            let logres = false;

            // Don't let servers authenticate. That'd be weird...
            if (m.from instanceof ircCore.User) {
                logres = this.attemptLogin(server.alias, m.from.nick, m.from.ident, m.from.host, m.tokenized[4]);
            }
            sender.bot.say(server.alias, m.destination.target, (logres ? "Success! Logged in" : "Failed to login"));
        }
        this.addCommand(loginCmd, loginOptions, loginCode);
    }

    addBot(bot:Bot) {
        if (this.bots[bot.alias]) {
            return;
        }

        let onconnect = (sender:SenderChain, server:Manager.ManagedServer, message:ircCore.Message) => {
            for(let network in this.settings.Networks) {
                if (this.settings.Networks[network].Network == server.alias) {
                    this.settings.Networks[network].Channels.forEach( (v, i, a) => {
                        bot.servers[server.alias].connection.write("JOIN " + v );
                    });

                    break;
                }
            }
        }

        bot.on(Parser.Numerics.ENDOFMOTD, onconnect);
        bot.on(Parser.Numerics.ERR_NOMOTD, onconnect);

        bot.on(Parser.Events.PRIVMSG, (sender:SenderChain, server:Manager.ManagedServer, m: ircCore.Message) => {
            if (m instanceof Parser.ConversationMessage) {
                if (!this.botCanExecute(sender.bot, server, m.destination)) return;

                let sc = new SenderChain(sender.bot, SenderChain.proxyActionsForShortcuts(this, m, server.alias));
                this.emit(Parser.Events.PRIVMSG, sc, server, m, bot);
            }
        });

        this.bots[bot.alias] = bot;
    }

    delBot(bot:Bot) {
        if (this.bots[bot.alias]) {
            delete this.settings.Bots[bot.alias];
            for(let n in bot.servers) {
                // Clear our out buffer so our QUIT message will send immediately
                bot.servers[n].connection.clear();
                bot.servers[n].connection.write("QUIT :dab.irc.bot Framework v" + (<any>global).Core.version);
                bot.servers[n].connection.disconnect();
            }

            delete this.bots[bot.alias];
        }
    }

    // By default, any bot in a private message is capable of being an executor.
    // Channels are the only places a bot executor is decided in. 
    botCanExecute(bot:Bot, svralias:(string|Manager.ManagedServer), channel:(string|ircCore.Target.ITarget)) : boolean {
        let svr:string = null;
        let chan:string = null;

        let allbots = Object.keys(this.bots);

        if (svralias instanceof Manager.ManagedServer) {
            svr = svralias.alias;
        }
        else {
            svr = svralias;
        }

        if (typeof channel != "string") {
            chan = channel.target;
        }
        else {
            chan = channel;
        }

        return (!bot.servers[svr].isChannel(chan) || this.getBotExecutor(svralias, channel).alias == bot.alias);
    }

    // Will return null if no bot (use the bot you're checking against or the first bot)
    getBotExecutor(serverAlias:(string|Manager.ManagedServer), channel:(string|ircCore.Target.ITarget)) : Bot {
        let svr:string = null;
        let chan:string = null;
        let bot:Bot = null;

        let allbots = Object.keys(this.bots);
        if (serverAlias instanceof Manager.ManagedServer) {
            svr = serverAlias.alias;
        }
        else {
            svr = serverAlias;
        }

        if (typeof channel != "string") {
            chan = channel.target;
        }
        else {
            chan = channel;
        }

        for(let botnick in this.bots) {
            if (!this._channelManager[svr].channel[chan]) continue;
            
            if (this._channelManager[svr].channel[chan].users[ botnick ]) {
                bot = this.bots[ botnick ];
                break;
            }
        }

        return bot;
    }
    
    // Create a new instance of this module. Initialize and do things as needed
    init(context : coreStuff.Core) : void {
        for(let botAlias in this.settings.Bots) {
            let bot = (<any>global).Core.addBot(this, botAlias, this.settings.Bots[botAlias]);
            this.addBot(bot);
        }

        for(let modid in this.settings.Modules) {
            this.load( this.settings.Modules[modid] );
        }

        for (let net in this.settings.Networks) {
            this.connect(this.settings.Networks[net].Network);
        }
    }
    // We are resuming a persisted state (either in memory or from disk)
    resume(context:coreStuff.Core, state : any) : void {

    }
    // Unloading this module. Return an optional state to store for reloading
    uninit() : any {

    }

    connect(network:string, connectionString?:(string|string[])) {
        if (connectionString && !(<any>global).Core.config.Networks[network]) {
            if (!(connectionString instanceof Array)) {
                connectionString = [connectionString];
            }
            (<any>global).Core.config.Networks[network] = connectionString;
        }

        if (this._channelManager[network]) {
            // make sure all bots are connected:
            for(let bot in this.bots) {
                if (!this.bots[bot].servers[network].connection.connected) {
                    // Reconnect the bot if they aren't connected.
                    this.bots[bot].servers[network].connection.init(this.bots[bot].servers[network].connection.context, true);
                }
            }
            return;
        }

        let cm = new Manager.ChannelManager();
        this._channelManager[network] = cm;

        for(let bot in this.bots) {
            let net = (<any>global).Core.randomServer(network);
            let user = new ircCore.User(this.bots[bot].settings.Nick, this.bots[bot].settings.Ident, null);
            user.name = (<any>global).Core.config.OwnerNicks + "'s bot";

            let bcc = new BotConnectionContext(user, net.host, net.port, net.ssl, (<any>global).Core.config.ValidateSslCerts);
            let con : ircCore.Connection = new ircCore.Connection();
            let bms =  new BotManagedServer(this.bots[bot], network, bcc, con, undefined, cm);
            this.bots[bot].connect(network,bms);

            // We want to wait to connect until all of our objects have created their callbacks
            // so they can listen to all the incoming messages from the connection.
            con.init(bcc, true);
        }
    }

    disconnect(alias:string) {
        for(let bot in this.bots) {
            if (this.bots[bot].servers[alias]) {
                // Clear our out buffer so our QUIT message will send immediately
                this.bots[bot].servers[alias].connection.clear();
                this.bots[bot].servers[alias].connection.write("QUIT :dab.irc.bot Framework v" + (<any>global).Core.version);
                this.bots[bot].servers[alias].connection.disconnect();
            }
        }
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

    addCommand(command:string, options:ICommandSettings, cb:(sender: SenderChain, server:Manager.ManagedServer, message:ircCore.Message) => any) : ICommandable {
        return this._commandable.addCommand(command, options, cb);
    }
    setCommand(command:string, options:ICommandSettings, cb:(sender: SenderChain, server:Manager.ManagedServer, message:ircCore.Message) => any) : ICommandable{
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

    private attemptLogin(alias:string, nick:string, ident:string, host:string, password:string) : boolean {
        if (!this.hasNetwork(alias)) return false;
        let auths = (<any>global).Core.config.Auth;
        for(let i =0; i < auths.length; i++) {
            if (auths[i].BotGroup && auths[i].BotGroup.indexOf(this.alias) == -1) continue;

            let parts = auths[i].login.replace(/\./g, "\\.").replace(/\*/g, ".*").split(/[!@]/);
            if (new RegExp(parts[0]).test(nick) && new RegExp(parts[1]).test(ident) &&
                    new RegExp(parts[2]).test(host)) {
                
                let enc: Function = new Function("pw", auths[i].encryption);//eval("function enc(pw) " + auths[i].encryption);

                if (enc(password) == auths[i].encryption) {
                    if (! this.logins[alias]) this.logins[alias] = {};
                    this.logins[alias][nick] = auths[i].level;
                    return true;
                }
            }
        }
        return false;
    }
    private events :EventEmitter;
    protected _alias:string;
    private _commandable:ICommandable;
    private logins: { [alias:string] : { [nick:string] : number} } = {};
    protected moduleHandler:IModuleHandler<IBotModuleContext>;
    protected _bots:{ [name:string] : Bot} = {};
    protected _channelManager :  {[alias:string] : Manager.ChannelManager} = {};
}