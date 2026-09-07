-- Catálogo GD 2025 — Acolchados CD (www.acolchadoscd.cl)
-- Precios: VALOR NETO CLP (sin IVA)
-- Proyecto Supabase: ramon-david (lgafrcuuvfexvlsmveju)

-- ---------------------------------------------------------------------------
-- Schema
-- ---------------------------------------------------------------------------

create table public.categories (
  id text primary key,
  name text not null,
  sort_order integer not null
);

create table public.sizes (
  id text primary key,
  label text not null,
  sort_order integer not null,
  kind text not null check (kind in ('bed', 'accessory', 'towel'))
);

create table public.colors (
  id text primary key,
  name text not null
);

create table public.fabrics (
  id text primary key,
  name text not null,
  group_name text
);

create table public.products (
  id text primary key,
  catalog_number integer not null,
  category_id text not null references public.categories (id),
  name text not null,
  thread_count integer,
  cotton_pct integer,
  polyester_pct integer,
  fill_gsm integer,
  includes_pillowcases boolean,
  notes text,
  quote_only boolean not null default false,
  source text not null default 'Catalogo GD 2025',
  created_at timestamptz not null default now()
);

create table public.product_variants (
  id bigint generated always as identity primary key,
  product_id text not null references public.products (id) on delete cascade,
  size_id text not null references public.sizes (id),
  option_key text not null default 'base',
  option_label text,
  width_cm integer,
  length_cm integer,
  drop_cm integer,
  extra jsonb not null default '{}'::jsonb,
  price_neto_clp integer,
  unique (product_id, size_id, option_key)
);

create table public.product_colors (
  product_id text not null references public.products (id) on delete cascade,
  color_id text not null references public.colors (id) on delete cascade,
  primary key (product_id, color_id)
);

create table public.product_fabrics (
  product_id text not null references public.products (id) on delete cascade,
  fabric_id text not null references public.fabrics (id) on delete cascade,
  primary key (product_id, fabric_id)
);

create index products_category_id_idx on public.products (category_id);
create index products_catalog_number_idx on public.products (catalog_number);
create index product_variants_product_id_idx on public.product_variants (product_id);
create index product_variants_size_id_idx on public.product_variants (size_id);
create index product_colors_color_id_idx on public.product_colors (color_id);
create index product_fabrics_fabric_id_idx on public.product_fabrics (fabric_id);

comment on table public.products is 'Ítems del Catálogo GD 2025. catalog_number puede repetirse (varias SKU por misma ficha).';
comment on column public.product_variants.price_neto_clp is 'Precio valor neto CLP. Null si el producto es solo cotización.';
comment on column public.product_variants.drop_cm is 'Caída / fuelle en cm (bajera, faldón, cubre colchón).';

-- ---------------------------------------------------------------------------
-- Lookups
-- ---------------------------------------------------------------------------

insert into public.categories (id, name, sort_order) values
  ('sabanas',       'Sábanas',        1),
  ('plumones',      'Plumones',       2),
  ('quilts',        'Quilts',         3),
  ('cubre-plumon',  'Cubre plumón',   4),
  ('pieceras',      'Pieceras',       5),
  ('colchas',       'Colchas',        6),
  ('almohadas',     'Almohadas',      7),
  ('faldones',      'Faldones',       8),
  ('toallas',       'Toallas',        9),
  ('cubre-colchon', 'Cubre colchón', 10),
  ('servicios',     'Servicios',     11);

insert into public.sizes (id, label, sort_order, kind) values
  ('1-plaza',    '1 plaza',     10, 'bed'),
  ('1-5-plazas', '1.5 plazas',  20, 'bed'),
  ('2-plazas',   '2 plazas',    30, 'bed'),
  ('king',       'King',        40, 'bed'),
  ('super-king', 'Super King',  50, 'bed'),
  ('50x70',      '50 × 70 cm',  60, 'accessory'),
  ('50x90',      '50 × 90 cm',  70, 'accessory'),
  ('40x90',      '40 × 90 cm',  80, 'accessory'),
  ('mano',       'Mano',        90, 'towel'),
  ('bano',       'Baño',       100, 'towel');

insert into public.colors (id, name) values
  ('blanco',      'Blanco'),
  ('azul-marino', 'Azul Marino'),
  ('beige',       'Beige'),
  ('gris',        'Gris');

insert into public.fabrics (id, name, group_name) values
  ('cafe-moro',     'Café Moro',     'lisas'),
  ('gamuza',        'Gamuza',        'lisas'),
  ('gris-perla',    'Gris Perla',    'lisas'),
  ('beige',         'Beige',         'lisas'),
  ('beige-oscuro',  'Beige oscuro',  'lisas'),
  ('azul-marino',   'Azul Marino',   'lisas'),
  ('beige-claro',   'Beige Claro',   'lisas'),
  ('gris',          'Gris',          'lisas'),
  ('pistacho',      'Pistacho',      'lisas'),
  ('negro',         'Negro',         'lisas'),
  ('azul',          'Azul',          'lisas'),
  ('rusticas',      'Rústicas',      'rusticas'),
  ('bistrech',      'Bistrech',      'manteleria'),
  ('granite',       'Granite',       'manteleria'),
  ('gabardina',     'Gabardina',     'manteleria');

-- ---------------------------------------------------------------------------
-- Products
-- ---------------------------------------------------------------------------

insert into public.products (
  id, catalog_number, category_id, name,
  thread_count, cotton_pct, polyester_pct, fill_gsm,
  includes_pillowcases, notes, quote_only
) values
(
  'sabana-300', 1, 'sabanas',
  'Sábana 300 hilos 100% algodón',
  300, 100, 0, null, true,
  'Juego: sábana encimera lisa, bajera elasticada y funda(s) de almohada.',
  false
),
(
  'sabana-200', 2, 'sabanas',
  'Sábana 200 hilos 50% algodón y 50% poliéster',
  200, 50, 50, null, true,
  'Juego: sábana encimera lisa, bajera elasticada y funda(s) de almohada.',
  false
),
(
  'sabana-144', 3, 'sabanas',
  'Sábana 144 hilos 50% algodón y 50% poliéster',
  144, 50, 50, null, true,
  'Juego: sábana encimera lisa, bajera elasticada y funda(s) de almohada.',
  false
),
(
  'plumon-microfibra', 4, 'plumones',
  'Plumón acolchado microfibra (100% poliéster)',
  null, 0, 100, 180, false,
  'Relleno napa siliconada de 180 gr/m². No incluye fundas de almohada.',
  false
),
(
  'plumon-144', 4, 'plumones',
  'Plumón acolchado 144 hilos 50% algodón y 50% poliéster',
  144, 50, 50, 180, false,
  'Relleno napa siliconada de 180 gr/m². No incluye fundas de almohada.',
  false
),
(
  'quilt-microfibra', 5, 'quilts',
  'Quilt acolchado microfibra (100% poliéster)',
  null, 0, 100, 90, false,
  'Relleno napa siliconada de 90 gr/m². No incluye fundas de almohada.',
  false
),
(
  'quilt-144', 5, 'quilts',
  'Quilt acolchado 144 hilos 50% algodón y 50% poliéster',
  144, 50, 50, 90, false,
  'Relleno napa siliconada de 90 gr/m². No incluye fundas de almohada.',
  false
),
(
  'cubre-plumon-300', 6, 'cubre-plumon',
  'Cubre plumón 300 hilos 100% algodón',
  300, 100, 0, null, false,
  'Fundas con pestaña y traslape 300 hilos se venden aparte.',
  false
),
(
  'cubre-plumon-200', 7, 'cubre-plumon',
  'Cubre plumón 200 hilos 50% algodón y 50% poliéster',
  200, 50, 50, null, false,
  'Fundas con pestaña y traslape 200 hilos se venden aparte.',
  false
),
(
  'cubre-plumon-144', 8, 'cubre-plumon',
  'Cubre plumón 144 hilos 50% algodón y 50% poliéster',
  144, 50, 50, null, false,
  'No incluye fundas de almohada. Fundas con pestaña y traslape se venden aparte.',
  false
),
(
  'piecera', 9, 'pieceras',
  'Piecera',
  null, null, null, null, false,
  'Se vende sola o con cojines 45×45 cm de la misma tela. 1 y 1.5 plazas: 1 cojín. 2 plazas, King y Super King: 2 cojines. 1 plaza aparece en las notas del catálogo pero no tiene precio publicado.',
  false
),
(
  'colcha', 10, 'colchas',
  'Colcha',
  null, null, null, null, null,
  'Opción con fundas con traslape (misma tela), 50×70 y 50×90 cm, o sin fundas.',
  false
),
(
  'almohada-hule', 11, 'almohadas',
  'Almohada impermeable de hule clínico',
  null, null, null, null, false,
  'Ideal para alta rotación. Material de fácil limpieza, textura 100% lisa, ojetillos. Usar siempre con funda.',
  false
),
(
  'faldon-144', 12, 'faldones',
  'Faldón liso 144 hilos 50% algodón y 50% poliéster',
  144, 50, 50, null, false,
  'Tela exterior 144 hilos. El catálogo duplica la etiqueta 1.5 plazas; el precio más bajo se asignó a 1 plaza (90×200+30).',
  false
),
(
  'almohada-hollowfill', 12, 'almohadas',
  'Almohada fibra hollowfill siliconado',
  null, 0, 100, null, false,
  'Relleno fibra de poliéster hollowfill siliconado, material retardante al fuego.',
  false
),
(
  'toalla-500', 13, 'toallas',
  'Toalla 500 g 100% algodón',
  null, 100, 0, null, false,
  '500 grs 100% algodón.',
  false
),
(
  'toalla-650', 13, 'toallas',
  'Toalla 650 g 100% algodón',
  null, 100, 0, null, false,
  '650 grs 100% algodón.',
  false
),
(
  'bordado', 14, 'servicios',
  'Servicio de bordado',
  null, null, null, null, false,
  'Se puede bordar en todos los productos. Cotización según necesidad.',
  true
),
(
  'cubre-colchon-clasico', 15, 'cubre-colchon',
  'Cubre colchón clásico',
  null, null, null, 130, false,
  'Acolchado con napa de 130 gr/m². Encintado en todo su contorno, elásticos de 35 mm.',
  false
),
(
  'cubre-colchon-fuelle', 15, 'cubre-colchon',
  'Cubre colchón borde tela (fuelle)',
  null, null, null, null, false,
  'Todo el contorno elasticado. Elástico 10 mm.',
  false
),
(
  'cubre-colchon-impermeable', 16, 'cubre-colchon',
  'Cubre colchón impermeable borde tela (fuelle)',
  null, null, null, null, false,
  'Todo el contorno elasticado, elástico 10 mm. Capa interior sin costuras para evitar paso de líquidos.',
  false
),
(
  'manteleria', 17, 'servicios',
  'Servicio de mantelería',
  null, null, null, null, false,
  'Confección a medida: caminos de mesa, manteles rectangulares, manteles redondos (hasta 280 cm de diámetro) y servilletas. Variedad de colores.',
  true
);

-- ---------------------------------------------------------------------------
-- Variants: sábanas
-- Encimera / bajera / fundas inferidas del layout del PDF (columnas mezcladas).
-- ---------------------------------------------------------------------------

insert into public.product_variants
  (product_id, size_id, option_key, option_label, width_cm, length_cm, drop_cm, extra, price_neto_clp)
values
-- 300 hilos
('sabana-300', '1-plaza',    'base', 'Juego completo', 160, 270, 40,
 '{"encimera":"160x270","bajera":"90x200+40","fundas":"1x50x70"}'::jsonb, 27700),
('sabana-300', '1-5-plazas', 'base', 'Juego completo', 175, 270, 40,
 '{"encimera":"175x270","bajera":"105x200+40","fundas":"1x50x70"}'::jsonb, 30200),
('sabana-300', '2-plazas',   'base', 'Juego completo', 220, 270, 40,
 '{"encimera":"220x270","bajera":"150x200+40","fundas":"2x50x70"}'::jsonb, 38800),
('sabana-300', 'king',       'base', 'Juego completo', 250, 270, 40,
 '{"encimera":"250x270","bajera":"180x200+40","fundas":"2x50x90"}'::jsonb, 44800),
('sabana-300', 'super-king', 'base', 'Juego completo', 270, 270, 40,
 '{"encimera":"270x270","bajera":"200x200+40","fundas":"2x50x90"}'::jsonb, 47800),
-- 200 hilos
('sabana-200', '1-plaza',    'base', 'Juego completo', 160, 270, 40,
 '{"encimera":"160x270","bajera":"90x200+40","fundas":"1x50x70"}'::jsonb, 18900),
('sabana-200', '1-5-plazas', 'base', 'Juego completo', 175, 270, 40,
 '{"encimera":"175x270","bajera":"105x200+40","fundas":"1x50x70"}'::jsonb, 20200),
('sabana-200', '2-plazas',   'base', 'Juego completo', 220, 270, 40,
 '{"encimera":"220x270","bajera":"150x200+40","fundas":"2x50x70"}'::jsonb, 25800),
('sabana-200', 'king',       'base', 'Juego completo', 250, 270, 40,
 '{"encimera":"250x270","bajera":"180x200+40","fundas":"2x50x90"}'::jsonb, 29800),
('sabana-200', 'super-king', 'base', 'Juego completo', 270, 270, 40,
 '{"encimera":"270x270","bajera":"200x200+40","fundas":"2x50x90"}'::jsonb, 31900),
-- 144 hilos (encimera 245 cm, fuelle 25 cm)
('sabana-144', '1-plaza',    'base', 'Juego completo', 160, 245, 25,
 '{"encimera":"160x245","bajera":"90x200+25","fundas":"1x50x70"}'::jsonb, 12900),
('sabana-144', '1-5-plazas', 'base', 'Juego completo', 175, 245, 25,
 '{"encimera":"175x245","bajera":"105x200+25","fundas":"1x50x70"}'::jsonb, 13900),
('sabana-144', '2-plazas',   'base', 'Juego completo', 220, 245, 25,
 '{"encimera":"220x245","bajera":"150x200+25","fundas":"2x50x70"}'::jsonb, 18900),
('sabana-144', 'king',       'base', 'Juego completo', 250, 245, 25,
 '{"encimera":"250x245","bajera":"180x200+25","fundas":"2x50x90"}'::jsonb, 20500),
('sabana-144', 'super-king', 'base', 'Juego completo', 270, 245, 25,
 '{"encimera":"270x245","bajera":"200x200+25","fundas":"2x50x90"}'::jsonb, 22900);

-- Plumones 180 g/m² (largo 240 cm)
insert into public.product_variants
  (product_id, size_id, option_key, width_cm, length_cm, extra, price_neto_clp)
values
('plumon-microfibra', '1-plaza',    'base', 180, 240, '{"medida":"180x240"}'::jsonb, 15800),
('plumon-microfibra', '1-5-plazas', 'base', 190, 240, '{"medida":"190x240"}'::jsonb, 16800),
('plumon-microfibra', '2-plazas',   'base', 230, 240, '{"medida":"230x240"}'::jsonb, 19200),
('plumon-microfibra', 'king',       'base', 260, 240, '{"medida":"260x240"}'::jsonb, 20900),
('plumon-microfibra', 'super-king', 'base', 280, 240, '{"medida":"280x240"}'::jsonb, 22900),
('plumon-144',        '1-plaza',    'base', 180, 240, '{"medida":"180x240"}'::jsonb, 21420),
('plumon-144',        '1-5-plazas', 'base', 190, 240, '{"medida":"190x240"}'::jsonb, 22200),
('plumon-144',        '2-plazas',   'base', 230, 240, '{"medida":"230x240"}'::jsonb, 25900),
('plumon-144',        'king',       'base', 260, 240, '{"medida":"260x240"}'::jsonb, 27900),
('plumon-144',        'super-king', 'base', 280, 240, '{"medida":"280x240"}'::jsonb, 29900);

-- Quilts 90 g/m² (largo 230 cm)
insert into public.product_variants
  (product_id, size_id, option_key, width_cm, length_cm, extra, price_neto_clp)
values
('quilt-microfibra', '1-plaza',    'base', 180, 230, '{"medida":"180x230"}'::jsonb, 15800),
('quilt-microfibra', '1-5-plazas', 'base', 190, 230, '{"medida":"190x230"}'::jsonb, 16800),
('quilt-microfibra', '2-plazas',   'base', 230, 230, '{"medida":"230x230"}'::jsonb, 19200),
('quilt-microfibra', 'king',       'base', 260, 230, '{"medida":"260x230"}'::jsonb, 20900),
('quilt-microfibra', 'super-king', 'base', 280, 230, '{"medida":"280x230"}'::jsonb, 22900),
('quilt-144',        '1-plaza',    'base', 180, 230, '{"medida":"180x230"}'::jsonb, 21420),
('quilt-144',        '1-5-plazas', 'base', 190, 230, '{"medida":"190x230"}'::jsonb, 22200),
('quilt-144',        '2-plazas',   'base', 230, 230, '{"medida":"230x230"}'::jsonb, 25900),
('quilt-144',        'king',       'base', 260, 230, '{"medida":"260x230"}'::jsonb, 27900),
('quilt-144',        'super-king', 'base', 280, 230, '{"medida":"280x230"}'::jsonb, 29900);

-- Cubre plumón (cama) + fundas sueltas
insert into public.product_variants
  (product_id, size_id, option_key, option_label, width_cm, length_cm, extra, price_neto_clp)
values
('cubre-plumon-300', '1-plaza',    'base',  'Cubre plumón', 180, 240, '{"medida":"180x240"}'::jsonb, 26900),
('cubre-plumon-300', '1-5-plazas', 'base',  'Cubre plumón', 190, 240, '{"medida":"190x240"}'::jsonb, 28900),
('cubre-plumon-300', '2-plazas',   'base',  'Cubre plumón', 230, 240, '{"medida":"230x240"}'::jsonb, 31950),
('cubre-plumon-300', 'king',       'base',  'Cubre plumón', 260, 240, '{"medida":"260x240"}'::jsonb, 35500),
('cubre-plumon-300', 'super-king', 'base',  'Cubre plumón', 280, 240, '{"medida":"280x240"}'::jsonb, 38200),
('cubre-plumon-300', '50x70',      'funda', 'Funda pestaña y traslape 300 hilos', 50, 70, '{}'::jsonb, 4000),
('cubre-plumon-300', '50x90',      'funda', 'Funda pestaña y traslape 300 hilos', 50, 90, '{}'::jsonb, 4350),
('cubre-plumon-200', '1-plaza',    'base',  'Cubre plumón', 180, 240, '{"medida":"180x240"}'::jsonb, 17900),
('cubre-plumon-200', '1-5-plazas', 'base',  'Cubre plumón', 190, 240, '{"medida":"190x240"}'::jsonb, 18900),
('cubre-plumon-200', '2-plazas',   'base',  'Cubre plumón', 230, 240, '{"medida":"230x240"}'::jsonb, 21600),
('cubre-plumon-200', 'king',       'base',  'Cubre plumón', 260, 240, '{"medida":"260x240"}'::jsonb, 24200),
('cubre-plumon-200', 'super-king', 'base',  'Cubre plumón', 280, 240, '{"medida":"280x240"}'::jsonb, 25700),
('cubre-plumon-200', '50x70',      'funda', 'Funda pestaña y traslape 200 hilos', 50, 70, '{}'::jsonb, 3700),
('cubre-plumon-200', '50x90',      'funda', 'Funda pestaña y traslape 200 hilos', 50, 90, '{}'::jsonb, 4000),
('cubre-plumon-144', '1-plaza',    'base',  'Cubre plumón', 180, 240, '{"medida":"180x240"}'::jsonb, 13900),
('cubre-plumon-144', '1-5-plazas', 'base',  'Cubre plumón', 190, 240, '{"medida":"190x240"}'::jsonb, 14600),
('cubre-plumon-144', '2-plazas',   'base',  'Cubre plumón', 230, 240, '{"medida":"230x240"}'::jsonb, 17200),
('cubre-plumon-144', 'king',       'base',  'Cubre plumón', 260, 240, '{"medida":"260x240"}'::jsonb, 19100),
('cubre-plumon-144', 'super-king', 'base',  'Cubre plumón', 280, 240, '{"medida":"280x240"}'::jsonb, 20800),
('cubre-plumon-144', '50x70',      'funda', 'Funda pestaña y traslape 144 hilos', 50, 70, '{}'::jsonb, 3400),
('cubre-plumon-144', '50x90',      'funda', 'Funda pestaña y traslape 144 hilos', 50, 90, '{}'::jsonb, 3600);

-- Pieceras (1 plaza citada sin precio en el PDF)
insert into public.product_variants
  (product_id, size_id, option_key, option_label, width_cm, length_cm, extra, price_neto_clp)
values
('piecera', '1-5-plazas', 'sin-cojines', 'Sin cojines', 65, 180,
 '{"medida":"65x180","cojines":0}'::jsonb, 10800),
('piecera', '2-plazas',   'sin-cojines', 'Sin cojines', 65, 230,
 '{"medida":"65x230","cojines":0}'::jsonb, 12500),
('piecera', 'king',       'sin-cojines', 'Sin cojines', 65, 260,
 '{"medida":"65x260","cojines":0}'::jsonb, 13900),
('piecera', 'super-king', 'sin-cojines', 'Sin cojines', 65, 280,
 '{"medida":"65x280","cojines":0}'::jsonb, 15200),
('piecera', '1-5-plazas', 'con-cojines', 'Incluye 1 cojín 45×45 cm', 65, 180,
 '{"medida":"65x180","cojines":1,"cojin_cm":"45x45"}'::jsonb, 14200),
('piecera', '2-plazas',   'con-cojines', 'Incluye 2 cojines 45×45 cm', 65, 230,
 '{"medida":"65x230","cojines":2,"cojin_cm":"45x45"}'::jsonb, 15900),
('piecera', 'king',       'con-cojines', 'Incluye 2 cojines 45×45 cm', 65, 260,
 '{"medida":"65x260","cojines":2,"cojin_cm":"45x45"}'::jsonb, 20700),
('piecera', 'super-king', 'con-cojines', 'Incluye 2 cojines 45×45 cm', 65, 280,
 '{"medida":"65x280","cojines":2,"cojin_cm":"45x45"}'::jsonb, 22000);

-- Colchas
insert into public.product_variants
  (product_id, size_id, option_key, option_label, width_cm, length_cm, extra, price_neto_clp)
values
('colcha', '1-plaza',    'con-fundas', 'Con fundas (traslape, misma tela)', 180, 240,
 '{"medida":"180x240","fundas":["50x70","50x90"]}'::jsonb, 19800),
('colcha', '1-5-plazas', 'con-fundas', 'Con fundas (traslape, misma tela)', 190, 240,
 '{"medida":"190x240","fundas":["50x70","50x90"]}'::jsonb, 20800),
('colcha', '2-plazas',   'con-fundas', 'Con fundas (traslape, misma tela)', 230, 240,
 '{"medida":"230x240","fundas":["50x70","50x90"]}'::jsonb, 25000),
('colcha', 'king',       'con-fundas', 'Con fundas (traslape, misma tela)', 260, 240,
 '{"medida":"260x240","fundas":["50x70","50x90"]}'::jsonb, 28900),
('colcha', 'super-king', 'con-fundas', 'Con fundas (traslape, misma tela)', 280, 240,
 '{"medida":"280x240","fundas":["50x70","50x90"]}'::jsonb, 31900),
('colcha', '1-plaza',    'sin-fundas', 'Sin fundas', 180, 240, '{"medida":"180x240"}'::jsonb, 16900),
('colcha', '1-5-plazas', 'sin-fundas', 'Sin fundas', 190, 240, '{"medida":"190x240"}'::jsonb, 17900),
('colcha', '2-plazas',   'sin-fundas', 'Sin fundas', 230, 240, '{"medida":"230x240"}'::jsonb, 20300),
('colcha', 'king',       'sin-fundas', 'Sin fundas', 260, 240, '{"medida":"260x240"}'::jsonb, 22600),
('colcha', 'super-king', 'sin-fundas', 'Sin fundas', 280, 240, '{"medida":"280x240"}'::jsonb, 24100);

-- Almohada hule clínico
insert into public.product_variants
  (product_id, size_id, option_key, width_cm, length_cm, extra, price_neto_clp)
values
('almohada-hule', '40x90', 'base', 40, 90, '{"medida":"40x90"}'::jsonb, 12900),
('almohada-hule', '50x70', 'base', 50, 70, '{"medida":"50x70"}'::jsonb, 10900),
('almohada-hule', '50x90', 'base', 50, 90, '{"medida":"50x90"}'::jsonb, 10900);

-- Faldón 144
insert into public.product_variants
  (product_id, size_id, option_key, width_cm, length_cm, drop_cm, extra, price_neto_clp)
values
('faldon-144', '1-plaza',    'base',  90, 200, 30, '{"medida":"90x200+30"}'::jsonb,  9600),
('faldon-144', '1-5-plazas', 'base', 105, 200, 30, '{"medida":"105x200+30"}'::jsonb, 9900),
('faldon-144', '2-plazas',   'base', 150, 200, 30, '{"medida":"150x200+30"}'::jsonb, 10900),
('faldon-144', 'king',       'base', 180, 200, 30, '{"medida":"180x200+30"}'::jsonb, 12100),
('faldon-144', 'super-king', 'base', 200, 200, 30, '{"medida":"200x200+30"}'::jsonb, 12900);

-- Almohada hollowfill
insert into public.product_variants
  (product_id, size_id, option_key, width_cm, length_cm, extra, price_neto_clp)
values
('almohada-hollowfill', '50x70', 'base', 50, 70, '{"medida":"50x70","peso_gr":850}'::jsonb, 4800),
('almohada-hollowfill', '50x90', 'base', 50, 90, '{"medida":"50x90","peso_gr":950}'::jsonb, 5200);

-- Toallas
insert into public.product_variants
  (product_id, size_id, option_key, width_cm, length_cm, extra, price_neto_clp)
values
('toalla-500', 'mano', 'base', 45,  90, '{"medida":"45x90","gramos":500}'::jsonb, 2950),
('toalla-500', 'bano', 'base', 70, 140, '{"medida":"70x140","gramos":500}'::jsonb, 6800),
('toalla-650', 'mano', 'base', 45,  90, '{"medida":"45x90","gramos":650}'::jsonb, 3650),
('toalla-650', 'bano', 'base', 70, 140, '{"medida":"70x140","gramos":650}'::jsonb, 8900);

-- Cubre colchón
insert into public.product_variants
  (product_id, size_id, option_key, width_cm, length_cm, drop_cm, extra, price_neto_clp)
values
('cubre-colchon-clasico', '1-plaza',    'base',  90, 200, 40, '{"medida":"90x200+40","elastico_mm":35}'::jsonb, 10900),
('cubre-colchon-clasico', '1-5-plazas', 'base', 105, 200, 40, '{"medida":"105x200+40","elastico_mm":35}'::jsonb, 11900),
('cubre-colchon-clasico', '2-plazas',   'base', 150, 200, 40, '{"medida":"150x200+40","elastico_mm":35}'::jsonb, 13800),
('cubre-colchon-clasico', 'king',       'base', 180, 200, 40, '{"medida":"180x200+40","elastico_mm":35}'::jsonb, 15400),
('cubre-colchon-clasico', 'super-king', 'base', 200, 200, 40, '{"medida":"200x200+40","elastico_mm":35}'::jsonb, 16400),
('cubre-colchon-fuelle', '1-plaza',     'base',  90, 200, null, '{"medida":"90x200","elastico_mm":10}'::jsonb, 7500),
('cubre-colchon-fuelle', '1-5-plazas',  'base', 105, 200, null, '{"medida":"105x200","elastico_mm":10}'::jsonb, 7900),
('cubre-colchon-fuelle', '2-plazas',    'base', 150, 200, null, '{"medida":"150x200","elastico_mm":10}'::jsonb, 10800),
('cubre-colchon-fuelle', 'king',        'base', 180, 200, null, '{"medida":"180x200","elastico_mm":10}'::jsonb, 12900),
('cubre-colchon-fuelle', 'super-king',  'base', 200, 200, null, '{"medida":"200x200","elastico_mm":10}'::jsonb, 14500),
('cubre-colchon-impermeable', '1-plaza',    'base',  90, 200, 40, '{"medida":"90x200+40","elastico_mm":10}'::jsonb, 13500),
('cubre-colchon-impermeable', '1-5-plazas', 'base', 105, 200, 40, '{"medida":"105x200+40","elastico_mm":10}'::jsonb, 14200),
('cubre-colchon-impermeable', '2-plazas',   'base', 150, 200, 40, '{"medida":"150x200+40","elastico_mm":10}'::jsonb, 15600),
('cubre-colchon-impermeable', 'king',       'base', 180, 200, 40, '{"medida":"180x200+40","elastico_mm":10}'::jsonb, 16900),
('cubre-colchon-impermeable', 'super-king', 'base', 200, 200, 40, '{"medida":"200x200+40","elastico_mm":10}'::jsonb, 17700);

-- ---------------------------------------------------------------------------
-- Colors / fabrics
-- ---------------------------------------------------------------------------

insert into public.product_colors (product_id, color_id)
select p.id, c.id
from (values
  ('sabana-144'),
  ('plumon-144'),
  ('quilt-144'),
  ('cubre-plumon-144'),
  ('faldon-144'),
  ('almohada-hollowfill')
) as p(id)
cross join (values
  ('blanco'),
  ('azul-marino'),
  ('beige'),
  ('gris')
) as c(id);

insert into public.product_fabrics (product_id, fabric_id)
select p.id, f.id
from (values ('piecera'), ('colcha')) as p(id)
cross join (values
  ('cafe-moro'),
  ('gamuza'),
  ('gris-perla'),
  ('beige'),
  ('beige-oscuro'),
  ('azul-marino'),
  ('beige-claro'),
  ('gris'),
  ('pistacho'),
  ('negro'),
  ('azul'),
  ('rusticas')
) as f(id);

insert into public.product_fabrics (product_id, fabric_id) values
  ('manteleria', 'bistrech'),
  ('manteleria', 'granite'),
  ('manteleria', 'gabardina');

-- ---------------------------------------------------------------------------
-- Vista de consulta
-- ---------------------------------------------------------------------------

create view public.catalogo_precios
with (security_invoker = true) as
select
  p.catalog_number,
  p.id as product_id,
  p.name as product_name,
  cat.name as category,
  s.label as size_label,
  v.option_key,
  v.option_label,
  v.width_cm,
  v.length_cm,
  v.drop_cm,
  v.extra,
  v.price_neto_clp,
  p.thread_count,
  p.fill_gsm,
  p.quote_only
from public.product_variants v
join public.products p on p.id = v.product_id
join public.categories cat on cat.id = p.category_id
join public.sizes s on s.id = v.size_id;

-- ---------------------------------------------------------------------------
-- RLS: catálogo público de lectura, sin escrituras anónimas
-- ---------------------------------------------------------------------------

alter table public.categories enable row level security;
alter table public.sizes enable row level security;
alter table public.colors enable row level security;
alter table public.fabrics enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_colors enable row level security;
alter table public.product_fabrics enable row level security;

create policy "catalog_read_categories" on public.categories for select to anon, authenticated using (true);
create policy "catalog_read_sizes" on public.sizes for select to anon, authenticated using (true);
create policy "catalog_read_colors" on public.colors for select to anon, authenticated using (true);
create policy "catalog_read_fabrics" on public.fabrics for select to anon, authenticated using (true);
create policy "catalog_read_products" on public.products for select to anon, authenticated using (true);
create policy "catalog_read_variants" on public.product_variants for select to anon, authenticated using (true);
create policy "catalog_read_product_colors" on public.product_colors for select to anon, authenticated using (true);
create policy "catalog_read_product_fabrics" on public.product_fabrics for select to anon, authenticated using (true);
