import { JsonController, Get } from '@loufa/routing-controllers';
import { Response } from 'express';
import { Authorized, Res } from 'routing-controllers';
import { Inject, Service } from 'typedi';
import { ConfigResponse } from '../../http/controllers/responses/config_response';

@Service()
@JsonController()
export class ConfigController {
    constructor(@Inject('config') private _config) {
    }

    @Get('/data/config.json')
    public config(): ConfigResponse {
        return {
            status: 'ok',
            config: {
                app: {
                    locale: this._config.app.locale,
                    password: this._config.app.password
                }
            }
        }
    }

    @Authorized()
    @Get('/data/version')
    public version(@Res() response: Response) {
        return response.status(200).send(this._config.env.version);
    }
}
