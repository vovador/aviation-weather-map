import dotenv from "dotenv";

dotenv.config();

interface EnvConfig {
  port: number;
  jwtSecret: string;
  frontendOrigin: string;
  awcBaseUrl: string;
  nodeEnv: string;
}

function validateEnv(): EnvConfig {
  const required = ["JWT_SECRET", "FRONTEND_ORIGIN", "AWC_BASE_URL"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }

  return {
    port: parseInt(process.env.PORT || "4000", 10),
    jwtSecret: process.env.JWT_SECRET!,
    frontendOrigin: process.env.FRONTEND_ORIGIN!,
    awcBaseUrl: process.env.AWC_BASE_URL!,
    nodeEnv: process.env.NODE_ENV || "development",
  };
}

export const env = validateEnv();
