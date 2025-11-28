import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { AWCFacade } from "../services/awc.facade";

/**
 * Controllers should only deal with HTTP concerns — reading queries, calling
 * the application layer, and sending responses. They deliberately avoid any
 * business logic so routing, validation, caching, and service behavior can
 * change without touching HTTP-facing code.
 *
 * Using the controller together with the Facade keeps the router small and
 * hides all complex steps (caching, API calls, normalization) behind one clear
 * interface. This makes the system easier to test (mock one dependency),
 * prevents accidental changes to endpoint behavior, and makes it simple to add
 * new advisory types or data sources without rewriting routes or breaking
 * integration tests.
 *
 * Controllers intentionally avoid any business/error logic. All errors (including
 * AWCServiceError) thrown from async methods are automatically caught by the
 * asyncRoute wrapper in the router and forwarded to the global error-handling
 * middleware, which is responsible for translating errors into appropriate HTTP
 * responses. This separation ensures controllers remain focused solely on
 * transport concerns.
 */
export class AWCController {
  constructor(private readonly awcFacade: AWCFacade) {}

  async getSigmet(req: AuthRequest, res: Response): Promise<void> {
    const queryParams = req.query as Record<string, string>;
    const geojson = await this.awcFacade.getSigmet(queryParams);
    res.json(geojson);
  }

  async getAirsigmet(req: AuthRequest, res: Response): Promise<void> {
    const queryParams = req.query as Record<string, string>;
    const geojson = await this.awcFacade.getAirsigmet(queryParams);
    res.json(geojson);
  }
}
