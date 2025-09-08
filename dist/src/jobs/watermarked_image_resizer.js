"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const config_1 = require("../config");
const logger_1 = require("../lib/core/logger");
const compute_thumbnail_output_filename_1 = require("@pictaccio/shared/utils/compute_thumbnail_output_filename");
const node_path_1 = require("node:path");
const sharp_1 = tslib_1.__importDefault(require("sharp"));
process?.on('message', async (batch) => {
    const watermarkImagePath = config_1.config.env.dirs.public + '/watermark.png';
    let watermarkBuffer;
    let watermarkMetadata;
    let watermarkImage = '';
    logger_1.logger.debug('Received batch of images to resize', batch);
    for (const item of batch) {
        const outputFileName = (0, compute_thumbnail_output_filename_1.computeThumbnailOutputFileName)(config_1.config.app.dirs.thumbnails, item.file, 'medium-watermarked');
        logger_1.logger.debug(`Resizing ${item.file} to ${outputFileName}`, {
            area: 'image-resizer-job',
            subarea: 'resize-images-watermarked',
            action: 'resizing-image-watermarked',
        });
        if (watermarkImage !== watermarkImagePath + item.width + item.height) {
            watermarkImage = watermarkImagePath;
            watermarkMetadata = await (0, sharp_1.default)(watermarkImage).metadata();
            const ratio = watermarkMetadata.width / watermarkMetadata.height;
            const widthDelta = item.width - watermarkMetadata.width;
            const watermarkWidth = watermarkMetadata.width > item.width
                ? item.width
                : watermarkMetadata.width;
            const watermarkHeight = Math.floor(watermarkWidth / ratio);
            watermarkBuffer = await (0, sharp_1.default)(watermarkImage)
                .resize(Math.floor(Math.min(watermarkWidth, item.width)), Math.floor(Math.min(watermarkHeight, item.height)))
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
        await (0, sharp_1.default)((0, node_path_1.join)(config_1.config.env.dirs.public, item.file))
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
            logger_1.logger.error(error);
        });
    }
    logger_1.logger.debug('Batch of images resized successfully', {
        area: 'image-resizer-job',
        subarea: 'resize-images',
        action: 'images-resized',
    });
    process?.send('done');
});
//# sourceMappingURL=watermarked_image_resizer.js.map