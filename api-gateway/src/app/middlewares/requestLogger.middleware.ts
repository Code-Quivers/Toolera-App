import morgan from 'morgan';
import { config } from '../config';

const format = config.nodeEnv === 'production'
  ? 'combined'
  : ':method :url :status :response-time ms';

export const requestLogger = morgan(format);
