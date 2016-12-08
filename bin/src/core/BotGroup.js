"use strict";
const events_1 = require('events');
const Parser = require('dab.irc.parser/src');
const ircCore = require('dab.irc.core/src');
const Manager = require('dab.irc.manager/src');
const Commandable_1 = require('./Commandable');
const ModuleHandler_1 = require('./ModuleHandler');
const BotManagedServer_1 = require('./BotManagedServer');
const BotConnectionContext_1 = require('./BotConnectionContext');
const SenderChain_1 = require('./SenderChain');
const coreStuff = require('./Core');
class BotGroup {
    constructor(alias, config) {
        this.logins = {};
        this._bots = {};
        this._channelManager = {};
        this._alias = alias;
        this.settings = JSON.parse(JSON.stringify(config));
        this._commandable = new Commandable_1.Commandable(this);
        this.moduleHandler = new ModuleHandler_1.ModuleHandler(this);
        this.events = new events_1.EventEmitter();
        this.on('tick', this.tick);
        let apl = (sender, server, message) => {
            this._commandable.onPrivmsg(sender, server, message);
        };
        this.on(Parser.Events.PRIVMSG, apl);
        let rawCmd = this.settings.RawCommandPrefix || (this.settings.CommandPrefix + this.settings.CommandPrefix);
        let rawOptions = {
            locationbinds: undefined,
            level: 3,
            allowpm: true,
            persist: false,
            timer: 0,
            hidden: true,
            exceptions: undefined,
            code: undefined
        };
        let rawCode = (sender, server, message) => {
            let bot = sender.bot;
            let group = sender.group;
            let channel = message.destination;
            const Core = coreStuff.Core;
            try {
                var re = eval(message.tokenized.splice(4).join(" "));
                if (re != undefined && re != null) {
                    var lines = re.toString().split("\n");
                    for (var i in lines) {
                        bot.say(server.alias, channel.target, lines[i]);
                    }
                }
            }
            catch (exception) {
                bot.say(server.alias, channel.target, "[RAWERR] " + exception);
            }
        };
        this.addCommand(rawCmd, rawOptions, rawCode);
        this.addCommand("test", global.Core.defaults.commandOptions, (s, ser, me) => { s.bot.say(ser.alias, me.destination.target, "test"); });
        let loginCmd = "login";
        let loginOptions = {
            locationbinds: undefined,
            level: 3,
            allowpm: true,
            persist: false,
            timer: 0,
            hidden: true,
            exceptions: undefined,
            code: undefined
        };
        let loginCode = (sender, server, message) => {
            let m = message;
            let logres = false;
            if (m.from instanceof ircCore.User) {
                logres = this.attemptLogin(server.alias, m.from.nick, m.from.ident, m.from.host, m.tokenized[4]);
            }
            sender.bot.say(server.alias, m.destination.target, (logres ? "Success! Logged in" : "Failed to login"));
        };
        this.addCommand(loginCmd, loginOptions, loginCode);
    }
    get modules() {
        return this.moduleHandler.modules;
    }
    get alias() {
        return this._alias;
    }
    get isBot() {
        return false;
    }
    get group() {
        return this;
    }
    get bots() {
        return this._bots;
    }
    tick() {
        for (let i in this.bots) {
            this.bots[i].emit('tick');
        }
    }
    hasNetwork(alias) {
        return (this._channelManager[alias] != undefined);
    }
    get networks() {
        return this._channelManager;
    }
    load(name, noResume) {
        return this.moduleHandler.load(name);
    }
    unload(name, persist) {
        return this.moduleHandler.unload(name, persist);
    }
    say(net, destination, message) {
        return this.msg(net, destination, message);
    }
    msg(net, destination, message) {
        return this.raw(net, "PRIVMSG " + destination + " :" + message);
    }
    notice(net, destination, message) {
        return this.raw(net, "NOTICE " + destination + " :" + message);
    }
    me(net, destination, message) {
        return this.action(net, destination, message);
    }
    action(net, destination, message) {
        return this.ctcp(net, destination, "PRIVMSG", "ACTION", message);
    }
    ctcp(net, destination, action, command, message) {
        return this.raw(net, action + " " + destination + " :\x01" + command + " " + message + "\x01");
        ;
    }
    join(net, channel, password) {
        return this.raw(net, "JOIN " + channel + " " + password);
    }
    part(net, channel, reason) {
        return this.raw(net, "PART " + channel + " :" + (reason || ""));
    }
    raw(net, text) {
        for (let bot in this.bots) {
            this.rawBot(net, this.bots[bot], text);
        }
        return this;
    }
    rawBot(net, bot, text) {
        bot.servers[net].connection.write(text);
        return this;
    }
    addBot(bot) {
        if (this.bots[bot.alias]) {
            return;
        }
        let onconnect = (sender, server, message) => {
            for (let network in this.settings.Networks) {
                if (this.settings.Networks[network].Network == server.alias) {
                    this.settings.Networks[network].Channels.forEach((v, i, a) => {
                        bot.servers[server.alias].connection.write("JOIN " + v);
                    });
                    break;
                }
            }
        };
        bot.on(Parser.Numerics.ENDOFMOTD, onconnect);
        bot.on(Parser.Numerics.ERR_NOMOTD, onconnect);
        bot.on(Parser.Events.PRIVMSG, (sender, server, m) => {
            if (m instanceof Parser.ConversationMessage) {
                if (!this.botCanExecute(sender.bot, server, m.destination))
                    return;
                let sc = new SenderChain_1.SenderChain(sender.bot, SenderChain_1.SenderChain.proxyActionsForShortcuts(this, m, server.alias));
                this.emit(Parser.Events.PRIVMSG, sc, server, m, bot);
            }
        });
        this.bots[bot.alias] = bot;
    }
    delBot(bot) {
        if (this.bots[bot.alias]) {
            delete this.settings.Bots[bot.alias];
            for (let n in bot.servers) {
                bot.servers[n].connection.clear();
                bot.servers[n].connection.write("QUIT :dab.irc.bot Framework v" + global.Core.version);
                bot.servers[n].connection.disconnect();
            }
            delete this.bots[bot.alias];
        }
    }
    botCanExecute(bot, svralias, channel) {
        let svr = null;
        let chan = null;
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
    getBotExecutor(serverAlias, channel) {
        let svr = null;
        let chan = null;
        let bot = null;
        let allbots = Object.keys(this.bots);
        console.log(allbots);
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
        for (let botnick in this.bots) {
            console.log(this._channelManager[svr].channel[chan]);
            if (!this._channelManager[svr].channel[chan])
                continue;
            console.log(botnick, this._channelManager[svr].channel[chan].users);
            if (this._channelManager[svr].channel[chan].users[botnick]) {
                bot = this.bots[botnick];
                break;
            }
        }
        return bot;
    }
    init(context) {
        for (let botAlias in this.settings.Bots) {
            let bot = global.Core.addBot(this, botAlias, this.settings.Bots[botAlias]);
            this.addBot(bot);
        }
        for (let modid in this.settings.Modules) {
            this.load(this.settings.Modules[modid]);
        }
        for (let net in this.settings.Networks) {
            this.connect(this.settings.Networks[net].Network);
        }
    }
    resume(context, state) {
    }
    uninit() {
    }
    connect(network, connectionString) {
        if (connectionString && !global.Core.config.Networks[network]) {
            if (!(connectionString instanceof Array)) {
                connectionString = [connectionString];
            }
            global.Core.config.Networks[network] = connectionString;
        }
        if (this._channelManager[network]) {
            for (let bot in this.bots) {
                if (!this.bots[bot].servers[network].connection.connected) {
                    this.bots[bot].servers[network].connection.init(this.bots[bot].servers[network].connection.context, true);
                }
            }
            return;
        }
        let cm = new Manager.ChannelManager();
        this._channelManager[network] = cm;
        for (let bot in this.bots) {
            let net = global.Core.randomServer(network);
            let user = new ircCore.User(this.bots[bot].settings.Nick, this.bots[bot].settings.Ident, null);
            user.name = global.Core.config.OwnerNicks + "'s bot";
            let bcc = new BotConnectionContext_1.BotConnectionContext(user, net.host, net.port, net.ssl, global.Core.config.ValidateSslCerts);
            let con = new ircCore.Connection();
            let bms = new BotManagedServer_1.BotManagedServer(this.bots[bot], network, bcc, con, undefined, cm);
            this.bots[bot].connect(network, bms);
            con.init(bcc, true);
        }
    }
    disconnect(alias) {
        for (let bot in this.bots) {
            if (this.bots[bot].servers[alias]) {
                this.bots[bot].servers[alias].connection.clear();
                this.bots[bot].servers[alias].connection.write("QUIT :dab.irc.bot Framework v" + global.Core.version);
                this.bots[bot].servers[alias].connection.disconnect();
            }
        }
    }
    on(event, listener) {
        this.events.on(event, listener);
        return this;
    }
    once(event, listener) {
        this.events.once(event, listener);
        return this;
    }
    emit(event, ...args) {
        args.splice(0, 0, event);
        this.events.emit.apply(this.events, args);
        return this;
    }
    addListener(event, listener) {
        this.on(event, listener);
        return this;
    }
    removeListener(event, listener) {
        this.events.removeListener(event, listener);
        return this;
    }
    removeAllListeners(event) {
        this.events.removeAllListeners(event);
        return this;
    }
    listeners(event) {
        return this.events.listeners(event);
    }
    eventNames() {
        return this.events.eventNames();
    }
    addCommand(command, options, cb) {
        return this._commandable.addCommand(command, options, cb);
    }
    setCommand(command, options, cb) {
        return this._commandable.setCommand(command, options, cb);
    }
    delCommand(command) {
        return this._commandable.delCommand(command);
    }
    addException(command, type, match, seconds) {
        return this._commandable.addException(command, type, match, seconds);
    }
    listExceptions(command, type) {
        return this._commandable.listExceptions(command, type);
    }
    delException(command, type, index) {
        return this._commandable.delException(command, type, index);
    }
    addLocationBind(command, server, channel, mode) {
        return this._commandable.addLocationBind(command, server, channel, mode);
    }
    listLocationBinds(command) {
        return this._commandable.listLocationBinds(command);
    }
    delLocationBind(command, index) {
        return this._commandable.delLocationBind(command, index);
    }
    attemptLogin(alias, nick, ident, host, password) {
        if (!this.hasNetwork(alias))
            return false;
        let auths = global.Core.config.Auth;
        for (let i = 0; i < auths.length; i++) {
            if (auths[i].BotGroup && auths[i].BotGroup.indexOf(this.alias) == -1)
                continue;
            let parts = auths[i].login.replace(/\./g, "\\.").replace(/\*/g, ".*").split(/[!@]/);
            if (new RegExp(parts[0]).test(nick) && new RegExp(parts[1]).test(ident) &&
                new RegExp(parts[2]).test(host)) {
                let enc = new Function("pw", auths[i].encryption);
                if (enc(password) == auths[i].encryption) {
                    if (!this.logins[alias])
                        this.logins[alias] = {};
                    this.logins[alias][nick] = auths[i].level;
                    return true;
                }
            }
        }
        return false;
    }
}
exports.BotGroup = BotGroup;
//# sourceMappingURL=BotGroup.js.map