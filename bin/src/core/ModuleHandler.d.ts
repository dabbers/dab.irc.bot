import * as Core from 'dab.irc.core/src';
import { IBotModuleContext } from './IBotModuleContext';
export interface ModuleDictionary<Ctx> {
    [name: string]: Core.IModule<Ctx>;
}
export declare class ModuleHandler implements Core.IModuleHandler<IBotModuleContext> {
    modules: ModuleDictionary<IBotModuleContext>;
    constructor(context: IBotModuleContext);
    load(name: string, noResume?: boolean): Core.IModuleHandler<IBotModuleContext>;
    unload(name: string, persist?: boolean): Core.IModuleHandler<IBotModuleContext>;
    private moduleStates;
    private context;
}
