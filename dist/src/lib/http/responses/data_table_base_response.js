"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataTableBaseResponse = void 0;
const base_response_1 = require("../../../http/controllers/responses/base_response");
class DataTableBaseResponse extends base_response_1.BaseResponse {
    affected;
    error;
    createdId;
    results;
    resultTotal;
}
exports.DataTableBaseResponse = DataTableBaseResponse;
//# sourceMappingURL=data_table_base_response.js.map