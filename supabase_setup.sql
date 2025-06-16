-- Создание таблиц для системы управления браслетами Gymboland
-- Выполните этот скрипт в SQL Editor вашего проекта Supabase

-- 1. Тарифные планы
CREATE TABLE IF NOT EXISTS tariff_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    duration_hours INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Браслеты
CREATE TABLE IF NOT EXISTS bracelets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    bracelet_code VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'lost')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Родители
CREATE TABLE IF NOT EXISTS parents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Дети
CREATE TABLE IF NOT EXISTS children (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(200),
    parent_id UUID REFERENCES parents(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Сессии браслетов
CREATE TABLE IF NOT EXISTS bracelet_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    bracelet_id UUID REFERENCES bracelets(id) ON DELETE CASCADE,
    child_id UUID REFERENCES children(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES parents(id) ON DELETE CASCADE,
    tariff_plan_id UUID REFERENCES tariff_plans(id) ON DELETE RESTRICT,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    status VARCHAR(20) DEFAULT 'inside' CHECK (status IN ('inside', 'outside')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Лог входов/выходов
CREATE TABLE IF NOT EXISTS entry_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES bracelet_sessions(id) ON DELETE CASCADE,
    action VARCHAR(10) NOT NULL CHECK (action IN ('enter', 'exit')),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT
);

-- Создание индексов для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_bracelets_code ON bracelets(bracelet_code);
CREATE INDEX IF NOT EXISTS idx_sessions_active ON bracelet_sessions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_sessions_bracelet ON bracelet_sessions(bracelet_id);
CREATE INDEX IF NOT EXISTS idx_entry_log_session ON entry_log(session_id);
CREATE INDEX IF NOT EXISTS idx_entry_log_timestamp ON entry_log(timestamp);

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггеры для автоматического обновления updated_at
CREATE TRIGGER update_bracelets_updated_at 
    BEFORE UPDATE ON bracelets 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bracelet_sessions_updated_at 
    BEFORE UPDATE ON bracelet_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Вставка тестовых тарифных планов
INSERT INTO tariff_plans (name, description, duration_hours, price) VALUES
('1 день', 'Доступ на весь день', 24, 500.00),
('2 часа', 'Доступ на 2 часа', 2, 200.00),
('4 часа', 'Доступ на 4 часа', 4, 350.00),
('30 минут', 'Пробный доступ', 0.5, 100.00)
ON CONFLICT DO NOTHING;

-- Настройка Row Level Security (RLS)
ALTER TABLE tariff_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE bracelets ENABLE ROW LEVEL SECURITY;
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE bracelet_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE entry_log ENABLE ROW LEVEL SECURITY;

-- Политики доступа (разрешаем все операции для анонимных пользователей)
-- В продакшене следует настроить более строгие политики

CREATE POLICY "Allow all operations on tariff_plans" ON tariff_plans
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on bracelets" ON bracelets
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on parents" ON parents
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on children" ON children
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on bracelet_sessions" ON bracelet_sessions
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on entry_log" ON entry_log
    FOR ALL USING (true) WITH CHECK (true);

-- Создание представления для получения полной информации о сессиях
CREATE OR REPLACE VIEW session_details AS
SELECT 
    bs.id,
    bs.bracelet_id,
    bs.child_id,
    bs.parent_id,
    bs.tariff_plan_id,
    bs.start_time,
    bs.end_time,
    bs.is_active,
    bs.status,
    bs.created_at,
    bs.updated_at,
    b.bracelet_code,
    b.status as bracelet_status,
    c.name as child_name,
    p.name as parent_name,
    p.phone as parent_phone,
    p.email as parent_email,
    tp.name as tariff_name,
    tp.description as tariff_description,
    tp.duration_hours,
    tp.price as tariff_price
FROM bracelet_sessions bs
JOIN bracelets b ON bs.bracelet_id = b.id
JOIN parents p ON bs.parent_id = p.id
LEFT JOIN children c ON bs.child_id = c.id
JOIN tariff_plans tp ON bs.tariff_plan_id = tp.id;

-- Комментарии к таблицам
COMMENT ON TABLE tariff_plans IS 'Тарифные планы для браслетов';
COMMENT ON TABLE bracelets IS 'Физические браслеты с уникальными кодами';
COMMENT ON TABLE parents IS 'Информация о родителях';
COMMENT ON TABLE children IS 'Информация о детях';
COMMENT ON TABLE bracelet_sessions IS 'Активные сессии использования браслетов';
COMMENT ON TABLE entry_log IS 'Лог всех входов и выходов';

-- Готово! Теперь можно использовать приложение с реальной базой данных. 