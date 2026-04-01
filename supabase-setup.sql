-- SMS OTP table (used by send-sms / verify-sms edge functions)
create table if not exists sms_otp (
  id uuid default gen_random_uuid() primary key,
  phone text not null,
  code text not null,
  used boolean default false,
  created_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '5 minutes')
);

alter table sms_otp enable row level security;
-- No RLS select/insert policies needed — only accessed via service_role key in edge functions.

create index if not exists idx_sms_otp_phone_created on sms_otp (phone, created_at desc);

-- ──────────────────────────────────────────────────────────────

create table if not exists test_results (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  test_name text not null,
  result_type text,
  result_data jsonb,
  completed_at timestamptz default now(),
  unique(user_id, test_name)
);

alter table test_results enable row level security;

create policy "Users can read own results"
  on test_results for select
  using (auth.uid() = user_id);

create policy "Users can insert own results"
  on test_results for insert
  with check (auth.uid() = user_id);

create policy "Users can update own results"
  on test_results for update
  using (auth.uid() = user_id);
