Local mock backend for Apps Script endpoints

Run a small Express server that mimics the Apps Script web app API for local testing.

Install & run:

```
npm install
npm run dev:api
```

Endpoints:

- POST /sales, /purchase, /cash, /credit — body JSON appended to current month (or provided date)
- GET /sales?month=YYYY-MM — returns rows for that month
- POST /customers — append a customer
- GET /customers — list customers

Data is stored in `scripts/mock-server/data/*.json`.
