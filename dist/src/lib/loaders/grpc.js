"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.grpcLoader = void 0;
const grpc_js_1 = require("@grpc/grpc-js");
const logger_1 = require("../../lib/core/logger");
const image_grpc_service_1 = require("../../services/image_grpc_service");
const image_service_v1_grpc_pb_1 = require("@pictaccio/grpc-service-contracts/image_service_v1_grpc_pb");
const typedi_1 = require("typedi");
const grpcLoader = async () => {
    return new Promise((resolve, reject) => {
        const config = typedi_1.Container.get('config');
        const server = new grpc_js_1.Server();
        server.addService(image_service_v1_grpc_pb_1.ImageService, new image_grpc_service_1.ImageGrpcService());
        logger_1.logger.info('Initializing gRPC', {
            area: 'loaders',
            subarea: 'grpc',
            action: 'loading'
        });
        server.bindAsync(`${config.rpc.imageServiceServer.interface}:${config.rpc.imageServiceServer.listen}`, grpc_js_1.ServerCredentials.createInsecure(), (error, port) => {
            if (error) {
                logger_1.logger.error('Failed initializing gRPC', {
                    area: 'loaders',
                    subarea: 'express',
                    action: 'loading',
                    error
                });
                reject(error);
            }
            else {
                logger_1.logger.info('Initialized gRPC successfully, listening on ' +
                    `${config.rpc.imageServiceServer.interface}:${config.rpc.imageServiceServer.listen}`, {
                    area: 'loaders',
                    subarea: 'express',
                    action: 'loading'
                });
                server.start();
                resolve(port);
            }
        });
    });
};
exports.grpcLoader = grpcLoader;
//# sourceMappingURL=grpc.js.map