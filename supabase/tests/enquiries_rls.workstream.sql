\set ON_ERROR_STOP on

-- Run against an isolated local Supabase database after migrations.
-- Every identifier below is synthetic and the transaction is rolled back.
begin;

insert into private.enquiry_api_keys (id, label, enabled)
values
  ('00000000-0000-4000-8000-000000000001', 'workstream-test-enabled', true),
  ('00000000-0000-4000-8000-000000000002', 'workstream-test-disabled', false);

set local role anon;
select set_config('request.headers', '{}', true);

do $test$
declare
  rejected boolean := false;
begin
  begin
    insert into api.enquiries (
      id,
      schema_version,
      name,
      email,
      pathway,
      privacy_acknowledged,
      privacy_notice_version,
      updates_consent
    ) values (
      '00000000-0000-4000-8000-000000000010',
      1,
      'Test Person',
      'test@example.invalid',
      'general-question',
      true,
      'test-v1',
      false
    );
  exception
    when insufficient_privilege then
      rejected := true;
  end;

  if not rejected then
    raise exception 'insert without enquiry gate was not rejected';
  end if;
end;
$test$;

select set_config(
  'request.headers',
  '{"x-enquiry-key":"00000000-0000-4000-8000-000000000099"}',
  true
);

do $test$
declare
  rejected boolean := false;
begin
  begin
    insert into api.enquiries (
      id,
      schema_version,
      name,
      email,
      pathway,
      privacy_acknowledged,
      privacy_notice_version,
      updates_consent
    ) values (
      '00000000-0000-4000-8000-000000000011',
      1,
      'Test Person',
      'test@example.invalid',
      'general-question',
      true,
      'test-v1',
      false
    );
  exception
    when insufficient_privilege then
      rejected := true;
  end;

  if not rejected then
    raise exception 'insert with wrong enquiry gate was not rejected';
  end if;
end;
$test$;

select set_config(
  'request.headers',
  '{"x-enquiry-key":"00000000-0000-4000-8000-000000000002"}',
  true
);

do $test$
declare
  rejected boolean := false;
begin
  begin
    insert into api.enquiries (
      id,
      schema_version,
      name,
      email,
      pathway,
      privacy_acknowledged,
      privacy_notice_version,
      updates_consent
    ) values (
      '00000000-0000-4000-8000-000000000012',
      1,
      'Test Person',
      'test@example.invalid',
      'general-question',
      true,
      'test-v1',
      false
    );
  exception
    when insufficient_privilege then
      rejected := true;
  end;

  if not rejected then
    raise exception 'insert with disabled enquiry gate was not rejected';
  end if;
end;
$test$;

select set_config(
  'request.headers',
  '{"x-enquiry-key":"00000000-0000-4000-8000-000000000001"}',
  true
);

insert into api.enquiries (
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
) values (
  '00000000-0000-4000-8000-000000000013',
  1,
  'Test Person',
  'test@example.invalid',
  'Test City',
  'general-question',
  'Synthetic policy test message.',
  true,
  'test-v1',
  false
);

do $test$
declare
  rejected boolean := false;
begin
  begin
    perform id from api.enquiries;
  exception
    when insufficient_privilege then
      rejected := true;
  end;

  if not rejected then
    raise exception 'anon select was not rejected';
  end if;
end;
$test$;

do $test$
declare
  rejected boolean := false;
begin
  begin
    update api.enquiries
    set name = 'Changed'
    where id = '00000000-0000-4000-8000-000000000013';
  exception
    when insufficient_privilege then
      rejected := true;
  end;

  if not rejected then
    raise exception 'anon update was not rejected';
  end if;
end;
$test$;

do $test$
declare
  rejected boolean := false;
begin
  begin
    delete from api.enquiries
    where id = '00000000-0000-4000-8000-000000000013';
  exception
    when insufficient_privilege then
      rejected := true;
  end;

  if not rejected then
    raise exception 'anon delete was not rejected';
  end if;
end;
$test$;

do $test$
declare
  rejected boolean := false;
begin
  begin
    perform id from private.enquiry_api_keys;
  exception
    when insufficient_privilege then
      rejected := true;
  end;

  if not rejected then
    raise exception 'anon gate-table select was not rejected';
  end if;
end;
$test$;

do $test$
declare
  rejected boolean := false;
begin
  begin
    insert into api.enquiries (
      id,
      status,
      schema_version,
      name,
      email,
      pathway,
      privacy_acknowledged,
      privacy_notice_version
    ) values (
      '00000000-0000-4000-8000-000000000014',
      'closed',
      1,
      'Test Person',
      'test@example.invalid',
      'general-question',
      true,
      'test-v1'
    );
  exception
    when insufficient_privilege then
      rejected := true;
  end;

  if not rejected then
    raise exception 'anon insert into disallowed status column was not rejected';
  end if;
end;
$test$;

do $test$
declare
  rejected boolean := false;
begin
  begin
    insert into api.enquiries (
      id,
      schema_version,
      name,
      email,
      pathway,
      privacy_acknowledged,
      privacy_notice_version
    ) values (
      '00000000-0000-4000-8000-000000000015',
      1,
      'Test Person',
      'test@example.invalid',
      'not-allowed',
      true,
      'test-v1'
    );
  exception
    when check_violation then
      rejected := true;
  end;

  if not rejected then
    raise exception 'invalid pathway constraint did not reject the row';
  end if;
end;
$test$;

reset role;

do $test$
begin
  if not exists (
    select 1
    from api.enquiries
    where id = '00000000-0000-4000-8000-000000000013'
  ) then
    raise exception 'valid gated insert was not persisted';
  end if;
end;
$test$;

set local role authenticated;

do $test$
declare
  rejected boolean := false;
begin
  begin
    insert into api.enquiries (
      id,
      schema_version,
      name,
      email,
      pathway,
      privacy_acknowledged,
      privacy_notice_version
    ) values (
      '00000000-0000-4000-8000-000000000016',
      1,
      'Test Person',
      'test@example.invalid',
      'general-question',
      true,
      'test-v1'
    );
  exception
    when insufficient_privilege then
      rejected := true;
  end;

  if not rejected then
    raise exception 'authenticated insert was not rejected';
  end if;
end;
$test$;

reset role;
rollback;
