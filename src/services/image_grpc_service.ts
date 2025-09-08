import { sendUnaryData, ServerUnaryCall, UntypedHandleCall } from '@grpc/grpc-js';
import { IImageServer } from 'dist/lib/grpc-service-contracts/src/image-service/image_service_v1_grpc_pb';
import {
    ResizeRequest,
    ResizeResponse,
    SizeProfile,
    WatermarkedResizeRequest
} from 'dist/lib/grpc-service-contracts/src/image-service/image_service_v1_pb';
import { config } from '@pictaccio/image-service/src/config';
import { logger } from '@pictaccio/image-service/src/lib/core/logger';
import JobsService from '@pictaccio/image-service/src/lib/services/jobs_service';
import { ImageResizeItem } from '@pictaccio/shared/src/types/image_resize_item';
import { join } from 'node:path';
import sharp from 'sharp';
import { Container, Service } from 'typedi';

function sizeProfileToString(profile: SizeProfile): string {
    switch (profile) {
        case SizeProfile.NORMAL:
            return 'normal';
        default:
            throw new Error(`Unknown size profile: ${profile}`);
    }
}

@Service()
export class ImageGrpcService implements IImageServer {
    [name: string]: UntypedHandleCall;

    public createThumbnails(call: ServerUnaryCall<ResizeRequest, ResizeResponse>,
        callback: sendUnaryData<ResizeResponse>) {
        logger.info(`Creating thumbnail for ${call.request.getItemsList().length} files`, {
            files: call.request.getItemsList().map(item => ({
                file: item.getFile(),
                profile: item.getProfile()
            }))
        });

        Promise.all(call.request.getItemsList().map(async file => {
            logger.info(`Creating thumbnail for ${file.getFile()}`, {
                area: 'image-grpc-service',
                subarea: 'create-thumbnails',
                action: 'preparing-thumbnail-job',
            });
            const metadata = await sharp(join(config.env.dirs.public, file.getFile())).metadata();
            const portrait = metadata.width < metadata.height;
            const ratio = metadata.width / metadata.height;
            const profile = sizeProfileToString(file.getProfile());
            const width = portrait
                ? config.app.images.thumbnails.profiles[profile].portraitSize
                : config.app.images.thumbnails.profiles[profile].landscapeSize;
            const height = width / ratio;

            return { file: file.getFile(), width, height };
        }))
            .then(items => {
                logger.info(`Creating ${items.length} thumbnails`, {
                    area: 'image-grpc-service',
                    subarea: 'create-thumbnails',
                    action: 'creating-thumbnails',
                });
                const jobs = Container.get<JobsService>(JobsService);
                return jobs.run<ImageResizeItem[]>('image_resizer', items);
            })
            .then(() => {
                const response = new ResizeResponse();
                response.setSuccess(true);
                logger.info('Thumbnails created successfully', {
                    area: 'image-grpc-service',
                    subarea: 'create-thumbnails',
                    action: 'thumbnail-job-response',
                });
                callback(null, response);
            })
            .catch(error => {
                logger.error('Error while creating thumbnails', {
                    area: 'image-grpc-service',
                    subarea: 'create-thumbnails',
                    action: 'thumbnail-job-error',
                    error
                });
                callback(error);
            });
    }

    public createWatermarkedThumbnails(call: ServerUnaryCall<WatermarkedResizeRequest, ResizeResponse>,
        callback: sendUnaryData<ResizeResponse>) {
        logger.info(`Creating watermarked thumbnail for ${call.request.getItemsList().length} files`, {
            files: call.request.getItemsList().map(item => ({
                file: item.getFile(),
                profile: item.getProfile()
            }))
        });

        Promise.all(call.request.getItemsList().map(async file => {
            logger.debug(`Creating watermarked thumbnail for ${file.getFile()}`, {
                area: 'image-grpc-service',
                subarea: 'create-watermarked-thumbnails',
                action: 'preparing-thumbnail-job',
            });
            const metadata = await sharp(join(config.env.dirs.public, file.getFile())).metadata();
            const portrait = metadata.width < metadata.height;
            const ratio = metadata.width / metadata.height;
            const profile = sizeProfileToString(file.getProfile());
            const width = portrait
                ? config.app.images.thumbnails.profiles[profile].portraitSize
                : config.app.images.thumbnails.profiles[profile].landscapeSize;
            const height = width / ratio;

            return { file: file.getFile(), width, height, watermarkImagePath: call.request.getWatermarkimagepath() };
        }))
            .then(items => {
                logger.debug(`Creating ${items.length} watermarked thumbnails`, {
                    area: 'image-grpc-service',
                    subarea: 'create-watermarked-thumbnails',
                    action: 'creating-thumbnails',
                });
                const jobs = Container.get<JobsService>(JobsService);
                return jobs.run<ImageResizeItem[]>('watermarked_image_resizer', items);
            })
            .then(() => {
                const response = new ResizeResponse();
                response.setSuccess(true);
                logger.debug('Watermarked thumbnails created successfully', {
                    area: 'image-grpc-service',
                    subarea: 'create-watermarked-thumbnails',
                    action: 'thumbnail-job-response',
                });
                callback(null, response);
            })
            .catch(error => {
                logger.error('Error while creating watermarked thumbnails', {
                    area: 'image-grpc-service',
                    subarea: 'create-watermarked-thumbnails',
                    action: 'thumbnail-job-error',
                    error
                });
                callback(error);
            });
    }
}
