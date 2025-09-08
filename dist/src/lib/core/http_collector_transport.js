"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpCollectorTransport = void 0;
const tslib_1 = require("tslib");
const config_1 = require("../../config");
const http_1 = require("http");
const loufairy_1 = require("@loufa/loufairy");
const winston_transport_1 = tslib_1.__importDefault(require("winston-transport"));
const bufferSize = 10;
const bufferFlushInterval = 2000;
class HttpCollectorTransport extends winston_transport_1.default {
    _agent;
    _auth;
    _options;
    constructor(options) {
        super(options);
        this._options = options;
        this._agent = new http_1.Agent({ keepAlive: true });
    }
    log(info, callback) {
        try {
            const httpCollectorRequest = (0, http_1.request)({
                method: 'POST',
                host: this._options.host,
                port: this._options.port,
                headers: {
                    'Content-Type': 'application/json'
                },
                agent: this._agent
            });
            httpCollectorRequest.end(Buffer.from(JSON.stringify({
                ...info,
                index: config_1.config.env.instanceId
            }), 'utf8'));
        }
        catch (error) {
            console.log('Couln\'t post to http collector');
        }
        if (callback) {
            setImmediate(callback);
        }
    }
    _normalizeHttpCollectorValue(value) {
        if (value instanceof Error) {
            return Object.fromEntries([
                ['stack', value.stack],
                ['message', value.message],
                ...Object.entries(value)
            ]);
        }
        else if ((0, loufairy_1.isObject)(value)) {
            return this._normalizeHttpCollectorObject(value);
        }
        return value;
    }
    _normalizeHttpCollectorObject(httpCollectorObject) {
        return Object.fromEntries(Object.entries(httpCollectorObject)
            .map(([prop, value]) => [
            prop,
            this._normalizeHttpCollectorValue(value)
        ]));
    }
}
exports.HttpCollectorTransport = HttpCollectorTransport;
//# sourceMappingURL=http_collector_transport.js.map