# Centralized Barangay Management System (CBMS)

A modern, multi-tenant digital governance portal for Barangay administration, Resident services, E-Wallet disbursements, Civil Registry, Real Property Tax (RPT) collection, and Disaster Risk Reduction Management (DRRM).

---

## 🏛️ Project Architecture

This repository is organized as a high-performance monorepo using **pnpm workspaces** and **Turborepo**:

```
├── apps
│   ├── admin         # Next.js Administrator Console (BAMS, BCIS, BDRIS, KP, Treasury)
│   ├── resident      # Next.js Resident Mobile-First Portal (CSM, E-Wallet, SOS)
│   ├── hub           # Next.js Super-Admin Regional Dashboard
│   ├── agent         # AI-powered operations agent workspace
│   └── website       # Public-facing information portal
├── packages
│   ├── ui            # Shared component library & Vanilla CSS Design Tokens
│   ├── api-client    # Mock REST API client and local state store
│   ├── db            # Prisma schema models & DB integrations
│   ├── auth          # Better Auth setup configuration
│   └── rbac          # Role-Based Access Control logic
└── schema.dbml       # DBML multi-tenant relational database layout
```

---

## 📋 System Requirements

To run and compile the client monorepo locally, you need:
- **Node.js**: `v18.x` or higher (`v20.x` LTS recommended)
- **pnpm**: `v8.x` or higher (package manager)
- **Prisma CLI / Engine**: (optional, for DB synchronizations)

For the Go Backend (if integrating with the Go microservice):
- **Go**: `v1.21` or higher
- **PostgreSQL**: `v14` or higher (for GORM persistence)
- **Jaeger**: (for trace logs telemetry)

---

## 🚀 Getting Started & Local Development

### 1. Installation
Install all monorepo dependencies and link workspace packages concurrently:
```bash
pnpm install
```

### 2. Run the Development Servers
Start all client applications (Admin, Resident, Hub, etc.) simultaneously in development mode:
```bash
pnpm dev
```
By default, the applications will launch on:
* **Admin Console**: [http://localhost:3000](http://localhost:3000)
* **Resident Portal**: [http://localhost:3001](http://localhost:3001)

### 3. Build & Typecheck
Verify compilation, linting, and type-safety rules across all packages:
```bash
# Run build checks
pnpm build

# Run project-wide TypeScript typechecks
pnpm typecheck
```

---

## ⚙️ Configuration & Environment Variables (Not required for now)

Create a `.env` file in the root directory (using `.env.example` as a template) to customize database connection strings, auth secrets, and API gateways:
```ini
DATABASE_URL="postgresql://user:password@localhost:5432/cbms_db?schema=public"
BETTER_AUTH_SECRET="your-better-auth-secret-key"
NEXT_PUBLIC_API_URL="http://localhost:8080/api"
```

---

## 🔌 Optional: Go Backend Integration

The backend is being migrated to a Go Hexagonal service stack located under `C:\Users\ciel2\go\src\cbms-backend`. 

### Running Go Backend:
1. Ensure a local PostgreSQL database is running.
2. Initialize Jaeger for OpenTelemetry tracers:
   ```bash
   docker run -d --name jaeger -p 16686:16686 -p 4317:4317 jaegertracing/all-in-one:latest
   ```
3. Run the Go server:
   ```bash
   cd C:\Users\ciel2\go\src\cbms-backend
   go run cmd/server/main.go
   ```