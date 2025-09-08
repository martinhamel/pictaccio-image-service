import { FastStore } from '@pictaccio/shared/src/types/fast_store';
import { Inject, Service } from 'typedi';

@Service('jobs-comm-worker')
export default class JobsCommWorkerService {
    constructor(@Inject('fast-store') private fastStore: FastStore) {
    }

    public publishProductMissingThemeImagesReport(report: number[]): void {
        this.fastStore.publish('job:product:missing-product-theme-images', JSON.stringify(report));
    }
}
