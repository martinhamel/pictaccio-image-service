"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoaderState = void 0;
const utils_1 = require("../../lib/core/utils");
const loader_error_1 = require("../../lib/errors/loader_error");
class LoaderState {
    _offers;
    _waitingOnOffers;
    constructor() {
        this._offers = {};
        this._waitingOnOffers = [];
    }
    offer(offerName, callback) {
        if (this._offers[offerName] !== undefined) {
            throw new loader_error_1.LoaderError(`${offerName} already on offer`);
        }
        this._offers[offerName] = callback;
        for (let i = this._waitingOnOffers.length - 1; i >= 0; --i) {
            if (this._waitingOnOffers[i].valueName === offerName) {
                this._waitingOnOffers[i].resolve(callback(...this._waitingOnOffers[i].args || []));
                this._waitingOnOffers.slice(i, 1);
            }
        }
    }
    async request(valueName, ...args) {
        if (this._offers[valueName] !== undefined) {
            return Promise.resolve(this._offers[valueName](...args));
        }
        else {
            try {
                return await (0, utils_1.createPromiseTimeout)(30000, new Promise((resolve, reject) => {
                    this._waitingOnOffers.push({
                        valueName,
                        args,
                        resolve,
                        reject
                    });
                }));
            }
            catch (error) {
                if (error === 'timeout') {
                    throw new loader_error_1.LoaderError(`Timout: Unmet dependency '${valueName}'`);
                }
                throw new Error(error);
            }
        }
    }
}
exports.LoaderState = LoaderState;
//# sourceMappingURL=loader_state.js.map