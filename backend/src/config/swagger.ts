import swaggerJsdoc from "swagger-jsdoc";
import { env } from "./env";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "AWC Proxy Backend API",
      version: "1.0.0",
      description:
        "API for fetching and normalizing aviation weather data from AWC with backend filtering",
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
        FeatureCollection: {
          type: "object",
          properties: {
            type: {
              type: "string",
              example: "FeatureCollection",
            },
            features: {
              type: "array",
              items: {
                $ref: "#/components/schemas/Feature",
              },
            },
          },
          required: ["type", "features"],
        },
        Feature: {
          type: "object",
          properties: {
            type: {
              type: "string",
              example: "Feature",
            },
            geometry: {
              type: "object",
              description: "GeoJSON geometry object",
            },
            properties: {
              type: "object",
              description: "Feature properties",
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
                  format: "date-time",
                },
                validityEnd: {
                  type: "string",
                  format: "date-time",
                },
                altitudeRange: {
                  type: "object",
                  properties: {
                    min: {
                      type: "number",
                    },
                    max: {
                      type: "number",
                    },
                    unit: {
                      type: "string",
                    },
                  },
                },
                fir: {
                  type: "string",
                },
              },
            },
          },
          required: ["type", "geometry", "properties"],
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
        MinAltParam: {
          in: "query",
          name: "minAlt",
          schema: {
            type: "number",
          },
          description: "Minimum altitude in feet",
          required: false,
          example: 10000,
        },
        MaxAltParam: {
          in: "query",
          name: "maxAlt",
          schema: {
            type: "number",
          },
          description: "Maximum altitude in feet",
          required: false,
          example: 30000,
        },
        FromTimeParam: {
          in: "query",
          name: "from",
          schema: {
            type: "string",
            format: "date-time",
          },
          description: "Start of time range filter (ISO datetime)",
          required: false,
          example: "2024-01-01T00:00:00Z",
        },
        ToTimeParam: {
          in: "query",
          name: "to",
          schema: {
            type: "string",
            format: "date-time",
          },
          description: "End of time range filter (ISO datetime)",
          required: false,
          example: "2024-01-01T05:00:00Z",
        },
        GeometryTypeParam: {
          in: "query",
          name: "geometryType",
          schema: {
            type: "string",
          },
          description:
            "Filter by GeoJSON geometry type (e.g., Polygon, Point, LineString)",
          required: false,
          example: "Polygon",
        },
      },
      responses: {
        GeoJsonResponse: {
          description: "GeoJSON FeatureCollection with weather data",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/FeatureCollection",
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
