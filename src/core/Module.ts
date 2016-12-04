import {IModule} from 'dab.irc.core/src';

import {IBotModuleContext} from './IBotModuleContext';

export class Module implements IModule<IBotModuleContext> {

    constructor(callback:(owner:IBotModuleContext)=>any, uninit?:(owner:IBotModuleContext) =>any, resume?:(owner:IBotModuleContext, state:any)=>any) {

    }

    init(context:IBotModuleContext):void {
        this.registerHooks(context);
        if (this.initCb) {
            this.initCb(this.owner);
        }
    }

    resume(context:IBotModuleContext, state: any): void {

        if (this.resumeCb) {
            this.registerHooks(context);
            this.resumeCb(this.owner, state);
        }
        else {
            this.init(context);
        }
    }

    private registerHooks(context:IBotModuleContext) {

    }

    uninit():any {

        if (this.uninitCb) {
            return this.uninitCb(this.owner);
        }

        return null;
    }

    private owner : IBotModuleContext;

    private fakeBot : IBotModuleContext;
    private fakeGroup : IBotModuleContext;

    private realBot : IBotModuleContext;
    private realGRoup : IBotModuleContext;

    private initCb : (owner:IBotModuleContext)=>any;
    private uninitCb : (owner:IBotModuleContext)=>any;
    private resumeCb : (owner:IBotModuleContext, state:any)=>any;
}