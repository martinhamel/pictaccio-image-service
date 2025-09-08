import { getUniqueFilename, checkFileMimeType } from '@loufa/loufairy-server/src/entry';
import { join } from 'path';
import { Container } from 'typedi';
import {
    BaseEntity,
    Equal,
    ILike,
    In,
    LessThan,
    LessThanOrEqual,
    Like,
    MoreThan,
    MoreThanOrEqual,
    Not,
    UpdateResult
} from 'typeorm';
import { ObjectType } from 'typeorm/common/ObjectType';
import { FindManyOptions } from 'typeorm/find-options/FindManyOptions';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';
import { FindOperator } from 'typeorm/find-options/FindOperator';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { SelectQueryBuilder } from 'typeorm/query-builder/SelectQueryBuilder';
import { ObjectId } from 'typeorm/driver/mongodb/typings';
import { SaveOptions } from 'typeorm/repository/SaveOptions';
import { RemoveOptions } from 'typeorm/repository/RemoveOptions';
import { DeleteResult } from 'typeorm/query-builder/result/DeleteResult';
import { ConfigSchema } from '../../../core/config_schema';
import { logger } from '../../../lib/core/logger';
import { httpCommonFields } from '../../../lib/core/logger_common';
import { Request } from '../../../lib/core/request';
import { getMetadata, ModelMetadata } from '../../../lib/database/decorators/metadata';
import { FileNotAllowedError } from '../../../lib/errors/file_not_allowed_error';
import { InvalidFormatError } from '../../../lib/errors/invalid_format';
import { DataTableCreateBaseRequest } from '../../../lib/http/requests/data_table_create_base_request';
import { DataTableDeleteBaseRequest } from '../../../lib/http/requests/data_table_delete_base_request';
import { DataTableReadBaseRequest } from '../../../lib/http/requests/data_table_read_base_request';
import { DataTableUpdateBaseRequest } from '../../../lib/http/requests/data_table_update_base_request';

interface BaseEntityConstraint<T extends BaseEntity> {
    new(): T;
    count<T extends BaseEntity>(this: ObjectType<T>, options?: FindManyOptions<T>): Promise<number>;
    createQueryBuilder<T extends BaseEntity>(this: ObjectType<T>, alias?: string): SelectQueryBuilder<T>;
    delete<T extends BaseEntity>(this: ObjectType<T>, criteria: string | string[] | number | number[] | Date | Date[] |
        ObjectId | ObjectId[] | FindOptionsWhere<T>, options?: RemoveOptions): Promise<DeleteResult>;
    getId<T extends BaseEntity>(this: ObjectType<T>, entity: T): any;
    find<T extends BaseEntity>(this: ObjectType<T>, options?: FindManyOptions<T>): Promise<T[]>;
    find<T extends BaseEntity>(this: ObjectType<T>, conditions?: FindOptionsWhere<T>): Promise<T[]>;
    update<T extends BaseEntity>(this: ObjectType<T>,
        criteria: string | string[] | number | number[] | Date | Date[] | ObjectId
            | ObjectId[] | FindOptionsWhere<T>,
        partialEntity: QueryDeepPartialEntity<T>,
        options?: SaveOptions): Promise<UpdateResult>;
}

type Operator = '==' | '!=' | '>' | '<' | '<=' | '>=' | 'IN' | 'NOT IN' | '~' | '~~';

export class DataTableCreateRequest<T extends BaseEntity> {
    values: DataTableValues<T>[];
}

export class DataTableDeleteRequest<T extends BaseEntity> {
    public filters?: DataTableFilterOption<T>[];
}

export class DataTableFilterOption<T extends BaseEntity> {
    public column: keyof T;
    public operator: Operator;
    public operand: T | T[];
}

export class DataTableReadSortOption<T extends BaseEntity> {
    public column: keyof T;
    public order: 'ASC' | 'DESC';
}

export class DataTableReadRequest<T extends BaseEntity> {
    public from?: number;
    public to?: number;
    public fields?: (keyof T)[];
    public filters?: DataTableFilterOption<T>[];
    public sort?: DataTableReadSortOption<T>[];
}

export class DataTableResponse<T extends BaseEntity> {
    public status: 'ok' | 'failed';
    public affected?: number;
    public error?: string;
    public createdId?: number | string;
    public results?: T[];
    public resultTotal?: number;
}

export class DataTableUpdateRequest<T extends BaseEntity> {
    public filters: DataTableFilterOption<T>[];
    public values: DataTableValues<T>[];
}

export class DataTableValues<T extends BaseEntity> {
    public column: keyof T;
    public value: any;
}

class CountReadFindOptions<T extends BaseEntity> {
    public countOptions: FindManyOptions<T>;
    public findOptions: FindManyOptions<T>;
}

export function fromCreateRequest<T extends BaseEntity>(
    request: DataTableCreateBaseRequest): DataTableCreateRequest<T> {
    return {
        values: request.values as DataTableValues<T>[]
    };
}

export function fromDeleteRequest<T extends BaseEntity>(
    request: DataTableDeleteBaseRequest): DataTableDeleteRequest<T> {
    const newRequest = new DataTableDeleteRequest<T>();

    if (Array.isArray(request.filters) && request.filters.length) {
        newRequest.filters = [];
        for (const filter of request.filters) {
            newRequest.filters.push({
                operator: filter.operator,
                operand: filter.operand as any,
                column: filter.column as keyof T
            });
        }
    }

    return newRequest;
}

export function fromReadRequest<T extends BaseEntity>(
    request: DataTableReadBaseRequest): DataTableReadRequest<T> {
    const newRequest = new DataTableReadRequest<T>();

    newRequest.to = request.to;
    newRequest.from = request.from;

    if (Array.isArray(request.fields) && request.fields.length) {
        newRequest.fields = [];
        for (const field of request.fields) {
            newRequest.fields.push(field as keyof T);
        }
    }

    if (Array.isArray(request.filters) && request.filters.length) {
        newRequest.filters = [];
        for (const filter of request.filters) {
            newRequest.filters.push({
                operator: filter.operator,
                operand: filter.operand as any,
                column: filter.column as keyof T
            });
        }
    }

    if (Array.isArray(request.sort) && request.sort.length) {
        newRequest.sort = [];
        for (const sort of request.sort) {
            newRequest.sort.push({
                column: sort.column as keyof T,
                order: sort.order
            });
        }
    }

    return newRequest;
}

export function fromUpdateRequest<T extends BaseEntity>(
    request: DataTableUpdateBaseRequest): DataTableUpdateRequest<T> {
    const newRequest = new DataTableUpdateRequest<T>();

    if (Array.isArray(request.filters) && request.filters.length) {
        newRequest.filters = [];

        for (const filter of request.filters) {
            newRequest.filters.push({
                operator: filter.operator,
                operand: filter.operand as any,
                column: filter.column as keyof T
            });
        }
    }

    if (Array.isArray(request.values) && request.values.length) {
        newRequest.values = [];

        for (const value of request.values) {
            if ('value' in value) {
                newRequest.values.push({
                    column: value.column as keyof T,
                    value: value.value
                });
            }
        }
    }

    return newRequest;
}

const config: ConfigSchema = Container.get<ConfigSchema>('config');

export class DataTable<T extends BaseEntity> {
    private readonly _model: BaseEntityConstraint<T>;
    private readonly _modelMetadata: ModelMetadata<T>;
    private readonly _request: Request;

    constructor(model: BaseEntityConstraint<T>, request: Request) {
        this._model = model;
        this._modelMetadata = getMetadata(model);
        this._request = request;
    }

    public async processCreate(request: DataTableCreateRequest<T>): Promise<DataTableResponse<T>> {
        const record = await this._buildRecordFromRequest(request);
        let errorMessage: string;
        let result: T;

        try {
            result = await record.save();
        } catch (error) {
            logger.error('Failed to create record', {
                area: 'database',
                subarea: 'data-table',
                action: 'processCreate',
                result: 'error',
                error,
                ...httpCommonFields(this._request)
            });
            errorMessage = error.message;
        }

        return {
            status: errorMessage ? 'failed' : 'ok',
            error: errorMessage,
            createdId: !errorMessage ? result.hasId() ? this._model.getId(record) : null : undefined
        };
    }

    public async processDelete(request: DataTableDeleteRequest<T>): Promise<DataTableResponse<T>> {
        const findOptions = this._buildFindConditionsForUpdateOrDeleteFromRequest(request);
        let errorMessage: string;
        let result: DeleteResult;

        try {
            result = await this._model.delete(findOptions);
        } catch (error) {
            logger.error('Failed to delete record', {
                area: 'database',
                subarea: 'data-table',
                action: 'processDelete',
                result: 'error',
                error,
                ...httpCommonFields(this._request)
            });
            errorMessage = error.message;
        }

        return {
            status: errorMessage ? 'failed' : 'ok',
            error: errorMessage,
            affected: result?.affected
        };
    }

    public async processRead(request: DataTableReadRequest<T>): Promise<DataTableResponse<T>> {
        const { countOptions, findOptions } = this._buildFindOptionsForReadFromRequest(request);
        let errorMessage: string;
        let count: number;
        let results: T[];

        try {
            count = await this._model.count(countOptions);
            results = await this._model.find(findOptions);
        } catch (error) {
            logger.error('Failed to read records', {
                area: 'database',
                subarea: 'data-table',
                action: 'processRead',
                result: 'error',
                error,
                ...httpCommonFields(this._request)
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

    public async processUpdate(request: DataTableUpdateRequest<T>): Promise<DataTableResponse<T>> {
        const findOptions = this._buildFindConditionsForUpdateOrDeleteFromRequest(request);
        const record = await this._buildRecordFromRequest(request);
        let errorMessage: string;
        let result: UpdateResult;

        try {
            result = await this._model.update(findOptions, record);
        } catch (error) {
            logger.error('Failed to update records', {
                area: 'database',
                subarea: 'data-table',
                action: 'processUpdate',
                result: 'error',
                error,
                ...httpCommonFields(this._request)
            });
            errorMessage = error.message;
        }

        return {
            status: errorMessage ? 'failed' : 'ok',
            error: errorMessage,
            affected: result?.affected
        };
    }

    /* PRIVATE */
    private _buildFindOptionsForReadFromRequest(request: DataTableReadRequest<T>): CountReadFindOptions<T> {
        const countOptions: FindManyOptions<T> = {};
        const findOptions: FindManyOptions<T> = {};

        if (request.from !== undefined && request.to !== undefined) {
            findOptions.skip = request.from;
            findOptions.take = request.to - request.from;
        }

        if (Array.isArray(request.fields)) {
            countOptions.select = findOptions.select =
                request.fields.filter(field => this._modelMetadata.allowedOnWire.includes(field));
        } else {
            countOptions.select = findOptions.select = this._modelMetadata.allowedOnWire;
        }

        if (Array.isArray(request.filters)) {
            countOptions.where = findOptions.where = {};

            for (const filter of request.filters) {
                countOptions.where[filter.column as string] =
                    findOptions.where[filter.column as string] = this._whereOperator(filter.operand, filter.operator);
            }
        }

        if (Array.isArray(request.sort)) {
            findOptions.order = {};

            for (const sort of request.sort) {
                findOptions.order[sort.column as string] = sort.order;
            }
        }

        return { countOptions, findOptions };
    }

    private _buildFindConditionsForUpdateOrDeleteFromRequest(
        request: DataTableUpdateRequest<T> | DataTableDeleteRequest<T>): FindOptionsWhere<T> {
        const findOptions: FindOptionsWhere<T> = {};

        if (Array.isArray(request.filters)) {
            for (const filter of request.filters) {
                findOptions[filter.column as string] = this._whereOperator(filter.operand, filter.operator);
            }
        }

        return findOptions;
    }

    private async _buildRecordFromRequest(
        request: DataTableCreateRequest<T> | DataTableUpdateRequest<T>): Promise<{ [Property in keyof T]: any }> {

        const createRequest = request.values.reduce((record, value) => {
            record[value.column] = value.value;
            return record;
        }, new this._model);

        return await this._sanitizeFieldData(createRequest);
    }

    private _hasFileRefs(field: any): boolean {
        return (typeof field === 'string' && field.startsWith('___DT_FILE___')) ||
            (Array.isArray(field) && typeof field[0] === 'string') && field[0]?.startsWith('___DT_FILE___');
    }

    private async _sanitizeFieldData(record: { [Property in keyof T]: any }): Promise<{ [Property in keyof T]: any }> {
        for (const [columnName, field] of Object.entries(record)) {
            if (this._hasFileRefs(field)) {
                if (Object.keys(this._modelMetadata.allowedUploads).includes(columnName)) {
                    record[columnName] = await this._saveFile(columnName as keyof T, field);
                } else {
                    throw new FileNotAllowedError(`Column ${columnName} doesn't support files`);
                }
            }
        }

        return record;
    }

    private async _saveFile(columnName: keyof T, value: string | string[]): Promise<string | string[]> {
        const allowedMimes = this._modelMetadata.allowedUploads[columnName].allowedMimes;
        const destinationDir = this._modelMetadata.allowedUploads[columnName].path;
        const fileNames: string[] = [];
        let arrayFlag = false;

        if (!Array.isArray(value)) {
            value = [value];
            arrayFlag = true;
        }

        for (const fileItemRef of value) {
            if (this._request.files[fileItemRef] !== undefined) {
                const fileMime = process.platform === "win32"
                    ? 'image/jpeg'
                    : await checkFileMimeType(this._request.files[fileItemRef].data);
                const fileOnDisk = await getUniqueFilename(join(destinationDir, this._request.files[fileItemRef].name));

                if (!allowedMimes.some(regex => regex.test(fileMime))) {
                    throw new InvalidFormatError();
                }

                this._request.files[fileItemRef].mv(fileOnDisk);
                fileNames.push(fileOnDisk.slice(config.env.dirs.public.length + 1).replace(/\\/g, '/'));
            }
        }

        return arrayFlag
            ? fileNames[0]
            : fileNames;
    }

    private _whereOperator(operand: T | T[] | FindOperator<T>, operator: Operator): FindOperator<T | T[]> {
        switch (operator) {
            case '==':
                return Equal(operand);
            case '!=':
                return Not(Equal(operand));
            case '<':
                return LessThan(operand);
            case '<=':
                return LessThanOrEqual(operand);
            case '>':
                return MoreThan(operand);
            case '>=':
                return MoreThanOrEqual(operand);
            case 'IN':
                return In(operand as T[]);
            case 'NOT IN':
                return Not(In(operand as T[]));
            case '~':
                return Like(operand);
            case '~~':
                return ILike(operand);
        }
    }
}
