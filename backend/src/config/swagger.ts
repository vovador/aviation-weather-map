import swaggerJsdoc from "swagger-jsdoc";
import { env } from "./env";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "AWC Proxy Backend API",
      version: "1.0.0",
      description:
        "API for fetching and normalizing aviation weather data from AWC",
    },
    servers: [
      {
        url: `http://localhost:${env.port}`,
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        GeoJsonFeatureCollection: {
          type: "object",
          properties: {
            type: {
              type: "string",
              example: "FeatureCollection",
            },
            features: {
              type: "array",
              items: {
                $ref: "#/components/schemas/GeoJsonFeature",
              },
            },
          },
        },
        GeoJsonFeature: {
          type: "object",
          properties: {
            type: {
              type: "string",
              example: "Feature",
            },
            geometry: {
              type: "object",
            },
            properties: {
              type: "object",
              properties: {
                hazardType: {
                  type: "string",
                },
                bulletinId: {
                  type: "string",
                },
                rawText: {
                  type: "string",
                },
                validityStart: {
                  type: "string",
                },
                validityEnd: {
                  type: "string",
                },
                altitudeRange: {
                  type: "object",
                },
                fir: {
                  type: "string",
                },
              },
            },
          },
        },
        TokenResponse: {
          type: "object",
          properties: {
            token: {
              type: "string",
              description: "JWT token",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            },
            expiresIn: {
              type: "number",
              description: "Token expiration time in seconds",
              example: 900,
            },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            error: {
              type: "string",
            },
          },
        },
      },
      parameters: {
        nocacheParam: {
          name: "nocache",
          in: "query",
          schema: {
            type: "string",
            enum: ["0", "1"],
          },
          description: "Set to '1' to bypass cache",
        },
        startParam: {
          name: "start",
          in: "query",
          schema: {
            type: "string",
          },
          description: "Start time filter (ISO 8601)",
        },
        endParam: {
          name: "end",
          in: "query",
          schema: {
            type: "string",
          },
          description: "End time filter (ISO 8601)",
        },
        minAltParam: {
          name: "minAlt",
          in: "query",
          schema: {
            type: "string",
          },
          description: "Minimum altitude filter",
        },
        maxAltParam: {
          name: "maxAlt",
          in: "query",
          schema: {
            type: "string",
          },
          description: "Maximum altitude filter",
        },
        hazardParam: {
          name: "hazard",
          in: "query",
          schema: {
            type: "string",
          },
          description: "Hazard type filter",
        },
        firParam: {
          name: "fir",
          in: "query",
          schema: {
            type: "string",
          },
          description: "FIR filter",
        },
      },
      responses: {
        GeoJsonResponse: {
          description: "GeoJSON FeatureCollection with weather data",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/GeoJsonFeatureCollection",
              },
            },
          },
        },
        UnauthorizedResponse: {
          description: "Unauthorized",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
        BadRequestResponse: {
          description: "Invalid query parameters",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
        InternalServerErrorResponse: {
          description: "Internal server error",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
