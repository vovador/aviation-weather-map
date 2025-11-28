import { Router } from "express";
import swaggerUi from "swagger-ui-express";
import express from "express";
import { swaggerSpec } from "../config/swagger";

const router = Router();

router.use(
  "/",
  ...(swaggerUi.serve as unknown as express.RequestHandler[]),
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: "AWC Proxy Backend API Documentation",
  }) as unknown as express.RequestHandler
);

export default router;
