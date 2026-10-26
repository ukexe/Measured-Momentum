# Enquiry database boundary

The migration creates `api.enquiries` and a private gate-key table/function. It
does not provision a gate value, expose an administrative read path, select a
retention period, or authorise production collection.

Before an environment can be enabled, an accountable database owner must:

1. apply and review the migration in an isolated environment;
2. expose only the `api` schema through the Supabase Data API;
3. confirm the new publishable key maps to `anon` and is not a secret or
   service-role key;
4. generate a random UUID outside source control, insert it into
   `private.enquiry_api_keys`, and store the same value only as the Worker
   secret `SUPABASE_ENQUIRY_GATE_KEY`;
5. run `supabase test db` locally and retain the
   `enquiries_rls.workstream.sql` result;
6. independently inspect grants, policies, functions and effective roles;
7. define authorised operational access outside the public API; and
8. approve and test retention, correction, deletion, backup expiry and incident
   handling.

The SQL test uses synthetic UUIDs inside a rolled-back transaction. No value in
the repository is a usable deployment gate.

The public roles intentionally have no `SELECT`, `UPDATE`, or `DELETE` grant.
The Worker requests `Prefer: return=minimal`, so a confirmed insert does not
need a read policy.
