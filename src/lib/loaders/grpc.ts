import { Server, ServerCredentials } from '@grpc/grpc-js';
import { ConfigSchema } from '@pictaccio/image-service/src/core/config_schema';
import { LoaderInterface } from '@pictaccio/image-service/src/lib/bootstrap';
import { logger } from '@pictaccio/image-service/src/lib/core/logger';
import { ImageGrpcService } from '@pictaccio/image-service/src/services/image_grpc_service';
import { ImageService } from '@pictaccio/grpc-service-contracts/src/image-service/image_service_v1_grpc_pb';
import { Container } from 'typedi';

export const grpcLoader: LoaderInterface = async (): Promise<any> => {
    return new Promise((resolve, reject) => {
        const config = Container.get<ConfigSchema>('config');
        const server = new Server();

        server.addService(ImageService, new ImageGrpcService());

        logger.info('Initializing gRPC', {
            area: 'loaders',
            subarea: 'grpc',
            action: 'loading'
        });

        server.bindAsync(`${config.rpc.imageServiceServer.interface}:${config.rpc.imageServiceServer.listen}`,
            ServerCredentials.createInsecure(),
            (error, port) => {
                if (error) {
                    logger.error('Failed initializing gRPC', {
                        area: 'loaders',
                        subarea: 'express',
                        action: 'loading',
                        error
                    });

                    reject(error);
                } else {
                    logger.info('Initialized gRPC successfully, listening on ' +
                        `${config.rpc.imageServiceServer.interface}:${config.rpc.imageServiceServer.listen}`, {
                        area: 'loaders',
                        subarea: 'express',
                        action: 'loading'
                    });

                    server.start();
                    resolve(port);
                }
            }
        )
    })
}
