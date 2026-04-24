-- Profiles table
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "Users view own profile" on public.profiles
  for select to authenticated using (auth.uid() = id);
create policy "Users update own profile" on public.profiles
  for update to authenticated using (auth.uid() = id);
create policy "Users insert own profile" on public.profiles
  for insert to authenticated with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Generations table
create table public.generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  business_name text not null,
  business_type text,
  review_text text not null,
  star_rating int not null check (star_rating between 1 and 5),
  tone text not null,
  owner_context text,
  short_reply text,
  warm_reply text,
  firm_reply text,
  private_message text,
  what_not_to_say text,
  action_checklist text,
  flag_guidance text,
  created_at timestamptz not null default now()
);
alter table public.generations enable row level security;

create policy "Users view own generations" on public.generations
  for select to authenticated using (auth.uid() = user_id);
create policy "Users insert own generations" on public.generations
  for insert to authenticated with check (auth.uid() = user_id);
create policy "Users delete own generations" on public.generations
  for delete to authenticated using (auth.uid() = user_id);

create index on public.generations (user_id, created_at desc);