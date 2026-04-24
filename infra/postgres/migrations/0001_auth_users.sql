create table if not exists auth_users (
  id uuid primary key,
  identifier text not null,
  channel text not null,
  created_at timestamptz not null,
  last_login_at timestamptz null,
  unique(identifier, channel)
);
