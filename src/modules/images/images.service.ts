import { randomUUID } from 'node:crypto';

import sharp from 'sharp';

import { imagesRepository } from './images.repository.js';
import { BadRequestError, NotFoundError } from '../../lib/errors.js';
import { uploadObject } from '../../lib/s3.js';

const COMPRESSED_CONTENT_TYPE = 'image/webp';

const compress = (buffer: Buffer) =>
  sharp(buffer).rotate().resize({ width: 2048, height: 2048, fit: 'inside', withoutEnlargement: true }).webp({ quality: 80 }).toBuffer();

const compressAndUpload = async (folder: string, files: Express.Multer.File[]) => {
  return Promise.all(
    files.map(async (file) => {
      let compressed: Buffer;
      try {
        compressed = await compress(file.buffer);
      } catch (cause) {
        throw new BadRequestError(`Invalid or unsupported image: ${file.originalname}`, { cause });
      }
      const key = `${folder}/${randomUUID()}.webp`;
      const url = await uploadObject({ key, body: compressed, contentType: COMPRESSED_CONTENT_TYPE });
      return { key, url };
    }),
  );
};

export const imagesService = {
  uploadAnimalImages: async (animalId: string, files: Express.Multer.File[], createdBy: string) => {
    if (files.length === 0) {
      throw new BadRequestError('At least one image file is required');
    }
    const animal = await imagesRepository.findAnimalById(animalId);
    if (!animal) {
      throw new NotFoundError(`Animal ${animalId} not found`);
    }

    const uploaded = await compressAndUpload(`animals/${animalId}`, files);
    return imagesRepository.createAnimalImages(
      uploaded.map(({ key, url }) => ({ animalId, s3Key: key, url, createdBy })),
    );
  },
  uploadMedicalRecordImages: async (medicalRecordId: string, files: Express.Multer.File[], createdBy: string) => {
    if (files.length === 0) {
      throw new BadRequestError('At least one image file is required');
    }
    const record = await imagesRepository.findMedicalRecordById(medicalRecordId);
    if (!record) {
      throw new NotFoundError(`Medical record ${medicalRecordId} not found`);
    }

    const uploaded = await compressAndUpload(`medical-records/${medicalRecordId}`, files);
    return imagesRepository.createMedicalRecordImages(
      uploaded.map(({ key, url }) => ({ medicalRecordId, s3Key: key, url, createdBy })),
    );
  },
};
