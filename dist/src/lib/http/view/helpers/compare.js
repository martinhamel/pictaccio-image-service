"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = compare;
function compare(operand1, operator, operand2, caseInsensitive = false) {
    if (caseInsensitive) {
        operand1 = operand1?.toLowerCase();
        operand2 = operand2?.toLowerCase();
    }
    switch (operator) {
        case '==':
            return (operand1 == operand2);
        case '!=':
            return (operand1 != operand2);
        case '===':
            return (operand1 === operand2);
        case '<':
            return (operand1 < operand2);
        case '<=':
            return (operand1 <= operand2);
        case '>':
            return (operand1 > operand2);
        case '>=':
            return (operand1 >= operand2);
        case '&&':
            return !!(operand1 && operand2);
        case '||':
            return !!(operand1 || operand2);
        default:
            return false;
    }
}
//# sourceMappingURL=compare.js.map