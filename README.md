
-------------------------------------- REGARDING PIPELINES --------------------------------

---

# Understanding `single-commit: true` in `JamesIves/github-pages-deploy-action`

Excellent question 👏 — this one trips a lot of people up because it’s not always obvious what `single-commit: true` does in **`JamesIves/github-pages-deploy-action`**.

Let’s break it down clearly 👇

---

### 🧩 The purpose of `single-commit: true`

Normally, every time you deploy with the action, it:

* Commits the new build (e.g. `Update MFE build`)
* Pushes that commit to your target branch (e.g. `main` or `gh-pages`)

Over time, you’ll accumulate **many commits** — one per deploy — which can make the branch’s history heavy or messy.

`single-commit: true` changes that behavior:

> It keeps **only one commit** in the target branch, overwriting it every time you deploy.

---

### ⚙️ What actually happens

When `single-commit: true` is set:

1. The action checks out your target branch.
2. It **removes all previous history** (resets to an empty branch).
3. It commits your current deployment as **a single commit**.
4. Pushes it forcefully (`--force`).

So your Pages branch (e.g., `main` or `gh-pages`) will always have:

* **One commit total**
* Containing only the latest build artifacts
* No incremental history or diffs

---

### ✅ Pros

| Benefit                            | Description                                                                     |
| ---------------------------------- | ------------------------------------------------------------------------------- |
| 🧹 Clean history                   | Keeps your `gh-pages` or `main` branch free of thousands of deployment commits. |
| 🚀 Faster pushes                   | No growing repo size from accumulating commits.                                 |
| 🔒 Safe for binary-heavy artifacts | Prevents bloated git history.                                                   |
| 🧠 Simpler to roll back            | You only ever see the latest deployed state.                                    |

---

### ⚠️ Cons

| Limitation              | Why it matters                                                  |
| ----------------------- | --------------------------------------------------------------- |
| ❌ No deployment history | You can’t see previous deploy commits or diffs.                 |
| ❌ Force pushes          | Each deploy overwrites the branch; concurrent deploys may race. |
| 🕰️ No rollback         | You can’t easily revert to an earlier deployment version.       |

---

### 🧭 When to use it

✅ **Use `single-commit: true` when:**

* You treat your Pages repo/branch purely as a *build artifact bucket*.
* You don’t need version history of static builds.
* You want to minimize branch clutter (especially for `gh-pages`).

🚫 **Avoid it if:**

* You want to keep each deployment’s commit (e.g., for auditing or rollback).
* You have multiple workflows pushing to the same branch concurrently (they may overwrite each other).

---

### 🧱 Typical config example

```yaml
- name: Deploy inkramp-mfe-supplier MFE
  uses: JamesIves/github-pages-deploy-action@v4
  with:
    branch: main
    folder: ./dist/pokemon
    repository-name: InkRamp/all-mfe-builds
    token: ${{ secrets.PAT_TOKEN }}
    target-folder: pokemon
    clean: false
    single-commit: true   # 👈 keeps just one commit, overwriting previous
```

---

### ✅ TL;DR

| Setting                          | Effect                                                                                  |
| -------------------------------- | --------------------------------------------------------------------------------------- |
| `single-commit: false` (default) | Adds a new commit each deployment (keeps history)                                       |
| `single-commit: true`            | Force-pushes one commit, erasing history — always one clean commit in the target branch |

---

If you’re using this shared `all-mfe-builds` repo for **multiple MFEs**,
👉 **don’t enable `single-commit`** — otherwise each deploy could erase the previous MFE’s folder history (since the branch history is replaced).

Instead, keep it `false` (default) and use `clean: false` — that ensures each MFE updates only its folder without nuking others.

---


-------------------------------------- HOST --------------------------------
ng new shell --routing --style=scss
cd shell 
ng update @angular/core@18 @angular/cli@18
ng add @angular-architects/module-federation@18 --project shell --type host --port 4100

# For generating modules
ng generate module shell --flat
ng g module shared/remote-wrapper

# Generate library before above code
ng generate library core-services --prefix=org 

# For generating library
# Then create a public API file:

# // projects/shared-services/src/index.ts
# export * from './auth.service';
# export * from './event-bus.service';

# 2️⃣ tsconfig path mapping

#Update this in tsconfig.json
# "paths": {
#       // "core-services": [
#       //   "./dist/core-services"
#       // ], 
#       "@org/core-services": ["./projects/core-services/src/public-api.ts"]
#     },

# Usage 
# import { AuthService } from '@org/core-services';





-------------------------------------- REMOTE --------------------------------
ng new pokemon --routing --style=scss
cd pokemon 
ng update @angular/core@18 @angular/cli@18
ng add @angular-architects/module-federation@18 --project pokemon --type remote --port 4101

I have a shell and some remotes in angular. Federation is done dynamically. There are some common problems I need to solve
like authentication, rbac, percieved performance, predictive loading, user preferences, system configurations, prioritized loading etc. 
I want to do all these in a manner that:
1. Some aspects work for both standalone and federated remotes like authentication, rbac, etc. 
2. My solutions are scalable and flexible. 
3. I follow best principles like SOLID and YAGNI
4. There should be high cohesion and low coupling. 
5. Some apps which need virtualization work seamlessly
6. Tell me the native solutions I could use to solve critical problems like huge data, processing, caching etc. 

Now to support all the above on UI i need to convert my existing backend to BFF. After all UI aspects are addressed, dig into these details afterwards. But while making UI decisions
do take this angle into account as well. You see its quite possible that current backend may not support my UI ambitions, so what do I need to do in order to alter them without affecting
exisiting services. Make necessary assumptions and take scenarios from bankking domain. 


# inkramp-mfe-supplier

This micro-frontend application provides sales history and performance tracking functionality for sales executives, team leads, and administrators.

## Quick Start

```bash
# Install dependencies
npm install

# Build core-services library
npm run ng build core-services

# Serve locally
npm start
# App runs at http://localhost:4101

# Build for production
npm run build

# Run tests
npm test
```

## Features

- 📊 **Sales History Dashboard**: View detailed sales records with filtering
- 👥 **Role-Based Access**: Different views for admins, team leads, and sales executives
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🎨 **Shared Design System**: Consistent styling with design tokens and mixins
- 🔄 **Module Federation**: Works standalone or as part of a larger shell application

## Documentation

For detailed documentation, see [MFE_DOCUMENTATION.md](./MFE_DOCUMENTATION.md)

## Architecture

This MFE uses:
- Angular 18
- Module Federation for micro-frontend architecture
- Zitadel for authentication
- RxJS for reactive programming
- SCSS with shared tokens for styling

## Key Components

- **SalesHistoryComponent**: Main component displaying sales data
- **RoleService**: Manages user roles and permissions
- **SalesDataService**: Provides sales data with filtering
- **AuthService**: Handles Zitadel OIDC authentication

## Project Structure

```
inkramp-mfe-supplier/
├── src/
│   ├── app/                    # Application components
│   ├── styles/                 # Shared SCSS tokens and mixins
│   └── styles.scss            # Global styles
├── projects/
│   └── core-services/         # Shared services library
├── MFE_DOCUMENTATION.md       # Detailed documentation
└── README.md                  # This file
```

## Development Notes

- Follows SOLID, DRY, and YAGNI principles
- Uses dummy data for demonstration (to be replaced with API calls)
- Designed to work with shell application using dynamic module loading
- Supports future brand-specific deployments

---

## Zitadel OIDC Authentication

This application implements Zitadel OIDC login for authentication.

### Configuration

The authentication settings are configured in `projects/core-services/src/lib/auth.service.ts`:

- **ISSUER_BASE_URL**: `https://your-tenant.zitadel.cloud`
- **CLIENT_ID**: `zitadel-client-id`
- **REDIRECT_URI**: `http://localhost:4200/auth-callback`
- **SCOPE**: `openid profile email`

### Setup Instructions

1. **Configure Zitadel**: 
   - Create an application in your Zitadel instance
   - Set the redirect URI to `http://localhost:4200/auth-callback`
   - Copy your Client ID

2. **Update Configuration**:
   - Open `projects/core-services/src/lib/auth.service.ts`
   - Replace `ISSUER_BASE_URL` with your Zitadel tenant URL
   - Replace `CLIENT_ID` with your application's client ID

3. **Run the Application**:
   ```bash
   npm install
   ng serve
   ```

4. **Login**:
   - Navigate to `http://localhost:4200`
   - Click the "Login with Zitadel" button in the header
   - You'll be redirected to Zitadel for authentication
   - After successful login, you'll be redirected back to the app
   - Your user information will be displayed in the header

### Features

- **Login**: Click "Login with Zitadel" to authenticate
- **Logout**: Click "Logout" to clear session
- **User Info**: Displays authenticated user's name or email in the header
- **JWT Storage**: Access token is stored in localStorage
- **Auth State**: Observable user state available via `AuthService.user$`

### API

The `AuthService` provides the following methods:

- `login()`: Initiates OIDC login flow
- `logout()`: Clears authentication state
- `getToken()`: Returns the stored JWT token
- `isAuthenticated()`: Returns true if user is authenticated
- `getUser()`: Returns current user information
- `user$`: Observable of user state changes

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
