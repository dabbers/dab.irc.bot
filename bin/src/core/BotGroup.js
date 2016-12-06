"use strict";
const events_1 = require('events');
const Parser = require('dab.irc.parser/src');
const ircCore = require('dab.irc.core/src');
const Manager = require('dab.irc.manager/src');
const Commandable_1 = require('./Commandable');
const ModuleHandler_1 = require('./ModuleHandler');
const Core_1 = require('./Core');
class BotGroup {
    constructor(alias, config) {
        this._bots = {};
        this._alias = alias;
        this.settings = JSON.parse(JSON.stringify(config));
        this._commandable = new Commandable_1.Commandable(this);
        this.moduleHandler = new ModuleHandler_1.ModuleHandler(this);
        this.events = new events_1.EventEmitter();
        this.on('tick', this.tick);
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
    load(name, noResume) {
        return this.moduleHandler.load(name);
    }
    unload(name, persist) {
        return this.moduleHandler.unload(name, persist);
    }
    say(net, destination, message) {
        return this;
    }
    msg(net, destination, message) {
        return this;
    }
    notice(net, destination, message) {
        return this;
    }
    me(net, destination, message) {
        return this;
    }
    action(net, destination, message) {
        return this;
    }
    ctcp(net, destination, action, command, message) {
        return this;
    }
    join(net, channel, password) {
        return this;
    }
    part(net, channel, reason) {
        return this;
    }
    raw(net, text) {
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
        bot.on(Parser.Events.PRIVMSG, (sender, server, message) => {
            this.emit(Parser.Events.PRIVMSG, this, server, message, bot);
        });
    }
    botCanExecute(bot, svralias, channel) {
        return this.getBotExecutor(svralias, channel).alias == bot.alias;
    }
    getBotExecutor(serverAlias, channel) {
        let svr = null;
        let chan = null;
        let bot = null;
        let allbots = Object.keys(this.bots);
        if (serverAlias instanceof Manager.ManagedServer) {
            svr = serverAlias.alias;
        }
        else {
            svr = serverAlias;
        }
        if (channel instanceof ircCore.Channel) {
            chan = channel.target;
        }
        else {
            chan = channel;
        }
        for (let botnick in allbots) {
            if (this._channelManager[svr].channel[chan].users[botnick]) {
                bot = this.bots[botnick];
                break;
            }
        }
        return bot;
    }
    init(context) {
        for (var botAlias in this.settings.Bots) {
            let bot = Core_1.Core.addBot(this, botAlias, this.settings.Bots[botAlias]);
            this.addBot(bot);
        }
    }
    resume(context, state) {
    }
    uninit() {
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
}
exports.BotGroup = BotGroup;
//# sourceMappingURL=BotGroup.js.map