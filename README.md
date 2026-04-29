# AuthNova

AuthNova is a full-stack authentication platform built with React, Node.js, Express, and MongoDB. It preserves production-grade security flows while introducing a completely redesigned interface and updated branding.

## Project Identity

- Name: AuthNova
- Brand Line: Trust Refined
- Logo Concept (text-based):
  - Icon: Rounded square badge with gradient glow and AN monogram
  - Wordmark: AuthNova in a geometric modern heading font
  - Tone: Futuristic security dashboard with dark glass surfaces and cyan/emerald accents

## Tech Stack

- Frontend: React + Tailwind CSS + React Router + Axios + React Hot Toast
- Backend: Node.js + Express + MongoDB (Mongoose)

## Security Features (unchanged logic)

- JWT access and refresh token flow
- Password hashing with bcrypt
- Two-factor authentication (OTP/authenticator)
- Account lockout after failed attempts
- Password reset with token expiration
- Login history with IP/device/location tracking
- Suspicious login alert emails
- Rate limiting, Helmet hardening, CSRF protection

## Architecture

- Backend follows MVC structure
- Existing auth flow and API behavior preserved
- Frontend restructured visually with reusable UI components:
  - Button
  - Input
  - Card
  - Auth shell layouts

## Folder Overview

- backend/: Express server, controllers, models, middleware, routes, utilities
- frontend/: React app, auth pages, dashboard, shared UI components, context and API layer

## Run Locally

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Notes

This redesign intentionally changes branding, typography, spacing, component style, and page composition to make the product identity distinct while preserving all existing security and authentication behavior.
