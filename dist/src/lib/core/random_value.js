"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomValue = randomValue;
const node_crypto_1 = require("node:crypto");
async function randomValue(max, min = 0) {
    return new Promise((resolve, _) => {
        (0, node_crypto_1.randomInt)(min, max, (error, value) => {
            resolve(value);
        });
    });
}
//# sourceMappingURL=random_value.js.map