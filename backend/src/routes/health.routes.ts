import { Router, Response } from "express";

const router = Router();

const healthHandler = (_req: unknown, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
};

router.get("/health", healthHandler);
router.get("/", healthHandler);

export default router;
