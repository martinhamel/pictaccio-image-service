import { Action, createParamDecorator } from 'routing-controllers';
import { Container } from 'typedi';
import { ConfigSchema } from '@pictaccio/image-service/src/core/config_schema';
import { getFixedT } from '@pictaccio/image-service/src/lib/loaders/i18next';

const config: ConfigSchema = Container.get<ConfigSchema>('config');

export const T = createParamDecorator({
    required: true,
    value: async (action: Action) => getFixedT(action.request.session.lang || config.locales.fallbacks.lang)
});
