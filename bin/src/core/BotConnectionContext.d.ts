import * as ircCore from 'dab.irc.core/src';
export declare class BotConnectionContext implements ircCore.IConnectionContext {
    me: ircCore.User;
    host: string;
    port: number;
    ssl: boolean;
    rejectUnauthedCerts: boolean;
    constructor(usr: ircCore.User, host: string, port: number, ssl: boolean, rejectUnauthedCerts: boolean);
    dataCallback: (d: ircCore.Message) => any;
    createConnection(cb: () => any): ircCore.ISocket;
    connectionEstablishedCallback: (c: ircCore.Connection) => any;
    logSentMessages: boolean;
    logReceivedMessages: boolean;
    channelPrefixes: string[];
}
