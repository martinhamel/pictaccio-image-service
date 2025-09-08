import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { parentPort } from 'node:worker_threads';
import sharp from 'sharp';
import { config } from '@pictaccio/image-service/src/config';
import { logger } from '@pictaccio/image-service/src/lib/core/logger';
import { ImageResizeItem } from '@pictaccio/shared/src/types/image_resize_item';
import { computeThumbnailOutputFileName } from '@pictaccio/shared/src/utils/compute_thumbnail_output_filename';

process?.on('message', async (batch: ImageResizeItem[]) => {
    logger.debug('Received batch of images to resize', batch);

    for await (const item of batch) {
        const outputFileName = computeThumbnailOutputFileName(config.app.dirs.thumbnails, item.file, 'medium');
        logger.debug(`Resizing ${item.file} to ${outputFileName}`, {
            area: 'image-resizer-job',
            subarea: 'resize-images',
            action: 'resizing-image',
        });
        await sharp(join(config.env.dirs.public, item.file))
            .resize(Math.floor(item.width), Math.floor(item.height))
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
