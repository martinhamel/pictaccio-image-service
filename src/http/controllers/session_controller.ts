import { Response } from 'express';
import { changeLanguage } from 'i18next';
import { Inject, Service } from 'typedi';
import { Body, Get, JsonController, Post, Res, Session } from 'routing-controllers';
import { ResponseSchema } from 'routing-controllers-openapi';
import { ConfigSchema } from '@pictaccio/image-service/src/core/config_schema';
import { SessionInterface } from '@pictaccio/image-service/src/core/session_interface';
import { SessionGetLangResponse } from '@pictaccio/image-service/src/http/controllers/responses/session_get_lang_response';
import { SessionPostLangResponse } from '@pictaccio/image-service/src/http/controllers/responses/session_post_lang_response';
import { SessionPostLangRequest } from '@pictaccio/image-service/src/http/controllers/requests/session_post_lang_request';

@Service()
@JsonController('/session')
export class SessionController {
    constructor(@Inject('config') private _config: ConfigSchema) {
    }

    @Get('/lang')
    @ResponseSchema(SessionGetLangResponse)
    public async getLang(@Session() session: SessionInterface): Promise<SessionGetLangResponse> {
        return {
            status: 'ok',
            lang: session.lang || this._config.locales.fallbacks.lang
        };
    }

    @Post('/lang')
    @ResponseSchema(SessionPostLangResponse)
    public async postLang(@Body() body: SessionPostLangRequest,
        @Session() session: SessionInterface,
        @Res() response: Response): Promise<SessionPostLangResponse> {

        if (!this._config.locales.supported.includes(body.lang)) {
            response.status(400);
            return {
                status: 'failed'
            };
        }

        await changeLanguage(body.lang);
        session.lang = body.lang;
        return {
            status: 'ok'
        };
    }
}
