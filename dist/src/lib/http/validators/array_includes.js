"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArrayIncludes = ArrayIncludes;
const class_validator_1 = require("class-validator");
function ArrayIncludes(property, validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            name: 'arrayIncludes',
            target: object.constructor,
            propertyName: propertyName,
            constraints: [property],
            options: validationOptions,
            validator: {
                validate(value, args) {
                    return args.value
                        ? args.value
                            .map(value => args.constraints[0].includes(value))
                            .filter(value => value)
                            .length !== 0
                        : false;
                },
                defaultMessage: (0, class_validator_1.buildMessage)(eachPrefix => eachPrefix + '$property must contain one of $constraint1 values', validationOptions)
            },
        });
    };
}
//# sourceMappingURL=array_includes.js.map