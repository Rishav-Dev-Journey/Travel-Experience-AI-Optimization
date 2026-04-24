create table if not exists otp_challenges (
  id uuid primary key,
  challenge_id text not null unique,
  user_id uuid not null references auth_users(id) on delete cascade,
  identifier text not null,
  channel text not null,
  code_hash text not null,
  created_at timestamptz not null,
  expires_at timestamptz not null,
  consumed_at timestamptz null
);

create index if not exists ix_otp_challenges_identifier_channel
  on otp_challenges(identifier, channel);
