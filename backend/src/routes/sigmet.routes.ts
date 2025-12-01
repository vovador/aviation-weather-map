import { Router } from "express";
import { AWCController } from "../controllers/awc.controller";
import { AuthRequest, verifyJWT } from "../middleware/auth";
import { asyncRoute } from "../middleware/asyncHandler";
import { validateQuery } from "../middleware/validation";
import { AWCFacade } from "../services/awc.facade";
import { FilterService } from "../services/filter.service";
import { buildWeatherCacheService } from "../services/weather-cache";
import {
  airsigmetQuerySchema,
  sigmetQuerySchema,
} from "../validators/query.validator";
import { API_ROUTES } from "../constants/apiRoutes";

const router = Router();

// --- Dependency initialization (light DI) ---
const weatherCacheService = buildWeatherCacheService();
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
  API_ROUTES.SIGMET,
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
  API_ROUTES.AIRSIGMET,
  verifyJWT,
  validateQuery(airsigmetQuerySchema),
  asyncRoute((req, res, _next) =>
    awcController.getAirsigmet(req as AuthRequest, res)
  )
);

export default router;
