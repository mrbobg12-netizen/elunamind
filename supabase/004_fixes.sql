-- =====================================================================
-- FIX: make sure the server can actually call the helper functions.
-- Run this after the other migrations. Safe to re-run.
--
-- Why: the earlier files revoked EXECUTE from PUBLIC to keep browsers out.
-- Depending on how your project's default privileges are set, that can also
-- strip the permission the server (service_role) needs, and then every
-- limit check fails and the app wrongly says "daily limit reached".
-- This grants it back to the server only.
-- =====================================================================

grant execute on function public.consume_usage(uuid, text, int) to service_role;
grant execute on function public.refund_usage(uuid, text)        to service_role;

grant execute on function public.admin_overview()                                     to service_role;
grant execute on function public.admin_daily_series(int)                              to service_role;
grant execute on function public.admin_feature_usage(int)                             to service_role;
grant execute on function public.admin_user_list(text, text, text, text, int, int)    to service_role;
grant execute on function public.admin_user_detail(uuid)                              to service_role;

-- browsers still have no access
revoke execute on function public.consume_usage(uuid, text, int) from anon, authenticated;
revoke execute on function public.refund_usage(uuid, text)       from anon, authenticated;

-- ---------------------------------------------------------------------
-- Health check. Every row should say OK.
-- ---------------------------------------------------------------------
select 'consume_usage exists' as check,
       case when exists (select 1 from pg_proc where proname = 'consume_usage') then 'OK' else 'MISSING — run 001_foundation.sql' end as result
union all
select 'usage_daily table',
       case when exists (select 1 from information_schema.tables where table_name = 'usage_daily') then 'OK' else 'MISSING — run 001_foundation.sql' end
union all
select 'chats table',
       case when exists (select 1 from information_schema.tables where table_name = 'chats') then 'OK' else 'MISSING — run 002_chat_and_notes.sql' end
union all
select 'profiles.role column',
       case when exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'role') then 'OK' else 'MISSING — run 003_admin.sql' end
union all
select 'app_settings table',
       case when exists (select 1 from information_schema.tables where table_name = 'app_settings') then 'OK' else 'MISSING — run 003_admin.sql' end
union all
select 'service_role can run consume_usage',
       case when has_function_privilege('service_role', 'public.consume_usage(uuid, text, int)', 'EXECUTE') then 'OK' else 'STILL BLOCKED' end
union all
select 'admins found',
       coalesce((select string_agg(email, ', ') from profiles where role = 'admin'), 'NONE — nobody is an admin yet');
