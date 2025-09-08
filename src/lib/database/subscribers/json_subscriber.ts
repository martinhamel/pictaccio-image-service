import { EntitySubscriberInterface, EventSubscriber } from 'typeorm';
import { objectPropertiesIterator } from '@loufa/loufairy';

@EventSubscriber()
export class JsonSubscriber implements EntitySubscriberInterface<any> {
    afterLoad(entity: any): void {
        for (const prop of objectPropertiesIterator(entity, /.*_json$/)) {
            try {
                entity[prop.slice(0, -5)] = JSON.parse(entity[prop])
            } catch (e) {
                // Pass
            }
        }
    }
}
