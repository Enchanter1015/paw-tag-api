import multer from 'multer';

import { config } from '../config/index.js';
import { BadRequestError } from '../lib/errors.js';

const IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

export const imagesUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.s3.maxUploadBytes,
    files: config.s3.maxImagesPerUpload,
  },
  fileFilter: (_req, file, callback) => {
    if (!IMAGE_MIME_TYPES.has(file.mimetype)) {
      callback(new BadRequestError(`Unsupported file type: ${file.mimetype}`, { code: 'UNSUPPORTED_FILE_TYPE' }));
      return;
    }
    callback(null, true);
  },
});
