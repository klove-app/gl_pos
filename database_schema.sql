-- Схема базы данных для системы управления детскими браслетами

-- Таблица тарифных планов
CREATE TABLE tariff_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    duration_hours INTEGER NOT NULL, -- продолжительность в часах
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица браслетов
CREATE TABLE bracelets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    bracelet_code TEXT UNIQUE NOT NULL, -- QR код или NFC ID
    status TEXT NOT NULL DEFAULT 'available', -- available, active, lost, broken
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица родителей
CREATE TABLE parents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица детей
CREATE TABLE children (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT, -- может быть NULL, если не указано
    parent_id UUID REFERENCES parents(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица активных сессий браслетов
CREATE TABLE bracelet_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    bracelet_id UUID REFERENCES bracelets(id) ON DELETE CASCADE,
    child_id UUID REFERENCES children(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES parents(id) ON DELETE CASCADE,
    tariff_plan_id UUID REFERENCES tariff_plans(id),
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    status TEXT DEFAULT 'inside', -- inside, outside
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица истории входов/выходов
CREATE TABLE entry_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES bracelet_sessions(id) ON DELETE CASCADE,
    action TEXT NOT NULL, -- enter, exit
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT
);

-- Вставка базовых тарифных планов
INSERT INTO tariff_plans (name, description, duration_hours, price) VALUES
('1 день', 'Доступ на весь день', 24, 500.00),
('2 часа', 'Доступ на 2 часа', 2, 200.00),
('4 часа', 'Доступ на 4 часа', 4, 350.00),
('Безлимит', 'Безлимитный доступ', 999, 1000.00);

-- Создание индексов для оптимизации
CREATE INDEX idx_bracelets_code ON bracelets(bracelet_code);
CREATE INDEX idx_bracelet_sessions_active ON bracelet_sessions(is_active, status);
CREATE INDEX idx_entry_log_timestamp ON entry_log(timestamp);
CREATE INDEX idx_parents_phone ON parents(phone);

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

-- Политики безопасности RLS (если нужно)
-- ALTER TABLE bracelets ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE bracelet_sessions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE children ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE entry_log ENABLE ROW LEVEL SECURITY; 