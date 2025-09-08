import { useContainer as typeormUseContainer } from 'typeorm';
import { useContainer as classValidatorUseContainer } from '@loufa/class-validator';
import { useContainer as routingControllerUseContainer } from '@loufa/routing-controllers';
import { Container } from 'typedi';
import { Container as TypeORMContainer } from 'typeorm-typedi-extensions';
import { LoaderInterface } from '@pictaccio/image-service/src/lib/bootstrap';

export const typediLoader: LoaderInterface = async (): Promise<any> => {
    typeormUseContainer(TypeORMContainer);
    //classValidatorUseContainer(Container);
    routingControllerUseContainer(Container);
}
