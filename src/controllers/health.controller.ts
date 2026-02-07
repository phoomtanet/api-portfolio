import { Request, Response } from 'express';
import { getHealthStatus } from '../services/health.service';

export const getHealth = (_req: Request, res: Response) => {
  const payload = getHealthStatus();
  return res.status(200).json(payload);
};
