"use strict";
const events_1 = require('events');
const Parser = require('dab.irc.parser/src');
const Manager = require('dab.irc.manager/src');
const Core_1 = require('./Core');
const Commandable_1 = require('./Commandable');
const ModuleHandler_1 = require('./ModuleHandler');
class Bot extends Manager.ManagedUser {
    constructor(alias, group, settings) {
        super(settings.Nick, settings.Ident, null);
        this.servers = {};
        this.name = Core_1.Core.config.OwnerNicks + "'s bot";
        this._group = group;
        this._alias = alias;
        this.settings = settings;
        this._commandable = new Commandable_1.Commandable(this);
        this.events = new events_1.EventEmitter();
        this.moduleHandler = new ModuleHandler_1.ModuleHandler(this);
        for (let modid in this.settings.Modules) {
            this.load(this.settings.Modules[modid]);
        }
        let onconnect = (sender, server, message) => {
            for (let chanidx in this.settings.Channels[server.alias]) {
                this.servers[server.alias].connection.write("JOIN " + this.settings.Channels[server.alias][chanidx]);
            }
            for (var cmd in this.settings.Commands[server.alias]) {
                let cm = this.settings.Commands[server.alias][cmd];
                if (cm.delay) {
                    setTimeout(function (svr, cmd) {
                        return function () {
                            svr.connection.write(cmd);
                        };
                    }(this.servers[server.alias], cm.command), cm.delay);
                }
                else {
                    this.servers[server.alias].connection.write(cm);
                }
            }
        };
        this.on(Parser.Numerics.ENDOFMOTD, onconnect);
        this.on(Parser.Numerics.ERR_NOMOTD, onconnect);
        this.on(Parser.Events.PRIVMSG, (sender, server, message) => {
            let m = message;
            if (m.ctcp == true && m.messageTags["intent"] == "VERSION") {
                this.ctcp(server.alias, m.from.target, "NOTICE", "VERSION", "dab.irc.bot v" + Core_1.Core.version);
            }
        });
        this.on(Parser.Events.JOIN, (sender, server, message) => {
            let m = message;
            if (message.from.target != this.nick) {
                return;
            }
            if (this.settings.Channels[server.alias] && this.settings.Channels[server.alias].filter((ch) => ch == m.destination.target).length > 0) {
                return;
            }
            let groupNetworkSetting = this.group.settings.Networks.filter(function (net) { return net.Network == server.alias; });
            if (groupNetworkSetting.length != 0 && groupNetworkSetting[0].Channels.filter((ch) => ch == m.destination.target).length != 0) {
                return;
            }
            if (!this.settings.Channels[server.alias]) {
                this.settings.Channels[server.alias] = [];
            }
            this.settings.Channels[server.alias].push(m.destination.target);
        });
        this.on(Parser.Events.PART, (sender, server, message) => {
            if (message.from.target != this.nick) {
                return;
            }
            let m = message;
            for (let i = 0; i < this.settings.Channels[server.alias].length; i++) {
                if (this.settings.Channels[server.alias][i] == m.destination.target) {
                    this.settings.Channels[server.alias].splice(i, 1);
                    break;
                }
            }
        });
    }
    get modules() {
        return this.moduleHandler.modules;
    }
    get alias() {
        return this._alias;
    }
    get group() {
        return this._group;
    }
    get isBot() {
        return true;
    }
    tick() {
        for (let i in this.servers) {
            this.servers[i].connection.tick();
        }
    }
    connect(alias, server) {
        this.servers[alias] = server;
    }
    disconnect(alias, quitmsg = "dab.irc.bot framework v" + Core_1.Core.version) {
        if (this.servers[alias]) {
            this.servers[alias].connection.write("QUIT :" + quitmsg);
        }
    }
    init(context) {
    }
    resume(context, state) {
    }
    uninit() {
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
        return this.raw(net, action + " " + destination + " :\001" + command + " " + message + "\001");
        ;
    }
    join(net, channel, password) {
        return this.raw(net, "JOIN " + channel + " " + password);
    }
    part(net, channel, reason) {
        return this.raw(net, "PART " + channel + " :" + (reason || ""));
    }
    raw(net, text) {
        this.servers[net].connection.write(text);
        return this;
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
exports.Bot = Bot;
//# sourceMappingURL=Bot.js.map