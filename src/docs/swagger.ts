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
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Access token issued by POST /auth/login, /auth/register or /auth/refresh.',
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
            images: { type: 'array', items: { $ref: '#/components/schemas/AnimalImage' } },
          },
        },
        AnimalImage: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            animalId: { type: 'string', example: 'a1b2c3d4' },
            s3Key: { type: 'string' },
            url: { type: 'string', format: 'uri' },
            createdBy: { type: 'string', format: 'uuid' },
            createdAt: { type: 'string', format: 'date-time' },
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
            roleId: { type: 'integer' },
            isActive: { type: 'boolean' },
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
        VetHospital: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string', example: 'Central Vet Clinic' },
            phoneNo: { type: 'string', nullable: true, example: '5551234567' },
            address: { type: 'string', nullable: true },
            businessEmail: { type: 'string', format: 'email', nullable: true },
            vetHospitalTypeId: { type: 'integer', example: 1 },
            isVerified: { type: 'boolean', example: false },
            isArchived: { type: 'boolean', example: false },
            createdBy: { type: 'string', format: 'uuid' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateVetHospitalInput: {
          type: 'object',
          required: ['name', 'vetHospitalTypeId'],
          properties: {
            name: { type: 'string', maxLength: 150 },
            phoneNo: { type: 'string', maxLength: 20 },
            address: { type: 'string', maxLength: 255 },
            businessEmail: { type: 'string', format: 'email', maxLength: 255 },
            vetHospitalTypeId: { type: 'integer' },
          },
        },
        UpdateVetHospitalInput: {
          type: 'object',
          minProperties: 1,
          properties: {
            name: { type: 'string', maxLength: 150 },
            phoneNo: { type: 'string', maxLength: 20 },
            address: { type: 'string', maxLength: 255 },
            businessEmail: { type: 'string', format: 'email', maxLength: 255 },
            vetHospitalTypeId: { type: 'integer' },
            isVerified: { type: 'boolean' },
          },
        },
        VetHospitalMember: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            vetHospitalId: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            roleId: { type: 'integer', example: 1 },
            joinedAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        AddVetHospitalMemberInput: {
          type: 'object',
          required: ['userId', 'roleId'],
          properties: {
            userId: { type: 'string', format: 'uuid' },
            roleId: { type: 'integer' },
          },
        },
        UpdateVetHospitalMemberInput: {
          type: 'object',
          required: ['roleId'],
          properties: {
            roleId: { type: 'integer' },
          },
        },
        MedicalRecord: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            medicalRecordTypeId: { type: 'integer', example: 1 },
            title: { type: 'string', example: 'Rabies vaccine' },
            description: { type: 'string', nullable: true },
            prescribedBy: { type: 'string', format: 'uuid' },
            animalId: { type: 'string', example: 'a1b2c3d4' },
            administeredAt: { type: 'string', format: 'date-time' },
            nextDueDate: { type: 'string', format: 'date', nullable: true },
            verifiedBy: { type: 'string', format: 'uuid', nullable: true },
            verifiedAt: { type: 'string', format: 'date-time', nullable: true },
            createdBy: { type: 'string', format: 'uuid' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            images: { type: 'array', items: { $ref: '#/components/schemas/MedicalRecordImage' } },
          },
        },
        MedicalRecordImage: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            medicalRecordId: { type: 'string', format: 'uuid' },
            s3Key: { type: 'string' },
            url: { type: 'string', format: 'uri' },
            createdBy: { type: 'string', format: 'uuid' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateVaccinationRecordInput: {
          type: 'object',
          required: ['title', 'medicalRecordTypeId', 'prescribedBy'],
          properties: {
            title: { type: 'string', maxLength: 200 },
            description: { type: 'string' },
            medicalRecordTypeId: { type: 'integer' },
            prescribedBy: { type: 'string', format: 'uuid' },
            administeredAt: { type: 'string', format: 'date-time' },
            nextDueDate: { type: 'string', format: 'date' },
          },
        },
        UpdateVaccinationRecordInput: {
          type: 'object',
          minProperties: 1,
          properties: {
            title: { type: 'string', maxLength: 200 },
            description: { type: 'string' },
            medicalRecordTypeId: { type: 'integer' },
            prescribedBy: { type: 'string', format: 'uuid' },
            administeredAt: { type: 'string', format: 'date-time' },
            nextDueDate: { type: 'string', format: 'date' },
          },
        },
        VerifyMedicalRecordInput: {
          type: 'object',
          required: ['verifiedBy'],
          properties: {
            verifiedBy: { type: 'string', format: 'uuid' },
          },
        },
        TokenPair: {
          type: 'object',
          properties: {
            accessToken: { type: 'string', description: 'Short-lived JWT sent as Authorization: Bearer <token>' },
            refreshToken: { type: 'string', description: 'Opaque token used with POST /auth/refresh' },
          },
        },
        RegisterInput: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string', maxLength: 150 },
            email: { type: 'string', format: 'email', maxLength: 255 },
            password: { type: 'string', minLength: 8, maxLength: 72 },
            dob: { type: 'string', format: 'date-time' },
            phoneNo: { type: 'string', maxLength: 20 },
            address: { type: 'string', maxLength: 255 },
          },
        },
        LoginInput: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', maxLength: 255 },
            password: { type: 'string' },
          },
        },
        RefreshInput: {
          type: 'object',
          required: ['refreshToken'],
          properties: {
            refreshToken: { type: 'string' },
          },
        },
        LogoutInput: {
          type: 'object',
          required: ['refreshToken'],
          properties: {
            refreshToken: { type: 'string' },
          },
        },
      },
    },
  },
  apis: ['./src/modules/**/*.routes.ts', './dist/modules/**/*.routes.js'],
};

export const openApiSpec = swaggerJsdoc(options);
