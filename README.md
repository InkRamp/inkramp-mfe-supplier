# inkramp-mfe-supplier

Supplier micro-frontend for InkRamp procurement workflows.

## What this MFE now provides

- View open supplier-visible RFQs
- Submit supplier quotes for selected RFQs
- View submitted quote history
- View catalog snapshot for supplier pricing context

## Relevant platform endpoints used

- RFQs: `https://2rjdttem3f.execute-api.us-east-1.amazonaws.com/v1/rfqs`
- Quoting: `https://2rjdttem3f.execute-api.us-east-1.amazonaws.com/v1/rfqs`
- Catalog: `https://2rjdttem3f.execute-api.us-east-1.amazonaws.com/v1/catalog`
- Documents (configured for next extension): `https://2rjdttem3f.execute-api.us-east-1.amazonaws.com/v1/documents`

## Local development

```bash
npm ci
npm start
```

## Validation

```bash
npm run build
npm test -- --watch=false --browsers=ChromeHeadless
```
