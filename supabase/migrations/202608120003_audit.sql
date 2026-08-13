-- 202608120003_audit.sql
-- Audit triggers for write-bearing tables (Plan 2 / Task 1 / Step 5)

create or replace function public.audit_change() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.audit_log (actor_id, action, entity, entity_id, detail)
  values (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    coalesce((NEW).id, (OLD).id),
    '{}'::jsonb
  );
  return coalesce(NEW, OLD);
end;
$$;

-- Only write-bearing, business-critical tables are audited.
create trigger audit_products
  after insert or update or delete on public.products
  for each row execute function public.audit_change();

create trigger audit_inquiries
  after insert or update or delete on public.inquiries
  for each row execute function public.audit_change();

create trigger audit_inquiry_items
  after insert or update or delete on public.inquiry_items
  for each row execute function public.audit_change();

create trigger audit_product_translations
  after insert or update or delete on public.product_translations
  for each row execute function public.audit_change();
