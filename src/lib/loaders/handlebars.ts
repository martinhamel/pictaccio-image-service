import { Express } from 'express'
import { create as createExpressHandlebars } from 'express-handlebars';
import { create as createHandlebars } from 'handlebars';
import { Container } from 'typedi';
import { ConfigSchema } from '@pictaccio/image-service/src/core/config_schema';
import { LoaderInterface } from '@pictaccio/image-service/src/lib/bootstrap';
import { Collection } from '@pictaccio/image-service/src/lib/core/collection';

export const handlebarsLoader: LoaderInterface = async (): Promise<any> => {
    const config = Container.get<ConfigSchema>('config');
    const app = Container.get<Express>('express.app');
    const handlebars = createHandlebars();
    const handlebarsExpress = createExpressHandlebars({ handlebars });

    (new Collection(config.server.dirs.helpers, { filter: /\.js$/ }))
        .on('ready', collection => collection.importAll())
        .on('imported-all', collection => collection.execEach(
            ({ obj }) => handlebars.registerHelper(obj.name, obj)));

    app.engine('handlebars', handlebarsExpress.engine);
    app.set('view engine', 'handlebars');
    app.set('views', config.server.dirs.templates);
}
