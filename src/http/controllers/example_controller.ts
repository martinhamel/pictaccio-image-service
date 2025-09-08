import { Response } from 'express';
import { promises as fsPromises } from 'fs';
import { Authorized, Body, Get, JsonController, Param, Post, Req, Res, ViewRender, ViewObj } from '@loufa/routing-controllers';
import { TFunction } from 'i18next';
import { join } from 'path';
import { Inject, Service } from 'typedi';
import { Request } from '@pictaccio/image-service/src/lib/core/request';
import { MailerItem, MailerInterface } from '@pictaccio/image-service/src/core/mailer_interface';
import {
    DataTable,
    DataTableCreateRequest,
    DataTableDeleteRequest,
    DataTableReadRequest,
    DataTableUpdateRequest
} from '@pictaccio/image-service/src/lib/database/helpers/data_table';
import { PublicUser } from '@pictaccio/image-service/src/database/models/public_user';
import { T } from '@pictaccio/image-service/src/lib/http/decorators/t';
import { View } from '@pictaccio/image-service/src/lib/http/view/view';
import { DataTableCreateBaseRequestRaw } from '@pictaccio/image-service/src/lib/http/requests/data_table_create_base_request';
import { DataTableReadBaseRequest } from '@pictaccio/image-service/src/lib/http/requests/data_table_read_base_request';
import { DataTableUpdateBaseRequest } from '@pictaccio/image-service/src/lib/http/requests/data_table_update_base_request';
import { DataTableDeleteBaseRequest } from '@pictaccio/image-service/src/lib/http/requests/data_table_delete_base_request';

@Service()
@JsonController()
export class ExampleController {
    @Inject('config')
    private _config;

    @Inject('mailer')
    private _mailer: MailerInterface;

    /**
     * Example GET request handler
     */
    @Get('/test')
    test(@T t: TFunction): any {
        return {
            message: 'test',
            translated: t('cancel'),
            translatedWithNamespace: t('messages:test'),
            translatedMissingNamespace: t('missing:test'),
            translatedMissingKey: t('missing')
        };
    }

    /**
     * Send test email
     */
    @Get('/testMessage')
    async testSendMessage(@Res() response: Response): Promise<string> {
        //const mailerSend = await loaderState.request('Mailer.send');
        const message: MailerItem = {
            from: 'test@mail.com',
            message: 'This is a test',
            subject: 'This is a test',
            to: 'test@mail.com'
        };

        try {
            await this._mailer.send(message);
        } catch (error) {
            response.status(500);
            return 'Failed ' + error.message + '  ' + error.stack;
        }

        return 'Message sent';
    }

    /**
     * Test roles permissions
     */
    @Authorized('admin:read:test')
    @Get('/only-admins')
    async onlyAdmins(@Req() request: Request): Promise<string> {
        return request.toString();
    }

    /**
     * View testing page
     */
    @Get('/render-test')
    @ViewRender('test')
    async renderTest(@ViewObj() view: View): Promise<any> {
        view.setTitle('test title');
        view.addScripts('app.min.js', true, true);
        return {
            test: 'patate'
        };
    }

    /**
     * Generic View
     */
    @Get('/home')
    @ViewRender('home')
    async renderHome(@ViewObj() view: View): Promise<any> {
        view.setTitle('home');
        view.addScripts('app.min.js', true, true);
    }

    /**
     * View localized with Markdown file
     */
    @Get('/docs/:slug')
    @ViewRender('documentation')
    async renderDocumentation(@ViewObj() view: View, @Param('slug') slug: string): Promise<any> {
        view.setTitle(slug);
        view.addScripts('app.min.js', true, true);

        const locale = 'en';
        const docs = {
            test1: 'test1.md'
        };

        return {
            mdDoc: await (
                await fsPromises.readFile(
                    join(this._config.env.dirs.docsPages, locale, docs[slug])
                )
            ).toString()
        };
    }

    /**
     * Test CRUD Post for dbtables
     */
    // @Post('/test-dbtable_create')
    // async create(@Req() request: Request, @Body() body: DataTableCreateBaseRequestRaw): Promise<any> {
    //     const dataTable = new DataTable(TransactionalBackground, request);
    //
    //     const test = await dataTable.processCreate(body.raw as unknown as DataTableCreateRequest<TransactionalBackground>);
    //     return test;
    // }

    // @Post('/test-dbtable_delete')
    // async delete(@Req() request: Request, @Body() body: DataTableDeleteBaseRequest): Promise<any> {
    //     const dataTable = new DataTable(PublicUser, request);
    //
    //     const test = await dataTable.processDelete(body as unknown as DataTableDeleteRequest<PublicUser>);
    //     return test;
    // }

    // @Post('/test-dbtable_read')
    // async read(@Req() request: Request, @Body() body: DataTableReadBaseRequest): Promise<any> {
    //     const dataTable = new DataTable(PublicUser, request);
    //
    //     const test = await dataTable.processRead(body as unknown as DataTableReadRequest<PublicUser>);
    //     return test;
    // }

    // @Post('/test-dbtable_update')
    // async update(@Req() request: Request, @Body() body: DataTableUpdateBaseRequest): Promise<any> {
    //     const dataTable = new DataTable(PublicUser, request);
    //
    //     const test = await dataTable.processUpdate(body as unknown as DataTableUpdateRequest<PublicUser>);
    //     return test;
    // }
}
