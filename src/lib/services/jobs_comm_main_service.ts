import { FastStore } from '@pictaccio/shared/src/types/fast_store';
import { Inject, Service } from 'typedi';

@Service('jobs-comm-main')
export default class JobsCommMainService {
    constructor(@Inject('fast-store') private fastStore: FastStore) {
    }

    public init(): void {
        // Pass
    }

    /* PRIVATE */
}
