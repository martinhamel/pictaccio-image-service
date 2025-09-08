"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataTable = exports.DataTableValues = exports.DataTableUpdateRequest = exports.DataTableResponse = exports.DataTableReadRequest = exports.DataTableReadSortOption = exports.DataTableFilterOption = exports.DataTableDeleteRequest = exports.DataTableCreateRequest = void 0;
exports.fromCreateRequest = fromCreateRequest;
exports.fromDeleteRequest = fromDeleteRequest;
exports.fromReadRequest = fromReadRequest;
exports.fromUpdateRequest = fromUpdateRequest;
const entry_1 = require("@loufa/loufairy-server/src/entry");
const path_1 = require("path");
const typedi_1 = require("typedi");
const typeorm_1 = require("typeorm");
const logger_1 = require("../../../lib/core/logger");
const logger_common_1 = require("../../../lib/core/logger_common");
const metadata_1 = require("../../../lib/database/decorators/metadata");
const file_not_allowed_error_1 = require("../../../lib/errors/file_not_allowed_error");
const invalid_format_1 = require("../../../lib/errors/invalid_format");
class DataTableCreateRequest {
    values;
}
exports.DataTableCreateRequest = DataTableCreateRequest;
class DataTableDeleteRequest {
    filters;
}
exports.DataTableDeleteRequest = DataTableDeleteRequest;
class DataTableFilterOption {
    column;
    operator;
    operand;
}
exports.DataTableFilterOption = DataTableFilterOption;
class DataTableReadSortOption {
    column;
    order;
}
exports.DataTableReadSortOption = DataTableReadSortOption;
class DataTableReadRequest {
    from;
    to;
    fields;
    filters;
    sort;
}
exports.DataTableReadRequest = DataTableReadRequest;
class DataTableResponse {
    status;
    affected;
    error;
    createdId;
    results;
    resultTotal;
}
exports.DataTableResponse = DataTableResponse;
class DataTableUpdateRequest {
    filters;
    values;
}
exports.DataTableUpdateRequest = DataTableUpdateRequest;
class DataTableValues {
    column;
    value;
}
exports.DataTableValues = DataTableValues;
class CountReadFindOptions {
    countOptions;
    findOptions;
}
function fromCreateRequest(request) {
    return {
        values: request.values
    };
}
function fromDeleteRequest(request) {
    const newRequest = new DataTableDeleteRequest();
    if (Array.isArray(request.filters) && request.filters.length) {
        newRequest.filters = [];
        for (const filter of request.filters) {
            newRequest.filters.push({
                operator: filter.operator,
                operand: filter.operand,
                column: filter.column
            });
        }
    }
    return newRequest;
}
function fromReadRequest(request) {
    const newRequest = new DataTableReadRequest();
    newRequest.to = request.to;
    newRequest.from = request.from;
    if (Array.isArray(request.fields) && request.fields.length) {
        newRequest.fields = [];
        for (const field of request.fields) {
            newRequest.fields.push(field);
        }
    }
    if (Array.isArray(request.filters) && request.filters.length) {
        newRequest.filters = [];
        for (const filter of request.filters) {
            newRequest.filters.push({
                operator: filter.operator,
                operand: filter.operand,
                column: filter.column
            });
        }
    }
    if (Array.isArray(request.sort) && request.sort.length) {
        newRequest.sort = [];
        for (const sort of request.sort) {
            newRequest.sort.push({
                column: sort.column,
                order: sort.order
            });
        }
    }
    return newRequest;
}
function fromUpdateRequest(request) {
    const newRequest = new DataTableUpdateRequest();
    if (Array.isArray(request.filters) && request.filters.length) {
        newRequest.filters = [];
        for (const filter of request.filters) {
            newRequest.filters.push({
                operator: filter.operator,
                operand: filter.operand,
                column: filter.column
            });
        }
    }
    if (Array.isArray(request.values) && request.values.length) {
        newRequest.values = [];
        for (const value of request.values) {
            if ('value' in value) {
                newRequest.values.push({
                    column: value.column,
                    value: value.value
                });
            }
        }
    }
    return newRequest;
}
const config = typedi_1.Container.get('config');
class DataTable {
    _model;
    _modelMetadata;
    _request;
    constructor(model, request) {
        this._model = model;
        this._modelMetadata = (0, metadata_1.getMetadata)(model);
        this._request = request;
    }
    async processCreate(request) {
        const record = await this._buildRecordFromRequest(request);
        let errorMessage;
        let result;
        try {
            result = await record.save();
        }
        catch (error) {
            logger_1.logger.error('Failed to create record', {
                area: 'database',
                subarea: 'data-table',
                action: 'processCreate',
                result: 'error',
                error,
                ...(0, logger_common_1.httpCommonFields)(this._request)
            });
            errorMessage = error.message;
        }
        return {
            status: errorMessage ? 'failed' : 'ok',
            error: errorMessage,
            createdId: !errorMessage ? result.hasId() ? this._model.getId(record) : null : undefined
        };
    }
    async processDelete(request) {
        const findOptions = this._buildFindConditionsForUpdateOrDeleteFromRequest(request);
        let errorMessage;
        let result;
        try {
            result = await this._model.delete(findOptions);
        }
        catch (error) {
            logger_1.logger.error('Failed to delete record', {
                area: 'database',
                subarea: 'data-table',
                action: 'processDelete',
                result: 'error',
                error,
                ...(0, logger_common_1.httpCommonFields)(this._request)
            });
            errorMessage = error.message;
        }
        return {
            status: errorMessage ? 'failed' : 'ok',
            error: errorMessage,
            affected: result?.affected
        };
    }
    async processRead(request) {
        const { countOptions, findOptions } = this._buildFindOptionsForReadFromRequest(request);
        let errorMessage;
        let count;
        let results;
        try {
            count = await this._model.count(countOptions);
            results = await this._model.find(findOptions);
        }
        catch (error) {
            logger_1.logger.error('Failed to read records', {
                area: 'database',
                subarea: 'data-table',
                action: 'processRead',
                result: 'error',
                error,
                ...(0, logger_common_1.httpCommonFields)(this._request)
            });
            errorMessage = error.message;
        }
        return {
            status: errorMessage ? 'failed' : 'ok',
            error: errorMessage,
            results,
            resultTotal: count
        };
    }
    async processUpdate(request) {
        const findOptions = this._buildFindConditionsForUpdateOrDeleteFromRequest(request);
        const record = await this._buildRecordFromRequest(request);
        let errorMessage;
        let result;
        try {
            result = await this._model.update(findOptions, record);
        }
        catch (error) {
            logger_1.logger.error('Failed to update records', {
                area: 'database',
                subarea: 'data-table',
                action: 'processUpdate',
                result: 'error',
                error,
                ...(0, logger_common_1.httpCommonFields)(this._request)
            });
            errorMessage = error.message;
        }
        return {
            status: errorMessage ? 'failed' : 'ok',
            error: errorMessage,
            affected: result?.affected
        };
    }
    _buildFindOptionsForReadFromRequest(request) {
        const countOptions = {};
        const findOptions = {};
        if (request.from !== undefined && request.to !== undefined) {
            findOptions.skip = request.from;
            findOptions.take = request.to - request.from;
        }
        if (Array.isArray(request.fields)) {
            countOptions.select = findOptions.select =
                request.fields.filter(field => this._modelMetadata.allowedOnWire.includes(field));
        }
        else {
            countOptions.select = findOptions.select = this._modelMetadata.allowedOnWire;
        }
        if (Array.isArray(request.filters)) {
            countOptions.where = findOptions.where = {};
            for (const filter of request.filters) {
                countOptions.where[filter.column] =
                    findOptions.where[filter.column] = this._whereOperator(filter.operand, filter.operator);
            }
        }
        if (Array.isArray(request.sort)) {
            findOptions.order = {};
            for (const sort of request.sort) {
                findOptions.order[sort.column] = sort.order;
            }
        }
        return { countOptions, findOptions };
    }
    _buildFindConditionsForUpdateOrDeleteFromRequest(request) {
        const findOptions = {};
        if (Array.isArray(request.filters)) {
            for (const filter of request.filters) {
                findOptions[filter.column] = this._whereOperator(filter.operand, filter.operator);
            }
        }
        return findOptions;
    }
    async _buildRecordFromRequest(request) {
        const createRequest = request.values.reduce((record, value) => {
            record[value.column] = value.value;
            return record;
        }, new this._model);
        return await this._sanitizeFieldData(createRequest);
    }
    _hasFileRefs(field) {
        return (typeof field === 'string' && field.startsWith('___DT_FILE___')) ||
            (Array.isArray(field) && typeof field[0] === 'string') && field[0]?.startsWith('___DT_FILE___');
    }
    async _sanitizeFieldData(record) {
        for (const [columnName, field] of Object.entries(record)) {
            if (this._hasFileRefs(field)) {
                if (Object.keys(this._modelMetadata.allowedUploads).includes(columnName)) {
                    record[columnName] = await this._saveFile(columnName, field);
                }
                else {
                    throw new file_not_allowed_error_1.FileNotAllowedError(`Column ${columnName} doesn't support files`);
                }
            }
        }
        return record;
    }
    async _saveFile(columnName, value) {
        const allowedMimes = this._modelMetadata.allowedUploads[columnName].allowedMimes;
        const destinationDir = this._modelMetadata.allowedUploads[columnName].path;
        const fileNames = [];
        let arrayFlag = false;
        if (!Array.isArray(value)) {
            value = [value];
            arrayFlag = true;
        }
        for (const fileItemRef of value) {
            if (this._request.files[fileItemRef] !== undefined) {
                const fileMime = process.platform === "win32"
                    ? 'image/jpeg'
                    : await (0, entry_1.checkFileMimeType)(this._request.files[fileItemRef].data);
                const fileOnDisk = await (0, entry_1.getUniqueFilename)((0, path_1.join)(destinationDir, this._request.files[fileItemRef].name));
                if (!allowedMimes.some(regex => regex.test(fileMime))) {
                    throw new invalid_format_1.InvalidFormatError();
                }
                this._request.files[fileItemRef].mv(fileOnDisk);
                fileNames.push(fileOnDisk.slice(config.env.dirs.public.length + 1).replace(/\\/g, '/'));
            }
        }
        return arrayFlag
            ? fileNames[0]
            : fileNames;
    }
    _whereOperator(operand, operator) {
        switch (operator) {
            case '==':
                return (0, typeorm_1.Equal)(operand);
            case '!=':
                return (0, typeorm_1.Not)((0, typeorm_1.Equal)(operand));
            case '<':
                return (0, typeorm_1.LessThan)(operand);
            case '<=':
                return (0, typeorm_1.LessThanOrEqual)(operand);
            case '>':
                return (0, typeorm_1.MoreThan)(operand);
            case '>=':
                return (0, typeorm_1.MoreThanOrEqual)(operand);
            case 'IN':
                return (0, typeorm_1.In)(operand);
            case 'NOT IN':
                return (0, typeorm_1.Not)((0, typeorm_1.In)(operand));
            case '~':
                return (0, typeorm_1.Like)(operand);
            case '~~':
                return (0, typeorm_1.ILike)(operand);
        }
    }
}
exports.DataTable = DataTable;
//# sourceMappingURL=data_table.js.map