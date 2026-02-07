import swaggerJSDoc, { SwaggerDefinition } from 'swagger-jsdoc';
import env from './env';

const swaggerDefinition: SwaggerDefinition = {
  openapi: '3.0.3',
  info: {
    title: 'API Portfolio',
    version: '1.0.0',
    description: 'REST API boilerplate using Node.js, Express, TypeScript, and Swagger',
  },
  servers: [
    {
      url: `http://localhost:${env.port}${env.apiPrefix}`,
      description: 'Local development server',
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['src/routes/**/*.ts'],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
