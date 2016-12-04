"use strict";
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
        this._defaults = new Defaults();
    }
    get defaults() {
        return this._defaults;
    }
    addGroup(name, settings) {
        for (var key in this.defaults.groupSettings) {
            if (!settings[key])
                settings[key] = this.defaults.groupSettings[key];
        }
        return null;
    }
    delGroup(name) {
    }
}
exports.Core = Core;
//# sourceMappingURL=Core.js.map