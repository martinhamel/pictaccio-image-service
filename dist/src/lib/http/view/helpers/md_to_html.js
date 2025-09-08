"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = mdToHtml;
const handlebars_1 = require("handlebars");
const marked_1 = require("marked");
function mdToHtml(md) {
    const html = marked_1.marked.parse(md, { async: false });
    return new handlebars_1.SafeString(html);
}
//# sourceMappingURL=md_to_html.js.map