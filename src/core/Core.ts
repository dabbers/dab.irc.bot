
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
    public loaded : boolean = false;
    public get defaults() {
        return this._defaults;
    }
    public get groups() : { [alias:string] : BotGroup } {
        return this._groups;
    }

    public addGroup(name:string, settings:any) : BotGroup {
        
        for(var key in this.defaults.groupSettings) {
            if (!settings[key]) settings[key] = (<any>this.defaults.groupSettings)[key];
        }
        let group = new BotGroup(name, settings);
        return null;
    }

    public delGroup(name:string) {

    }

    private _defaults = Object.freeze(new Defaults());

    private _groups: { [alias:string] : BotGroup } = {};
}


