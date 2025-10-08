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


# Pokemon

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 17.3.17.

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
