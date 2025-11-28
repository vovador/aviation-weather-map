import { Request, Response, NextFunction } from "express";
import { validateQuery } from "../../src/middleware/validation";
import { z } from "zod";

describe("Validation Middleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      query: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
  });

  it("should call next() with valid query parameters", () => {
    const schema = z.object({
      nocache: z.enum(["0", "1"]).optional(),
      start: z.string().optional(),
    });

    mockRequest.query = {
      nocache: "1",
      start: "2024-01-01",
    };

    const middleware = validateQuery(schema);
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  it("should return 400 for invalid query parameters", () => {
    const schema = z.object({
      nocache: z.enum(["0", "1"]).optional(),
    });

    mockRequest.query = {
      nocache: "invalid",
    };

    const middleware = validateQuery(schema);
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "Invalid query parameters",
        details: expect.any(Array),
      })
    );
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it("should validate required fields", () => {
    const schema = z.object({
      required: z.string(),
    });

    mockRequest.query = {};

    const middleware = validateQuery(schema);
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it("should allow passthrough for additional fields", () => {
    const schema = z
      .object({
        nocache: z.enum(["0", "1"]).optional(),
      })
      .passthrough();

    mockRequest.query = {
      nocache: "1",
      extra: "value",
    };

    const middleware = validateQuery(schema);
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
    expect(mockRequest.query).toHaveProperty("extra", "value");
  });
});
