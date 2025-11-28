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
- `GET /isigmet` - Fetch SIGMET data (requires auth)
- `GET /airsigmet` - Fetch AIRSIGMET data (requires auth)
- `GET /health` - Health check
- `GET /docs` - Swagger documentation

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
