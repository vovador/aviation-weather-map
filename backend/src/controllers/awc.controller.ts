import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { AWCFacade } from "../services/awc.facade";
import { LogControllerRequest } from "../decorators/log-controller-request.decorator";

/**
 * Controllers handle HTTP concerns:
 * - Reading query parameters
 * - Calling the application layer (AWCFacade)
 * - Sending responses
 *
 * All parsing and mapping logic is delegated to the facade layer.
 */
export class AWCController {
  constructor(private readonly awcFacade: AWCFacade) {}

  @LogControllerRequest()
  async getSigmet(req: AuthRequest, res: Response): Promise<void> {
    const geojson = await this.awcFacade.getFilteredSigmet(req.query);
    res.json(geojson);
  }

  @LogControllerRequest()
  async getAirsigmet(req: AuthRequest, res: Response): Promise<void> {
    const geojson = await this.awcFacade.getFilteredAirsigmet(req.query);
    res.json(geojson);
  }
}
