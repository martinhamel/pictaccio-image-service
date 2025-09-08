"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportState = exportState;
function exportState(state) {
    return (object, propertyName) => {
        const objectName = typeof object.constructor === 'function' && object.constructor.name !== 'Function' ?
            object.constructor.name :
            object.name;
        state.offer(`${objectName}.${propertyName}`, (args) => {
            return object[propertyName](...args || []);
        });
    };
}
//# sourceMappingURL=export_state_decorator.js.map