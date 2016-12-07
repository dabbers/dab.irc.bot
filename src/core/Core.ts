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
    public static get version() : string { 
        return this._version;
    }
    public static get defaults() {
        return Core._defaults;
    }
    // __dirname = /path/to/bot/bin/src/core/Core.js
    public static config : ManagedConfig.ManagedConfig;

    public static init(version:string, config:string) {
        this._version = version;
        Core.config = ManagedConfig.ManagedConfig.createConfig(config);

        for(let group in Core.config.BotGroups) {
            Core.addGroup(group, Core.config.BotGroups[group]);
        }
    }

    public static get groups() : { [alias:string] : BotGroup } {
        return Core._groups;
    }

    public static get bots() : { [alias: string] : Bot } {
        return Core._bots;
    }

    public static addGroup(name:string, settings?:ManagedConfig.IGroupConfig) : BotGroup {
        if (settings === undefined) settings = JSON.parse(JSON.stringify(this.defaults.groupSettings));
        else {
            for(let key in Core.defaults.groupSettings) {
                if ((<any>settings)[key] == undefined) (<any>settings)[key] = (<any>Core.defaults.groupSettings)[key];
            }
        }

        let group = new BotGroup(name, settings);
        this._groups[name] = group;

        group.init(Core);
        return group;
    }

    public static delGroup(name:string) {

    }

    public static addBot(group:BotGroup, alias:string, settings?:ManagedConfig.IBotConfig) : Bot {
        if (settings === undefined) settings = JSON.parse(JSON.stringify(this.defaults.botSetting));
        else {
            for(let key in Core.defaults.botSetting) {
                if ((<any>settings)[key] == undefined) (<any>settings)[key] = (<any>Core.defaults.botSetting)[key];
            }
        }

        if (settings.Nick === undefined || settings.Nick.length == 0) {
            settings.Nick = alias;
        }

        if (group === null) {
            Core.addGroup(alias);
        }

        let bot = new Bot(alias, group, settings);
        Core.bots[alias] = bot;

        return bot;
    }

    public static randomServer(alias:string) : ManagedConfig.INetworkSettings{
        let ran = this.config.Networks[alias][Math.floor((Math.random() * this.config.Networks[alias].length))];
        let parts = ran.split(':');
        
        let port = (parts[1] ? (parts[1][0] == "+" ? parseInt(parts[1].substring(1)) : parseInt(parts[1])) : 6667);

        let ssl = parts[1][0] == "+";

        return {"host":parts[0], "port":port, "ssl":ssl };
    }

    public static tick() {
        this.config.save();
        for(let group in Core.groups) {
            Core.groups[group].emit('tick');
        }
    }

    private static _defaults = Object.freeze(new Defaults());

    private static _groups: { [alias:string] : BotGroup } = {};
    private static _bots: { [alias:string] : Bot } = {};
    private static _version:string = "0.0.0";
}


