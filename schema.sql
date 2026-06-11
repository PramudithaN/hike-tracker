-- supabase/schema.sql
-- Run this in your Supabase SQL editor to set up all tables

-- Enable PostGIS for geographic distance calculations (optional but useful)
-- create extension if not exists postgis;

-- ── Users ──────────────────────────────────────────────────────
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  avatar_url text,
  total_hikes integer default 0,
  total_distance_km numeric default 0,
  created_at timestamptz default now()
);

alter table public.users enable row level security;

create policy "Users can read all profiles"
  on public.users for select using (true);

create policy "Users can update own profile"
  on public.users for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.users for insert with check (auth.uid() = id);


-- ── Hikes ──────────────────────────────────────────────────────
create table public.hikes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  status text check (status in ('active', 'summited', 'completed')) default 'active',

  start_time timestamptz not null,
  summit_time timestamptz,
  end_time timestamptz,

  elapsed_seconds integer,                -- total hike duration
  summit_elapsed_seconds integer,         -- time to summit

  start_latitude numeric not null,
  start_longitude numeric not null,
  summit_latitude numeric,
  summit_longitude numeric,
  end_latitude numeric,
  end_longitude numeric,

  distance_km numeric,
  elevation_gain_m numeric,

  created_at timestamptz default now()
);

alter table public.hikes enable row level security;

create policy "Users can read all hikes"
  on public.hikes for select using (true);

create policy "Users can insert own hikes"
  on public.hikes for insert with check (auth.uid() = user_id);

create policy "Users can update own hikes"
  on public.hikes for update using (auth.uid() = user_id);


-- ── Waypoints ──────────────────────────────────────────────────
create table public.waypoints (
  id uuid default gen_random_uuid() primary key,
  hike_id uuid references public.hikes(id) on delete cascade not null,
  latitude numeric not null,
  longitude numeric not null,
  altitude numeric,
  type text check (type in ('track', 'start', 'summit', 'end')) default 'track',
  recorded_at timestamptz default now()
);

alter table public.waypoints enable row level security;

create policy "Waypoints readable by all"
  on public.waypoints for select using (true);

create policy "Users can insert waypoints for own hikes"
  on public.waypoints for insert
  with check (
    auth.uid() = (select user_id from public.hikes where id = hike_id)
  );


-- ── Achievements ───────────────────────────────────────────────
create table public.achievements (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  key text not null,
  earned_at timestamptz default now(),
  unique (user_id, key)                   -- prevent duplicate awards
);

alter table public.achievements enable row level security;

create policy "Achievements readable by all"
  on public.achievements for select using (true);

create policy "Only server can insert achievements"
  on public.achievements for insert with check (auth.uid() = user_id);


-- ── Auto-increment total_hikes on completion ───────────────────
create or replace function increment_user_hike_count()
returns trigger as $$
begin
  if NEW.status = 'completed' and OLD.status != 'completed' then
    update public.users
    set total_hikes = total_hikes + 1
    where id = NEW.user_id;
  end if;
  return NEW;
end;
$$ language plpgsql security definer;

create trigger on_hike_completed
  after update on public.hikes
  for each row execute function increment_user_hike_count();
