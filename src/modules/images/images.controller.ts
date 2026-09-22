import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { imagesService } from './images.service.js';
import { asyncHandler } from '../../lib/async-handler.js';
import { BadRequestError } from '../../lib/errors.js';

const filesOf = (req: Request): Express.Multer.File[] => {
  const files = req.files;
  if (!Array.isArray(files) || files.length === 0) {
    throw new BadRequestError('At least one image file is required', { code: 'NO_FILES_UPLOADED' });
  }
  return files;
};

export const uploadAnimalImages = asyncHandler(async (req: Request, res: Response) => {
  const images = await imagesService.uploadAnimalImages(req.params.animalId!, filesOf(req), req.actorId!);
  res.status(StatusCodes.CREATED).json(images);
});

export const uploadMedicalRecordImages = asyncHandler(async (req: Request, res: Response) => {
  const images = await imagesService.uploadMedicalRecordImages(req.params.id!, filesOf(req), req.actorId!);
  res.status(StatusCodes.CREATED).json(images);
});
