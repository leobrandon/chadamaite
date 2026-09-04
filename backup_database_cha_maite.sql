-- ====================================================================
-- BACKUP COMPLETO DO BANCO DE DADOS - CHÁ DA MAITÊ
-- Data do Dump: 2026-09-03T11:07:02.450Z
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. TABELA: event_config (1 registros)
-- --------------------------------------------------------------------
INSERT INTO public.event_config (id, baby_name, parents, event_date, event_time, display_date, display_time, location_name, address, city, map_url, pix_key, pix_name, admin_pin, welcome_message, updated_at)
VALUES ('default_config', 'Maitê', 'Leonardo & Isabella', '2026-10-17', '18:00', 'Sábado, 17 de Outubro de 2026', 'A partir das 18:00h', 'Espaço LC Eventos', 'R. EMA-01, Quadra 07 Lote 28 - Lot. Alphaville Res., Goiânia - GO, 74370-720', 'Goiânia - GO', 'https://maps.app.goo.gl/6c8WqWsfqNx4kpXFA', '70436237156', 'Leonardo / Isabella', '16101928', 'Estamos muito felizes em compartilhar esse momento tão especial com você! Preparamos tudo com muito amor e carinho para esperar a nossa Maitê.', '2026-08-16T01:51:39.957662+00:00')
ON CONFLICT (id) DO UPDATE SET baby_name = EXCLUDED.baby_name, parents = EXCLUDED.parents, event_date = EXCLUDED.event_date, event_time = EXCLUDED.event_time, display_date = EXCLUDED.display_date, display_time = EXCLUDED.display_time, location_name = EXCLUDED.location_name, address = EXCLUDED.address, city = EXCLUDED.city, map_url = EXCLUDED.map_url, pix_key = EXCLUDED.pix_key, pix_name = EXCLUDED.pix_name, admin_pin = EXCLUDED.admin_pin, welcome_message = EXCLUDED.welcome_message, updated_at = EXCLUDED.updated_at;

-- --------------------------------------------------------------------
-- 2. TABELA: gifts (21 registros)
-- --------------------------------------------------------------------
INSERT INTO public.gifts (id, title, category, description, icon, status, reserved_by, reserved_at, priority, created_at)
VALUES ('gift-5', 'Kit Lenços Umedecidos', 'Higiene & Banho', 'Sem perfume ou à base d’água (ex: Pampers Wipes, Huggies Pure, Bepantol Baby). [meta:50]', '✨', 'available', '', NULL, 'high', '2026-08-16T01:58:45.315223+00:00')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, category = EXCLUDED.category, description = EXCLUDED.description, icon = EXCLUDED.icon, status = EXCLUDED.status, reserved_by = EXCLUDED.reserved_by, reserved_at = EXCLUDED.reserved_at, priority = EXCLUDED.priority, created_at = EXCLUDED.created_at;
INSERT INTO public.gifts (id, title, category, description, icon, status, reserved_by, reserved_at, priority, created_at)
VALUES ('gift-7', 'Pomadas para Assaduras (Bepantol Baby / Hipoglós)', 'Higiene & Banho', 'Cuidado essencial para proteger a pele sensível da Maitê. [meta:8]', '🧴', 'available', '', NULL, 'high', '2026-08-16T01:58:45.315223+00:00')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, category = EXCLUDED.category, description = EXCLUDED.description, icon = EXCLUDED.icon, status = EXCLUDED.status, reserved_by = EXCLUDED.reserved_by, reserved_at = EXCLUDED.reserved_at, priority = EXCLUDED.priority, created_at = EXCLUDED.created_at;
INSERT INTO public.gifts (id, title, category, description, icon, status, reserved_by, reserved_at, priority, created_at)
VALUES ('gift-6', 'Kit Shampoo e Sabonete Líquido Neutro para Bebê', 'Higiene & Banho', 'Linha Granado Bebê, Mustela ou Johnson’s Hora do Sono. [meta:5]', '🛁', 'available', '', NULL, 'high', '2026-08-16T01:58:45.315223+00:00')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, category = EXCLUDED.category, description = EXCLUDED.description, icon = EXCLUDED.icon, status = EXCLUDED.status, reserved_by = EXCLUDED.reserved_by, reserved_at = EXCLUDED.reserved_at, priority = EXCLUDED.priority, created_at = EXCLUDED.created_at;
INSERT INTO public.gifts (id, title, category, description, icon, status, reserved_by, reserved_at, priority, created_at)
VALUES ('gift-9', 'Kit Cuidados do Bebê (Tesourinha, Cortador, Lixa e Escova)', 'Higiene & Banho', 'Kit de manicure e escovinha de cerdas naturais para recém-nascido. [meta:1]', '✂️', 'available', '', NULL, 'medium', '2026-08-16T01:58:45.315223+00:00')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, category = EXCLUDED.category, description = EXCLUDED.description, icon = EXCLUDED.icon, status = EXCLUDED.status, reserved_by = EXCLUDED.reserved_by, reserved_at = EXCLUDED.reserved_at, priority = EXCLUDED.priority, created_at = EXCLUDED.created_at;
INSERT INTO public.gifts (id, title, category, description, icon, status, reserved_by, reserved_at, priority, created_at)
VALUES ('gift-12', 'Kit Mamadeiras Anticólica (Avent Philips ou MAM)', 'Alimentação', 'Com bico pétala ou sistema anticólica para conforto da Maitê. [meta:1]', '🍼', 'available', '', NULL, 'medium', '2026-08-16T01:58:45.315223+00:00')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, category = EXCLUDED.category, description = EXCLUDED.description, icon = EXCLUDED.icon, status = EXCLUDED.status, reserved_by = EXCLUDED.reserved_by, reserved_at = EXCLUDED.reserved_at, priority = EXCLUDED.priority, created_at = EXCLUDED.created_at;
INSERT INTO public.gifts (id, title, category, description, icon, status, reserved_by, reserved_at, priority, created_at)
VALUES ('gift-25', 'Kit Body Manga Curta e Mijões (Tam. M / G)', 'Roupas & Acessórios', 'Peças básicas e confortáveis 100% algodão suedine. [meta:5]', '👚', 'available', '', NULL, 'high', '2026-08-16T01:58:45.315223+00:00')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, category = EXCLUDED.category, description = EXCLUDED.description, icon = EXCLUDED.icon, status = EXCLUDED.status, reserved_by = EXCLUDED.reserved_by, reserved_at = EXCLUDED.reserved_at, priority = EXCLUDED.priority, created_at = EXCLUDED.created_at;
INSERT INTO public.gifts (id, title, category, description, icon, status, reserved_by, reserved_at, priority, created_at)
VALUES ('gift-26', 'Macacão com Zíper (Tam. M ou G)', 'Roupas & Acessórios', 'Macacão com zíper, agiliza a troca de fraldas. [meta:5]', '👗', 'available', '', NULL, 'medium', '2026-08-16T01:58:45.315223+00:00')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, category = EXCLUDED.category, description = EXCLUDED.description, icon = EXCLUDED.icon, status = EXCLUDED.status, reserved_by = EXCLUDED.reserved_by, reserved_at = EXCLUDED.reserved_at, priority = EXCLUDED.priority, created_at = EXCLUDED.created_at;
INSERT INTO public.gifts (id, title, category, description, icon, status, reserved_by, reserved_at, priority, created_at)
VALUES ('gift-17', 'Kit Fraldinhas de Boca e Paninhos de Ombro (Bordadas/Estampadas)', 'Quarto & Enxoval', 'Kit com 5 a 6 paninhos 100% algodão super absorventes. [meta:7]', '🧵', 'available', '', NULL, 'medium', '2026-08-16T01:58:45.315223+00:00')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, category = EXCLUDED.category, description = EXCLUDED.description, icon = EXCLUDED.icon, status = EXCLUDED.status, reserved_by = EXCLUDED.reserved_by, reserved_at = EXCLUDED.reserved_at, priority = EXCLUDED.priority, created_at = EXCLUDED.created_at;
INSERT INTO public.gifts (id, title, category, description, icon, status, reserved_by, reserved_at, priority, created_at)
VALUES ('gift-11', 'Aspirador Nasal de Sucção (NoseFrida ou similar)', 'Higiene & Banho', 'Salvação para os dias de narizinho trancado. [meta:2]', '💨', 'available', '', NULL, 'medium', '2026-08-16T01:58:45.315223+00:00')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, category = EXCLUDED.category, description = EXCLUDED.description, icon = EXCLUDED.icon, status = EXCLUDED.status, reserved_by = EXCLUDED.reserved_by, reserved_at = EXCLUDED.reserved_at, priority = EXCLUDED.priority, created_at = EXCLUDED.created_at;
INSERT INTO public.gifts (id, title, category, description, icon, status, reserved_by, reserved_at, priority, created_at)
VALUES ('gift-23', 'Canguru Ergonômico / Sling de Algodão', 'Passeio & Segurança', 'Facilita passeios mantendo o bebê coladinho com os pais. [meta:1]', '🤍', 'available', '', NULL, 'low', '2026-08-16T01:58:45.315223+00:00')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, category = EXCLUDED.category, description = EXCLUDED.description, icon = EXCLUDED.icon, status = EXCLUDED.status, reserved_by = EXCLUDED.reserved_by, reserved_at = EXCLUDED.reserved_at, priority = EXCLUDED.priority, created_at = EXCLUDED.created_at;
INSERT INTO public.gifts (id, title, category, description, icon, status, reserved_by, reserved_at, priority, created_at)
VALUES ('gift-19', 'Som Ruído Branco', 'Quarto & Enxoval', 'Som ruído branco para a Maitê. [meta:1]', '💡', 'available', '', NULL, 'low', '2026-08-16T01:58:45.315223+00:00')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, category = EXCLUDED.category, description = EXCLUDED.description, icon = EXCLUDED.icon, status = EXCLUDED.status, reserved_by = EXCLUDED.reserved_by, reserved_at = EXCLUDED.reserved_at, priority = EXCLUDED.priority, created_at = EXCLUDED.created_at;
INSERT INTO public.gifts (id, title, category, description, icon, status, reserved_by, reserved_at, priority, created_at)
VALUES ('gift-27', 'Kit Meias, Luvinhas e Faixas de Cabelo Delicadas', 'Roupas & Acessórios', 'Acessórios macios e charmosos para enfeitar a princesinha. [meta:3]', '🎀', 'available', '', NULL, 'medium', '2026-08-16T01:58:45.315223+00:00')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, category = EXCLUDED.category, description = EXCLUDED.description, icon = EXCLUDED.icon, status = EXCLUDED.status, reserved_by = EXCLUDED.reserved_by, reserved_at = EXCLUDED.reserved_at, priority = EXCLUDED.priority, created_at = EXCLUDED.created_at;
INSERT INTO public.gifts (id, title, category, description, icon, status, reserved_by, reserved_at, priority, created_at)
VALUES ('gift-31', 'Tapete de Atividades', 'Brinquedos & Mimos', 'Estimula o desenvolvimento sensorial e motor da bebê. [meta:1]', '🎪', 'available', '', NULL, 'low', '2026-08-16T01:58:45.315223+00:00')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, category = EXCLUDED.category, description = EXCLUDED.description, icon = EXCLUDED.icon, status = EXCLUDED.status, reserved_by = EXCLUDED.reserved_by, reserved_at = EXCLUDED.reserved_at, priority = EXCLUDED.priority, created_at = EXCLUDED.created_at;
INSERT INTO public.gifts (id, title, category, description, icon, status, reserved_by, reserved_at, priority, created_at)
VALUES ('gift-16', 'Jogo de Lençol para Berço 100% Algodão (Rosa / Neutro)', 'Quarto & Enxoval', 'Toque suave de percal ou malha para noites tranquilas. [meta:3]', '🛏️', 'available', '', NULL, 'high', '2026-08-16T01:58:45.315223+00:00')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, category = EXCLUDED.category, description = EXCLUDED.description, icon = EXCLUDED.icon, status = EXCLUDED.status, reserved_by = EXCLUDED.reserved_by, reserved_at = EXCLUDED.reserved_at, priority = EXCLUDED.priority, created_at = EXCLUDED.created_at;
INSERT INTO public.gifts (id, title, category, description, icon, status, reserved_by, reserved_at, priority, created_at)
VALUES ('gift-8', 'Toalha de Banho com Capuz Infantil Macia', 'Higiene & Banho', 'Toalha aveludada 100% algodão com capuz fofo. [meta:3]', '🦢', 'available', '', NULL, 'medium', '2026-08-16T01:58:45.315223+00:00')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, category = EXCLUDED.category, description = EXCLUDED.description, icon = EXCLUDED.icon, status = EXCLUDED.status, reserved_by = EXCLUDED.reserved_by, reserved_at = EXCLUDED.reserved_at, priority = EXCLUDED.priority, created_at = EXCLUDED.created_at;
INSERT INTO public.gifts (id, title, category, description, icon, status, reserved_by, reserved_at, priority, created_at)
VALUES ('gift-18', 'Manta Quentinha / Cobertor de Microfibra Antialérgico', 'Quarto & Enxoval', 'Manta macia e quentinha em tons delicados. [meta:3]', '🧸', 'available', '', NULL, 'high', '2026-08-16T01:58:45.315223+00:00')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, category = EXCLUDED.category, description = EXCLUDED.description, icon = EXCLUDED.icon, status = EXCLUDED.status, reserved_by = EXCLUDED.reserved_by, reserved_at = EXCLUDED.reserved_at, priority = EXCLUDED.priority, created_at = EXCLUDED.created_at;
INSERT INTO public.gifts (id, title, category, description, icon, status, reserved_by, reserved_at, priority, created_at)
VALUES ('gift-29', 'Naninha de Pelúcia / Paninho de Apego Antialérgico', 'Brinquedos & Mimos', 'Companheira fofinha para os soninhos e momentos de carinho. [meta:2]', '🐰', 'available', '', NULL, 'low', '2026-08-16T01:58:45.315223+00:00')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, category = EXCLUDED.category, description = EXCLUDED.description, icon = EXCLUDED.icon, status = EXCLUDED.status, reserved_by = EXCLUDED.reserved_by, reserved_at = EXCLUDED.reserved_at, priority = EXCLUDED.priority, created_at = EXCLUDED.created_at;
INSERT INTO public.gifts (id, title, category, description, icon, status, reserved_by, reserved_at, priority, created_at)
VALUES ('gift-30', 'Chocalho e Mordedor Macio com Água Gelável', 'Brinquedos & Mimos', 'Alivia o desconforto do nascimento dos primeiros dentinhos. [meta:1]', '🔔', 'available', '', NULL, 'low', '2026-08-16T01:58:45.315223+00:00')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, category = EXCLUDED.category, description = EXCLUDED.description, icon = EXCLUDED.icon, status = EXCLUDED.status, reserved_by = EXCLUDED.reserved_by, reserved_at = EXCLUDED.reserved_at, priority = EXCLUDED.priority, created_at = EXCLUDED.created_at;
INSERT INTO public.gifts (id, title, category, description, icon, status, reserved_by, reserved_at, priority, created_at)
VALUES ('gift-32', 'Livrinho Sensorial de Pano / Banho', 'Brinquedos & Mimos', 'Com texturas e cores para estimular a curiosidade da Maitê. [meta:1]', '📖', 'available', '', NULL, 'low', '2026-08-16T01:58:45.315223+00:00')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, category = EXCLUDED.category, description = EXCLUDED.description, icon = EXCLUDED.icon, status = EXCLUDED.status, reserved_by = EXCLUDED.reserved_by, reserved_at = EXCLUDED.reserved_at, priority = EXCLUDED.priority, created_at = EXCLUDED.created_at;
INSERT INTO public.gifts (id, title, category, description, icon, status, reserved_by, reserved_at, priority, created_at)
VALUES ('gift-3', 'Pacote de Fraldas Tam. M (Pampers / Huggies)', 'Fraldas', 'Tamanho M (6 a 9kg), o tamanho que a bebê mais vai usar. [meta:32] [order:2]', '🎀', 'available', '', NULL, 'high', '2026-08-16T01:58:45.315223+00:00')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, category = EXCLUDED.category, description = EXCLUDED.description, icon = EXCLUDED.icon, status = EXCLUDED.status, reserved_by = EXCLUDED.reserved_by, reserved_at = EXCLUDED.reserved_at, priority = EXCLUDED.priority, created_at = EXCLUDED.created_at;
INSERT INTO public.gifts (id, title, category, description, icon, status, reserved_by, reserved_at, priority, created_at)
VALUES ('gift-4', 'Pacote de Fraldas Tam. G (Pampers / Huggies)', 'Fraldas', 'Tamanho G (9 a 12kg) para quando a Maitê estiver mais crescidinha. [meta:20] [order:3]', '🧸', 'available', '', NULL, 'medium', '2026-08-16T01:58:45.315223+00:00')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, category = EXCLUDED.category, description = EXCLUDED.description, icon = EXCLUDED.icon, status = EXCLUDED.status, reserved_by = EXCLUDED.reserved_by, reserved_at = EXCLUDED.reserved_at, priority = EXCLUDED.priority, created_at = EXCLUDED.created_at;

-- --------------------------------------------------------------------
-- 3. TABELA: gift_pledges (26 registros)
-- --------------------------------------------------------------------
INSERT INTO public.gift_pledges (id, gift_id, giver_name, quantity, created_at)
VALUES ('pledge-26388f03-94c1-4455-bb4a-d93f4eb46add', 'gift-3', 'Rafaella e Victor', 3, '2026-08-16T23:03:21.754396+00:00')
ON CONFLICT (id) DO UPDATE SET gift_id = EXCLUDED.gift_id, giver_name = EXCLUDED.giver_name, quantity = EXCLUDED.quantity, created_at = EXCLUDED.created_at;
INSERT INTO public.gift_pledges (id, gift_id, giver_name, quantity, created_at)
VALUES ('pledge-07651d5d-d3cc-4914-b633-95dafc8e7ad7', 'gift-6', 'Rafaella e Victor', 1, '2026-08-16T23:03:21.75225+00:00')
ON CONFLICT (id) DO UPDATE SET gift_id = EXCLUDED.gift_id, giver_name = EXCLUDED.giver_name, quantity = EXCLUDED.quantity, created_at = EXCLUDED.created_at;
INSERT INTO public.gift_pledges (id, gift_id, giver_name, quantity, created_at)
VALUES ('pledge-68be2f27-eeb9-4133-a103-504552c982db', 'gift-5', 'Jéssica e Marcelo', 1, '2026-08-16T23:05:53.215466+00:00')
ON CONFLICT (id) DO UPDATE SET gift_id = EXCLUDED.gift_id, giver_name = EXCLUDED.giver_name, quantity = EXCLUDED.quantity, created_at = EXCLUDED.created_at;
INSERT INTO public.gift_pledges (id, gift_id, giver_name, quantity, created_at)
VALUES ('pledge-10acede4-c69b-47e0-9361-56219c59d5b8', 'gift-7', 'Maria Eduarda', 1, '2026-08-16T23:45:22.597172+00:00')
ON CONFLICT (id) DO UPDATE SET gift_id = EXCLUDED.gift_id, giver_name = EXCLUDED.giver_name, quantity = EXCLUDED.quantity, created_at = EXCLUDED.created_at;
INSERT INTO public.gift_pledges (id, gift_id, giver_name, quantity, created_at)
VALUES ('pledge-686abf50-d33b-485e-b698-a1640fae1b55', 'gift-4', 'Maria Eduarda', 1, '2026-08-16T23:45:22.597196+00:00')
ON CONFLICT (id) DO UPDATE SET gift_id = EXCLUDED.gift_id, giver_name = EXCLUDED.giver_name, quantity = EXCLUDED.quantity, created_at = EXCLUDED.created_at;
INSERT INTO public.gift_pledges (id, gift_id, giver_name, quantity, created_at)
VALUES ('pledge-a4fee764-81c9-48d9-82fe-bd40b4f69d6f', 'gift-3', 'Vitoria', 1, '2026-08-17T10:27:48.487492+00:00')
ON CONFLICT (id) DO UPDATE SET gift_id = EXCLUDED.gift_id, giver_name = EXCLUDED.giver_name, quantity = EXCLUDED.quantity, created_at = EXCLUDED.created_at;
INSERT INTO public.gift_pledges (id, gift_id, giver_name, quantity, created_at)
VALUES ('pledge-c91e59ed-eef8-48df-82b5-6a920d6ad338', 'gift-27', 'Vitoria', 1, '2026-08-17T10:27:48.956291+00:00')
ON CONFLICT (id) DO UPDATE SET gift_id = EXCLUDED.gift_id, giver_name = EXCLUDED.giver_name, quantity = EXCLUDED.quantity, created_at = EXCLUDED.created_at;
INSERT INTO public.gift_pledges (id, gift_id, giver_name, quantity, created_at)
VALUES ('pledge-a9867384-4097-4cd0-b552-11bf40cc2bf6', 'gift-3', 'Luiza Goyaz', 1, '2026-08-17T14:57:50.968114+00:00')
ON CONFLICT (id) DO UPDATE SET gift_id = EXCLUDED.gift_id, giver_name = EXCLUDED.giver_name, quantity = EXCLUDED.quantity, created_at = EXCLUDED.created_at;
INSERT INTO public.gift_pledges (id, gift_id, giver_name, quantity, created_at)
VALUES ('pledge-d3bd1fab-51f7-4438-b25b-33368d22f4a3', 'gift-5', 'Luiza Goyaz', 1, '2026-08-17T14:57:51.373019+00:00')
ON CONFLICT (id) DO UPDATE SET gift_id = EXCLUDED.gift_id, giver_name = EXCLUDED.giver_name, quantity = EXCLUDED.quantity, created_at = EXCLUDED.created_at;
INSERT INTO public.gift_pledges (id, gift_id, giver_name, quantity, created_at)
VALUES ('pledge-4d62be63-3cc2-48f1-85b1-ac0f5d464059', 'gift-5', 'Leonardo', 1, '2026-08-17T15:06:03.12766+00:00')
ON CONFLICT (id) DO UPDATE SET gift_id = EXCLUDED.gift_id, giver_name = EXCLUDED.giver_name, quantity = EXCLUDED.quantity, created_at = EXCLUDED.created_at;
INSERT INTO public.gift_pledges (id, gift_id, giver_name, quantity, created_at)
VALUES ('pledge-9a620255-c25c-4033-9c9e-7d63a1727571', 'gift-3', 'Kelvin, Paula é Lisa', 1, '2026-08-17T16:44:10.158341+00:00')
ON CONFLICT (id) DO UPDATE SET gift_id = EXCLUDED.gift_id, giver_name = EXCLUDED.giver_name, quantity = EXCLUDED.quantity, created_at = EXCLUDED.created_at;
INSERT INTO public.gift_pledges (id, gift_id, giver_name, quantity, created_at)
VALUES ('pledge-980567de-228b-4f70-9d2d-9c464da745fb', 'gift-5', 'Kelvin, Paula é Lisa', 1, '2026-08-17T16:44:11.150536+00:00')
ON CONFLICT (id) DO UPDATE SET gift_id = EXCLUDED.gift_id, giver_name = EXCLUDED.giver_name, quantity = EXCLUDED.quantity, created_at = EXCLUDED.created_at;
INSERT INTO public.gift_pledges (id, gift_id, giver_name, quantity, created_at)
VALUES ('pledge-b5163ce9-2bb8-4dba-83f3-fc7b4fce130a', 'gift-3', 'Gabriel Henrique Menezes Silva', 1, '2026-08-17T20:57:13.66861+00:00')
ON CONFLICT (id) DO UPDATE SET gift_id = EXCLUDED.gift_id, giver_name = EXCLUDED.giver_name, quantity = EXCLUDED.quantity, created_at = EXCLUDED.created_at;
INSERT INTO public.gift_pledges (id, gift_id, giver_name, quantity, created_at)
VALUES ('pledge-fa4a33ee-ece6-4b20-983e-b4be7e705838', 'gift-5', 'Gabriel Henrique Menezes Silva', 1, '2026-08-17T20:57:14.157105+00:00')
ON CONFLICT (id) DO UPDATE SET gift_id = EXCLUDED.gift_id, giver_name = EXCLUDED.giver_name, quantity = EXCLUDED.quantity, created_at = EXCLUDED.created_at;
INSERT INTO public.gift_pledges (id, gift_id, giver_name, quantity, created_at)
VALUES ('pledge-dc6623af-08ee-4f9d-bdd3-f41f1af48ead', 'gift-3', 'Ivanete Batista', 1, '2026-08-17T22:15:06.456904+00:00')
ON CONFLICT (id) DO UPDATE SET gift_id = EXCLUDED.gift_id, giver_name = EXCLUDED.giver_name, quantity = EXCLUDED.quantity, created_at = EXCLUDED.created_at;
INSERT INTO public.gift_pledges (id, gift_id, giver_name, quantity, created_at)
VALUES ('pledge-a9dec0c2-aa3e-43db-8cd1-de50a8449c24', 'gift-5', 'Ivanete Batista', 1, '2026-08-17T22:15:06.940048+00:00')
ON CONFLICT (id) DO UPDATE SET gift_id = EXCLUDED.gift_id, giver_name = EXCLUDED.giver_name, quantity = EXCLUDED.quantity, created_at = EXCLUDED.created_at;
INSERT INTO public.gift_pledges (id, gift_id, giver_name, quantity, created_at)
VALUES ('pledge-a15b353c-581b-4e28-a87d-fc6e94dadc8c', 'gift-3', 'Filipe e família', 1, '2026-08-18T13:49:50.154999+00:00')
ON CONFLICT (id) DO UPDATE SET gift_id = EXCLUDED.gift_id, giver_name = EXCLUDED.giver_name, quantity = EXCLUDED.quantity, created_at = EXCLUDED.created_at;
INSERT INTO public.gift_pledges (id, gift_id, giver_name, quantity, created_at)
VALUES ('pledge-fa52546a-0061-495b-bc68-075a71fb675f', 'gift-5', 'Filipe e família', 1, '2026-08-18T13:49:50.659936+00:00')
ON CONFLICT (id) DO UPDATE SET gift_id = EXCLUDED.gift_id, giver_name = EXCLUDED.giver_name, quantity = EXCLUDED.quantity, created_at = EXCLUDED.created_at;
INSERT INTO public.gift_pledges (id, gift_id, giver_name, quantity, created_at)
VALUES ('pledge-6ce2ed9c-bcc8-456f-9a37-dc9cfd2a2b1d', 'gift-3', 'Adélia', 1, '2026-08-18T22:28:28.701464+00:00')
ON CONFLICT (id) DO UPDATE SET gift_id = EXCLUDED.gift_id, giver_name = EXCLUDED.giver_name, quantity = EXCLUDED.quantity, created_at = EXCLUDED.created_at;
INSERT INTO public.gift_pledges (id, gift_id, giver_name, quantity, created_at)
VALUES ('pledge-279290b7-1fb9-4b86-9cee-8a8c26ea781d', 'gift-7', 'Adélia', 1, '2026-08-18T22:28:29.112466+00:00')
ON CONFLICT (id) DO UPDATE SET gift_id = EXCLUDED.gift_id, giver_name = EXCLUDED.giver_name, quantity = EXCLUDED.quantity, created_at = EXCLUDED.created_at;
INSERT INTO public.gift_pledges (id, gift_id, giver_name, quantity, created_at)
VALUES ('pledge-9cb346dc-605c-44aa-bd24-6659e993c0c2', 'gift-3', 'Dhulia', 1, '2026-08-26T15:33:16.780548+00:00')
ON CONFLICT (id) DO UPDATE SET gift_id = EXCLUDED.gift_id, giver_name = EXCLUDED.giver_name, quantity = EXCLUDED.quantity, created_at = EXCLUDED.created_at;
INSERT INTO public.gift_pledges (id, gift_id, giver_name, quantity, created_at)
VALUES ('pledge-30db5fda-6e82-460c-8979-faf6f50ce21e', 'gift-5', 'Dhulia', 1, '2026-08-26T15:33:17.195672+00:00')
ON CONFLICT (id) DO UPDATE SET gift_id = EXCLUDED.gift_id, giver_name = EXCLUDED.giver_name, quantity = EXCLUDED.quantity, created_at = EXCLUDED.created_at;
INSERT INTO public.gift_pledges (id, gift_id, giver_name, quantity, created_at)
VALUES ('pledge-dbb735bf-2d27-432b-856e-b9bd75beed7c', 'gift-3', 'Teste convidado', 1, '2026-09-03T01:50:13.476443+00:00')
ON CONFLICT (id) DO UPDATE SET gift_id = EXCLUDED.gift_id, giver_name = EXCLUDED.giver_name, quantity = EXCLUDED.quantity, created_at = EXCLUDED.created_at;
INSERT INTO public.gift_pledges (id, gift_id, giver_name, quantity, created_at)
VALUES ('pledge-113e1f63-d817-41c4-9c2d-9823f2cc1ad7', 'gift-5', 'Teste convidado', 1, '2026-09-03T01:50:13.850008+00:00')
ON CONFLICT (id) DO UPDATE SET gift_id = EXCLUDED.gift_id, giver_name = EXCLUDED.giver_name, quantity = EXCLUDED.quantity, created_at = EXCLUDED.created_at;
INSERT INTO public.gift_pledges (id, gift_id, giver_name, quantity, created_at)
VALUES ('pledge-58735a2c-1a8b-4f81-86c5-5510afb5f94a', 'gift-3', 'Carlos Eduardo', 1, '2026-09-03T02:25:51.86361+00:00')
ON CONFLICT (id) DO UPDATE SET gift_id = EXCLUDED.gift_id, giver_name = EXCLUDED.giver_name, quantity = EXCLUDED.quantity, created_at = EXCLUDED.created_at;
INSERT INTO public.gift_pledges (id, gift_id, giver_name, quantity, created_at)
VALUES ('pledge-44485dbf-600c-4e23-8109-65bafe97c34e', 'gift-5', 'Carlos Eduardo', 1, '2026-09-03T02:25:52.283013+00:00')
ON CONFLICT (id) DO UPDATE SET gift_id = EXCLUDED.gift_id, giver_name = EXCLUDED.giver_name, quantity = EXCLUDED.quantity, created_at = EXCLUDED.created_at;

-- --------------------------------------------------------------------
-- 4. TABELA: rsvps (39 registros)
-- --------------------------------------------------------------------
INSERT INTO public.rsvps (id, name, attending, adults_count, children_count, companion_names, phone, message, created_at)
VALUES ('rsvp-a41818aa-7962-48cf-aece-bf76e50a64aa', 'Maria Jose Das Neves Silva', true, 1, 1, '{"Ayla Yusuf Neves"}'::text[], '62991944802', '', '2026-08-16T22:50:08.19593+00:00')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, attending = EXCLUDED.attending, adults_count = EXCLUDED.adults_count, children_count = EXCLUDED.children_count, companion_names = EXCLUDED.companion_names, phone = EXCLUDED.phone, message = EXCLUDED.message, created_at = EXCLUDED.created_at;
INSERT INTO public.rsvps (id, name, attending, adults_count, children_count, companion_names, phone, message, created_at)
VALUES ('rsvp-864ab951-9276-4a0c-9cbf-0e755b2e8c15', 'Luiza Goyaz', true, 2, 0, '{"Ok!"}'::text[], '62983179424', 'Amo vocês!', '2026-08-16T22:58:09.233865+00:00')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, attending = EXCLUDED.attending, adults_count = EXCLUDED.adults_count, children_count = EXCLUDED.children_count, companion_names = EXCLUDED.companion_names, phone = EXCLUDED.phone, message = EXCLUDED.message, created_at = EXCLUDED.created_at;
INSERT INTO public.rsvps (id, name, attending, adults_count, children_count, companion_names, phone, message, created_at)
VALUES ('rsvp-505eb353-ee69-4da1-97fd-898e58d9ba4b', 'Renato Brandão', true, 2, 0, '{"Stella"}'::text[], '62995458923', '', '2026-08-16T23:07:29.637161+00:00')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, attending = EXCLUDED.attending, adults_count = EXCLUDED.adults_count, children_count = EXCLUDED.children_count, companion_names = EXCLUDED.companion_names, phone = EXCLUDED.phone, message = EXCLUDED.message, created_at = EXCLUDED.created_at;
INSERT INTO public.rsvps (id, name, attending, adults_count, children_count, companion_names, phone, message, created_at)
VALUES ('rsvp-72e709c6-b9f9-4ad8-85f4-5de8b497dc47', 'Jéssica Bispo', true, 2, 0, '{"Marcelo"}'::text[], '', '', '2026-08-16T23:10:38.8324+00:00')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, attending = EXCLUDED.attending, adults_count = EXCLUDED.adults_count, children_count = EXCLUDED.children_count, companion_names = EXCLUDED.companion_names, phone = EXCLUDED.phone, message = EXCLUDED.message, created_at = EXCLUDED.created_at;
INSERT INTO public.rsvps (id, name, attending, adults_count, children_count, companion_names, phone, message, created_at)
VALUES ('rsvp-cb656975-002c-4119-9486-562d0f50d85c', 'Rafaella Barros', true, 1, 0, '{}'::text[], '62996144863', 'Maitê, você já é uma bênção escolhida por Deus e muito amada antes mesmo de chegar. “Antes de formá-lo no ventre, eu a escolhi.” Jr 1:5 .. Estarei sempre aqui por você! Você foi escolhida por Deus e presenteada aos papais certos 🩷 Aos meus amigos, a quem Deus confiou essa linda missão: que a família de vocês, que agora se inicia, seja sempre cercada de amor, respeito, fé e cumplicidade. Que Deus os capacite a cada dia e os guie nessa nova caminhada, e que nunca falte amor!!🩷 eu amo vocês!!', '2026-08-16T23:10:42.935398+00:00')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, attending = EXCLUDED.attending, adults_count = EXCLUDED.adults_count, children_count = EXCLUDED.children_count, companion_names = EXCLUDED.companion_names, phone = EXCLUDED.phone, message = EXCLUDED.message, created_at = EXCLUDED.created_at;
INSERT INTO public.rsvps (id, name, attending, adults_count, children_count, companion_names, phone, message, created_at)
VALUES ('rsvp-1bb3cd4d-97bc-4c08-a156-8b73808b39d5', 'Solange A A Ramos Brandão', true, 2, 0, '{"Ruy Gonçalves Brandão"}'::text[], '62985679449', 'Maitê, estamos te esperando com muito  e carinho. Que Deus te abençoe e te dê muita saúde, e felicidade! 🙌🙌🙏🙏👏👏👏👏', '2026-08-16T23:13:12.982028+00:00')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, attending = EXCLUDED.attending, adults_count = EXCLUDED.adults_count, children_count = EXCLUDED.children_count, companion_names = EXCLUDED.companion_names, phone = EXCLUDED.phone, message = EXCLUDED.message, created_at = EXCLUDED.created_at;
INSERT INTO public.rsvps (id, name, attending, adults_count, children_count, companion_names, phone, message, created_at)
VALUES ('rsvp-b379235d-1cea-45c9-aacc-cce2b83e4c2c', 'Stéfano silva', true, 1, 0, '{}'::text[], '62986411610', 'Um milagre que se tornou a maior felicidade da Isa, é nítido que Deus está envolvido desde o princípio desse sonho. 
Que essa princesa seja muito bem educada pelos papais e muito abençoada por Deus.', '2026-08-16T23:26:02.116572+00:00')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, attending = EXCLUDED.attending, adults_count = EXCLUDED.adults_count, children_count = EXCLUDED.children_count, companion_names = EXCLUDED.companion_names, phone = EXCLUDED.phone, message = EXCLUDED.message, created_at = EXCLUDED.created_at;
INSERT INTO public.rsvps (id, name, attending, adults_count, children_count, companion_names, phone, message, created_at)
VALUES ('rsvp-3fea1d36-a127-4969-a8d3-a3f5cf482407', 'Victor Alves', true, 1, 0, '{}'::text[], '62999667007', '', '2026-08-16T23:34:44.623772+00:00')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, attending = EXCLUDED.attending, adults_count = EXCLUDED.adults_count, children_count = EXCLUDED.children_count, companion_names = EXCLUDED.companion_names, phone = EXCLUDED.phone, message = EXCLUDED.message, created_at = EXCLUDED.created_at;
INSERT INTO public.rsvps (id, name, attending, adults_count, children_count, companion_names, phone, message, created_at)
VALUES ('rsvp-1f16fa6a-840a-49fc-8d66-e897ed953a6d', 'Hércules Gideons', true, 2, 0, '{"Adaleny Dayane"}'::text[], '', 'Jogo feliz em poder participar desse momento com vocês ❤️🎉', '2026-08-16T23:36:56.208036+00:00')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, attending = EXCLUDED.attending, adults_count = EXCLUDED.adults_count, children_count = EXCLUDED.children_count, companion_names = EXCLUDED.companion_names, phone = EXCLUDED.phone, message = EXCLUDED.message, created_at = EXCLUDED.created_at;
INSERT INTO public.rsvps (id, name, attending, adults_count, children_count, companion_names, phone, message, created_at)
VALUES ('rsvp-b8599e13-6526-414f-8ad1-faf44b4bbf83', 'José Ricardo Brandão', true, 1, 0, '{}'::text[], '62991759498', 'Parabéns que Deus e Nossa Senhora abençoe vcs', '2026-08-16T23:46:18.790964+00:00')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, attending = EXCLUDED.attending, adults_count = EXCLUDED.adults_count, children_count = EXCLUDED.children_count, companion_names = EXCLUDED.companion_names, phone = EXCLUDED.phone, message = EXCLUDED.message, created_at = EXCLUDED.created_at;
INSERT INTO public.rsvps (id, name, attending, adults_count, children_count, companion_names, phone, message, created_at)
VALUES ('rsvp-6d454f1a-a6fe-445d-9414-6f3a938b3bda', 'Amanda Gonçalves de Oliveira', true, 2, 0, '{"Werick Oliveira Santos"}'::text[], '', '', '2026-08-17T00:28:07.289644+00:00')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, attending = EXCLUDED.attending, adults_count = EXCLUDED.adults_count, children_count = EXCLUDED.children_count, companion_names = EXCLUDED.companion_names, phone = EXCLUDED.phone, message = EXCLUDED.message, created_at = EXCLUDED.created_at;
INSERT INTO public.rsvps (id, name, attending, adults_count, children_count, companion_names, phone, message, created_at)
VALUES ('rsvp-30d99724-cf24-49ac-9d89-d016b429fd28', 'Isadora Vieira', true, 2, 0, '{"Vinicius"}'::text[], '62993666726', 'Que a família de Nazaré abençoe o lar de vocês e que a benção de nossa senhora grávida venha descer sobre sua gestação e sobre o seu parto para que seja tão abençoado quanto a vinda do nosso menino Jesus foi e é em nossas vidas. 
Amo vocês demais e contem comigo sempre ❤️', '2026-08-17T00:52:30.612654+00:00')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, attending = EXCLUDED.attending, adults_count = EXCLUDED.adults_count, children_count = EXCLUDED.children_count, companion_names = EXCLUDED.companion_names, phone = EXCLUDED.phone, message = EXCLUDED.message, created_at = EXCLUDED.created_at;
INSERT INTO public.rsvps (id, name, attending, adults_count, children_count, companion_names, phone, message, created_at)
VALUES ('rsvp-d0681e23-38ea-4af0-a0e5-fc2550722e73', 'Gabrielly Nogueira', true, 5, 0, '{"Rozane","Isabella","Rafael","Ivanete"}'::text[], '62996423262', '', '2026-08-17T01:25:49.057594+00:00')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, attending = EXCLUDED.attending, adults_count = EXCLUDED.adults_count, children_count = EXCLUDED.children_count, companion_names = EXCLUDED.companion_names, phone = EXCLUDED.phone, message = EXCLUDED.message, created_at = EXCLUDED.created_at;
INSERT INTO public.rsvps (id, name, attending, adults_count, children_count, companion_names, phone, message, created_at)
VALUES ('rsvp-f7113a3b-635e-447f-ae84-fed29b1a5640', 'Anna Flávia da silva Brandão', true, 1, 0, '{}'::text[], '', 'Que venha com muita saúde ❤️', '2026-08-17T01:59:37.956828+00:00')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, attending = EXCLUDED.attending, adults_count = EXCLUDED.adults_count, children_count = EXCLUDED.children_count, companion_names = EXCLUDED.companion_names, phone = EXCLUDED.phone, message = EXCLUDED.message, created_at = EXCLUDED.created_at;
INSERT INTO public.rsvps (id, name, attending, adults_count, children_count, companion_names, phone, message, created_at)
VALUES ('rsvp-aba38dd9-3f80-4d5c-b922-4176ff10ab64', 'Vitoria', true, 2, 0, '{"Kenedy"}'::text[], '(62) 68235-1303', '', '2026-08-17T10:27:48.176674+00:00')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, attending = EXCLUDED.attending, adults_count = EXCLUDED.adults_count, children_count = EXCLUDED.children_count, companion_names = EXCLUDED.companion_names, phone = EXCLUDED.phone, message = EXCLUDED.message, created_at = EXCLUDED.created_at;
INSERT INTO public.rsvps (id, name, attending, adults_count, children_count, companion_names, phone, message, created_at)
VALUES ('rsvp-5acfc45f-52cb-4347-b333-6f50ed147740', 'Thais Viana de Jesus', true, 1, 0, '{}'::text[], '(62) 98532-0281', '', '2026-08-17T12:06:35.540059+00:00')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, attending = EXCLUDED.attending, adults_count = EXCLUDED.adults_count, children_count = EXCLUDED.children_count, companion_names = EXCLUDED.companion_names, phone = EXCLUDED.phone, message = EXCLUDED.message, created_at = EXCLUDED.created_at;
INSERT INTO public.rsvps (id, name, attending, adults_count, children_count, companion_names, phone, message, created_at)
VALUES ('rsvp-dfb382a0-d40c-4ab9-88ac-8d8bf1e6958f', 'Raynara Stephany', true, 2, 0, '{"Cleia Dalva"}'::text[], '', 'Que a chegada da Maitê traga ainda mais amor, alegria e luz para a vida de vocês. Que ela venha com muita saúde e seja cercada de amor em cada fase da vida. Desejo muitas bênçãos e momentos inesquecíveis para essa família linda! 🤍✨', '2026-08-17T13:22:48.41322+00:00')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, attending = EXCLUDED.attending, adults_count = EXCLUDED.adults_count, children_count = EXCLUDED.children_count, companion_names = EXCLUDED.companion_names, phone = EXCLUDED.phone, message = EXCLUDED.message, created_at = EXCLUDED.created_at;
INSERT INTO public.rsvps (id, name, attending, adults_count, children_count, companion_names, phone, message, created_at)
VALUES ('rsvp-99240fa1-448f-4fd7-9b52-f0aef176a342', 'Leonardo Vieira', true, 1, 0, '{}'::text[], '62995148080', '', '2026-08-17T15:06:42.811082+00:00')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, attending = EXCLUDED.attending, adults_count = EXCLUDED.adults_count, children_count = EXCLUDED.children_count, companion_names = EXCLUDED.companion_names, phone = EXCLUDED.phone, message = EXCLUDED.message, created_at = EXCLUDED.created_at;
INSERT INTO public.rsvps (id, name, attending, adults_count, children_count, companion_names, phone, message, created_at)
VALUES ('rsvp-395ab024-0174-4fdb-983c-3a827b179387', 'Gabriel Henrique Menezes Silva', true, 1, 0, '{}'::text[], '(62) 99953-1746', 'Que venha com muita saúde e seja alegria de todos ao seu redor', '2026-08-17T20:56:12.637407+00:00')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, attending = EXCLUDED.attending, adults_count = EXCLUDED.adults_count, children_count = EXCLUDED.children_count, companion_names = EXCLUDED.companion_names, phone = EXCLUDED.phone, message = EXCLUDED.message, created_at = EXCLUDED.created_at;
INSERT INTO public.rsvps (id, name, attending, adults_count, children_count, companion_names, phone, message, created_at)
VALUES ('rsvp-694406cc-e817-452d-8e6f-b2b574341e2d', 'Ivanete Batista', true, 1, 0, '{}'::text[], '', '', '2026-08-17T22:14:10.277196+00:00')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, attending = EXCLUDED.attending, adults_count = EXCLUDED.adults_count, children_count = EXCLUDED.children_count, companion_names = EXCLUDED.companion_names, phone = EXCLUDED.phone, message = EXCLUDED.message, created_at = EXCLUDED.created_at;
INSERT INTO public.rsvps (id, name, attending, adults_count, children_count, companion_names, phone, message, created_at)
VALUES ('rsvp-f163af34-3fc9-4993-a176-72f7fb9dc168', 'Kelvin Fayyad', true, 2, 1, '{"Paula","Lisa"}'::text[], '(62) 98505-2009', '', '2026-08-17T17:43:38.886059+00:00')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, attending = EXCLUDED.attending, adults_count = EXCLUDED.adults_count, children_count = EXCLUDED.children_count, companion_names = EXCLUDED.companion_names, phone = EXCLUDED.phone, message = EXCLUDED.message, created_at = EXCLUDED.created_at;
INSERT INTO public.rsvps (id, name, attending, adults_count, children_count, companion_names, phone, message, created_at)
VALUES ('rsvp-89d86b63-3f82-4f12-b7f6-743a2a958acf', 'Nayany Aparecida de Oliveira', true, 2, 0, '{"Allana Caetano"}'::text[], '(62) 98284-1625', '', '2026-08-18T13:51:11.804+00:00')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, attending = EXCLUDED.attending, adults_count = EXCLUDED.adults_count, children_count = EXCLUDED.children_count, companion_names = EXCLUDED.companion_names, phone = EXCLUDED.phone, message = EXCLUDED.message, created_at = EXCLUDED.created_at;
INSERT INTO public.rsvps (id, name, attending, adults_count, children_count, companion_names, phone, message, created_at)
VALUES ('rsvp-506b23e2-befa-460b-808f-feac41079104', 'Adélia Pires de Barros', true, 1, 0, '{}'::text[], '(62) 99697-5955', 'Que venha com muita saúde bebezinha', '2026-08-18T22:28:28.251+00:00')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, attending = EXCLUDED.attending, adults_count = EXCLUDED.adults_count, children_count = EXCLUDED.children_count, companion_names = EXCLUDED.companion_names, phone = EXCLUDED.phone, message = EXCLUDED.message, created_at = EXCLUDED.created_at;
INSERT INTO public.rsvps (id, name, attending, adults_count, children_count, companion_names, phone, message, created_at)
VALUES ('rsvp-8d57c84e-bcf1-4b0a-99b5-418ebeb06284', 'Dhulia Hemily dos Santos Menezes', false, 1, 0, '{}'::text[], '', '', '2026-08-26T15:33:52.763+00:00')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, attending = EXCLUDED.attending, adults_count = EXCLUDED.adults_count, children_count = EXCLUDED.children_count, companion_names = EXCLUDED.companion_names, phone = EXCLUDED.phone, message = EXCLUDED.message, created_at = EXCLUDED.created_at;
INSERT INTO public.rsvps (id, name, attending, adults_count, children_count, companion_names, phone, message, created_at)
VALUES ('rsvp-db15e92c-29d4-49d5-8e5e-71378c99091e', 'Fabiana', true, 3, 0, '{"Heliomar","Felipe"}'::text[], '(62) 99811-4723', 'Maitê já é muito amada por todos nós!', '2026-08-26T22:42:34.506+00:00')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, attending = EXCLUDED.attending, adults_count = EXCLUDED.adults_count, children_count = EXCLUDED.children_count, companion_names = EXCLUDED.companion_names, phone = EXCLUDED.phone, message = EXCLUDED.message, created_at = EXCLUDED.created_at;
INSERT INTO public.rsvps (id, name, attending, adults_count, children_count, companion_names, phone, message, created_at)
VALUES ('rsvp-2912304b-9fdf-4f00-8ee9-bccafc72a74e', 'Tio San', true, 1, 0, '{}'::text[], '', '', '2026-08-29T20:22:05.907+00:00')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, attending = EXCLUDED.attending, adults_count = EXCLUDED.adults_count, children_count = EXCLUDED.children_count, companion_names = EXCLUDED.companion_names, phone = EXCLUDED.phone, message = EXCLUDED.message, created_at = EXCLUDED.created_at;
INSERT INTO public.rsvps (id, name, attending, adults_count, children_count, companion_names, phone, message, created_at)
VALUES ('rsvp-9bdb30be-096b-4420-9087-d98a1afa080c', 'Victoria de Oliveira Costa', true, 2, 1, '{"Saymon","Eloá"}'::text[], '(62) 98319-8369', 'Estou muito ansiosa para a sua chegada! Titia/ madrinha te ama muito.', '2026-08-16T22:32:36.110698+00:00')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, attending = EXCLUDED.attending, adults_count = EXCLUDED.adults_count, children_count = EXCLUDED.children_count, companion_names = EXCLUDED.companion_names, phone = EXCLUDED.phone, message = EXCLUDED.message, created_at = EXCLUDED.created_at;
INSERT INTO public.rsvps (id, name, attending, adults_count, children_count, companion_names, phone, message, created_at)
VALUES ('rsvp-9a2f2af1-9440-4092-b88c-f57cbe977d70', 'Kamilla Santos', true, 1, 0, '{}'::text[], '(62) 99912-9998', '', '2026-08-29T21:44:04.318+00:00')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, attending = EXCLUDED.attending, adults_count = EXCLUDED.adults_count, children_count = EXCLUDED.children_count, companion_names = EXCLUDED.companion_names, phone = EXCLUDED.phone, message = EXCLUDED.message, created_at = EXCLUDED.created_at;
INSERT INTO public.rsvps (id, name, attending, adults_count, children_count, companion_names, phone, message, created_at)
VALUES ('rsvp-428825b1-6561-43bc-8fdd-2ac4006ef05d', 'Adriana Batista', true, 1, 0, '{}'::text[], '(62) 99312-5592', 'Com certeza vc já é muito amada e esperada princesinha, a titia avó já te ama de montão e não vê a hora de te conhecer pessoalmente e te dar muito amor e carinho bonequinha!😍❤️💕Deus trará vc com saúde e linda como sua mamãe!!!😘', '2026-09-01T12:10:36.146+00:00')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, attending = EXCLUDED.attending, adults_count = EXCLUDED.adults_count, children_count = EXCLUDED.children_count, companion_names = EXCLUDED.companion_names, phone = EXCLUDED.phone, message = EXCLUDED.message, created_at = EXCLUDED.created_at;
INSERT INTO public.rsvps (id, name, attending, adults_count, children_count, companion_names, phone, message, created_at)
VALUES ('rsvp-3dbe18cf-976d-40ed-a6a2-191ee3cdb7ba', 'Filipe e família', true, 1, 0, '{}'::text[], '(62) 99544-5696', 'Vai ser um prazer pra vocês ter a minha presença', '2026-08-18T13:49:48.688+00:00')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, attending = EXCLUDED.attending, adults_count = EXCLUDED.adults_count, children_count = EXCLUDED.children_count, companion_names = EXCLUDED.companion_names, phone = EXCLUDED.phone, message = EXCLUDED.message, created_at = EXCLUDED.created_at;
INSERT INTO public.rsvps (id, name, attending, adults_count, children_count, companion_names, phone, message, created_at)
VALUES ('rsvp-c7c28f95-8817-43cd-b0ab-9834a745d34a', 'Teste convidado', true, 1, 0, '{}'::text[], '', '', '2026-09-03T01:50:01.242+00:00')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, attending = EXCLUDED.attending, adults_count = EXCLUDED.adults_count, children_count = EXCLUDED.children_count, companion_names = EXCLUDED.companion_names, phone = EXCLUDED.phone, message = EXCLUDED.message, created_at = EXCLUDED.created_at;
INSERT INTO public.rsvps (id, name, attending, adults_count, children_count, companion_names, phone, message, created_at)
VALUES ('rsvp-425aa689-d59a-4695-8915-7f29cb37c896', 'Mariana Silva', true, 1, 0, '{}'::text[], '', '', '2026-09-03T02:24:47.24+00:00')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, attending = EXCLUDED.attending, adults_count = EXCLUDED.adults_count, children_count = EXCLUDED.children_count, companion_names = EXCLUDED.companion_names, phone = EXCLUDED.phone, message = EXCLUDED.message, created_at = EXCLUDED.created_at;
INSERT INTO public.rsvps (id, name, attending, adults_count, children_count, companion_names, phone, message, created_at)
VALUES ('rsvp-73ad0271-7a06-4c24-be83-7a206823849d', 'Carlos Eduardo', true, 1, 0, '{}'::text[], '', '', '2026-09-03T02:25:21.013+00:00')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, attending = EXCLUDED.attending, adults_count = EXCLUDED.adults_count, children_count = EXCLUDED.children_count, companion_names = EXCLUDED.companion_names, phone = EXCLUDED.phone, message = EXCLUDED.message, created_at = EXCLUDED.created_at;
INSERT INTO public.rsvps (id, name, attending, adults_count, children_count, companion_names, phone, message, created_at)
VALUES ('rsvp-815ba231-578c-49a7-a56a-9d478617fe65', 'Teste', true, 1, 0, '{}'::text[], '', '', '2026-09-03T02:41:12.948+00:00')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, attending = EXCLUDED.attending, adults_count = EXCLUDED.adults_count, children_count = EXCLUDED.children_count, companion_names = EXCLUDED.companion_names, phone = EXCLUDED.phone, message = EXCLUDED.message, created_at = EXCLUDED.created_at;
INSERT INTO public.rsvps (id, name, attending, adults_count, children_count, companion_names, phone, message, created_at)
VALUES ('rsvp-b8c79c24-8384-4f95-82e5-cae0c89c00d9', 'Teste', true, 1, 0, '{}'::text[], '', '', '2026-09-03T02:41:21.388+00:00')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, attending = EXCLUDED.attending, adults_count = EXCLUDED.adults_count, children_count = EXCLUDED.children_count, companion_names = EXCLUDED.companion_names, phone = EXCLUDED.phone, message = EXCLUDED.message, created_at = EXCLUDED.created_at;
INSERT INTO public.rsvps (id, name, attending, adults_count, children_count, companion_names, phone, message, created_at)
VALUES ('rsvp-a9101a33-6c60-4961-8618-e05d7caa269a', 'Teste', true, 1, 0, '{}'::text[], '', '', '2026-09-03T02:41:36.111+00:00')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, attending = EXCLUDED.attending, adults_count = EXCLUDED.adults_count, children_count = EXCLUDED.children_count, companion_names = EXCLUDED.companion_names, phone = EXCLUDED.phone, message = EXCLUDED.message, created_at = EXCLUDED.created_at;
INSERT INTO public.rsvps (id, name, attending, adults_count, children_count, companion_names, phone, message, created_at)
VALUES ('rsvp-42f56a04-cf82-4602-83f0-5cc3816c7ff2', 'Teste', true, 1, 0, '{}'::text[], '', '', '2026-09-03T02:43:25.904+00:00')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, attending = EXCLUDED.attending, adults_count = EXCLUDED.adults_count, children_count = EXCLUDED.children_count, companion_names = EXCLUDED.companion_names, phone = EXCLUDED.phone, message = EXCLUDED.message, created_at = EXCLUDED.created_at;
INSERT INTO public.rsvps (id, name, attending, adults_count, children_count, companion_names, phone, message, created_at)
VALUES ('rsvp-bed95647-8c6e-4af7-93e4-4bb1deb1d5e7', 'Teste', true, 1, 0, '{}'::text[], '', '', '2026-09-03T02:47:42.098+00:00')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, attending = EXCLUDED.attending, adults_count = EXCLUDED.adults_count, children_count = EXCLUDED.children_count, companion_names = EXCLUDED.companion_names, phone = EXCLUDED.phone, message = EXCLUDED.message, created_at = EXCLUDED.created_at;
INSERT INTO public.rsvps (id, name, attending, adults_count, children_count, companion_names, phone, message, created_at)
VALUES ('rsvp-b9e9d1c1-3d20-448a-9397-412ca700de46', 'Teste', true, 1, 0, '{}'::text[], '', '', '2026-09-03T02:55:47.795+00:00')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, attending = EXCLUDED.attending, adults_count = EXCLUDED.adults_count, children_count = EXCLUDED.children_count, companion_names = EXCLUDED.companion_names, phone = EXCLUDED.phone, message = EXCLUDED.message, created_at = EXCLUDED.created_at;

-- --------------------------------------------------------------------
-- 5. TABELA: messages (21 registros)
-- --------------------------------------------------------------------
INSERT INTO public.messages (id, author, text, date, likes, status, created_at)
VALUES ('msg-2818f5fb-3ea8-4249-9433-d4a64bdb7d72', 'Stéfano silva', 'Que essa princesa cresça guardada e abençoada por Deus. Que o amor que sentimos pela Isa e pelo Léo possa refletir nessa neném ❤️', 'Agora mesmo', 2, 'approved', '2026-08-16T23:29:38.353+00:00')
ON CONFLICT (id) DO UPDATE SET author = EXCLUDED.author, text = EXCLUDED.text, date = EXCLUDED.date, likes = EXCLUDED.likes, status = EXCLUDED.status, created_at = EXCLUDED.created_at;
INSERT INTO public.messages (id, author, text, date, likes, status, created_at)
VALUES ('msg-6c672fb9-0e9c-499f-b46f-c49bf4d95e78', 'Victoria de Oliveira Costa', 'Estou muito ansiosa para a sua chegada! Titia/ madrinha te ama muito.', 'Agora mesmo', 5, 'approved', '2026-08-16T19:48:18.341+00:00')
ON CONFLICT (id) DO UPDATE SET author = EXCLUDED.author, text = EXCLUDED.text, date = EXCLUDED.date, likes = EXCLUDED.likes, status = EXCLUDED.status, created_at = EXCLUDED.created_at;
INSERT INTO public.messages (id, author, text, date, likes, status, created_at)
VALUES ('msg-2cec6b19-d9c0-4461-97ba-0877d1888c89', 'Tio Kelvin', 'Minha sobrinha lindona, que vc venha com muita saúde, pq de beleza e carisma eu sei que vai puxar o titio! 
Não dê ouvidos ao seu pai e não vai na onda da sua mãe. Fica uma dica de ouro.', 'Agora mesmo', 2, 'approved', '2026-08-17T14:54:37.519+00:00')
ON CONFLICT (id) DO UPDATE SET author = EXCLUDED.author, text = EXCLUDED.text, date = EXCLUDED.date, likes = EXCLUDED.likes, status = EXCLUDED.status, created_at = EXCLUDED.created_at;
INSERT INTO public.messages (id, author, text, date, likes, status, created_at)
VALUES ('msg-eb7d57b7-392b-4d93-bf5f-872f5bd029c6', 'Raynara Stephany', 'Que a chegada da Maitê traga ainda mais amor, alegria e luz para a vida de vocês. Que ela venha com muita saúde e seja cercada de amor em cada fase da vida. Desejo muitas bênçãos e momentos inesquecíveis para essa família linda! 🤍✨', 'Agora mesmo', 1, 'approved', '2026-08-17T13:22:47.771+00:00')
ON CONFLICT (id) DO UPDATE SET author = EXCLUDED.author, text = EXCLUDED.text, date = EXCLUDED.date, likes = EXCLUDED.likes, status = EXCLUDED.status, created_at = EXCLUDED.created_at;
INSERT INTO public.messages (id, author, text, date, likes, status, created_at)
VALUES ('msg-ac4e3404-2499-436e-ae50-35edddd9a300', 'Adriana Batista', 'Com certeza vc já é muito amada e esperada princesinha, a titia avó já te ama de montão e não vê a hora de te conhecer pessoalmente e te dar muito amor e carinho bonequinha!😍❤️💕Deus trará vc com saúde e linda como sua mamãe!!!😘', 'Agora mesmo', 1, 'approved', '2026-09-01T12:10:36.147+00:00')
ON CONFLICT (id) DO UPDATE SET author = EXCLUDED.author, text = EXCLUDED.text, date = EXCLUDED.date, likes = EXCLUDED.likes, status = EXCLUDED.status, created_at = EXCLUDED.created_at;
INSERT INTO public.messages (id, author, text, date, likes, status, created_at)
VALUES ('msg-23b4fd08-22d0-414b-bf47-cd1a42e7ef10', 'Filipe e família', 'Vai ser um prazer pra vocês ter a minha presença', 'Agora mesmo', 1, 'approved', '2026-08-18T13:49:48.688+00:00')
ON CONFLICT (id) DO UPDATE SET author = EXCLUDED.author, text = EXCLUDED.text, date = EXCLUDED.date, likes = EXCLUDED.likes, status = EXCLUDED.status, created_at = EXCLUDED.created_at;
INSERT INTO public.messages (id, author, text, date, likes, status, created_at)
VALUES ('msg-7ea92cf8-7401-4d41-87ef-f9fed249912d', 'Rafaella Barros', 'Maitê, você já é uma bênção escolhida por Deus e muito amada antes mesmo de chegar. “Antes de formá-lo no ventre, eu a escolhi.” Jr 1:5 .. Estarei sempre aqui por você! Você foi escolhida por Deus e presenteada aos papais certos 🩷 Aos meus amigos, a quem Deus confiou essa linda missão: que a família de vocês, que agora se inicia, seja sempre cercada de amor, respeito, fé e cumplicidade. Que Deus os capacite a cada dia e os guie nessa nova caminhada, e que nunca falte amor!!🩷 eu amo vocês!!', 'Agora mesmo', 3, 'approved', '2026-08-16T23:10:43.076+00:00')
ON CONFLICT (id) DO UPDATE SET author = EXCLUDED.author, text = EXCLUDED.text, date = EXCLUDED.date, likes = EXCLUDED.likes, status = EXCLUDED.status, created_at = EXCLUDED.created_at;
INSERT INTO public.messages (id, author, text, date, likes, status, created_at)
VALUES ('msg-4a7229b6-2d94-4b1c-9b89-4cb58d88f8f7', 'Hércules Gideons', 'Jogo feliz em poder participar desse momento com vocês ❤️🎉', 'Agora mesmo', 3, 'approved', '2026-08-16T23:36:55.705+00:00')
ON CONFLICT (id) DO UPDATE SET author = EXCLUDED.author, text = EXCLUDED.text, date = EXCLUDED.date, likes = EXCLUDED.likes, status = EXCLUDED.status, created_at = EXCLUDED.created_at;
INSERT INTO public.messages (id, author, text, date, likes, status, created_at)
VALUES ('msg-7a8b708f-2342-4c9a-9c81-3e5638b4cc17', 'Solange A A Ramos Brandão', 'Maitê, estamos te esperando com muito amor e carinho. Que Deus te abençoe e te dê muita saúde, e felicidade! 🙌🙌🙏🙏👏👏👏👏', 'Agora mesmo', 3, 'approved', '2026-08-16T23:18:44.189+00:00')
ON CONFLICT (id) DO UPDATE SET author = EXCLUDED.author, text = EXCLUDED.text, date = EXCLUDED.date, likes = EXCLUDED.likes, status = EXCLUDED.status, created_at = EXCLUDED.created_at;
INSERT INTO public.messages (id, author, text, date, likes, status, created_at)
VALUES ('msg-3dd1b38b-f519-48de-b013-9d590e0ad594', 'Papai e Mamãe', 'Site criado com muito carinho para o chá da nossa Maitê. Te amamos, filha!', 'Agora mesmo', 8, 'approved', '2026-08-16T19:14:08.724+00:00')
ON CONFLICT (id) DO UPDATE SET author = EXCLUDED.author, text = EXCLUDED.text, date = EXCLUDED.date, likes = EXCLUDED.likes, status = EXCLUDED.status, created_at = EXCLUDED.created_at;
INSERT INTO public.messages (id, author, text, date, likes, status, created_at)
VALUES ('msg-298b02db-6dd2-4c4e-9516-6c62ec38bb9c', 'Adélia Pires de Barros', 'Que venha com muita saúde bebezinha', 'Agora mesmo', 1, 'approved', '2026-08-18T22:28:28.251+00:00')
ON CONFLICT (id) DO UPDATE SET author = EXCLUDED.author, text = EXCLUDED.text, date = EXCLUDED.date, likes = EXCLUDED.likes, status = EXCLUDED.status, created_at = EXCLUDED.created_at;
INSERT INTO public.messages (id, author, text, date, likes, status, created_at)
VALUES ('msg-c6bb5115-22e1-4447-8a90-240b05469917', 'Anna Flávia da silva Brandão', 'Que venha com muita saúde ❤️', 'Agora mesmo', 2, 'approved', '2026-08-17T01:59:37.714+00:00')
ON CONFLICT (id) DO UPDATE SET author = EXCLUDED.author, text = EXCLUDED.text, date = EXCLUDED.date, likes = EXCLUDED.likes, status = EXCLUDED.status, created_at = EXCLUDED.created_at;
INSERT INTO public.messages (id, author, text, date, likes, status, created_at)
VALUES ('msg-900923db-0701-4708-97b8-de4609286f7c', 'Isadora Vieira', 'Que a família de Nazaré abençoe o lar de vocês e que a benção de nossa senhora grávida venha descer sobre sua gestação e sobre o seu parto para que seja tão abençoado quanto a vinda do nosso menino Jesus foi e é em nossas vidas. 
Amo vocês demais e contem comigo sempre ❤️', 'Agora mesmo', 3, 'approved', '2026-08-17T00:52:30.119+00:00')
ON CONFLICT (id) DO UPDATE SET author = EXCLUDED.author, text = EXCLUDED.text, date = EXCLUDED.date, likes = EXCLUDED.likes, status = EXCLUDED.status, created_at = EXCLUDED.created_at;
INSERT INTO public.messages (id, author, text, date, likes, status, created_at)
VALUES ('msg-1ce7fcc2-cb44-455b-a5cd-e4fb33249ded', 'Célio', 'Vovozinho te espera com muito carinho', 'Agora mesmo', 2, 'approved', '2026-08-17T00:05:03.999+00:00')
ON CONFLICT (id) DO UPDATE SET author = EXCLUDED.author, text = EXCLUDED.text, date = EXCLUDED.date, likes = EXCLUDED.likes, status = EXCLUDED.status, created_at = EXCLUDED.created_at;
INSERT INTO public.messages (id, author, text, date, likes, status, created_at)
VALUES ('msg-09475ec2-6bb6-459e-9ee3-a62d0e5e25d2', 'José Ricardo Brandão', 'Parabéns que Deus e Nossa Senhora abençoe vcs', 'Agora mesmo', 2, 'approved', '2026-08-16T23:46:17.865+00:00')
ON CONFLICT (id) DO UPDATE SET author = EXCLUDED.author, text = EXCLUDED.text, date = EXCLUDED.date, likes = EXCLUDED.likes, status = EXCLUDED.status, created_at = EXCLUDED.created_at;
INSERT INTO public.messages (id, author, text, date, likes, status, created_at)
VALUES ('msg-ca747330-d628-4f75-9eab-e55e3b0e42bd', 'Gabriel Henrique Menezes Silva', 'Que venha com muita saúde e seja alegria de todos ao seu redor', 'Agora mesmo', 1, 'approved', '2026-08-17T20:56:12.358+00:00')
ON CONFLICT (id) DO UPDATE SET author = EXCLUDED.author, text = EXCLUDED.text, date = EXCLUDED.date, likes = EXCLUDED.likes, status = EXCLUDED.status, created_at = EXCLUDED.created_at;
INSERT INTO public.messages (id, author, text, date, likes, status, created_at)
VALUES ('msg-55249c30-3c77-45ee-949e-1be22dacd4ba', 'Stéfano silva', 'Um milagre que se tornou a maior felicidade da Isa, é nítido que Deus está envolvido desde o princípio desse sonho. 
Que essa princesa seja muito bem educada pelos papais e muito abençoada por Deus.', 'Agora mesmo', 4, 'approved', '2026-08-16T23:26:01.499+00:00')
ON CONFLICT (id) DO UPDATE SET author = EXCLUDED.author, text = EXCLUDED.text, date = EXCLUDED.date, likes = EXCLUDED.likes, status = EXCLUDED.status, created_at = EXCLUDED.created_at;
INSERT INTO public.messages (id, author, text, date, likes, status, created_at)
VALUES ('msg-cf60180a-1289-4f18-a307-dd0843ee0fc8', 'Luiza Goyaz', 'Amo vocês!', 'Agora mesmo', 2, 'approved', '2026-08-16T22:58:09.353+00:00')
ON CONFLICT (id) DO UPDATE SET author = EXCLUDED.author, text = EXCLUDED.text, date = EXCLUDED.date, likes = EXCLUDED.likes, status = EXCLUDED.status, created_at = EXCLUDED.created_at;
INSERT INTO public.messages (id, author, text, date, likes, status, created_at)
VALUES ('msg-da6875a1-6a42-4a01-b694-22c7b01f50c9', 'Ayla', 'Esperamos por você Maitê ansiosamente, bjs da priminha Ayla', 'Agora mesmo', 2, 'approved', '2026-08-16T22:54:57.422+00:00')
ON CONFLICT (id) DO UPDATE SET author = EXCLUDED.author, text = EXCLUDED.text, date = EXCLUDED.date, likes = EXCLUDED.likes, status = EXCLUDED.status, created_at = EXCLUDED.created_at;
INSERT INTO public.messages (id, author, text, date, likes, status, created_at)
VALUES ('msg-295d31cc-071c-4fbf-87b5-540960d53087', 'Titio Saymon', 'Titio te ama muito princesa, estarei aqui sempre que precisar, ainda mais sendo seu tio e padrinho...♡', 'Agora mesmo', 2, 'approved', '2026-08-16T20:21:04.933+00:00')
ON CONFLICT (id) DO UPDATE SET author = EXCLUDED.author, text = EXCLUDED.text, date = EXCLUDED.date, likes = EXCLUDED.likes, status = EXCLUDED.status, created_at = EXCLUDED.created_at;
INSERT INTO public.messages (id, author, text, date, likes, status, created_at)
VALUES ('msg-cd9839ee-2131-421d-923c-d8db948ff5df', 'Fabiana', 'Maitê já é muito amada por todos nós!', 'Agora mesmo', 1, 'approved', '2026-08-26T22:42:34.512+00:00')
ON CONFLICT (id) DO UPDATE SET author = EXCLUDED.author, text = EXCLUDED.text, date = EXCLUDED.date, likes = EXCLUDED.likes, status = EXCLUDED.status, created_at = EXCLUDED.created_at;

