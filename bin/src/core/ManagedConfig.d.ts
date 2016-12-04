export interface INetworkConfig {
    Network: string;
    Channels: string[];
}
export interface IDelayedCommandConfig {
    delay: number;
    command: string;
}
export interface IBotConfig {
    Nick: string;
    Ident: string;
    Channels: {
        [network: string]: string[];
    };
    Modules: string[];
    Commands: {
        [network: string]: (string | IDelayedCommandConfig)[];
    };
}
export interface IGroupConfig {
    Networks: INetworkConfig[];
    Bots: {
        [alias: string]: IBotConfig;
    };
    Modules: string[];
    CommandPrefix: string;
    RawCommandPrefix: string;
}
export interface IAuthConfig {
    login: string;
    password: string;
    encryption: string;
    level: number;
}
export interface IFrameworkConfig {
    OwnerNicks: string;
    AuthVerification: string;
    Networks: {
        [alias: string]: string[];
    };
    BotGroups: {
        [alias: string]: IGroupConfig;
    };
    Auth: IAuthConfig[];
    Modules: {
        [modname: string]: any;
    };
}
export declare class ManagedConfig implements IFrameworkConfig {
    OwnerNicks: string;
    AuthVerification: string;
    Networks: {
        [alias: string]: string[];
    };
    BotGroups: {
        [alias: string]: IGroupConfig;
    };
    Auth: IAuthConfig[];
    Modules: {
        [modname: string]: any;
    };
    isDirty: boolean;
    constructor(cfgPath: string);
    save(): void;
    static createConfig(cfgPath: string): ManagedConfig;
    private convertToproxy(obj);
    rawSettings: IFrameworkConfig;
    private path;
}
