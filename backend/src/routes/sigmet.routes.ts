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
import { WeatherCacheService } from "../services/weather-cache.service";
import { FilterService } from "../services/filter.service";
import { ApiClient } from "../core/ApiClient";
import { env } from "../config/env";
import { AWCFacade } from "../services/awc.facade";
import { AWCController } from "../controllers/awc.controller";

const router = Router();

// Initialize services
const apiClient = new ApiClient(env.awcBaseUrl, { format: "json" });
const awcService = new AWCService(apiClient);
const normalizationService = new NormalizationService();
const weatherCacheService = new WeatherCacheService(
  awcService,
  normalizationService
);
const filterService = new FilterService();
const awcFacade = new AWCFacade(weatherCacheService, filterService);
const awcController = new AWCController(awcFacade);

/**
 * @swagger
 * /sigmet:
 *   get:
 *     summary: Get filtered SIGMET data
 *     description: Fetches SIGMET data from AWC API, normalizes to GeoJSON, and applies backend filtering by altitude, time range, and geometry type
 *     tags: [SIGMET]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/MinAltParam'
 *       - $ref: '#/components/parameters/MaxAltParam'
 *       - $ref: '#/components/parameters/FromTimeParam'
 *       - $ref: '#/components/parameters/ToTimeParam'
 *       - $ref: '#/components/parameters/GeometryTypeParam'
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
  "/sigmet",
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
 *     summary: Get filtered AIRSIGMET data
 *     description: Fetches AIRSIGMET data from AWC API, normalizes to GeoJSON, and applies backend filtering by altitude, time range, and geometry type
 *     tags: [AIRSIGMET]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/MinAltParam'
 *       - $ref: '#/components/parameters/MaxAltParam'
 *       - $ref: '#/components/parameters/FromTimeParam'
 *       - $ref: '#/components/parameters/ToTimeParam'
 *       - $ref: '#/components/parameters/GeometryTypeParam'
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
