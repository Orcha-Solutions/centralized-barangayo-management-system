# [CBMS-204] Integrate OpenAPI 3.0 & Swagger UI for Go Fiber Core Backend

**Issue Type:** Story / Technical Task  
**Epic:** CBMS Platform & API Infrastructure  
**Priority:** High  
**Story Points:** 5  
**Component:** `cbms-backend` (Go / Fiber v2)  
**Labels:** `api`, `swagger`, `openapi3`, `golang`, `fiber`, `documentation`, `rbac`  

---

## 1. Summary & Background
The CBMS backend is built with **Go Fiber v2** and GORM, providing multi-tenant local government services (RBI, Blotter, KP, Clearances, Treasury, GAD, Disaster, and DILG MC 2025-104 RBAC). Currently, frontend developers, mobile engineers, and third-party LGU integration partners rely on manual inspection of Fiber route files and Postman/PowerShell scripts to understand request schemas, authentication requirements, and role permissions.

This ticket covers generating an automated **OpenAPI 3.0 / Swagger 2.0 specification** using declarative code annotations (`swaggo/swag`) and serving an interactive **Swagger UI** directly at `/swagger/*` on the Go Fiber web server.

---

## 2. User Story
> **As an** API consumer, frontend engineer, or LGU system integrator,  
> **I want** an interactive, auto-generated Swagger UI and OpenAPI JSON/YAML endpoint,  
> **So that** I can explore, test, and integrate against all CBMS endpoints with precise request/response schemas, DILG role requirements, and multi-tenant header parameters.

---

## 3. Technical Implementation Details

### A. Dependency Selection
- **Swagger Generator CLI / Library:** `github.com/swaggo/swag/cmd/swag`
- **Fiber v2 Swagger Middleware:** `github.com/gofiber/swagger`
- **OpenAPI Schema Version:** OpenAPI 3.0 / Swagger 2.0 compatible

### B. Security Definitions to Document
The Swagger specification must define two security schemes:
1. **BearerAuth (JWT):**
   ```yaml
   type: apiKey
   name: Authorization
   in: header
   description: "Enter: 'Bearer <jwt_token>'"
   ```
2. **TenantHeader:**
   ```yaml
   type: apiKey
   name: X-Tenant-Id
   in: header
   description: "UUID or slug of the active barangay tenant (e.g. 'barangka')"
   ```

### C. Endpoint Coverage Scope
All existing endpoints registered in `cmd/server/main.go` must have complete `@Summary`, `@Description`, `@Tags`, `@Accept`, `@Produce`, `@Param`, `@Success`, and `@Failure` tags:
1. **System & Health**:
   - `GET /health` - Health check status & DB connectivity
   - `GET /api/hello` - Connectivity greeting
2. **Tenants Management (`/api/tenants`)**:
   - `GET /api/tenants` - List all tenants
   - `GET /api/tenants/current` - Get active tenant context
   - `GET /api/tenants/check-availability?subdomain={slug}` - Check slug availability
   - `GET /api/tenants/:identifier` - Get tenant by slug or ID
   - `POST /api/tenants` - Create new tenant (Onboarding)
   - `PUT /api/tenants/:id` - Full update
   - `PATCH /api/tenants/:id` - Partial update
   - `DELETE /api/tenants/:id` - Remove tenant
3. **Tenant Staff & Invitations (`/api/tenants/:identifier/invitations`)**:
   - `GET /api/tenants/:identifier/invitations` - List invitations
   - `POST /api/tenants/:identifier/invitations` - Create invitation with pre-assigned role
   - `GET /api/tenants/invitations/:token` - Validate invite token
   - `POST /api/tenants/invitations/accept` - Complete profile & accept invite
   - `DELETE /api/tenants/:identifier/invitations/:id` - Revoke invitation
4. **Member Roster (`/api/tenants/:identifier/members`)**:
   - `GET /api/tenants/:identifier/members`
   - `POST /api/tenants/:identifier/members`
   - `GET /api/tenants/:identifier/members/:userId`
   - `PATCH /api/tenants/:identifier/members/:userId`
   - `DELETE /api/tenants/:identifier/members/:userId`
5. **Authentication & Session (`/api/auth`)**:
   - `POST /api/auth/login` - Authenticate with email/password
   - `POST /api/auth/logout` - Invalidate session / clear refresh cookie
   - `POST /api/auth/refresh-token` - Better Auth token refresh
   - `GET /api/auth/me` - Current authenticated user profile
6. **DILG RBAC Matrix (`/api/rbac`)**:
   - `GET /api/rbac/roles` - List 13 DILG MC 2025-104 local government roles
   - `GET /api/rbac/roles/:role` - Inspect role specification
   - `GET /api/rbac/roles/:role/permissions` - List permissions granted to role
   - `GET /api/rbac/permissions` - List all available system permissions
   - `GET /api/rbac/me` - Caller's evaluated permissions and active role

---

## 4. Acceptance Criteria (Definition of Done)

- [ ] **AC 1: Swagger Dependency Installation**
  - `go.mod` is updated with `github.com/gofiber/swagger` and `swaggo/swag`.
- [ ] **AC 2: Main Application Metadata Annotated**
  - `cmd/server/main.go` contains package-level swagger annotations (`@title`, `@version`, `@description`, `@contact`, `@license`, `@securityDefinitions.apikey`).
- [ ] **AC 3: Route Mounting**
  - Route `app.Get("/swagger/*", swagger.HandlerDefault)` is mounted in `main.go` and accessible via browser.
- [ ] **AC 4: Interactive API Testing**
  - Users can click **"Authorize"** in Swagger UI, input a JWT token, and execute protected calls directly in the browser.
- [ ] **AC 5: Code Generation Script**
  - A helper script or Makefile target (`go run github.com/swaggo/swag/cmd/swag init -g cmd/server/main.go -o docs/swagger`) is provided to re-generate docs after handler changes.
- [ ] **AC 6: Zero Breaking Changes**
  - Existing Fiber route middleware, tenant resolution, and RBAC guards remain completely unaffected.

---

## 5. Implementation Subtasks

1. **Subtask 1**: Install `swaggo/swag` and `github.com/gofiber/swagger` into `cbms-backend`.
2. **Subtask 2**: Add API metadata and security scheme headers to `cmd/server/main.go`.
3. **Subtask 3**: Annotate handlers in `internal/adapters/handlers/`:
   - `auth_handler.go`
   - `tenant_handler.go`
   - `rbac_handler.go`
   - `message_handler.go`
4. **Subtask 4**: Run `swag init` to generate `docs/swagger/docs.go`, `swagger.json`, and `swagger.yaml`.
5. **Subtask 5**: Mount `/swagger/*` route in `main.go`.
6. **Subtask 6**: Verify endpoint rendering and execution in local browser at `http://localhost:4000/swagger/index.html`.
