"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SplunkTransport = void 0;
const tslib_1 = require("tslib");
const https_1 = require("https");
const loufairy_1 = require("@loufa/loufairy");
const winston_transport_1 = tslib_1.__importDefault(require("winston-transport"));
const bufferSize = 10;
const bufferFlushInterval = 2000;
const splunkEndpointPath = '/services/collector/event';
class SplunkTransport extends winston_transport_1.default {
    _agent;
    _auth;
    _buffer;
    _options;
    constructor(options) {
        super(options);
        this._options = options;
        this._agent = new https_1.Agent({ keepAlive: true });
        this._auth = `Splunk ${options.token}`;
        this._buffer = [];
        this._startFlushIntervalLoop();
    }
    log(info, callback) {
        const splunkEvent = {
            event: (0, loufairy_1.mergeObjects)(true, {
                message: info.message,
                _time: info.timestamp
            }, Object.fromEntries(Object.entries(info).filter(([prop]) => !['splat'].includes(prop))))
        };
        this._buffer.push(this._normalizeSplunkObject(splunkEvent));
        if (this._buffer.length > bufferSize) {
            this._flush();
        }
        if (callback) {
            setImmediate(callback);
        }
    }
    _flush() {
        try {
            const splunkRequest = (0, https_1.request)({
                method: 'POST',
                host: this._options.host,
                port: this._options.port,
                path: splunkEndpointPath,
                headers: {
                    Authorization: this._auth
                },
                agent: this._agent
            });
            splunkRequest.end(Buffer.from(JSON.stringify(this._buffer), 'utf8'));
            this._buffer = [];
        }
        catch (error) {
            console.log('Couln\'t post to Splunk');
        }
    }
    _normalizeSplunkValue(value) {
        if (value instanceof Error) {
            return Object.fromEntries([
                ['stack', value.stack],
                ['message', value.message],
                ...Object.entries(value)
            ]);
        }
        else if ((0, loufairy_1.isObject)(value)) {
            return this._normalizeSplunkObject(value);
        }
        return value;
    }
    _normalizeSplunkObject(splunkObject) {
        return Object.fromEntries(Object.entries(splunkObject)
            .map(([prop, value]) => [
            prop,
            this._normalizeSplunkValue(value)
        ]));
    }
    _startFlushIntervalLoop() {
        setInterval(() => this._flush(), bufferFlushInterval);
    }
}
exports.SplunkTransport = SplunkTransport;
//# sourceMappingURL=splunk_transport.js.map