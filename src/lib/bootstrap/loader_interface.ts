import { LoaderState } from '@pictaccio/image-service/src/lib/bootstrap/loader_state';

export interface LoaderInterface {
    (state: LoaderState): Promise<any> | any;
}
