# paw-tag-api

Production-ready Node.js REST API scaffold (Express 4, ESM, Node 20+).

## Getting started

```bash
npm install
cp .env.example .env
npm run dev
```

## Scripts

| Command            | Description                        |
| ------------------ | ---------------------------------- |
| `npm start`        | Run the server                     |
| `npm run dev`      | Run with file watching             |
| `npm test`         | Run tests (node:test + supertest)  |
| `npm run lint`     | Lint with ESLint                   |
| `npm run format`   | Format with Prettier               |

## Endpoint

```
GET /api/v1/health
```

```json
{
  "status": "ok",
  "service": "paw-tag-api",
  "env": "development",
  "uptimeSeconds": 12,
  "timestamp": "2026-01-01T00:00:00.000Z"
}
```

## Structure

```
src/
  app.js                 Express app wiring (no listen)
  server.js              Bootstrap + graceful shutdown
  config/index.js        Zod-validated env config
  lib/                   logger, error classes, asyncHandler
  middleware/            request logging, rate limit, validation, 404, error handler
  modules/health/        Example module (routes + controller)
  routes/index.js        API router — mount new modules here
test/
```

## Adding an endpoint

1. Create `src/modules/<name>/<name>.routes.js` + `.controller.js` (+ `.service.js`, `.schema.js` as needed).
2. Mount it in [src/routes/index.js](src/routes/index.js).
3. Use `validate({ body, query, params })` for input validation and `asyncHandler` for async controllers.
4. Throw the error classes from [src/lib/errors.js](src/lib/errors.js); the error handler produces a consistent envelope.

## Error envelope

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found",
    "requestId": "..."
  }
}
```

## Docker

```bash
docker build -t paw-tag-api .
docker run -p 3000:3000 --env-file .env paw-tag-api
```
