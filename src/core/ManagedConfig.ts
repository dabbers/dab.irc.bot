import * as fs from 'fs';
const watch = require("watchwithproxy");

export interface INetworkConfig {
    Network:string;
    Channels:string[];
}
export interface IDelayedCommandConfig {
    delay:number;
    command:string;
}
export interface IBotConfig {
    Nick:string;
    Ident:string;
    Channels: { [network:string] :string[]};
    Modules:string[];
    Commands: { [network:string] : (string|IDelayedCommandConfig)[]};
}

export interface IGroupConfig {
    Networks: INetworkConfig[];
    Bots: { [alias:string] : IBotConfig};
    Modules:string[];
    CommandPrefix:string;
    RawCommandPrefix:string;
}

export interface IAuthConfig {
    login: string;
    password: string;
    encryption: string;
    level: number;
}

export interface IFrameworkConfig {
    OwnerNicks: string;
    AuthVerification:string;
    Networks: { [alias:string] : string[] };
    BotGroups: { [alias:string] : IGroupConfig };

    Auth: IAuthConfig[];
    Modules: { [modname:string] : any };
}

export class ManagedConfig implements IFrameworkConfig {
    OwnerNicks: string;
    AuthVerification:string;
    Networks: { [alias:string] : string[] };
    BotGroups: { [alias:string] : IGroupConfig };

    Auth: IAuthConfig[];
    Modules: { [modname:string] : any };

    isDirty : boolean = false;

    constructor(cfgPath:string) {
        this.rawSettings = <IFrameworkConfig>require(cfgPath);
        
        watch.Watcher.Watch(this.rawSettings, new watch.WatchOptions(), (s:any, p:string, o:any, n:any) => {
            this.isDirty = true;
        });
        this.path = cfgPath;
    }

    public save() {
        if (this.isDirty) {
            fs.writeFile(this.path, JSON.stringify(this.rawSettings, null, 4), (err) => {
                console.log(err);
            });
        }
    }

    public static createConfig(cfgPath:string) : ManagedConfig {
        let o = new ManagedConfig(cfgPath);

        let n = new Proxy<ManagedConfig>(o, {
            set: (proxy, name, value) => {

                if ((<any>proxy.rawSettings)[name] !== undefined && proxy.rawSettings.hasOwnProperty(name)) {
                    proxy.isDirty = true;
                    return (<any>proxy.rawSettings)[name] = value;
                }
                else {
                    return(<any>proxy)[name] = value;
                }
            },
            get: (proxy, name) => {
                if ((<any>proxy.rawSettings)[name] !== undefined && proxy.rawSettings.hasOwnProperty(name)) {
                    return (<any>proxy.rawSettings)[name];
                }
                else {
                    return(<any>proxy)[name];
                }
            }
        });

        return n;
    }

    // Modifies the object to become proxified
    private convertToproxy(obj:any):any {
        if (obj === undefined || obj === null || obj instanceof String || obj instanceof Number) {
            return obj;
        }
        else if (obj instanceof Array) {
            for(let i = 0; i < obj.length; i++) {

            }
        }
        else {
            let keys = Object.keys(obj);
            for(let i in keys) {

            }
        }
    }

    public rawSettings:IFrameworkConfig;
    private path : string;
}