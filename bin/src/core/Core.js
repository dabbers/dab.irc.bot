"use strict";
const Bot_1 = require('./Bot');
const BotGroup_1 = require('./BotGroup');
const ManagedConfig = require('./ManagedConfig');
class Defaults {
    get groupSettings() {
        return { "Networks": [], "Bots": {}, "Modules": [], "CommandPrefix": "!" };
    }
    get commandHelp() {
        return {
            "locationbind": "(list/add/remove [index]) Binds command to server/prefix#channel:botNick. Use * for wildcard. (ie:ggxy or ggxy/#ggxy:D*Bot or ggxy/~#ggxy.chat*:DeBot)",
            "level": "The minimum level required for this command. Default, everyone is level 1",
            "allowpm": "Allow the command to be issued in a private message",
            "hidden": "If this command is to not be listed in the commands list",
            "exception": "(list/add/remove [index]) Timer exceptions on user mode:seconds (ie: @:4), level:seconds (ie: 1:5), nick:2 (ie: nick:sec or [*!*@*]:5), and #channel:sec .",
            "timer": "The timer throttle for the command between each command",
            "persist": "If this command should be written to file so it can be reloaded upon bot load",
            "code": "The code to execute on command call"
        };
    }
    get botSetting() {
        return { "Ident": "dbt", "Channels": {}, "Modules": [] };
    }
    get commandOptions() {
        return {
            "locationbinds": [],
            "level": 1,
            "allowpm": false,
            "hidden": false,
            "exceptions": { "channels": [], "users": [], "chanmodes": [], "levels": [] },
            "timer": 5,
            "persist": true,
            "code": function () { }
        };
    }
}
exports.Defaults = Defaults;
class Core {
    constructor() {
        this.loaded = false;
        this._defaults = Object.freeze(new Defaults());
        this._groups = {};
        this._bots = {};
        this._version = "0.0.0";
    }
    get version() {
        return this._version;
    }
    get defaults() {
        return this._defaults;
    }
    init(version, config) {
        this._version = version;
        this.config = ManagedConfig.ManagedConfig.createConfig(config);
        for (let group in this.config.BotGroups) {
            this.addGroup(group, this.config.BotGroups[group]);
        }
    }
    get groups() {
        return this._groups;
    }
    get bots() {
        return this._bots;
    }
    addGroup(name, settings) {
        if (settings === undefined)
            settings = JSON.parse(JSON.stringify(this.defaults.groupSettings));
        else {
            for (let key in this.defaults.groupSettings) {
                if (settings[key] == undefined)
                    settings[key] = this.defaults.groupSettings[key];
            }
        }
        let group = new BotGroup_1.BotGroup(name, settings);
        this._groups[name] = group;
        group.init(this);
        return group;
    }
    delGroup(name) {
    }
    addBot(group, alias, settings) {
        if (settings === undefined)
            settings = JSON.parse(JSON.stringify(this.defaults.botSetting));
        else {
            for (let key in this.defaults.botSetting) {
                if (settings[key] == undefined)
                    settings[key] = this.defaults.botSetting[key];
            }
        }
        if (settings.Nick === undefined || settings.Nick.length == 0) {
            settings.Nick = alias;
        }
        if (group === null) {
            this.addGroup(alias);
        }
        let bot = new Bot_1.Bot(alias, group, settings);
        this.bots[alias] = bot;
        return bot;
    }
    randomServer(alias) {
        let ran = this.config.Networks[alias][Math.floor((Math.random() * this.config.Networks[alias].length))];
        let parts = ran.split(':');
        let port = (parts[1] ? (parts[1][0] == "+" ? parseInt(parts[1].substring(1)) : parseInt(parts[1])) : 6667);
        let ssl = parts[1][0] == "+";
        return { "host": parts[0], "port": port, "ssl": ssl };
    }
    tick() {
        this.config.save();
        for (let group in this.groups) {
            this.groups[group].emit('tick');
        }
    }
}
exports.Core = Core;
//# sourceMappingURL=Core.js.map