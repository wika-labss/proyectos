-- Permite CRUD desde el admin HTML (anon + authenticated).
-- Quien tenga la página y la anon key puede escribir. No publicar en internet abierto.

create policy "catalog_insert_products" on public.products for insert to anon, authenticated with check (true);
create policy "catalog_update_products" on public.products for update to anon, authenticated using (true) with check (true);
create policy "catalog_delete_products" on public.products for delete to anon, authenticated using (true);

create policy "catalog_insert_variants" on public.product_variants for insert to anon, authenticated with check (true);
create policy "catalog_update_variants" on public.product_variants for update to anon, authenticated using (true) with check (true);
create policy "catalog_delete_variants" on public.product_variants for delete to anon, authenticated using (true);

create policy "catalog_insert_product_colors" on public.product_colors for insert to anon, authenticated with check (true);
create policy "catalog_delete_product_colors" on public.product_colors for delete to anon, authenticated using (true);

create policy "catalog_insert_product_fabrics" on public.product_fabrics for insert to anon, authenticated with check (true);
create policy "catalog_delete_product_fabrics" on public.product_fabrics for delete to anon, authenticated using (true);

create policy "catalog_insert_categories" on public.categories for insert to anon, authenticated with check (true);
create policy "catalog_update_categories" on public.categories for update to anon, authenticated using (true) with check (true);
create policy "catalog_delete_categories" on public.categories for delete to anon, authenticated using (true);

create policy "catalog_insert_sizes" on public.sizes for insert to anon, authenticated with check (true);
create policy "catalog_update_sizes" on public.sizes for update to anon, authenticated using (true) with check (true);
create policy "catalog_delete_sizes" on public.sizes for delete to anon, authenticated using (true);

create policy "catalog_insert_colors" on public.colors for insert to anon, authenticated with check (true);
create policy "catalog_update_colors" on public.colors for update to anon, authenticated using (true) with check (true);
create policy "catalog_delete_colors" on public.colors for delete to anon, authenticated using (true);

create policy "catalog_insert_fabrics" on public.fabrics for insert to anon, authenticated with check (true);
create policy "catalog_update_fabrics" on public.fabrics for update to anon, authenticated using (true) with check (true);
create policy "catalog_delete_fabrics" on public.fabrics for delete to anon, authenticated using (true);

grant select, insert, update, delete on
  public.products, public.product_variants, public.product_colors, public.product_fabrics,
  public.categories, public.sizes, public.colors, public.fabrics
  to anon, authenticated;

grant usage, select on all sequences in schema public to anon, authenticated;
