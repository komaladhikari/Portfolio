# Portfolio

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Configuration:

```dotenv
VITE_API_BASE_URL=http://127.0.0.1:8000
VITE_API_TIMEOUT_MS=10000
```

`VITE_API_BASE_URL` must be the deployed HTTPS backend URL in production. Vite
variables are public browser configuration, so never put passwords or claim
tokens in them.

## Checks

```bash
npm test
npm run build
```

The browser stores only a visitor's wish IDs and private claim tokens in
`localStorage`. Claim tokens are sent in `X-Claim-Token` headers, never URLs.
