-- ============================================================
-- CORREÇÃO — ordem certa do cardápio
-- corre isto no SQL Editor do Supabase, ANTES do supabase-menu-update.sql
-- ============================================================
-- Sem isto, o site mostrava os produtos por data de criação ou por
-- ordem alfabética — o que nunca ia garantir a sequência exata do
-- cardápio oficial. Esta coluna resolve isso: os itens passam a
-- aparecer sempre pela ordem que tu definires.
-- ============================================================
alter table public.products add column if not exists ordem integer not null default 0;

-- Ordena os produtos existentes pelo nome, só para não ficarem todos com
-- ordem = 0 antes de correres o supabase-menu-update.sql.
update public.products p
set ordem = sub.rn
from (
  select id, row_number() over (partition by categoria order by nome) as rn
  from public.products
) sub
where p.id = sub.id;
