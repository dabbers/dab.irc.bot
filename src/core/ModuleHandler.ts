import * as Core from 'dab.irc.core/src';

import {IBotModuleContext} from './IBotModuleContext';


export interface ModuleDictionary<Ctx> {
    [name: string] : Core.IModule<Ctx>;
}

interface StateDictionary {
    [name: string] : any;
}
export class ModuleHandler implements Core.IModuleHandler<IBotModuleContext> {
    public modules : ModuleDictionary<IBotModuleContext> = {};

    constructor(context: IBotModuleContext) {
        this.context = context;
    }

    load(name: string, noResume?:boolean) : Core.IModuleHandler<IBotModuleContext> {
        if (this.modules[name]) this.unload(name);

        //if (require.cache[name + ".js"]) delete require.cache[name + ".js"];

        var module1 = <Core.IModule<IBotModuleContext>>require(name);
        if (this.moduleStates[name] && !noResume) {
            module1.resume(this.context, this.moduleStates[name]);
        }
        module1.init(this.context);

        return this.context;
    }

    unload(name: string, persist: boolean = false) : Core.IModuleHandler<IBotModuleContext> {
        if (this.modules[name]) {
            var res = this.modules[name].uninit();

            if (res) {
                this.moduleStates[name] = res;
            }

            delete this.modules[name];
        }
        return this.context;
    }

    private moduleStates : StateDictionary = {};
    private context: IBotModuleContext;
}