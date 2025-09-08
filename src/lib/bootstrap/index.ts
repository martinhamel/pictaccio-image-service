import { Bootstraper } from '../../lib/bootstrap/bootstraper';

export { loaderState } from '../../lib/bootstrap/bootstraper';
export { exportState } from '../../lib/bootstrap/export_state_decorator';
export { LoaderInterface } from '../../lib/bootstrap/loader_interface';
export { LoaderState } from '../../lib/bootstrap/loader_state';
export { onExit } from '../../lib/bootstrap/on_exit';

export function bootstrap(loaders: any[]): Promise<any> {
    const bootstrapper = new Bootstraper(loaders);

    return bootstrapper.run();
}
