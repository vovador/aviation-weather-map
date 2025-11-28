import { Router } from "express";
import { verifyJWT, AuthRequest } from "../middleware/auth";
import { validateQuery } from "../middleware/validation";
import { asyncRoute } from "../middleware/asyncHandler";
import {
  sigmetQuerySchema,
  airsigmetQuerySchema,
} from "../validators/query.validator";
import { AWCService } from "../services/awc.service";
import { NormalizationService } from "../services/normalization.service";
import { TTLCache } from "../utils/cache";
import { ApiClient } from "../core/ApiClient";
import { env } from "../config/env";
import { AWCFacade } from "../services/awc.facade";
import { AWCController } from "../controllers/awc.controller";
import { GeoJSONFeatureCollection } from "../types/geojson";

const router = Router();
const apiClient = new ApiClient(env.awcBaseUrl, { format: "json" });
const awcService = new AWCService(apiClient);
const normalizationService = new NormalizationService();

// 1-hour TTL cache (3600 seconds)
const cache = new TTLCache<string, GeoJSONFeatureCollection>(3600);
const awcFacade = new AWCFacade(awcService, normalizationService, cache);
const awcController = new AWCController(awcFacade);

/**
 * @swagger
 * /isigmet:
 *   get:
 *     summary: Get SIGMET data
 *     description: Fetches and normalizes SIGMET data from AWC API into GeoJSON format
 *     tags: [SIGMET]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/nocacheParam'
 *       - $ref: '#/components/parameters/startParam'
 *       - $ref: '#/components/parameters/endParam'
 *       - $ref: '#/components/parameters/minAltParam'
 *       - $ref: '#/components/parameters/maxAltParam'
 *       - $ref: '#/components/parameters/hazardParam'
 *       - $ref: '#/components/parameters/firParam'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/GeoJsonResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequestResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerErrorResponse'
 */
router.get(
  "/isigmet",
  verifyJWT,
  validateQuery(sigmetQuerySchema),
  asyncRoute((req, res, _next) =>
    awcController.getSigmet(req as AuthRequest, res)
  )
);

/**
 * @swagger
 * /airsigmet:
 *   get:
 *     summary: Get AIRSIGMET data
 *     description: Fetches and normalizes AIRSIGMET data from AWC API into GeoJSON format
 *     tags: [AIRSIGMET]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/nocacheParam'
 *       - $ref: '#/components/parameters/startParam'
 *       - $ref: '#/components/parameters/endParam'
 *       - $ref: '#/components/parameters/minAltParam'
 *       - $ref: '#/components/parameters/maxAltParam'
 *       - $ref: '#/components/parameters/hazardParam'
 *       - $ref: '#/components/parameters/firParam'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/GeoJsonResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequestResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerErrorResponse'
 */
router.get(
  "/airsigmet",
  verifyJWT,
  validateQuery(airsigmetQuerySchema),
  asyncRoute((req, res, _next) =>
    awcController.getAirsigmet(req as AuthRequest, res)
  )
);

export default router;
