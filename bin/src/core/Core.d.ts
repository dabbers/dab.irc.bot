import { Bot } from './Bot';
import { BotGroup } from './BotGroup';
import * as ManagedConfig from './ManagedConfig';
export declare class Defaults {
    readonly groupSettings: ManagedConfig.IGroupConfig;
    readonly commandHelp: {
        "locationbind": string;
        "level": string;
        "allowpm": string;
        "hidden": string;
        "exception": string;
        "timer": string;
        "persist": string;
        "code": string;
    };
    readonly botSetting: ManagedConfig.IBotConfig;
    readonly commandOptions: {
        "locationbinds": string[];
        "level": number;
        "allowpm": boolean;
        "hidden": boolean;
        "exceptions": {
            "channels": any[];
            "users": any[];
            "chanmodes": any[];
            "levels": any[];
        };
        "timer": number;
        "persist": boolean;
        "code": () => void;
    };
}
export declare class Core {
    loaded: boolean;
    readonly version: string;
    readonly defaults: Defaults;
    config: ManagedConfig.ManagedConfig;
    init(version: string, config: string): void;
    readonly groups: {
        [alias: string]: BotGroup;
    };
    readonly bots: {
        [alias: string]: Bot;
    };
    addGroup(name: string, settings?: ManagedConfig.IGroupConfig): BotGroup;
    delGroup(name: string): void;
    addBot(group: BotGroup, alias: string, settings?: ManagedConfig.IBotConfig): Bot;
    randomServer(alias: string): ManagedConfig.INetworkSettings;
    tick(): void;
    private _defaults;
    private _groups;
    private _bots;
    private _version;
}
