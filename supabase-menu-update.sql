-- ============================================================
-- ATUALIZAÇÃO DO CARDÁPIO — corre isto no SQL Editor do Supabase
-- ============================================================
-- Os produtos vivem na base de dados (tabela "products"), não no
-- código do site — por isso é aqui, e não num ficheiro HTML, que se
-- atualiza o cardápio.
--
-- Este script:
--  1) Desativa os produtos de exemplo antigos (não os apaga, para não
--     partir encomendas passadas que ainda os referenciam).
--  2) Insere o cardápio oficial completo, exatamente como pedido.
--
-- Depois de correres isto, os itens aparecem automaticamente nos
-- carrosséis de index.html e loja.html (não precisas de tocar em
-- nenhum ficheiro do site).
-- ============================================================

-- 1) Desativa tudo o que já existia (fica invisível no site, mas
--    continua ligado a encomendas antigas, se as houver).
update public.products set ativo = false;

-- 2) Cardápio oficial — Fast Food
insert into public.products (nome, descricao, preco, categoria, stock, ativo) values
('Cachorro Simples',      'Salsicha · milho · batata palha',                                                              2000, 'fastfood', 100, true),
('Cachorro Composto',     'Salsicha · ovo · milho · batata palha',                                                        2300, 'fastfood', 100, true),
('Hambúrguer Simples',    'Carne · ovo · milho · queijo · fiambre · batata palha',                                        3000, 'fastfood', 100, true),
('Hambúrguer do Arraso',  'Carne · ovo · bacon · queijo · fiambre · chouriçao · milho · batata palha · cebola caramelizada', 3500, 'fastfood', 100, true),
('Big Hambúrguer',        '2 carnes · 2 ovos · milho · queijo · fiambre · batata palha',                                  4000, 'fastfood', 100, true),
('Fahita de Frango',      'Frango · milho',                                                                               3500, 'fastfood', 100, true),
('Fahita de Carne',       'Carne · milho',                                                                                4000, 'fastfood', 100, true);

-- 3) Cardápio oficial — Bebidas
insert into public.products (nome, descricao, preco, categoria, stock, ativo) values
('Fanta de Laranja',  'Refrigerante',        800,  'bebidas', 200, true),
('Sprite',             'Refrigerante',        800,  'bebidas', 200, true),
('Coca-Cola',          'Refrigerante',        800,  'bebidas', 200, true),
('Compal em Lata',     'Néctar de fruta',     950,  'bebidas', 150, true),
('Sumol de Laranja',   'Refrigerante',        950,  'bebidas', 150, true),
('Sumol de Ananás',    'Refrigerante',        950,  'bebidas', 150, true),
('Água Mineral',       'Sem gás',             400,  'bebidas', 300, true),
('Água Tónica',        'Refrigerante',        800,  'bebidas', 150, true),
('Ginger Ale',         'Refrigerante',        800,  'bebidas', 150, true),
('7Up',                'Refrigerante',        800,  'bebidas', 150, true),
('Mirinda',            'Refrigerante',        800,  'bebidas', 150, true),
('Pepsi',              'Refrigerante',        800,  'bebidas', 150, true),
('Fino Copo',          'Cerveja de pressão',  700,  'bebidas', 150, true),
('Cuca',               'Cerveja nacional',    800,  'bebidas', 150, true),
('Eka',                'Cerveja nacional',    800,  'bebidas', 150, true),
('Nocal',              'Cerveja',             800,  'bebidas', 150, true),
('Smirnoff',           'Bebida destilada',    1100, 'bebidas', 80,  true),
('Speed',              'Energético/mistura',  1100, 'bebidas', 80,  true),
('Booster Cidra',      'Cidra',               800,  'bebidas', 100, true);

-- Confirmação rápida: deve devolver 7 fastfood + 19 bebidas = 26 linhas ativas
select categoria, count(*) from public.products where ativo = true group by categoria;
