-- ============================================================
-- CORREÇÃO — papéis da equipa (Gestor / Funcionário)
-- corre isto no SQL Editor do Supabase, depois do schema.sql e do migration-2
-- ============================================================
-- O painel do gestor (manager/index.html e manager/login.html) já foi
-- construído para suportar 4 papéis: cliente, funcionario, gestor, admin
-- (vês isso no ecrã "Utilizadores" e nos atributos data-roles do menu).
--
-- Mas a base de dados original só permitia 'cliente' e 'admin'
-- (profiles_role_check) e as regras de segurança (RLS) só davam
-- permissões a quem tivesse role = 'admin'. Isto significa que, sem
-- esta migração, promover alguém a "Gestor" ou "Funcionário" falhava
-- silenciosamente, e mesmo que não falhasse, essas contas ficavam sem
-- conseguir editar produtos, encomendas, etc.
-- ============================================================

-- 1) Permite os 4 papéis na coluna role
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in ('cliente','funcionario','gestor','admin'));

-- 2) Função auxiliar: verifica se o utilizador atual faz parte da equipa
--    (admin, gestor ou funcionário) — usada em vez de is_admin() nas
--    tabelas que a equipa toda deve poder gerir.
create or replace function public.is_staff()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin','gestor','funcionario')
  );
$$;

-- 3) Alarga as políticas que faziam sentido para toda a equipa
--    (produtos, encomendas, reservas, campos extra e aparência/textos).
--    A gestão de "Utilizadores" (mudar papéis) continua restrita a
--    role = 'admin' através de is_admin(), que se mantém como estava.

drop policy if exists "só admin gere produtos" on public.products;
create policy "equipa gere produtos"
  on public.products for all
  using (public.is_staff())
  with check (public.is_staff());

drop policy if exists "só admin altera encomendas" on public.orders;
create policy "equipa altera encomendas"
  on public.orders for update
  using (public.is_staff())
  with check (public.is_staff());

drop policy if exists "cliente vê as suas reservas" on public.reservations;
create policy "cliente ou equipa vê reservas"
  on public.reservations for select
  using (auth.uid() = cliente_id or public.is_staff());

drop policy if exists "só admin gere os campos extra" on public.order_field_defs;
create policy "equipa gere os campos extra"
  on public.order_field_defs for all
  using (public.is_staff())
  with check (public.is_staff());

drop policy if exists "só admin edita as configurações" on public.site_settings;
create policy "equipa edita as configurações"
  on public.site_settings for update
  using (public.is_staff())
  with check (public.is_staff());

-- Nota: a política "clientes veem o próprio perfil" / "clientes editam o
-- próprio perfil" em profiles já usa is_admin() como alternativa a
-- auth.uid()=id — mantém-se assim de propósito, porque só o Admin deve
-- poder ver/mudar o papel de outras contas (a UI de "Utilizadores" já
-- confirma isto do lado do cliente, mas a regra real está aqui).
