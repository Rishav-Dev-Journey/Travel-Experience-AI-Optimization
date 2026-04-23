# Travel Experience Platform

This repository is a product-centric monorepo for the Travel Experience Platform.

Starter layout:

```text
apps/
	api/        # .NET API
	web/        # React web app
services/
	node/       # future Node.js microservices
shared/      # shared contracts, utilities, and types
infra/       # deployment and infrastructure code
```

Use feature or product names in the repo structure, not generic labels like backend or frontend, so the codebase can grow cleanly over time.

This layout is deployment-friendly as long as each app owns its own build, environment variables, and deploy target. The repository structure itself should not cause deployment issues.

Local run targets:

- `apps/api` is a minimal ASP.NET Core API.
- `apps/web` is a Vite React starter.
- `services/node` is reserved for future Node.js microservices.