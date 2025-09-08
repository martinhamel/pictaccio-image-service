"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = currentUrlClass;
const view_1 = require("../../../../lib/http/view/view");
function currentUrlClass(url, className, options) {
    const internalUrl = options.data.root.__internals__[view_1.SLOT_URL];
    return internalUrl.url === url
        ? className
        : '';
}
//# sourceMappingURL=current_url_class.js.map