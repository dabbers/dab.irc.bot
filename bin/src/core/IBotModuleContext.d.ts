import { IModuleHandler } from 'dab.irc.core/src';
import { IModule } from 'dab.irc.core/src';
import { ICommandable } from './ICommandable';
import { BotGroup } from './BotGroup';
import { Core } from './Core';
export interface IBotModuleContext extends ICommandable {
    alias: string;
    isBot: boolean;
    group: BotGroup;
    tick(): void;
    load(name: string, noResume?: boolean): IModuleHandler<IBotModuleContext>;
    unload(name: string, persist: boolean): IModuleHandler<IBotModuleContext>;
    on(event: string, listener: Function): IBotModuleContext;
    once(event: string, listener: Function): IBotModuleContext;
    emit(event: string, ...args: any[]): IBotModuleContext;
    addListener(event: string, listener: Function): IBotModuleContext;
    removeListener(event: string, listener: Function): IBotModuleContext;
    removeAllListeners(event?: string): IBotModuleContext;
    listeners(event: string): Function[];
    eventNames(): (string | symbol)[];
    say(net: string, destination?: string, message?: string): IBotModuleContext;
    msg(net: string, destination?: string, message?: string): IBotModuleContext;
    notice(net: string, destination?: string, message?: string): IBotModuleContext;
    me(net: string, destination?: string, message?: string): IBotModuleContext;
    action(net: string, destination?: string, message?: string): IBotModuleContext;
    ctcp(net: string, destination: string, action: string, command: string, message?: string): IBotModuleContext;
    join(net: string, channel?: string, password?: string): IBotModuleContext;
    part(net: string, channel?: string, reason?: string): IBotModuleContext;
    raw(net: string, text?: string): IBotModuleContext;
    init(context: Core): void;
    resume(context: Core, state: any): void;
    uninit(): any;
    modules: {
        [name: string]: IModule<IBotModuleContext>;
    };
}
