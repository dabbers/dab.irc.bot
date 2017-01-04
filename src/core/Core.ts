import * as path from 'path';

import {Bot} from './Bot';
import {BotGroup} from './BotGroup';
import * as ManagedConfig from './ManagedConfig';
import * as Storages from './Storage';
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
    public  loaded : boolean = false;
    public  get version() : string { 
        return this._version;
    }
    public  get defaults() {
        return this._defaults;
    }
    // __dirname = /path/to/bot/bin/src/core/Core.js
    public  config : ManagedConfig.ManagedConfig;
    public  storage : Storages.Storage;

    public  init(version:string, config:string, storage:string) {
        this._version = version;
        this.config = ManagedConfig.ManagedConfig.createConfig(config);
        this.storage = new Storages.Storage( storage );
        for(let group in this.config.BotGroups) {
            this.addGroup(group, this.config.BotGroups[group]);
        }
    }

    public  get groups() : { [alias:string] : BotGroup } {
        return this._groups;
    }

    public  get bots() : { [alias: string] : Bot } {
        return this._bots;
    }

    public  addGroup(name:string, settings?:ManagedConfig.IGroupConfig) : BotGroup {
        if (settings === undefined) settings = JSON.parse(JSON.stringify(this.defaults.groupSettings));
        else {
            for(let key in this.defaults.groupSettings) {
                if ((<any>settings)[key] == undefined) (<any>settings)[key] = (<any>this.defaults.groupSettings)[key];
            }
        }

        let group = new BotGroup(name, settings);
        this._groups[name] = group;

        group.init(this);
        return group;
    }

    public  delGroup(name:string) {
        for(let n in this.groups[name].networks) {
            this.groups[name].disconnect(n);
        }

        delete this.config.BotGroups[name];
    }

    public addBot(group:BotGroup, alias:string, settings?:ManagedConfig.IBotConfig) : Bot {
        if (settings === undefined) settings = JSON.parse(JSON.stringify(this.defaults.botSetting));
        else {
            for(let key in this.defaults.botSetting) {
                if ((<any>settings)[key] == undefined) (<any>settings)[key] = (<any>this.defaults.botSetting)[key];
            }
        }

        if (settings.Nick === undefined || settings.Nick.length == 0) {
            settings.Nick = alias;
        }

        if (group === null) {
            this.addGroup(alias);
        }

        let bot = new Bot(alias, group, settings);
        this.bots[alias] = bot;

        return bot;
    }

    public randomServer(alias:string) : ManagedConfig.INetworkSettings{
        let ran = this.config.Networks[alias][Math.floor((Math.random() * this.config.Networks[alias].length))];
        let parts = ran.split(':');
        
        let port = (parts[1] ? (parts[1][0] == "+" ? parseInt(parts[1].substring(1)) : parseInt(parts[1])) : 6667);

        let ssl = parts[1][0] == "+";

        return {"host":parts[0], "port":port, "ssl":ssl };
    }

    public tick() {
        this.config.save();
        for(let group in this.groups) {
            this.groups[group].emit('tick');
        }
    }

    private _defaults = Object.freeze(new Defaults());

    private _groups: { [alias:string] : BotGroup } = {};
    private _bots: { [alias:string] : Bot } = {};
    private _version:string = "0.0.0";
}


