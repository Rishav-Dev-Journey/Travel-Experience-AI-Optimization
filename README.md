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

Database:

- The auth flow is now backed by PostgreSQL.
- Default connection string: `Host=localhost;Port=5432;Database=travel_experience`
- Override it with `ConnectionStrings:Postgres` or `POSTGRES_CONNECTION_STRING`.
- Use your existing local PostgreSQL instance; no Docker setup is required.
- The schema lives in table-wise migrations under [infra/postgres/migrations](infra/postgres/migrations).
- Apply migrations in order:
  - `psql -d travel_experience -f infra/postgres/migrations/0001_auth_users.sql`
  - `psql -d travel_experience -f infra/postgres/migrations/0002_otp_challenges.sql`

OTP delivery (Email only):

- The auth flow is currently email-only (`channel: "email"`).
- Email OTP is sent using Azure Communication Services Email.
- Configure these values in [apps/api/appsettings.Development.json](apps/api/appsettings.Development.json):
  - `Azure:CommunicationServices:Enabled` to turn Azure email delivery on/off
  - `Azure:CommunicationServices:ConnectionString` for local testing
  - `Azure:CommunicationServices:SenderAddress`
- Optionally set `AZURE_COMMUNICATION_EMAIL_ENABLED=true|false` via environment variable.
- For local development, `demoOtp` is returned; in non-Development it is omitted entirely.
- Do not commit secrets into the repo; use environment variables or user secrets.
