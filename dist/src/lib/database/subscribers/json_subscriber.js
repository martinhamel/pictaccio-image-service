"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonSubscriber = void 0;
const tslib_1 = require("tslib");
const typeorm_1 = require("typeorm");
const loufairy_1 = require("@loufa/loufairy");
let JsonSubscriber = class JsonSubscriber {
    afterLoad(entity) {
        for (const prop of (0, loufairy_1.objectPropertiesIterator)(entity, /.*_json$/)) {
            try {
                entity[prop.slice(0, -5)] = JSON.parse(entity[prop]);
            }
            catch (e) {
            }
        }
    }
};
exports.JsonSubscriber = JsonSubscriber;
exports.JsonSubscriber = JsonSubscriber = tslib_1.__decorate([
    (0, typeorm_1.EventSubscriber)()
], JsonSubscriber);
//# sourceMappingURL=json_subscriber.js.map