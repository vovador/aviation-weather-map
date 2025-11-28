import asyncHandler from "express-async-handler";

/**
 * Re-exported helper so routes can wrap async handlers consistently.
 */
export const asyncRoute = asyncHandler;
