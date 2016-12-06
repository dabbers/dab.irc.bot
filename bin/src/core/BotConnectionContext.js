"use strict";
const net = require('net');
const tls = require('tls');
const ircCore = require('dab.irc.core/src');
class BotConnectionContext {
    constructor(usr, host, port, ssl, rejectUnauthedCerts) {
        this.host = "irc.dab.biz";
        this.port = 6697;
        this.ssl = true;
        this.rejectUnauthedCerts = false;
        this.connectionEstablishedCallback = (c) => {
            c.write("NICK " + this.me.nick);
            c.write("USER " + this.me.ident + " 8 * :" + this.me.name);
        };
        this.logSentMessages = true;
        this.logReceivedMessages = true;
        this.me = usr;
        this.host = host;
        this.port = port;
        this.ssl = ssl;
        this.rejectUnauthedCerts = rejectUnauthedCerts;
    }
    createConnection(cb) {
        if (this.ssl) {
            return new ircCore.NodeSocket(tls.connect(this.port, this.host, { rejectUnauthorized: this.rejectUnauthedCerts }, cb));
        }
        else {
            return new ircCore.NodeSocket(net.createConnection(this.port, this.host, cb));
        }
    }
}
exports.BotConnectionContext = BotConnectionContext;
//# sourceMappingURL=BotConnectionContext.js.map