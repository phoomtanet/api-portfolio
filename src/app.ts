import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import routes from './routes';
import env from './config/env';
import swaggerSpec from './config/swagger';
import notFoundHandler from './middlewares/not-found';
import errorHandler from './middlewares/error-handler';

const app = express();

app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://phoomtanet-web-portfolio.vercel.app',
    'http://35.198.235.25:3000'
  ],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { customSiteTitle: 'API Portfolio Docs' }));

app.use(env.apiPrefix, routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
