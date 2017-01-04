import net = require('net');
import tls = require('tls');

import * as ircCore from 'dab.irc.core/src';
import * as Parser from 'dab.irc.parser/src';

export class BotConnectionContext implements ircCore.IConnectionContext {
    me: ircCore.User;
    
    host: string = "irc.dab.biz";
    port: number = 6697;
    ssl: boolean = true;
    rejectUnauthedCerts: boolean = false;

    constructor(usr:ircCore.User, host:string, port:number, ssl:boolean, rejectUnauthedCerts:boolean) {
        this.me = usr;
        this.host = host;
        this.port = port;
        this.ssl = ssl;
        this.rejectUnauthedCerts = rejectUnauthedCerts;
    }

    dataCallback: (d: ircCore.Message) => any;
    
    createConnection(cb:() => any): ircCore.ISocket {
        if (this.ssl) {
            return new ircCore.NodeSocket(tls.connect(this.port, this.host, {rejectUnauthorized: this.rejectUnauthedCerts}, cb));
        }
        else {
            return new ircCore.NodeSocket(net.createConnection(this.port, this.host, cb));            
        }
    }

    connectionEstablishedCallback: (c:ircCore.Connection) => any = (c:ircCore.Connection) => {
        c.write("NICK " + this.me.nick);
        c.write("USER " + this.me.ident + " 8 * :" + this.me.name);
    }

    logSentMessages: boolean = true;
    logReceivedMessages: boolean = true;
    channelPrefixes:string[];
}