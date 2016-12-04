"use strict";
class ModuleHandler {
    constructor(context) {
        this.modules = {};
        this.moduleStates = {};
        this.context = context;
    }
    load(name, noResume) {
        if (this.modules[name])
            this.unload(name);
        var module1 = require(name);
        if (this.moduleStates[name] && !noResume) {
            module1.resume(this.context, this.moduleStates[name]);
        }
        module1.init(this.context);
        return this.context;
    }
    unload(name, persist = false) {
        if (this.modules[name]) {
            var res = this.modules[name].uninit();
            if (res) {
                this.moduleStates[name] = res;
            }
            delete this.modules[name];
        }
        return this.context;
    }
}
exports.ModuleHandler = ModuleHandler;
//# sourceMappingURL=ModuleHandler.js.map