# ADR 0001 — Modular monolith, not microservices

**Status:** Accepted · **Date:** 2026-08-08

## Context

CBMS spans ~20 functional modules across five client applications. The build prompt
explicitly forbids microservices. We need clean module boundaries without distributed-systems
overhead, on a codebase a small team (or a single agent) can hold in its head.

## Decision

One deployable API (`apps/api`, Fastify) with **package seams** rather than network seams:

- `@cbms/db` — schema, tenant-scoped client, field encryption, money primitives
- `@cbms/rbac` — permission catalog and guards
- `@cbms/auth` — passwords, JWT, TOTP
- `@cbms/payments` — the `EmiProvider` interface (the only place a real EMI plugs in)
- `@cbms/ui`, `@cbms/api-client` — shared front-end contracts

Routes are grouped per module under `apps/api/src/routes/`. Cross-module access goes
through Prisma, not HTTP.

We chose **Fastify** over NestJS (the prompt's first suggestion). The prompt allowed
"pick one and stay consistent"; Fastify gives us Zod-first validation and far less
boilerplate at this module count, and its plugin system already provides the
encapsulation NestJS modules would have.

## Consequences

- One process to run, one transaction boundary — the wallet can post to the ledger
  atomically (`prisma.$transaction`), which a microservice split would have made a
  distributed-transaction problem.
- Module isolation is enforced by review and package boundaries, not the network.
- If a module ever needs independent scaling, its routes + Prisma models are already
  grouped and can be extracted.
