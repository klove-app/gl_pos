-- Исправленные тестовые данные для системы управления браслетами Gymboland
-- Выполните этот SQL в Supabase SQL Editor после создания схемы

-- Очистка существующих данных (если нужно)
-- DELETE FROM entry_log;
-- DELETE FROM bracelet_sessions;
-- DELETE FROM children;
-- DELETE FROM parents;
-- DELETE FROM bracelets;
-- Не удаляем tariff_plans, так как они уже созданы в схеме

-- 1. Браслеты
INSERT INTO bracelets (id, bracelet_code, status) VALUES
('11111111-1111-1111-1111-111111111001', 'BR-001', 'active'),
('11111111-1111-1111-1111-111111111002', 'BR-002', 'active'),
('11111111-1111-1111-1111-111111111003', 'BR-003', 'active'),
('11111111-1111-1111-1111-111111111004', 'BR-004', 'active'),
('11111111-1111-1111-1111-111111111005', 'BR-005', 'active'),
('11111111-1111-1111-1111-111111111006', 'BR-006', 'active'),
('11111111-1111-1111-1111-111111111007', 'BR-007', 'active'),
('11111111-1111-1111-1111-111111111008', 'BR-008', 'active'),
('11111111-1111-1111-1111-111111111009', 'BR-009', 'active'),
('11111111-1111-1111-1111-111111111010', 'BR-010', 'active')
ON CONFLICT (bracelet_code) DO NOTHING;

-- 2. Родители
INSERT INTO parents (id, name, phone, email) VALUES
('22222222-2222-2222-2222-222222222001', 'Anna Johnson', '+1-555-0101', 'anna.johnson@email.com'),
('22222222-2222-2222-2222-222222222002', 'Michael Smith', '+1-555-0102', 'michael.smith@email.com'),
('22222222-2222-2222-2222-222222222003', 'Sarah Davis', '+1-555-0103', 'sarah.davis@email.com'),
('22222222-2222-2222-2222-222222222004', 'David Wilson', '+1-555-0104', 'david.wilson@email.com'),
('22222222-2222-2222-2222-222222222005', 'Emily Brown', '+1-555-0105', 'emily.brown@email.com'),
('22222222-2222-2222-2222-222222222006', 'James Miller', '+1-555-0106', 'james.miller@email.com'),
('22222222-2222-2222-2222-222222222007', 'Lisa Garcia', '+1-555-0107', 'lisa.garcia@email.com'),
('22222222-2222-2222-2222-222222222008', 'Robert Taylor', '+1-555-0108', 'robert.taylor@email.com')
ON CONFLICT DO NOTHING;

-- 3. Дети
INSERT INTO children (id, parent_id, name) VALUES
('33333333-3333-3333-3333-333333333001', '22222222-2222-2222-2222-222222222001', 'Emma Johnson'),
('33333333-3333-3333-3333-333333333002', '22222222-2222-2222-2222-222222222002', 'Liam Smith'),
('33333333-3333-3333-3333-333333333003', '22222222-2222-2222-2222-222222222003', 'Olivia Davis'),
('33333333-3333-3333-3333-333333333004', '22222222-2222-2222-2222-222222222004', 'Noah Wilson'),
('33333333-3333-3333-3333-333333333005', '22222222-2222-2222-2222-222222222005', 'Ava Brown'),
('33333333-3333-3333-3333-333333333006', '22222222-2222-2222-2222-222222222006', 'William Miller'),
('33333333-3333-3333-3333-333333333007', '22222222-2222-2222-2222-222222222007', 'Sophia Garcia'),
('33333333-3333-3333-3333-333333333008', '22222222-2222-2222-2222-222222222008', 'Benjamin Taylor'),
('33333333-3333-3333-3333-333333333009', '22222222-2222-2222-2222-222222222001', 'Mason Johnson'),
('33333333-3333-3333-3333-333333333010', '22222222-2222-2222-2222-222222222003', 'Isabella Davis')
ON CONFLICT DO NOTHING;

-- 4. Получаем ID тарифных планов (они уже созданы в схеме)
-- Создаем временную таблицу для хранения ID тарифов
DO $$
DECLARE
    tariff_1day UUID;
    tariff_4hours UUID;
    tariff_2hours UUID;
    tariff_30min UUID;
BEGIN
    -- Получаем ID существующих тарифов
    SELECT id INTO tariff_1day FROM tariff_plans WHERE name = '1 день' LIMIT 1;
    SELECT id INTO tariff_4hours FROM tariff_plans WHERE name = '4 часа' LIMIT 1;
    SELECT id INTO tariff_2hours FROM tariff_plans WHERE name = '2 часа' LIMIT 1;
    SELECT id INTO tariff_30min FROM tariff_plans WHERE name = '30 минут' LIMIT 1;

    -- 5. Активные сессии браслетов
    INSERT INTO bracelet_sessions (id, bracelet_id, child_id, parent_id, tariff_plan_id, start_time, status, is_active) VALUES
    ('44444444-4444-4444-4444-444444444001', '11111111-1111-1111-1111-111111111001', '33333333-3333-3333-3333-333333333001', '22222222-2222-2222-2222-222222222001', tariff_1day, NOW() - INTERVAL '2 hours', 'inside', true),
    ('44444444-4444-4444-4444-444444444002', '11111111-1111-1111-1111-111111111002', '33333333-3333-3333-3333-333333333002', '22222222-2222-2222-2222-222222222002', tariff_4hours, NOW() - INTERVAL '1 hour', 'inside', true),
    ('44444444-4444-4444-4444-444444444003', '11111111-1111-1111-1111-111111111003', '33333333-3333-3333-3333-333333333003', '22222222-2222-2222-2222-222222222003', tariff_2hours, NOW() - INTERVAL '30 minutes', 'inside', true),
    ('44444444-4444-4444-4444-444444444004', '11111111-1111-1111-1111-111111111004', '33333333-3333-3333-3333-333333333004', '22222222-2222-2222-2222-222222222004', tariff_1day, NOW() - INTERVAL '3 hours', 'outside', true),
    ('44444444-4444-4444-4444-444444444005', '11111111-1111-1111-1111-111111111005', '33333333-3333-3333-3333-333333333005', '22222222-2222-2222-2222-222222222005', tariff_4hours, NOW() - INTERVAL '45 minutes', 'outside', true),
    ('44444444-4444-4444-4444-444444444006', '11111111-1111-1111-1111-111111111006', '33333333-3333-3333-3333-333333333006', '22222222-2222-2222-2222-222222222006', tariff_2hours, NOW() - INTERVAL '15 minutes', 'inside', true),
    ('44444444-4444-4444-4444-444444444007', '11111111-1111-1111-1111-111111111007', '33333333-3333-3333-3333-333333333007', '22222222-2222-2222-2222-222222222007', tariff_1day, NOW() - INTERVAL '4 hours', 'inside', true),
    ('44444444-4444-4444-4444-444444444008', '11111111-1111-1111-1111-111111111008', '33333333-3333-3333-3333-333333333008', '22222222-2222-2222-2222-222222222008', tariff_30min, NOW() - INTERVAL '10 minutes', 'outside', true)
    ON CONFLICT DO NOTHING;

    -- 6. Журнал входов/выходов
    INSERT INTO entry_log (id, session_id, action, timestamp, notes) VALUES
    -- Записи для Emma Johnson (session 001)
    ('55555555-5555-5555-5555-555555555001', '44444444-4444-4444-4444-444444444001', 'enter', NOW() - INTERVAL '2 hours', 'Initial entry'),
    ('55555555-5555-5555-5555-555555555002', '44444444-4444-4444-4444-444444444001', 'exit', NOW() - INTERVAL '1 hour 30 minutes', 'Bathroom break'),
    ('55555555-5555-5555-5555-555555555003', '44444444-4444-4444-4444-444444444001', 'enter', NOW() - INTERVAL '1 hour 20 minutes', 'Returned from break'),

    -- Записи для Liam Smith (session 002)
    ('55555555-5555-5555-5555-555555555004', '44444444-4444-4444-4444-444444444002', 'enter', NOW() - INTERVAL '1 hour', 'Initial entry'),

    -- Записи для Olivia Davis (session 003)
    ('55555555-5555-5555-5555-555555555005', '44444444-4444-4444-4444-444444444003', 'enter', NOW() - INTERVAL '30 minutes', 'Initial entry'),

    -- Записи для Noah Wilson (session 004)
    ('55555555-5555-5555-5555-555555555006', '44444444-4444-4444-4444-444444444004', 'enter', NOW() - INTERVAL '3 hours', 'Initial entry'),
    ('55555555-5555-5555-5555-555555555007', '44444444-4444-4444-4444-444444444004', 'exit', NOW() - INTERVAL '2 hours 30 minutes', 'Lunch break'),
    ('55555555-5555-5555-5555-555555555008', '44444444-4444-4444-4444-444444444004', 'enter', NOW() - INTERVAL '2 hours', 'Back from lunch'),
    ('55555555-5555-5555-5555-555555555009', '44444444-4444-4444-4444-444444444004', 'exit', NOW() - INTERVAL '1 hour', 'Left for home'),

    -- Записи для Ava Brown (session 005)
    ('55555555-5555-5555-5555-555555555010', '44444444-4444-4444-4444-444444444005', 'enter', NOW() - INTERVAL '45 minutes', 'Initial entry'),
    ('55555555-5555-5555-5555-555555555011', '44444444-4444-4444-4444-444444444005', 'exit', NOW() - INTERVAL '20 minutes', 'Parent pickup'),

    -- Записи для William Miller (session 006)
    ('55555555-5555-5555-5555-555555555012', '44444444-4444-4444-4444-444444444006', 'enter', NOW() - INTERVAL '15 minutes', 'Initial entry'),

    -- Записи для Sophia Garcia (session 007)
    ('55555555-5555-5555-5555-555555555013', '44444444-4444-4444-4444-444444444007', 'enter', NOW() - INTERVAL '4 hours', 'Initial entry'),

    -- Записи для Benjamin Taylor (session 008)
    ('55555555-5555-5555-5555-555555555014', '44444444-4444-4444-4444-444444444008', 'enter', NOW() - INTERVAL '10 minutes', 'Initial entry'),
    ('55555555-5555-5555-5555-555555555015', '44444444-4444-4444-4444-444444444008', 'exit', NOW() - INTERVAL '5 minutes', 'Session ended')
    ON CONFLICT DO NOTHING;

    -- Дополнительные исторические записи для демонстрации
    INSERT INTO bracelet_sessions (id, bracelet_id, child_id, parent_id, tariff_plan_id, start_time, end_time, status, is_active) VALUES
    ('44444444-4444-4444-4444-444444444101', '11111111-1111-1111-1111-111111111009', '33333333-3333-3333-3333-333333333009', '22222222-2222-2222-2222-222222222001', tariff_2hours, NOW() - INTERVAL '1 day', NOW() - INTERVAL '22 hours', 'outside', false),
    ('44444444-4444-4444-4444-444444444102', '11111111-1111-1111-1111-111111111010', '33333333-3333-3333-3333-333333333010', '22222222-2222-2222-2222-222222222003', tariff_4hours, NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day 20 hours', 'outside', false)
    ON CONFLICT DO NOTHING;

    INSERT INTO entry_log (id, session_id, action, timestamp, notes) VALUES
    ('55555555-5555-5555-5555-555555555101', '44444444-4444-4444-4444-444444444101', 'enter', NOW() - INTERVAL '1 day', 'Historical entry'),
    ('55555555-5555-5555-5555-555555555102', '44444444-4444-4444-4444-444444444101', 'exit', NOW() - INTERVAL '22 hours', 'Historical exit'),
    ('55555555-5555-5555-5555-555555555103', '44444444-4444-4444-4444-444444444102', 'enter', NOW() - INTERVAL '2 days', 'Historical entry'),
    ('55555555-5555-5555-5555-555555555104', '44444444-4444-4444-4444-444444444102', 'exit', NOW() - INTERVAL '1 day 20 hours', 'Historical exit')
    ON CONFLICT DO NOTHING;

END $$;

-- Проверочные запросы для тестирования
-- SELECT 'Tariff Plans' as table_name, COUNT(*) as count FROM tariff_plans
-- UNION ALL
-- SELECT 'Bracelets', COUNT(*) FROM bracelets
-- UNION ALL
-- SELECT 'Parents', COUNT(*) FROM parents
-- UNION ALL
-- SELECT 'Children', COUNT(*) FROM children
-- UNION ALL
-- SELECT 'Active Sessions', COUNT(*) FROM bracelet_sessions WHERE is_active = true
-- UNION ALL
-- SELECT 'Entry Log', COUNT(*) FROM entry_log;

-- Запрос для проверки активных сессий с полной информацией
-- SELECT 
--   bs.id as session_id,
--   b.bracelet_code,
--   c.name as child_name,
--   p.name as parent_name,
--   p.phone as parent_phone,
--   tp.name as tariff_name,
--   tp.price,
--   bs.status,
--   bs.start_time,
--   bs.is_active
-- FROM bracelet_sessions bs
-- JOIN bracelets b ON bs.bracelet_id = b.id
-- JOIN children c ON bs.child_id = c.id
-- JOIN parents p ON bs.parent_id = p.id
-- JOIN tariff_plans tp ON bs.tariff_plan_id = tp.id
-- WHERE bs.is_active = true
-- ORDER BY bs.start_time DESC; 