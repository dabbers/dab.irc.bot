"use strict";
class Commandable {
    constructor(host) {
        this._commands = {};
        this._isDirty = false;
        this._host = host;
        this._commands = {};
    }
    get commands() {
        return this._commands;
    }
    onPrivmsg(sender, server, message) {
        let command = message.firstWord.toLocaleLowerCase();
        if (!this._commands[command]) {
            return;
        }
        this._commands[command].code(sender, server, message);
    }
    addCommand(command, options, cb) {
        if (!options) {
            options = JSON.parse(JSON.stringify(global.Core.defaults.commandOptions));
        }
        if (cb == undefined) {
            cb = options;
            options = JSON.parse(JSON.stringify(global.Core.defaults.commandOptions));
        }
        command = command.toLocaleLowerCase();
        let defOpt = JSON.parse(JSON.stringify(global.Core.defaults.commandOptions));
        for (let key in defOpt) {
            if (defOpt.hasOwnProperty(key) && options[key] == undefined) {
                options[key] = defOpt[key];
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
    setCommand(command, options, cb) {
        return this._host;
    }
    delCommand(command) {
        return this._host;
    }
    addException(command, type, match, secondsd) {
        return this._host;
    }
    listExceptions(command, type) {
        return this._host;
    }
    delException(command, type, index) {
        return this._host;
    }
    addLocationBind(command, server, channel, mode) {
        return this._host;
    }
    listLocationBinds(command) {
        return this._host;
    }
    delLocationBind(command, index) {
        return this._host;
    }
}
exports.Commandable = Commandable;
//# sourceMappingURL=Commandable.js.map