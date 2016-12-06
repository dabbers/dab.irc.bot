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
    static loaded: boolean;
    static readonly version: string;
    static readonly defaults: Defaults;
    static config: ManagedConfig.ManagedConfig;
    static init(version: string, config: string): void;
    static readonly groups: {
        [alias: string]: BotGroup;
    };
    static readonly bots: {
        [alias: string]: Bot;
    };
    static addGroup(name: string, settings?: ManagedConfig.IGroupConfig): BotGroup;
    static delGroup(name: string): void;
    static addBot(group: BotGroup, alias: string, settings?: ManagedConfig.IBotConfig): Bot;
    static tick(): void;
    private static _defaults;
    private static _groups;
    private static _bots;
    private static _version;
}
