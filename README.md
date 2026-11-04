# StudyDeck

Mobile-first learning platform for Nigerian learners: Primary 1–6, JSS 1–3, SS 1–3, JAMB, WAEC, NECO and tertiary learners.

## Stack
- React + Vite
- Supabase Auth and Postgres
- Forest-green and warm cream interface
- Designed to deploy on a free static-hosting tier

## Local setup
1. Install Node.js 20 or newer on a computer.
2. Run `npm install`.
3. Copy `.env.example` to `.env` and fill in the Supabase project URL and publishable key.
4. Run `npm run dev`.

On Android, you can upload this project ZIP to GitHub using the repository's **Add file → Upload files** option. GitHub's mobile website may require selecting the extracted project files rather than uploading a ZIP; if so, use GitHub's browser desktop-site option or a computer.

## Supabase setup
1. Open the `supabase/migrations/001_initial_schema.sql` file.
2. In Supabase, open the new `studydeck-platform` project → SQL Editor.
3. Paste and run the migration.
4. Configure Auth → URL Configuration after choosing your final deployment URL.

The migration enables Row Level Security on user-owned data. It does not create an admin user or grant admin rights to anyone. Admin roles must be assigned securely by a trusted project owner through a server-side process, never through editable user metadata.

## Important
- Never put a Supabase `service_role` or secret key in this frontend project.
- `.env` is ignored by Git. Only use the publishable key in browser code.
- Payment collection, AI features and premium entitlements are not wired yet. Add them only after choosing a payment provider and implementing server-side verification.
- The app is a starter foundation, not a production-complete learning platform.
