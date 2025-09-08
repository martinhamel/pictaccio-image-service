"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = t;
const view_1 = require("../../../../lib/http/view/view");
function t(key, options) {
    const t = options.data.root.__internals__[view_1.SLOT_T];
    return t(key, options.hash);
}
//# sourceMappingURL=t.js.map