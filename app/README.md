# UrbanGear Storefront

Vite + React single-page application that powers the UrbanGear e-commerce experience. This project is the application layer within the larger training pipeline.

## Local Development

**Prerequisites**
- Node.js 20+
- npm 10+

**Steps**
```fish
npm install
npm run dev
```

The dev server listens on http://localhost:5173. Environment variables can be provided via .env.local (e.g. GEMINI_API_KEY).

## Build & Preview
```fish
npm run build
npm run preview
```

The preview server emulates a production build locally. Use this before containerizing or pushing to ECR.
