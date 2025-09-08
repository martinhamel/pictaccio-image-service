import { Bootstraper } from '@pictaccio/image-service/src/lib/bootstrap/bootstraper';

export { loaderState } from '@pictaccio/image-service/src/lib/bootstrap/bootstraper';
export { exportState } from '@pictaccio/image-service/src/lib/bootstrap/export_state_decorator';
export { LoaderInterface } from '@pictaccio/image-service/src/lib/bootstrap/loader_interface';
export { LoaderState } from '@pictaccio/image-service/src/lib/bootstrap/loader_state';
export { onExit } from '@pictaccio/image-service/src/lib/bootstrap/on_exit';

export function bootstrap(loaders: any[]): Promise<any> {
    const bootstrapper = new Bootstraper(loaders);

    return bootstrapper.run();
}
