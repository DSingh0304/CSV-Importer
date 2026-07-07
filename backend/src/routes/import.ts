import { Router } from 'express';
import { handleImport } from '../controllers/importController';

const router = Router();

router.post('/import', handleImport);

export default router;
