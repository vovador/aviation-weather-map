import { Response, NextFunction } from "express";
import { verifyJWT, AuthRequest } from "../../src/middleware/auth";
import { generateGuestToken } from "../../src/services/auth.service";
import jwt from "jsonwebtoken";
import { env } from "../../src/config/env";

describe("JWT Auth Middleware", () => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
  });

  it("should call next() with valid JWT token", () => {
    const token = generateGuestToken();
    mockRequest.headers = {
      authorization: `Bearer ${token}`,
    };

    verifyJWT(
      mockRequest as AuthRequest,
      mockResponse as Response,
      nextFunction
    );

    expect(nextFunction).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
    expect(mockRequest.user).toBeDefined();
  });

  it("should return 401 if Authorization header is missing", () => {
    verifyJWT(
      mockRequest as AuthRequest,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: "Missing or invalid Authorization header",
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it("should return 401 if Authorization header does not start with Bearer", () => {
    mockRequest.headers = {
      authorization: "Invalid token",
    };

    verifyJWT(
      mockRequest as AuthRequest,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it("should return 401 if token is expired", () => {
    const expiredToken = jwt.sign(
      {
        iss: "awc-proxy-backend",
        aud: "awc-proxy-frontend",
        iat: Math.floor(Date.now() / 1000) - 1000,
        exp: Math.floor(Date.now() / 1000) - 100,
      },
      env.jwtSecret
    );

    mockRequest.headers = {
      authorization: `Bearer ${expiredToken}`,
    };

    verifyJWT(
      mockRequest as AuthRequest,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: "Token expired" });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it("should return 401 if token has wrong issuer", () => {
    const wrongIssuerToken = jwt.sign(
      {
        iss: "wrong-issuer",
        aud: "awc-proxy-frontend",
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 900,
      },
      env.jwtSecret
    );

    mockRequest.headers = {
      authorization: `Bearer ${wrongIssuerToken}`,
    };

    verifyJWT(
      mockRequest as AuthRequest,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it("should return 401 if token has wrong audience", () => {
    const wrongAudienceToken = jwt.sign(
      {
        iss: "awc-proxy-backend",
        aud: "wrong-audience",
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 900,
      },
      env.jwtSecret
    );

    mockRequest.headers = {
      authorization: `Bearer ${wrongAudienceToken}`,
    };

    verifyJWT(
      mockRequest as AuthRequest,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(nextFunction).not.toHaveBeenCalled();
  });
});
