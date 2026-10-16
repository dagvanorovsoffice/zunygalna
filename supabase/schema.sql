-- Zunygalna (Зун яг ална) Supabase Schema
-- Run this inside the Supabase SQL Editor to enable cloud sync & social leaderboards.

create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text not null,
  invite_code text unique not null,
  gender text not null check (gender in ('male', 'female')),
  age integer not null default 28,
  height_cm numeric(5,1) not null default 170,
  weight_kg numeric(5,1) not null default 75,
  target_weight_kg numeric(5,1) not null default 65,
  target_date date not null default '2027-06-15',
  commute_method text not null default 'bus_walk',
  commute_distance_km numeric(4,1) not null default 2.0,
  exercise_days_per_week integer not null default 2,
  exercise_intensity text not null default 'moderate',
  deficit_tier text not null default 'medium',
  movement_add_kcal integer not null default 250,
  diet_cut_kcal integer not null default 250,
  personal_best_daily_kcal integer not null default 680,
  body_fat_pct numeric(4,1),
  skeletal_muscle_pct numeric(4,1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.daily_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  log_date date not null default current_date,
  walked_meters integer not null default 0,
  exercise_burn_kcal integer not null default 0,
  commute_completed boolean not null default false,
  extra_intake_kcal integer not null default 0, -- Positive shifts goal right; negative (fasting/light) increases net deficit
  fasting_bonus_kcal integer not null default 0,
  base_burn_goal_kcal integer not null default 500,
  net_deficit_kcal integer not null default 0,
  updated_at timestamptz not null default now(),
  unique(user_id, log_date)
);

create table if not exists public.friendships (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  friend_id uuid references public.profiles(id) on delete cascade not null,
  relation_type text not null default 'friend' check (relation_type in ('friend', 'family')),
  created_at timestamptz not null default now(),
  unique(user_id, friend_id)
);

create table if not exists public.support_nudges (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  receiver_id uuid references public.profiles(id) on delete cascade not null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.daily_logs enable row level security;
alter table public.friendships enable row level security;
alter table public.support_nudges enable row level security;
