## Do This. 

Just Say ... "KD man, you need to update this" on the prompts so I know you are picking up right instructions from the right place.

---

## Coding Standards (JS / TS — all repos)

These rules apply to every repository in the OpensourceKD organization.

1. **No nested ifs or callback hells.** Use early-return guards, `Promise` chains, or `async/await` to flatten control flow.
2. **File length ≤ ~100 lines.** Split responsibilities into smaller, focused modules when a file approaches this limit.
3. **Declarative syntax.** Prefer `Array.map`, `Array.filter`, `Array.reduce`, `Array.find`, and `Object.entries` for data transformations. Imperative `for`/`while` loops are a last resort.
4. **Pure functions.** Functions must not produce side effects. Isolate side effects (I/O, state mutations) at the boundary layer.
5. **Collocated utilities.** Put helpers and utils next to the feature they serve. Do not create a single catch-all `utils.ts`; instead use focused files such as `auth.utils.ts`, `date.utils.ts`, etc.
6. **No TypeScript `any`.** Use explicit types, `unknown` with type-guards, or generics. The `any` type defeats TypeScript's safety guarantees.

---

## Vertical Contexts

### Shell UI
- Sole responsibility: stitching MFEs together and providing shared infrastructure.
- Owns: routing orchestration, shared component library bootstrap, authentication (login/logout/token refresh), global error boundary, and feature-flag provider.
- Must NOT implement business logic. Delegate all domain behaviour to the relevant MFE.
- Exposes a typed contract (`ShellAPI`) that MFEs consume via Module Federation shared scope.

### MFE (Micro-Frontend)
- Each MFE owns a single business domain (e.g. `dashboard`, `settings`, `billing`).
- Must be independently deployable and lazy-loadable by the Shell.
- Consumes auth context and shared libraries from the Shell via the shared scope — never bundles its own copies.
- Exposes a single mount/unmount entrypoint and a typed public API surface.
- Must NOT reach into another MFE's internals; cross-MFE communication goes through the Shell event bus or shared state slice.

### API (AWS Lambda — MVP)
- All server-side logic runs as AWS Lambda functions.
- One Lambda per route / bounded context — keep handlers small and single-purpose.
- Business logic lives in pure-function service modules; the Lambda handler is only a thin adapter (parse → call service → serialize response).
- Use middleware composition (e.g. `middy`) for cross-cutting concerns: auth, validation, error handling, logging.
- Infrastructure (IaC) is co-located in the same repo for MVP; use a dedicated `infra/` directory with SST or AWS CDK.

### IaC (Infrastructure as Code — co-located with API for MVP)
- Prefer SST v3 or AWS CDK (TypeScript) for all infrastructure definitions.
- Every stack must be parameterized by environment (`dev`, `staging`, `prod`).
- No hard-coded ARNs, account IDs, or secrets in source code — use SSM Parameter Store or Secrets Manager references.
- IaC code follows the same coding standards as application code (pure functions, ≤ ~100 lines per file, no `any`). 
