import swaggerJSDoc from 'swagger-jsdoc';
import { SwaggerOptions } from 'swagger-jsdoc';

const options: SwaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Crypto Wallet API',
      version: '1.0.0',
      description: '加密货币钱包系统 API 文档',
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: '本地开发服务器',
      },
      {
        url: 'https://api.example.com',
        description: '生产服务器',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT 认证令牌，格式: Bearer {token}',
        },
        apiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'API 密钥',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            code: {
              type: 'number',
              example: 400,
            },
            error: {
              type: 'object',
              properties: {
                code: {
                  type: 'string',
                  example: 'VALIDATION_ERROR',
                },
                message: {
                  type: 'string',
                  example: '参数验证失败',
                },
                timestamp: {
                  type: 'string',
                  format: 'date-time',
                },
              },
            },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            code: {
              type: 'number',
              example: 200,
            },
            data: {
              type: 'object',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
      {
        apiKey: [],
      },
    ],
  },
  apis: ['./src/route/*.ts', './src/controller/*.ts'], // 扫描路由和控制器文件中的注释
};

export const swaggerSpec = swaggerJSDoc(options);

