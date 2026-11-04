# StudyDeck build roadmap

## Foundation (included)
- Vite + React app shell
- Responsive forest-green and cream UI
- Supabase email/password sign-up and sign-in
- Profile row creation on Auth signup
- Initial database tables and row-level security

## Next implementation stages
1. Profile editor: education level, class, subjects and exam goals.
2. Notes: create, edit, favourite, search and delete personal notes.
3. Flashcards: decks, review sessions and spaced-repetition scheduling.
4. Quizzes: safe question delivery, scoring and attempt history.
5. CBT: timed exam sessions, navigation, autosave and results.
6. Admin content studio: trusted role assignment and content moderation.
7. Premium: server-verified payment webhooks, subscription status and entitlements.
8. AI study assistant: server-side calls, quotas, abuse controls and cost monitoring.

## Security decisions
- RLS is enabled on all tables in the initial schema.
- Public clients cannot insert/update subject, topic, quiz or answer-key content.
- Admin permissions must be implemented with a server-controlled role table or claims, not user-editable metadata.
- Do not store payment secrets or AI provider keys in frontend environment variables.
