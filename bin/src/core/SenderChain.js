"use strict";
class SenderChain {
    constructor(bot, group) {
        this.bot = bot;
        this.group = group;
    }
    get sender() {
        return (this.group || this.bot);
    }
}
exports.SenderChain = SenderChain;
//# sourceMappingURL=SenderChain.js.map