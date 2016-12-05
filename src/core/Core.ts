import * as path from 'path';

import {Bot} from './Bot';
import {BotGroup} from './BotGroup';
import * as ManagedConfig from './ManagedConfig';

export class Defaults {
    public get groupSettings() {
        return <ManagedConfig.IGroupConfig>{"Networks":[], "Bots":{}, "Modules":[], "CommandPrefix":"!"};
    }

    public get commandHelp() {
        return {
            "locationbind":"(list/add/remove [index]) Binds command to server/prefix#channel:botNick. Use * for wildcard. (ie:ggxy or ggxy/#ggxy:D*Bot or ggxy/~#ggxy.chat*:DeBot)",
            "level":"The minimum level required for this command. Default, everyone is level 1",
            "allowpm":"Allow the command to be issued in a private message",
            "hidden":"If this command is to not be listed in the commands list",
            "exception":"(list/add/remove [index]) Timer exceptions on user mode:seconds (ie: @:4), level:seconds (ie: 1:5), nick:2 (ie: nick:sec or [*!*@*]:5), and #channel:sec .",
            "timer":"The timer throttle for the command between each command",
            "persist":"If this command should be written to file so it can be reloaded upon bot load",
            "code":"The code to execute on command call"
        };
    }

    public get  botSetting () {
        return <ManagedConfig.IBotConfig>{"Ident":"dbt", "Channels":{}, "Modules":[]};
    }

    public get commandOptions() {
        return {
            "locationbinds" : <string[]>[],
            "level" : 1,
            "allowpm" : false,
            "hidden" : false,
            "exceptions": {"channels":<any[]>[], "users":<any[]>[], "chanmodes":<any[]>[], "levels":<any[]>[] },
            "timer":5, // 5 seconds between command calls.
            "persist":true,
            "code": function() { }
        };
    } 
}

export class Core {
    public static loaded : boolean = false;
    public static get defaults() {
        return Core._defaults;
    }
    // __dirname = /path/to/bot/bin/src/core/Core.js
    public static config : ManagedConfig.ManagedConfig;

    public static init(config:string) {
        Core.config = ManagedConfig.ManagedConfig.createConfig(config);

        for(var group in Core.config.BotGroups) {
            Core.addGroup(group, Core.config.BotGroups[group]);
        }
    }

    public static get groups() : { [alias:string] : BotGroup } {
        return Core._groups;
    }

    public static addGroup(name:string, settings:any) : BotGroup {
        
        for(var key in Core.defaults.groupSettings) {
            if (!settings[key]) settings[key] = (<any>Core.defaults.groupSettings)[key];
        }
        let group = new BotGroup(name, settings);
        group.init(Core);
        return group;
    }

    public static delGroup(name:string) {

    }

    public static tick() {
        this.config.save();
        for(var group in Core.groups) {
            Core.groups[group].emit('tick');
        }
    }

    private static _defaults = Object.freeze(new Defaults());

    private static _groups: { [alias:string] : BotGroup } = {};
}


