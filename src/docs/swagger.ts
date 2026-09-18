import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Paw Tag API',
      version: '1.0.0',
      description: 'REST API for registering, tracking and managing tagged animals.',
    },
    servers: [{ url: '/api/v1' }],
    components: {
      securitySchemes: {
        ActorId: {
          type: 'apiKey',
          in: 'header',
          name: 'x-user-id',
          description: 'Temporary actor stand-in until real auth ships; must be an existing user id.',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'object',
              properties: {
                code: { type: 'string', example: 'NOT_FOUND' },
                message: { type: 'string', example: 'Animal not found' },
                requestId: { type: 'string', format: 'uuid' },
              },
            },
          },
        },
        Animal: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'a1b2c3d4' },
            name: { type: 'string', example: 'Rex' },
            dob: { type: 'string', format: 'date-time', nullable: true },
            animalTypeId: { type: 'integer', example: 1 },
            breed: { type: 'string', nullable: true, example: 'Labrador' },
            isStreet: { type: 'boolean', example: false },
            createdBy: { type: 'string', format: 'uuid', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateAnimalInput: {
          type: 'object',
          required: ['name', 'animalTypeId'],
          properties: {
            name: { type: 'string', maxLength: 100 },
            dob: { type: 'string', format: 'date-time' },
            animalTypeId: { type: 'integer' },
            breed: { type: 'string', maxLength: 100 },
            isStreet: { type: 'boolean' },
          },
        },
        UpdateAnimalInput: {
          type: 'object',
          minProperties: 1,
          properties: {
            name: { type: 'string', maxLength: 100 },
            dob: { type: 'string', format: 'date-time' },
            animalTypeId: { type: 'integer' },
            breed: { type: 'string', maxLength: 100 },
            isStreet: { type: 'boolean' },
          },
        },
        MergeAnimalInput: {
          type: 'object',
          required: ['targetId'],
          properties: {
            targetId: { type: 'string', minLength: 8, maxLength: 8 },
          },
        },
        Lookup: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Dog' },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string', example: 'Jane Doe' },
            email: { type: 'string', format: 'email', example: 'jane@example.com' },
            dob: { type: 'string', format: 'date-time', nullable: true },
            googleId: { type: 'string', nullable: true },
            appleId: { type: 'string', nullable: true },
            phoneNo: { type: 'string', nullable: true, example: '5551234567' },
            address: { type: 'string', nullable: true },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateUserInput: {
          type: 'object',
          required: ['name', 'email'],
          properties: {
            name: { type: 'string', maxLength: 150 },
            email: { type: 'string', format: 'email', maxLength: 255 },
            dob: { type: 'string', format: 'date-time' },
            googleId: { type: 'string', maxLength: 255 },
            appleId: { type: 'string', maxLength: 255 },
            phoneNo: { type: 'string', maxLength: 20 },
            address: { type: 'string', maxLength: 255 },
          },
        },
        UpdateUserInput: {
          type: 'object',
          minProperties: 1,
          properties: {
            name: { type: 'string', maxLength: 150 },
            email: { type: 'string', format: 'email', maxLength: 255 },
            dob: { type: 'string', format: 'date-time' },
            googleId: { type: 'string', maxLength: 255 },
            appleId: { type: 'string', maxLength: 255 },
            phoneNo: { type: 'string', maxLength: 20 },
            address: { type: 'string', maxLength: 255 },
          },
        },
      },
    },
  },
  apis: ['./src/modules/**/*.routes.ts', './dist/modules/**/*.routes.js'],
};

export const openApiSpec = swaggerJsdoc(options);
