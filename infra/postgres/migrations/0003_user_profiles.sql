create table if not exists user_profiles (
  user_id uuid primary key references auth_users(id) on delete cascade,
  name text null,
  home_city text null,
  budget text null,
  interests text[] not null default '{}',
  updated_at timestamptz not null
);
