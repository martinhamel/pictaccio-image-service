"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.View = exports.SLOT_URL = exports.SLOT_T = void 0;
const routing_controllers_1 = require("@loufa/routing-controllers");
const typedi_1 = require("typedi");
const i18next_1 = require("../../../lib/loaders/i18next");
exports.SLOT_T = 0;
exports.SLOT_URL = 1;
class View extends routing_controllers_1.BaseView {
    _config;
    _layout;
    _title;
    _scripts = [];
    constructor(controller) {
        super(controller);
        this._config = typedi_1.Container.get('config');
    }
    addScripts(name, async, defer) {
        this._scripts.push({
            name,
            async,
            defer
        });
    }
    setLayout(layout) {
        this._layout = layout;
    }
    setTitle(title) {
        this._title = title;
    }
    async executeAction(actionMetadata, action, params) {
        const results = await actionMetadata.callMethod(params, action);
        const viewVars = {
            __internals__: [
                await (0, i18next_1.getFixedT)(action.request.session.lang || this._config.locales.fallbacks.lang),
                {
                    hostname: action.request.headers['host'],
                    url: action.request.originalUrl,
                    path: action.request.path
                }
            ],
            __head_title__: this._title,
            __head_scripts__: this._scripts,
            ...results
        };
        if (this._layout !== undefined) {
            viewVars.layout = this._layout;
        }
        this._reset();
        return viewVars;
    }
    _reset() {
        this._title = undefined;
        this._layout = undefined;
        this._scripts = [];
    }
}
exports.View = View;
//# sourceMappingURL=view.js.map