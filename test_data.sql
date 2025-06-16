-- Тестовые данные для системы управления браслетами Gymboland
-- Выполните этот SQL в Supabase SQL Editor после создания схемы

-- Очистка существующих данных (если нужно)
-- DELETE FROM entry_log;
-- DELETE FROM bracelet_sessions;
-- DELETE FROM children;
-- DELETE FROM parents;
-- DELETE FROM bracelets;
-- DELETE FROM tariff_plans;

-- 1. Тарифные планы
INSERT INTO tariff_plans (id, name, price, duration_minutes, description) VALUES
('tp-30min', '30 Minutes', 100, 30, 'Trial access'),
('tp-2hours', '2 Hours', 200, 120, '2 hours access'),
('tp-4hours', '4 Hours', 350, 240, '4 hours access'),
('tp-1day', '1 Day', 500, 1440, 'Full day access');

-- 2. Браслеты
INSERT INTO bracelets (id, bracelet_code, status) VALUES
('br-001', 'BR-001', 'active'),
('br-002', 'BR-002', 'active'),
('br-003', 'BR-003', 'active'),
('br-004', 'BR-004', 'active'),
('br-005', 'BR-005', 'active'),
('br-006', 'BR-006', 'active'),
('br-007', 'BR-007', 'active'),
('br-008', 'BR-008', 'active'),
('br-009', 'BR-009', 'available'),
('br-010', 'BR-010', 'available');

-- 3. Родители
INSERT INTO parents (id, name, phone, email) VALUES
('p-001', 'Anna Johnson', '+1-555-0101', 'anna.johnson@email.com'),
('p-002', 'Michael Smith', '+1-555-0102', 'michael.smith@email.com'),
('p-003', 'Sarah Davis', '+1-555-0103', 'sarah.davis@email.com'),
('p-004', 'David Wilson', '+1-555-0104', 'david.wilson@email.com'),
('p-005', 'Emily Brown', '+1-555-0105', 'emily.brown@email.com'),
('p-006', 'James Miller', '+1-555-0106', 'james.miller@email.com'),
('p-007', 'Lisa Garcia', '+1-555-0107', 'lisa.garcia@email.com'),
('p-008', 'Robert Taylor', '+1-555-0108', 'robert.taylor@email.com');

-- 4. Дети
INSERT INTO children (id, parent_id, name, age) VALUES
('c-001', 'p-001', 'Emma Johnson', 5),
('c-002', 'p-002', 'Liam Smith', 7),
('c-003', 'p-003', 'Olivia Davis', 4),
('c-004', 'p-004', 'Noah Wilson', 6),
('c-005', 'p-005', 'Ava Brown', 8),
('c-006', 'p-006', 'William Miller', 5),
('c-007', 'p-007', 'Sophia Garcia', 6),
('c-008', 'p-008', 'Benjamin Taylor', 7),
('c-009', 'p-001', 'Mason Johnson', 3),
('c-010', 'p-003', 'Isabella Davis', 9);

-- 5. Активные сессии браслетов
INSERT INTO bracelet_sessions (id, bracelet_id, child_id, tariff_plan_id, start_time, status, total_amount) VALUES
('s-001', 'br-001', 'c-001', 'tp-1day', NOW() - INTERVAL '2 hours', 'inside', 500),
('s-002', 'br-002', 'c-002', 'tp-4hours', NOW() - INTERVAL '1 hour', 'inside', 350),
('s-003', 'br-003', 'c-003', 'tp-2hours', NOW() - INTERVAL '30 minutes', 'inside', 200),
('s-004', 'br-004', 'c-004', 'tp-1day', NOW() - INTERVAL '3 hours', 'outside', 500),
('s-005', 'br-005', 'c-005', 'tp-4hours', NOW() - INTERVAL '45 minutes', 'outside', 350),
('s-006', 'br-006', 'c-006', 'tp-2hours', NOW() - INTERVAL '15 minutes', 'inside', 200),
('s-007', 'br-007', 'c-007', 'tp-1day', NOW() - INTERVAL '4 hours', 'inside', 500),
('s-008', 'br-008', 'c-008', 'tp-30min', NOW() - INTERVAL '10 minutes', 'outside', 100);

-- 6. Журнал входов/выходов
INSERT INTO entry_log (id, session_id, action, timestamp, notes) VALUES
-- Записи для Emma Johnson (s-001)
('e-001', 's-001', 'enter', NOW() - INTERVAL '2 hours', 'Initial entry'),
('e-002', 's-001', 'exit', NOW() - INTERVAL '1 hour 30 minutes', 'Bathroom break'),
('e-003', 's-001', 'enter', NOW() - INTERVAL '1 hour 20 minutes', 'Returned from break'),

-- Записи для Liam Smith (s-002)
('e-004', 's-002', 'enter', NOW() - INTERVAL '1 hour', 'Initial entry'),

-- Записи для Olivia Davis (s-003)
('e-005', 's-003', 'enter', NOW() - INTERVAL '30 minutes', 'Initial entry'),

-- Записи для Noah Wilson (s-004)
('e-006', 's-004', 'enter', NOW() - INTERVAL '3 hours', 'Initial entry'),
('e-007', 's-004', 'exit', NOW() - INTERVAL '2 hours 30 minutes', 'Lunch break'),
('e-008', 's-004', 'enter', NOW() - INTERVAL '2 hours', 'Back from lunch'),
('e-009', 's-004', 'exit', NOW() - INTERVAL '1 hour', 'Left for home'),

-- Записи для Ava Brown (s-005)
('e-010', 's-005', 'enter', NOW() - INTERVAL '45 minutes', 'Initial entry'),
('e-011', 's-005', 'exit', NOW() - INTERVAL '20 minutes', 'Parent pickup'),

-- Записи для William Miller (s-006)
('e-012', 's-006', 'enter', NOW() - INTERVAL '15 minutes', 'Initial entry'),

-- Записи для Sophia Garcia (s-007)
('e-013', 's-007', 'enter', NOW() - INTERVAL '4 hours', 'Initial entry'),

-- Записи для Benjamin Taylor (s-008)
('e-014', 's-008', 'enter', NOW() - INTERVAL '10 minutes', 'Initial entry'),
('e-015', 's-008', 'exit', NOW() - INTERVAL '5 minutes', 'Session ended');

-- Дополнительные исторические записи для демонстрации
INSERT INTO bracelet_sessions (id, bracelet_id, child_id, tariff_plan_id, start_time, end_time, status, total_amount) VALUES
('s-h001', 'br-009', 'c-009', 'tp-2hours', NOW() - INTERVAL '1 day', NOW() - INTERVAL '22 hours', 'completed', 200),
('s-h002', 'br-010', 'c-010', 'tp-4hours', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day 20 hours', 'completed', 350);

INSERT INTO entry_log (id, session_id, action, timestamp, notes) VALUES
('e-h001', 's-h001', 'enter', NOW() - INTERVAL '1 day', 'Historical entry'),
('e-h002', 's-h001', 'exit', NOW() - INTERVAL '22 hours', 'Historical exit'),
('e-h003', 's-h002', 'enter', NOW() - INTERVAL '2 days', 'Historical entry'),
('e-h004', 's-h002', 'exit', NOW() - INTERVAL '1 day 20 hours', 'Historical exit');

-- Проверочные запросы для тестирования
-- SELECT 'Tariff Plans' as table_name, COUNT(*) as count FROM tariff_plans
-- UNION ALL
-- SELECT 'Bracelets', COUNT(*) FROM bracelets
-- UNION ALL
-- SELECT 'Parents', COUNT(*) FROM parents
-- UNION ALL
-- SELECT 'Children', COUNT(*) FROM children
-- UNION ALL
-- SELECT 'Active Sessions', COUNT(*) FROM bracelet_sessions WHERE status IN ('inside', 'outside')
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
--   bs.total_amount
-- FROM bracelet_sessions bs
-- JOIN bracelets b ON bs.bracelet_id = b.id
-- JOIN children c ON bs.child_id = c.id
-- JOIN parents p ON c.parent_id = p.id
-- JOIN tariff_plans tp ON bs.tariff_plan_id = tp.id
-- WHERE bs.status IN ('inside', 'outside')
-- ORDER BY bs.start_time DESC; 