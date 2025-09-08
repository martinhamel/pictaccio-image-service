import { LoaderState } from '../../lib/bootstrap/loader_state';

export interface LoaderInterface {
    (state: LoaderState): Promise<any> | any;
}
