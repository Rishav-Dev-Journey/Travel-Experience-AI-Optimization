create table if not exists user_sessions (
  token text primary key,
  user_id uuid not null references auth_users(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null
);

create index if not exists ix_user_sessions_user_id on user_sessions(user_id);
