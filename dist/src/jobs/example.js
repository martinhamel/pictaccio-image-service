"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const public_user_1 = require("../database/models/public_user");
exports.default = (async function () {
    let users;
    try {
        users = await public_user_1.PublicUser.find();
    }
    catch (e) {
        users = undefined;
    }
    console.log(users);
});
//# sourceMappingURL=example.js.map