-- Выполните в Supabase: SQL Editor → New query → Run
-- Добавляет колонку tags для хранения тегов расходов (массив строк)

ALTER TABLE public.expenses
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT ARRAY[]::text[];

COMMENT ON COLUMN public.expenses.tags IS 'Теги расхода (через запятую в UI)';
