import { IModule } from 'dab.irc.core/src';
import { IBotModuleContext } from './IBotModuleContext';
export declare class Module implements IModule<IBotModuleContext> {
    constructor(callback: (owner: IBotModuleContext) => any, uninit?: (owner: IBotModuleContext) => any, resume?: (owner: IBotModuleContext, state: any) => any);
    init(context: IBotModuleContext): void;
    resume(context: IBotModuleContext, state: any): void;
    private registerHooks(context);
    uninit(): any;
    private owner;
    private fakeBot;
    private fakeGroup;
    private realBot;
    private realGRoup;
    private initCb;
    private uninitCb;
    private resumeCb;
}
