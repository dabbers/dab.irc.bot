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
    static get version() {
        return this._version;
    }
    static get defaults() {
        return Core._defaults;
    }
    static init(version, config) {
        this._version = version;
        Core.config = ManagedConfig.ManagedConfig.createConfig(config);
        for (let group in Core.config.BotGroups) {
            Core.addGroup(group, Core.config.BotGroups[group]);
        }
    }
    static get groups() {
        return Core._groups;
    }
    static get bots() {
        return Core._bots;
    }
    static addGroup(name, settings) {
        if (settings === undefined)
            settings = JSON.parse(JSON.stringify(this.defaults.groupSettings));
        else {
            for (let key in Core.defaults.groupSettings) {
                if (!settings[key])
                    settings[key] = Core.defaults.groupSettings[key];
            }
        }
        let group = new BotGroup_1.BotGroup(name, settings);
        this._groups[name] = group;
        group.init(Core);
        return group;
    }
    static delGroup(name) {
    }
    static addBot(group, alias, settings) {
        if (settings === undefined)
            settings = JSON.parse(JSON.stringify(this.defaults.botSetting));
        else {
            for (let key in Core.defaults.botSetting) {
                if (!settings[key])
                    settings[key] = Core.defaults.botSetting[key];
            }
        }
        if (settings.Nick === undefined || settings.Nick.length == 0) {
            settings.Nick = alias;
        }
        if (group === null) {
            Core.addGroup(alias);
        }
        let bot = new Bot_1.Bot(alias, group, settings);
        Core.bots[alias] = bot;
        return bot;
    }
    static tick() {
        this.config.save();
        for (let group in Core.groups) {
            Core.groups[group].emit('tick');
        }
    }
}
Core.loaded = false;
Core._defaults = Object.freeze(new Defaults());
Core._groups = {};
Core._bots = {};
Core._version = "0.0.0";
exports.Core = Core;
//# sourceMappingURL=Core.js.map