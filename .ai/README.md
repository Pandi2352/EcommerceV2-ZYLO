# AI Agent Workspace Guidance

All engineering standards, product requirements, API specifications, and agent rules are maintained centrally in the [`docs/`](../docs/) directory.

### Tech Stack Standards
- **Frontend**: React + TypeScript + Tailwind CSS + React Router DOM + Axios
- **Backend**: NestJS + TypeScript + Swagger OpenAPI (`/api/docs`)
- **Database**: MongoDB 7+ with Mongoose (@nestjs/mongoose)

Please refer to:
- [`../docs/README.md`](../docs/README.md) - Master documentation directory
- [`../docs/00-project-context.md`](../docs/00-project-context.md) - Project context and objectives
- [`../docs/04-architecture.md`](../docs/04-architecture.md) - NestJS modular architecture & dependency injection
- [`../docs/07-database-design.md`](../docs/07-database-design.md) - MongoDB document schemas, indexes & ERD
- [`../docs/08-api-specification.md`](../docs/08-api-specification.md) - Swagger OpenAPI specs & DTOs
- [`../docs/10-backend-guidelines.md`](../docs/10-backend-guidelines.md) - NestJS controllers, services, schemas
- [`../docs/12-business-rules.md`](../docs/12-business-rules.md) - Authoritative commerce & atomic stock/transaction rules
- [`../docs/21-ai-agent-rules.md`](../docs/21-ai-agent-rules.md) - Operating rules for AI agents
