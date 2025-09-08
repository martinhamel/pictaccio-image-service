"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const node_path_1 = require("node:path");
const sharp_1 = tslib_1.__importDefault(require("sharp"));
const config_1 = require("../config");
const logger_1 = require("../lib/core/logger");
const compute_thumbnail_output_filename_1 = require("@pictaccio/shared/utils/compute_thumbnail_output_filename");
process?.on('message', async (batch) => {
    logger_1.logger.debug('Received batch of images to resize', batch);
    for await (const item of batch) {
        const outputFileName = (0, compute_thumbnail_output_filename_1.computeThumbnailOutputFileName)(config_1.config.app.dirs.thumbnails, item.file, 'medium');
        logger_1.logger.debug(`Resizing ${item.file} to ${outputFileName}`, {
            area: 'image-resizer-job',
            subarea: 'resize-images',
            action: 'resizing-image',
        });
        await (0, sharp_1.default)((0, node_path_1.join)(config_1.config.env.dirs.public, item.file))
            .resize(Math.floor(item.width), Math.floor(item.height))
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
//# sourceMappingURL=image_resizer.js.map