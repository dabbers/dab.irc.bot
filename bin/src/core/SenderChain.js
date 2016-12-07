"use strict";
class SenderChain {
    constructor(bot, group) {
        if (bot instanceof SenderChain) {
            if (bot.group)
                throw new Error("Cannot have existing group in sender chain");
            this.bot = bot.bot;
        }
        else {
            this.bot = bot;
        }
        this.group = group;
    }
    get sender() {
        return (this.group || this.bot);
    }
}
exports.SenderChain = SenderChain;
//# sourceMappingURL=SenderChain.js.map