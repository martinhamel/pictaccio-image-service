"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Password = Password;
const class_validator_1 = require("class-validator");
const typedi_1 = require("typedi");
function Password() {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            name: 'password',
            target: object.constructor,
            propertyName: propertyName,
            validator: {
                validate(value, args) {
                    const config = typedi_1.Container.get('config');
                    let valid = true;
                    valid &&= value.length >= config.app.password.policy.minLength ||
                        value.length <= config.app.password.policy.maxLength;
                    valid &&= value.match(/[a-z]/)?.length >= config.app.password.policy.lowercase;
                    valid &&= value.match(/[A-Z]/)?.length >= config.app.password.policy.uppercase;
                    valid &&= value.match(/[^a-z0-9]/i)?.length >= config.app.password.policy.symbols;
                    valid &&= value.match(/[0-9]/)?.length >= config.app.password.policy.numbers;
                    return valid;
                },
                defaultMessage: (0, class_validator_1.buildMessage)(eachPrefix => eachPrefix + '$property must comply with the app password policy', null)
            },
        });
    };
}
//# sourceMappingURL=password.js.map