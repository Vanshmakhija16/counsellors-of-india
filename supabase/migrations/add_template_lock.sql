-- Template selection lock: once a therapist picks a template, they cannot
-- change it for 1 year. This column stores the timestamp until which the
-- template is locked. NULL = never selected / not locked yet.
--
-- Flow:
--   - Appearance page lets the user preview & try-demo all 5 templates.
--   - On "Select", we set template_id AND template_locked_until = now() + 1 year.
--   - While now() < template_locked_until, the Select buttons are disabled.

alter table therapists
  add column if not exists template_locked_until timestamptz;
