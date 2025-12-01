import { Router, Response } from "express";
import { generateGuestToken } from "../services/auth.service";
import { logger } from "../utils/logger";
import { HTTP_STATUS } from "../constants/httpStatus";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { AUTH } from "../constants/auth";

const router = Router();

/**
 * @swagger
 * /auth/guest:
 *   post:
 *     summary: Get a temporary guest JWT token
 *     description: Returns a JWT token valid for 15 minutes for accessing protected endpoints
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: JWT token issued successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerErrorResponse'
 */
router.post(`/${AUTH.GUEST_ROUTE}`, (_req, res: Response) => {
  try {
    const token = generateGuestToken();
    logger.info("Guest token issued");
    res.json({
      token,
      expiresIn: 15 * 60, // 15 minutes in seconds
    });
  } catch (error) {
    logger.error("Error generating guest token", { error });
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: ERROR_MESSAGES.FAILED_TO_GENERATE_TOKEN,
    });
  }
});

export default router;
