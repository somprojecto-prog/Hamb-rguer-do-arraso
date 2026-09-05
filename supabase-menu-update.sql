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
--  2) Insere o cardápio oficial completo, exatamente como pedido,
--     já com a coluna "ordem" preenchida (ver supabase-migration-4-
--     ordem-produtos.sql) para que os carrosséis mostrem os itens
--     sempre na sequência oficial, e não por data ou ordem alfabética.
--
-- Depois de correres isto, os itens aparecem automaticamente nos
-- carrosséis de index.html e loja.html (não precisas de tocar em
-- nenhum ficheiro do site).
-- ============================================================

-- 1) Desativa tudo o que já existia (fica invisível no site, mas
--    continua ligado a encomendas antigas, se as houver).
update public.products set ativo = false;

-- 2) Cardápio oficial — Fast Food (ordem 1 a 7, a sequência oficial)
insert into public.products (nome, descricao, preco, categoria, stock, ativo, ordem) values
('Cachorro Simples',      'Salsicha · milho · batata palha',                                                              2000, 'fastfood', 100, true, 1),
('Cachorro Composto',     'Salsicha · ovo · milho · batata palha',                                                        2300, 'fastfood', 100, true, 2),
('Hambúrguer Simples',    'Carne · ovo · milho · queijo · fiambre · batata palha',                                        3000, 'fastfood', 100, true, 3),
('Hambúrguer do Arraso',  'Carne · ovo · bacon · queijo · fiambre · chouriçao · milho · batata palha · cebola caramelizada', 3500, 'fastfood', 100, true, 4),
('Big Hambúrguer',        '2 carnes · 2 ovos · milho · queijo · fiambre · batata palha',                                  4000, 'fastfood', 100, true, 5),
('Fahita de Frango',      'Frango · milho',                                                                               3500, 'fastfood', 100, true, 6),
('Fahita de Carne',       'Carne · milho',                                                                                4000, 'fastfood', 100, true, 7);

-- 3) Cardápio oficial — Bebidas (ordem 1 a 19, a sequência oficial)
insert into public.products (nome, descricao, preco, categoria, stock, ativo, ordem) values
('Fanta de Laranja',  'Refrigerante',        800,  'bebidas', 200, true, 1),
('Sprite',             'Refrigerante',        800,  'bebidas', 200, true, 2),
('Coca Cola',          'Refrigerante',        800,  'bebidas', 200, true, 3),
('Compal em Lata',     'Néctar de fruta',     950,  'bebidas', 150, true, 4),
('Sumol de Laranja',   'Refrigerante',        950,  'bebidas', 150, true, 5),
('Sumol de Ananás',    'Refrigerante',        950,  'bebidas', 150, true, 6),
('Água Mineral',       'Sem gás',             400,  'bebidas', 300, true, 7),
('Água Tónica',        'Refrigerante',        800,  'bebidas', 150, true, 8),
('Ginger Ale',         'Refrigerante',        800,  'bebidas', 150, true, 9),
('7Up',                'Refrigerante',        800,  'bebidas', 150, true, 10),
('Mirinda',            'Refrigerante',        800,  'bebidas', 150, true, 11),
('Pepsi',              'Refrigerante',        800,  'bebidas', 150, true, 12),
('Fino Copo',          'Cerveja de pressão',  700,  'bebidas', 150, true, 13),
('Cuca',               'Cerveja nacional',    800,  'bebidas', 150, true, 14),
('Eka',                'Cerveja nacional',    800,  'bebidas', 150, true, 15),
('Nocal',              'Cerveja',             800,  'bebidas', 150, true, 16),
('Smirnof',            'Bebida destilada',    1100, 'bebidas', 80,  true, 17),
('Speed',              'Energético/mistura',  1100, 'bebidas', 80,  true, 18),
('Booster Cidra',      'Cidra',               800,  'bebidas', 100, true, 19);

-- Confirmação rápida: deve devolver 7 fastfood + 19 bebidas = 26 linhas ativas
select categoria, count(*) from public.products where ativo = true group by categoria;

-- Confirmação da ordem: deve mostrar os itens na sequência 1,2,3... por categoria
select categoria, ordem, nome from public.products where ativo = true order by categoria, ordem;
