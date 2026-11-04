-- StudyDeck initial schema. Run in the NEW StudyDeck Supabase project only.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  education_level text check (education_level is null or education_level in
    ('Primary 1–6','JSS 1–3','SS 1–3','JAMB','WAEC','NECO','Tertiary')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, nullif(new.raw_user_meta_data ->> 'full_name',''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  education_level text not null,
  exam_track text,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.topics (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects(id) on delete cascade,
  title text not null,
  description text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete set null,
  title text not null,
  body text not null default '',
  is_favourite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.flashcards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete set null,
  front text not null,
  back text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subject_id uuid references public.subjects(id) on delete set null,
  education_level text,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  prompt text not null,
  options jsonb not null default '[]'::jsonb,
  correct_option_index integer not null check (correct_option_index >= 0),
  explanation text,
  sort_order integer not null default 0
);

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  score integer not null default 0,
  total_questions integer not null default 0,
  answers jsonb not null default '{}'::jsonb,
  completed_at timestamptz not null default now()
);

create index if not exists notes_user_updated_idx on public.notes(user_id, updated_at desc);
create index if not exists flashcards_user_created_idx on public.flashcards(user_id, created_at desc);
create index if not exists attempts_user_completed_idx on public.quiz_attempts(user_id, completed_at desc);
create index if not exists topics_subject_sort_idx on public.topics(subject_id, sort_order);

alter table public.profiles enable row level security;
alter table public.subjects enable row level security;
alter table public.topics enable row level security;
alter table public.notes enable row level security;
alter table public.flashcards enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_attempts enable row level security;

-- A learner can read and update only their own profile.
create policy "profile_select_own" on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy "profile_update_own" on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- Learning catalogue is readable by signed-in learners; writes are reserved for trusted server/admin workflows.
create policy "subjects_read_authenticated" on public.subjects for select to authenticated using (true);
create policy "topics_read_authenticated" on public.topics for select to authenticated using (true);
create policy "published_quizzes_read_authenticated" on public.quizzes for select to authenticated using (is_published = true);
create policy "questions_for_published_quizzes_read" on public.quiz_questions for select to authenticated
using (exists (select 1 from public.quizzes q where q.id = quiz_id and q.is_published = true));

-- Learner-owned content.
create policy "notes_select_own" on public.notes for select to authenticated using (user_id = (select auth.uid()));
create policy "notes_insert_own" on public.notes for insert to authenticated with check (user_id = (select auth.uid()));
create policy "notes_update_own" on public.notes for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "notes_delete_own" on public.notes for delete to authenticated using (user_id = (select auth.uid()));

create policy "flashcards_select_own" on public.flashcards for select to authenticated using (user_id = (select auth.uid()));
create policy "flashcards_insert_own" on public.flashcards for insert to authenticated with check (user_id = (select auth.uid()));
create policy "flashcards_update_own" on public.flashcards for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "flashcards_delete_own" on public.flashcards for delete to authenticated using (user_id = (select auth.uid()));

create policy "attempts_select_own" on public.quiz_attempts for select to authenticated using (user_id = (select auth.uid()));
create policy "attempts_insert_own" on public.quiz_attempts for insert to authenticated with check (user_id = (select auth.uid()));

-- No public or client-side policies allow users to publish content or alter answer keys.
