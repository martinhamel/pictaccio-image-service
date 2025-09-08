import { config } from '../config';
import { logger } from '../lib/core/logger';
import { WatermarkedImageResizeItem } from '@pictaccio/shared/types/watermarked_image_resize_item';
import { computeThumbnailOutputFileName } from '@pictaccio/shared/utils/compute_thumbnail_output_filename';
import { join } from 'node:path';
import { parentPort } from 'node:worker_threads';
import sharp from 'sharp';

process?.on('message', async (batch: WatermarkedImageResizeItem[]) => {
    const watermarkImagePath = config.env.dirs.public + '/watermark.png';
    let watermarkBuffer: Buffer;
    let watermarkMetadata: sharp.Metadata;
    let watermarkImage = '';

    logger.debug('Received batch of images to resize', batch);

    for (const item of batch) {
        const outputFileName =
            computeThumbnailOutputFileName(config.app.dirs.thumbnails, item.file, 'medium-watermarked');

        logger.debug(`Resizing ${item.file} to ${outputFileName}`, {
            area: 'image-resizer-job',
            subarea: 'resize-images-watermarked',
            action: 'resizing-image-watermarked',
        });

        if (watermarkImage !== watermarkImagePath + item.width + item.height) {
            watermarkImage = watermarkImagePath;
            watermarkMetadata = await sharp(watermarkImage).metadata();

            const ratio = watermarkMetadata.width / watermarkMetadata.height;
            const widthDelta = item.width - watermarkMetadata.width;
            const watermarkWidth = watermarkMetadata.width > item.width
                ? item.width
                : watermarkMetadata.width;
            const watermarkHeight = Math.floor(watermarkWidth / ratio);

            watermarkBuffer = await sharp(watermarkImage)
                .resize(Math.floor(Math.min(watermarkWidth, item.width)),
                    Math.floor(Math.min(watermarkHeight, item.height)))
                .composite([
                    {
                        input: Buffer.from([0, 0, 0, 0]),
                        raw: {
                            width: 1,
                            height: 1,
                            channels: 4,
                        },
                        tile: true,
                    }
                ])
                .toBuffer();
        }

        await sharp(join(config.env.dirs.public, item.file))
            .resize(Math.floor(item.width), Math.floor(item.height))
            .composite([
                {
                    input: watermarkBuffer,
                    gravity: 'center',
                    tile: false,
                },
            ])
            .webp()
            .toFile(outputFileName)
            .catch((error) => {
                logger.error(error);
            });
    }

    logger.debug('Batch of images resized successfully', {
        area: 'image-resizer-job',
        subarea: 'resize-images',
        action: 'images-resized',
    });

    process?.send('done');
});
