"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageGrpcService = void 0;
const tslib_1 = require("tslib");
const image_service_v1_pb_1 = require("@pictaccio/grpc-service-contracts/image_service_v1_pb");
const config_1 = require("../config");
const logger_1 = require("../lib/core/logger");
const jobs_service_1 = tslib_1.__importDefault(require("../lib/services/jobs_service"));
const node_path_1 = require("node:path");
const sharp_1 = tslib_1.__importDefault(require("sharp"));
const typedi_1 = require("typedi");
function sizeProfileToString(profile) {
    switch (profile) {
        case image_service_v1_pb_1.SizeProfile.NORMAL:
            return 'normal';
        default:
            throw new Error(`Unknown size profile: ${profile}`);
    }
}
let ImageGrpcService = class ImageGrpcService {
    createThumbnails(call, callback) {
        logger_1.logger.info(`Creating thumbnail for ${call.request.getItemsList().length} files`, {
            files: call.request.getItemsList().map(item => ({
                file: item.getFile(),
                profile: item.getProfile()
            }))
        });
        Promise.all(call.request.getItemsList().map(async (file) => {
            logger_1.logger.info(`Creating thumbnail for ${file.getFile()}`, {
                area: 'image-grpc-service',
                subarea: 'create-thumbnails',
                action: 'preparing-thumbnail-job',
            });
            const metadata = await (0, sharp_1.default)((0, node_path_1.join)(config_1.config.env.dirs.public, file.getFile())).metadata();
            const portrait = metadata.width < metadata.height;
            const ratio = metadata.width / metadata.height;
            const profile = sizeProfileToString(file.getProfile());
            const width = portrait
                ? config_1.config.app.images.thumbnails.profiles[profile].portraitSize
                : config_1.config.app.images.thumbnails.profiles[profile].landscapeSize;
            const height = width / ratio;
            return { file: file.getFile(), width, height };
        }))
            .then(items => {
            logger_1.logger.info(`Creating ${items.length} thumbnails`, {
                area: 'image-grpc-service',
                subarea: 'create-thumbnails',
                action: 'creating-thumbnails',
            });
            const jobs = typedi_1.Container.get(jobs_service_1.default);
            return jobs.run('image_resizer', items);
        })
            .then(() => {
            const response = new image_service_v1_pb_1.ResizeResponse();
            response.setSuccess(true);
            logger_1.logger.info('Thumbnails created successfully', {
                area: 'image-grpc-service',
                subarea: 'create-thumbnails',
                action: 'thumbnail-job-response',
            });
            callback(null, response);
        })
            .catch(error => {
            logger_1.logger.error('Error while creating thumbnails', {
                area: 'image-grpc-service',
                subarea: 'create-thumbnails',
                action: 'thumbnail-job-error',
                error
            });
            callback(error);
        });
    }
    createWatermarkedThumbnails(call, callback) {
        logger_1.logger.info(`Creating watermarked thumbnail for ${call.request.getItemsList().length} files`, {
            files: call.request.getItemsList().map(item => ({
                file: item.getFile(),
                profile: item.getProfile()
            }))
        });
        Promise.all(call.request.getItemsList().map(async (file) => {
            logger_1.logger.debug(`Creating watermarked thumbnail for ${file.getFile()}`, {
                area: 'image-grpc-service',
                subarea: 'create-watermarked-thumbnails',
                action: 'preparing-thumbnail-job',
            });
            const metadata = await (0, sharp_1.default)((0, node_path_1.join)(config_1.config.env.dirs.public, file.getFile())).metadata();
            const portrait = metadata.width < metadata.height;
            const ratio = metadata.width / metadata.height;
            const profile = sizeProfileToString(file.getProfile());
            const width = portrait
                ? config_1.config.app.images.thumbnails.profiles[profile].portraitSize
                : config_1.config.app.images.thumbnails.profiles[profile].landscapeSize;
            const height = width / ratio;
            return { file: file.getFile(), width, height, watermarkImagePath: call.request.getWatermarkimagepath() };
        }))
            .then(items => {
            logger_1.logger.debug(`Creating ${items.length} watermarked thumbnails`, {
                area: 'image-grpc-service',
                subarea: 'create-watermarked-thumbnails',
                action: 'creating-thumbnails',
            });
            const jobs = typedi_1.Container.get(jobs_service_1.default);
            return jobs.run('watermarked_image_resizer', items);
        })
            .then(() => {
            const response = new image_service_v1_pb_1.ResizeResponse();
            response.setSuccess(true);
            logger_1.logger.debug('Watermarked thumbnails created successfully', {
                area: 'image-grpc-service',
                subarea: 'create-watermarked-thumbnails',
                action: 'thumbnail-job-response',
            });
            callback(null, response);
        })
            .catch(error => {
            logger_1.logger.error('Error while creating watermarked thumbnails', {
                area: 'image-grpc-service',
                subarea: 'create-watermarked-thumbnails',
                action: 'thumbnail-job-error',
                error
            });
            callback(error);
        });
    }
};
exports.ImageGrpcService = ImageGrpcService;
exports.ImageGrpcService = ImageGrpcService = tslib_1.__decorate([
    (0, typedi_1.Service)()
], ImageGrpcService);
//# sourceMappingURL=image_grpc_service.js.map