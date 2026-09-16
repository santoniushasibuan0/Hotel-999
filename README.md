# Hotel 999 Batam — Hotel Management System

A focused hotel operations prototype for interview demonstration, covering **PMS, Inventory, and an AI Assistant** in one web application.

## Features
- Dashboard: room KPIs, today's reservations, inventory alerts
- PMS: Rooms, Guests, Reservations, check-in/check-out lifecycle model
- Inventory: products, stock levels, low-stock monitoring, stock-in/out architecture
- AI Assistant: Hotel 999 Operational AI Assistant with Demo Mode and server-side AI integration point
- Responsive professional dashboard UI

## Business flow
Room lifecycle: `AVAILABLE → RESERVED → OCCUPIED → CLEANING → AVAILABLE`; `MAINTENANCE` is a separate operational state.
Reservation lifecycle: `PENDING → CONFIRMED → CHECKED_IN → CHECKED_OUT` with `CANCELLED` as an alternate terminal state.

## Data model
- `users`
- `rooms`
- `guests`
- `reservations`
- `inventory_products`
- `inventory_transactions`

Relationships: Guest 1—N Reservations; Room 1—N Reservations; Inventory Product 1—N Inventory Transactions.

## Tech stack
Next.js App Router, TypeScript, Tailwind CSS, Supabase-ready architecture, server-side API route, Vercel-ready.

## Run locally
```bash
npm install
npm run dev
```
Open `http://localhost:3000`.

## Environment variables
Copy `.env.example` to `.env.local` when integration is needed. Never commit `.env.local`.

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `GEMINI_API_KEY`
- `OPENAI_API_KEY`

## Supabase integration plan
Replace demo data services with Supabase repositories, add Supabase Auth, create SQL tables matching the data model, then enforce database constraints/RLS. Keep the UI components independent from the persistence layer.

## AI integration plan
Browser → `/api/ai` → server-side provider → hotel data service → Supabase → response. API keys remain server-side. Demo Mode is explicitly labeled and does not claim live database access.

## Deployment
Deploy to Vercel after configuring production environment variables. The project does not require GitHub access from the application itself.

## Scope
This project intentionally does **not** implement CRM, HRIS, Accounting, POS, CCTV, network, asset management, or other large modules. Those can be discussed as future integration areas during an interview.
