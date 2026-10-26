begin;

create schema if not exists api;
create schema if not exists private;

revoke all on schema api from public;
revoke all on schema private from public;
revoke all on schema api from anon, authenticated;
revoke all on schema private from anon, authenticated;

create table api.enquiries (
  id uuid primary key,
  submitted_at timestamptz not null default now(),
  source text not null default 'website'
    check (source = 'website'),
  status text not null default 'new'
    check (status in ('new', 'in_review', 'closed', 'deleted')),
  schema_version smallint not null
    check (schema_version = 1),
  name text not null
    check (
      char_length(name) between 2 and 100
      and btrim(name) = name
    ),
  email text not null
    check (
      char_length(email) between 3 and 254
      and position('@' in email) > 1
      and lower(email) = email
      and btrim(email) = email
    ),
  city_state text
    check (
      city_state is null
      or (
        char_length(city_state) between 1 and 120
        and btrim(city_state) = city_state
      )
    ),
  pathway text not null
    check (
      pathway in (
        'athlete-participant',
        'parent-guardian',
        'coach',
        'judge-technical-official',
        'club-studio',
        'event-organiser',
        'governance-safeguarding',
        'volunteer-contributor',
        'research-media-education',
        'institutional-support',
        'general-updates',
        'general-question',
        'participation-question',
        'governance-documents',
        'media-research',
        'factual-correction',
        'privacy-request'
      )
    ),
  message text
    check (
      message is null
      or (
        char_length(message) between 10 and 2000
        and btrim(message) = message
      )
    ),
  privacy_acknowledged boolean not null
    check (privacy_acknowledged),
  privacy_notice_version text not null
    check (
      char_length(privacy_notice_version) between 1 and 64
      and privacy_notice_version ~ '^[A-Za-z0-9._-]+$'
    ),
  updates_consent boolean not null default false
);

comment on table api.enquiries is
  'Minimal website enquiry records. No browser role has read, update, or delete access.';
comment on column api.enquiries.message is
  'Optional non-confidential note; never use for safeguarding, health, document, or child details.';
comment on column api.enquiries.updates_consent is
  'Separate optional updates choice; false by default.';

alter table api.enquiries enable row level security;
alter table api.enquiries force row level security;

revoke all on table api.enquiries from public, anon, authenticated;
grant usage on schema api to anon;
grant insert (
  id,
  schema_version,
  name,
  email,
  city_state,
  pathway,
  message,
  privacy_acknowledged,
  privacy_notice_version,
  updates_consent
) on table api.enquiries to anon;

create table private.enquiry_api_keys (
  id uuid primary key,
  label text not null unique,
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

comment on table private.enquiry_api_keys is
  'Worker-only enquiry gate identifiers provisioned outside migrations.';

alter table private.enquiry_api_keys enable row level security;
alter table private.enquiry_api_keys force row level security;

revoke all on table private.enquiry_api_keys
  from public, anon, authenticated;

create or replace function private.enquiry_gate_ok()
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select exists (
    select 1
    from private.enquiry_api_keys as gate
    where gate.enabled
      and gate.id::text = coalesce(
        (
          coalesce(
            nullif(current_setting('request.headers', true), ''),
            '{}'
          )::jsonb ->> 'x-enquiry-key'
        ),
        ''
      )
  );
$function$;

revoke all on function private.enquiry_gate_ok() from public;
grant usage on schema private to anon;
grant execute on function private.enquiry_gate_ok() to anon;

create policy enquiries_insert_from_worker
on api.enquiries
for insert
to anon
with check (
  source = 'website'
  and status = 'new'
  and schema_version = 1
  and privacy_acknowledged
  and private.enquiry_gate_ok()
);

commit;
