# Recovery Companion - Monorepo

This repository contains the source code for the Recovery Companion, a privacy-first 12-step recovery app.

- **apps/mobile**: Expo (React Native) app for users.
- **apps/web**: Next.js app for the sponsor/admin portal.
- **packages/api**: Shared tRPC routers.
- **packages/ui**: Shared React/React Native components.
- **packages/types**: Zod schemas and TypeScript types.
- **supabase/**: Database migrations and seed scripts.

## 🚀 Getting Started

### 1. Prerequisites

- [Node.js](https://nodejs.org/en/) (v18+ recommended)
- [pnpm](https://pnpm.io/installation) (or npm/yarn with workspace support)
- [Docker](https://www.docker.com/products/docker-desktop/) (for Supabase local development)
- [Supabase CLI](https://supabase.com/docs/guides/cli/getting-started): `npm install -g supabase`

### 2. Initial Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd recovery-companion
    ```

2.  **Install dependencies:**
    ```bash
    pnpm install
    ```

3.  **Set up Environment Variables:**
    Copy the root environment example file.
    ```bash
    cp .env.example .env
    ```
    *You will fill this in during the Supabase setup.*

### 3. Supabase Local Development

1.  **Log in to Supabase CLI:**
    ```bash
    supabase login
    ```
    *(You'll need a Supabase Access Token)*

2.  **Start the local Supabase stack:**
    This will start a local instance of Postgres, Auth, Storage, etc., using Docker.
    ```bash
    supabase start
    ```

3.  **Apply migrations and seed the database:**
    This will create the database schema from `supabase/migrations` and run the seed script.
    ```bash
    supabase db reset
    ```

4.  **Get local Supabase credentials:**
    The `supabase start` command will output your local API URL and keys.
    - `API URL`
    - `anon key`
    - `service_role key`

5.  **Update your `.env` file:**
    Open the `.env` file in the root of the project and populate it with the credentials from the previous step. You can use the `anon key` for both `SUPABASE_ANON_KEY` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

### 4. Running the Development Servers

You can run both the web and mobile apps concurrently.

1.  **Run the Next.js web app (Sponsor Portal):**
    ```bash
    pnpm dev:web
    ```
    This will start the web server at `http://localhost:3000`.

2.  **Run the Expo mobile app:**
    In a separate terminal:
    ```bash
    pnpm dev:mobile
    ```
    This will start the Metro bundler. You can then open the app in an iOS Simulator, Android Emulator, or on your physical device using the Expo Go app.

## Scripts

- `pnpm dev`: Runs both mobile and web apps concurrently.
- `pnpm dev:mobile`: Starts the Expo dev server.
- `pnpm dev:web`: Starts the Next.js dev server.
- `pnpm lint`: Lints all code in the monorepo.
- `pnpm typecheck`: Runs TypeScript compiler across all packages.
