import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import importRouter from './routes/import';
import { log } from './utils/logger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api', importRouter);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  log('error', err.message);
  res.status(500).json({ success: false, error: err.message });
});

app.listen(PORT, () => {
  log('info', `Server running on http://localhost:${PORT}`);
});

export default app;
