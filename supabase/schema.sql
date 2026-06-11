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

  elapsed_seconds integer,
  summit_elapsed_seconds integer,

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
  unique (user_id, key)
);

alter table public.achievements enable row level security;

create policy "Achievements readable by all"
  on public.achievements for select using (true);

create policy "Users can insert own achievements"
  on public.achievements for insert with check (auth.uid() = user_id);


-- ── Trigger: auto-create profile on auth signup ──────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, username)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'username',
      'user_' || substr(new.id::text, 1, 8)
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ── Trigger: auto-increment total_hikes on completion ──────────
create or replace function public.increment_hike_count()
returns trigger language plpgsql security definer as $$
begin
  if new.status = 'completed' and (old.status is null or old.status <> 'completed') then
    update public.users
    set
      total_hikes      = total_hikes + 1,
      total_distance_km = total_distance_km + coalesce(new.distance_km, 0)
    where id = new.user_id;
  end if;
  return new;
end;
$$;

create trigger on_hike_completed
  after update on public.hikes
  for each row execute procedure public.increment_hike_count();
