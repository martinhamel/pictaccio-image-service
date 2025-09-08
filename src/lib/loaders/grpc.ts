import { Server, ServerCredentials } from '@grpc/grpc-js';
import { ConfigSchema } from '../../core/config_schema';
import { LoaderInterface } from '../../lib/bootstrap';
import { logger } from '../../lib/core/logger';
import { ImageGrpcService } from '../../services/image_grpc_service';
import { ImageService } from '@pictaccio/grpc-service-contracts/image_service_v1_grpc_pb';
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
