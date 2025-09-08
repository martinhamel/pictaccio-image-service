import { bootstrap } from '../src/lib/bootstrap';
import { typediLoader } from '../src/lib/loaders/typedi';
import { configLoader } from '../src/lib/loaders/config';

bootstrap([
    typediLoader,
    configLoader
])
.then(() => {
    import('../node_modules/typeorm/cli');
});
