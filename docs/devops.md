# DevOps Notes

## CI/CD Pipeline Sketch

1. Code commit: Developers push feature branches to GitHub and open a pull request.
2. Build: GitHub Actions installs frontend and backend dependencies with `npm ci`, then builds the Next.js frontend.
3. Test: Run frontend type checks and backend route/unit tests. A service container can start MongoDB and Redis for integration tests.
4. Security checks: Scan dependencies with `npm audit` and keep secrets in GitHub Actions secrets.
5. Docker build: Build frontend and backend images from the included Dockerfiles.
6. Deploy: Push images to a registry, SSH to the Linux server, pull the new images, and restart with Docker Compose.

## Docker Build And Run

From the project root:

```bash
docker compose up --build
```

Frontend runs on `http://localhost:9002`, backend on `http://localhost:5001`, MongoDB on `27017`, and Redis on `6379`.

## Linux Hosting Considerations

Use Nginx as a reverse proxy with separate server blocks or paths for the frontend and backend. Store `MONGODB_URI`, `REDIS_URL`, `JWT_SECRET`, and `GEMINI_API_KEY` as environment variables, not in source control. If deploying without Docker, use PM2 to keep the Node processes alive and configure log rotation.

For multiple projects on one server, isolate each project with its own Docker Compose network, unique ports, separate environment files, and separate Nginx server names. Keep project databases and Redis keys namespaced.

## Kafka Usage

Kafka would be useful once the app grows beyond a single backend. Course CSV uploads could publish a `course.imported` event so search indexing, cache invalidation, analytics, and audit logging happen asynchronously. Recommendation requests could publish events for usage analytics without slowing down the user-facing API response.

## State And Caching Choices

The frontend uses React Context for global auth and course state because the app has a small shared state surface: JWT session, loaded courses, and refresh actions. Course listings are cached in `localStorage`, so repeat visits show data immediately and still refresh from the API when available. Backend course listings and recommendation responses are cached through Redis with an in-memory fallback for local development.
