-- ============================================================
-- HAMBÚRGUER DO ARRASO — ESQUEMA DA BASE DE DADOS (Supabase)
-- ============================================================
-- Como usar:
-- 1. Cria um projeto grátis em https://supabase.com
-- 2. Vai a "SQL Editor" → "New query"
-- 3. Cola TODO este ficheiro e clica em "Run"
-- 4. Segue o README.md para criares a tua conta de administrador
-- ============================================================

-- ------------------------------------------------------------
-- 1. PERFIS (dados extra de cada utilizador, ligados ao login)
-- ------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null default '',
  telefone text default '',
  morada text default '',
  role text not null default 'cliente' check (role in ('cliente','admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Função auxiliar: verifica se o utilizador atual é admin.
-- "security definer" evita loops infinitos nas políticas de RLS.
create function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- Quando alguém cria conta (auth.users), cria-se automaticamente o perfil dele.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nome)
  values (new.id, coalesce(new.raw_user_meta_data->>'nome', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Políticas: cada cliente só vê/edita o seu próprio perfil; admin vê todos.
create policy "clientes veem o próprio perfil"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

create policy "clientes editam o próprio perfil"
  on public.profiles for update
  using (auth.uid() = id or public.is_admin());

-- ------------------------------------------------------------
-- 2. PRODUTOS
-- ------------------------------------------------------------
create table public.products (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  descricao text default '',
  preco numeric(12,2) not null default 0,
  preco_promocional numeric(12,2), -- desconto opcional; se preenchido, é o preço a cobrar
  categoria text not null default 'fastfood', -- 'fastfood' ou 'bebidas'
  imagem_url text,
  stock integer not null default 0,
  ativo boolean not null default true,
  extras jsonb not null default '[]', -- ex: [{"nome":"Extra queijo","preco":200}]
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;

-- Qualquer pessoa (mesmo sem login) pode ver produtos ativos.
create policy "todos veem produtos ativos"
  on public.products for select
  using (ativo = true or public.is_admin());

-- Só admin pode criar/editar/apagar produtos.
create policy "só admin gere produtos"
  on public.products for all
  using (public.is_admin())
  with check (public.is_admin());

-- ------------------------------------------------------------
-- 3. ENCOMENDAS
-- ------------------------------------------------------------
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.profiles(id),
  status text not null default 'Pendente'
    check (status in ('Pendente','Pago','Em preparação','Enviado','Entregue','Cancelado')),
  total numeric(12,2) not null default 0,
  morada text default '',
  telefone text default '',
  pagamento text default '',
  observacoes text default '',
  campos_extra jsonb not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;

create policy "cliente vê as suas encomendas"
  on public.orders for select
  using (auth.uid() = cliente_id or public.is_admin());

create policy "cliente cria a sua encomenda"
  on public.orders for insert
  with check (auth.uid() = cliente_id);

create policy "só admin altera encomendas"
  on public.orders for update
  using (public.is_admin())
  with check (public.is_admin());

-- ------------------------------------------------------------
-- 4. ITENS DE CADA ENCOMENDA
-- ------------------------------------------------------------
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  produto_id uuid references public.products(id),
  nome text not null,
  preco numeric(12,2) not null,
  quantidade integer not null default 1,
  observacoes text default '',
  extras jsonb not null default '[]'
);

alter table public.order_items enable row level security;

create policy "vê itens das encomendas que pode ver"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and (o.cliente_id = auth.uid() or public.is_admin())
    )
  );

create policy "cliente cria itens da sua própria encomenda"
  on public.order_items for insert
  with check (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.cliente_id = auth.uid()
    )
  );

-- ------------------------------------------------------------
-- 5. RESERVAS DE MESA
-- ------------------------------------------------------------
create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid references public.profiles(id),
  nome text not null,
  telefone text not null,
  email text,
  data_reserva date not null,
  hora_reserva time not null,
  pessoas integer not null default 1,
  tipo_mesa text default '',
  observacoes text default '',
  created_at timestamptz not null default now()
);

alter table public.reservations enable row level security;

create policy "cliente vê as suas reservas"
  on public.reservations for select
  using (auth.uid() = cliente_id or public.is_admin());

create policy "cliente cria a sua reserva"
  on public.reservations for insert
  with check (auth.uid() = cliente_id);

-- ------------------------------------------------------------
-- 6. FAVORITOS
-- ------------------------------------------------------------
create table public.favorites (
  cliente_id uuid not null references public.profiles(id) on delete cascade,
  produto_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (cliente_id, produto_id)
);

alter table public.favorites enable row level security;

create policy "cliente gere os seus favoritos"
  on public.favorites for all
  using (auth.uid() = cliente_id)
  with check (auth.uid() = cliente_id);

-- ------------------------------------------------------------
-- 8. CAMPOS EXTRA DA ENCOMENDA (configuráveis pelo gestor)
-- ------------------------------------------------------------
create table public.order_field_defs (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  type text not null default 'text' check (type in ('text','textarea','select')),
  options jsonb not null default '[]',
  required boolean not null default false,
  ordem integer not null default 0
);

alter table public.order_field_defs enable row level security;

create policy "todos veem os campos extra"
  on public.order_field_defs for select
  using (true);

create policy "só admin gere os campos extra"
  on public.order_field_defs for all
  using (public.is_admin())
  with check (public.is_admin());

-- ------------------------------------------------------------
-- 7. PRODUTOS DE EXEMPLO (podes editar/apagar tudo no painel depois)
-- ------------------------------------------------------------
insert into public.products (nome, descricao, preco, categoria, stock) values
('Arraso Clássico', 'Pão, carne, queijo, alface, tomate e molho da casa', 2500, 'fastfood', 50),
('Arraso Duplo', 'Duas carnes, queijo cheddar, bacon e molho especial', 3500, 'fastfood', 50),
('Arraso Frango', 'Frango grelhado, alface, tomate e maionese da casa', 2800, 'fastfood', 50),
('Batata Frita', 'Porção generosa de batata frita crocante', 1200, 'fastfood', 100),
('Coca-Cola 33cl', 'Refrigerante gelado', 500, 'bebidas', 200),
('Sumo Natural', 'Sumo de fruta da época', 800, 'bebidas', 100);
