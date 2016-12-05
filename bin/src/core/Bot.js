"use strict";
const events_1 = require('events');
const Manager = require('dab.irc.manager/src');
const Commandable_1 = require('./Commandable');
class Bot extends Manager.ManagedUser {
    constructor() {
        super("", null, null);
        this._commandable = new Commandable_1.Commandable(this);
        this.events = new events_1.EventEmitter();
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
    }
    init(context) {
    }
    resume(context, state) {
    }
    uninit() {
    }
    load(name, noResume) {
        return this;
    }
    unload(name, persist) {
        return this;
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