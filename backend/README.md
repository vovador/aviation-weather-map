# AWC Proxy Backend

Express backend API for fetching and normalizing aviation weather data from the Aviation Weather Center (AWC) API.

## Quick Start

1. Install dependencies:

```bash
npm install
# or
yarn install
```

2. Create a `.env` file:

```env
PORT=4000
JWT_SECRET=supersecretkey
FRONTEND_ORIGIN=https://your-frontend-domain.com
AWC_BASE_URL=https://aviationweather.gov/api
NODE_ENV=development
```

3. Run:

```bash
npm run dev
# or
yarn dev
```

## API Endpoints

- `POST /auth/guest` - Get JWT token
- `GET /sigmet` - Fetch filtered SIGMET data (requires auth)
  - Query parameters: `minAlt`, `maxAlt`, `from`, `to`
- `GET /airsigmet` - Fetch filtered AIRSIGMET data (requires auth)
  - Query parameters: `minAlt`, `maxAlt`, `from`, `to`
- `GET /health` - Health check
- `GET /docs` - Swagger documentation

### Query Parameters

- `minAlt` (number, optional): Minimum altitude in feet
- `maxAlt` (number, optional): Maximum altitude in feet
- `from` (string, optional): Start of time range filter (ISO datetime, e.g., "2024-01-01T00:00:00Z")
- `to` (string, optional): End of time range filter (ISO datetime, e.g., "2024-01-01T05:00:00Z")

All filtering is performed in the backend. The AWC API is called without any filter parameters.

## Environment Variables

| Variable          | Description                | Required  |
| ----------------- | -------------------------- | --------- |
| `JWT_SECRET`      | Secret key for JWT signing | Yes       |
| `FRONTEND_ORIGIN` | Allowed CORS origin        | Yes       |
| `AWC_BASE_URL`    | AWC API base URL           | Yes       |
| `PORT`            | Server port                | No (4000) |
| `NODE_ENV`        | Environment mode           | No        |

## Docker

```bash
docker-compose up --build
```

## Testing

```bash
npm test
# or
yarn test
```
