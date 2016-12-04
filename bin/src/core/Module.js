"use strict";
class Module {
    constructor(callback, uninit, resume) {
    }
    init(context) {
        this.registerHooks(context);
        if (this.initCb) {
            this.initCb(this.owner);
        }
    }
    resume(context, state) {
        if (this.resumeCb) {
            this.registerHooks(context);
            this.resumeCb(this.owner, state);
        }
        else {
            this.init(context);
        }
    }
    registerHooks(context) {
    }
    uninit() {
        if (this.uninitCb) {
            return this.uninitCb(this.owner);
        }
        return null;
    }
}
exports.Module = Module;
//# sourceMappingURL=Module.js.map