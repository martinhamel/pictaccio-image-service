"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.T = void 0;
const routing_controllers_1 = require("routing-controllers");
const typedi_1 = require("typedi");
const i18next_1 = require("../../../lib/loaders/i18next");
const config = typedi_1.Container.get('config');
exports.T = (0, routing_controllers_1.createParamDecorator)({
    required: true,
    value: async (action) => (0, i18next_1.getFixedT)(action.request.session.lang || config.locales.fallbacks.lang)
});
//# sourceMappingURL=t.js.map