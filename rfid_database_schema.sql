-- Расширенная схема базы данных для RFID системы Gymboland
-- Добавляет поддержку зонирования, RFID событий и аналитики

-- 1. Зоны игрового центра
CREATE TABLE IF NOT EXISTS zones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    zone_type VARCHAR(50) NOT NULL CHECK (zone_type IN ('entrance', 'play_area', 'cafe', 'restroom', 'party_room', 'sports', 'creative')),
    age_restrictions JSONB DEFAULT '{}', -- {"min_age": 3, "max_age": 12}
    capacity INTEGER NOT NULL DEFAULT 50,
    current_occupancy INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    safety_level VARCHAR(20) DEFAULT 'standard' CHECK (safety_level IN ('low', 'standard', 'high', 'restricted')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. RFID считыватели
CREATE TABLE IF NOT EXISTS rfid_readers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reader_code VARCHAR(50) UNIQUE NOT NULL,
    zone_id UUID REFERENCES zones(id) ON DELETE CASCADE,
    location_description TEXT,
    reader_type VARCHAR(30) NOT NULL CHECK (reader_type IN ('entry', 'exit', 'checkpoint')),
    is_active BOOLEAN DEFAULT true,
    last_heartbeat TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. RFID события (сырые данные от считывателей)
CREATE TABLE IF NOT EXISTS rfid_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    rfid_tag VARCHAR(100) NOT NULL, -- RFID ID браслета
    reader_id UUID REFERENCES rfid_readers(id) ON DELETE CASCADE,
    zone_id UUID REFERENCES zones(id) ON DELETE CASCADE,
    event_type VARCHAR(20) NOT NULL CHECK (event_type IN ('detected', 'enter', 'exit')),
    signal_strength INTEGER, -- Сила сигнала (для определения близости)
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed BOOLEAN DEFAULT false,
    session_id UUID, -- Будет заполнено после обработки
    notes TEXT
);

-- 4. Записи о пребывании в зонах
CREATE TABLE IF NOT EXISTS zone_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES bracelet_sessions(id) ON DELETE CASCADE,
    zone_id UUID REFERENCES zones(id) ON DELETE CASCADE,
    entry_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    exit_time TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    entry_method VARCHAR(20) DEFAULT 'rfid' CHECK (entry_method IN ('rfid', 'manual', 'system')),
    exit_method VARCHAR(20) CHECK (exit_method IN ('rfid', 'manual', 'system')),
    is_active BOOLEAN DEFAULT true
);

-- 5. Оповещения безопасности
CREATE TABLE IF NOT EXISTS security_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN ('unauthorized_exit', 'zone_violation', 'lost_child', 'overcrowding', 'age_restriction', 'emergency')),
    child_id UUID REFERENCES children(id) ON DELETE CASCADE,
    session_id UUID REFERENCES bracelet_sessions(id) ON DELETE CASCADE,
    zone_id UUID REFERENCES zones(id) ON DELETE SET NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    message TEXT NOT NULL,
    auto_resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Достижения детей (геймификация)
CREATE TABLE IF NOT EXISTS child_achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    child_id UUID REFERENCES children(id) ON DELETE CASCADE,
    achievement_type VARCHAR(50) NOT NULL,
    achievement_name VARCHAR(100) NOT NULL,
    description TEXT,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_id UUID REFERENCES bracelet_sessions(id) ON DELETE SET NULL,
    zone_id UUID REFERENCES zones(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}' -- Дополнительные данные о достижении
);

-- 7. Настройки родительского контроля
CREATE TABLE IF NOT EXISTS parental_controls (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    parent_id UUID REFERENCES parents(id) ON DELETE CASCADE,
    child_id UUID REFERENCES children(id) ON DELETE CASCADE,
    allowed_zones UUID[] DEFAULT '{}', -- Массив разрешенных зон
    restricted_zones UUID[] DEFAULT '{}', -- Массив запрещенных зон
    max_session_duration INTEGER, -- Максимальное время сессии в минутах
    notification_preferences JSONB DEFAULT '{}', -- Настройки уведомлений
    emergency_contacts JSONB DEFAULT '{}', -- Экстренные контакты
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Аналитические данные (агрегированные)
CREATE TABLE IF NOT EXISTS analytics_daily (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL,
    zone_id UUID REFERENCES zones(id) ON DELETE CASCADE,
    total_visitors INTEGER DEFAULT 0,
    total_duration_minutes INTEGER DEFAULT 0,
    avg_duration_minutes DECIMAL(10,2) DEFAULT 0,
    peak_occupancy INTEGER DEFAULT 0,
    peak_hour INTEGER, -- Час пиковой загрузки (0-23)
    age_distribution JSONB DEFAULT '{}', -- Распределение по возрастам
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(date, zone_id)
);

-- Добавляем поля в существующие таблицы

-- Добавляем RFID поддержку в браслеты
ALTER TABLE bracelets ADD COLUMN IF NOT EXISTS rfid_tag VARCHAR(100) UNIQUE;
ALTER TABLE bracelets ADD COLUMN IF NOT EXISTS battery_level INTEGER DEFAULT 100;
ALTER TABLE bracelets ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITH TIME ZONE;

-- Добавляем возраст в детей для контроля доступа
ALTER TABLE children ADD COLUMN IF NOT EXISTS age INTEGER;
ALTER TABLE children ADD COLUMN IF NOT EXISTS birth_date DATE;

-- Добавляем текущую зону в сессии
ALTER TABLE bracelet_sessions ADD COLUMN IF NOT EXISTS current_zone_id UUID REFERENCES zones(id);
ALTER TABLE bracelet_sessions ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2);

-- Создание индексов для оптимизации
CREATE INDEX IF NOT EXISTS idx_rfid_events_tag ON rfid_events(rfid_tag);
CREATE INDEX IF NOT EXISTS idx_rfid_events_timestamp ON rfid_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_rfid_events_processed ON rfid_events(processed) WHERE processed = false;
CREATE INDEX IF NOT EXISTS idx_zone_entries_session ON zone_entries(session_id);
CREATE INDEX IF NOT EXISTS idx_zone_entries_zone ON zone_entries(zone_id);
CREATE INDEX IF NOT EXISTS idx_zone_entries_active ON zone_entries(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_security_alerts_severity ON security_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_security_alerts_unresolved ON security_alerts(auto_resolved) WHERE auto_resolved = false;
CREATE INDEX IF NOT EXISTS idx_analytics_daily_date ON analytics_daily(date);

-- Триггеры для автоматического обновления

-- Обновление счетчика занятости зоны
CREATE OR REPLACE FUNCTION update_zone_occupancy()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Увеличиваем счетчик при входе
        UPDATE zones 
        SET current_occupancy = current_occupancy + 1 
        WHERE id = NEW.zone_id;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' AND OLD.is_active = true AND NEW.is_active = false THEN
        -- Уменьшаем счетчик при выходе
        UPDATE zones 
        SET current_occupancy = GREATEST(current_occupancy - 1, 0) 
        WHERE id = NEW.zone_id;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_zone_occupancy
    AFTER INSERT OR UPDATE ON zone_entries
    FOR EACH ROW EXECUTE FUNCTION update_zone_occupancy();

-- Автоматическое создание оповещений безопасности
CREATE OR REPLACE FUNCTION check_security_violations()
RETURNS TRIGGER AS $$
DECLARE
    child_age INTEGER;
    zone_restrictions JSONB;
    parent_controls RECORD;
BEGIN
    -- Получаем возраст ребенка
    SELECT c.age INTO child_age
    FROM children c
    JOIN bracelet_sessions bs ON c.id = bs.child_id
    WHERE bs.id = NEW.session_id;
    
    -- Получаем ограничения зоны
    SELECT age_restrictions INTO zone_restrictions
    FROM zones WHERE id = NEW.zone_id;
    
    -- Проверяем возрастные ограничения
    IF zone_restrictions ? 'min_age' AND child_age < (zone_restrictions->>'min_age')::INTEGER THEN
        INSERT INTO security_alerts (alert_type, child_id, session_id, zone_id, severity, message)
        SELECT 'age_restriction', bs.child_id, bs.id, NEW.zone_id, 'medium',
               'Child is too young for this zone'
        FROM bracelet_sessions bs WHERE bs.id = NEW.session_id;
    END IF;
    
    IF zone_restrictions ? 'max_age' AND child_age > (zone_restrictions->>'max_age')::INTEGER THEN
        INSERT INTO security_alerts (alert_type, child_id, session_id, zone_id, severity, message)
        SELECT 'age_restriction', bs.child_id, bs.id, NEW.zone_id, 'medium',
               'Child is too old for this zone'
        FROM bracelet_sessions bs WHERE bs.id = NEW.session_id;
    END IF;
    
    -- Проверяем родительские ограничения
    SELECT * INTO parent_controls
    FROM parental_controls pc
    JOIN bracelet_sessions bs ON pc.child_id = bs.child_id
    WHERE bs.id = NEW.session_id AND pc.is_active = true;
    
    IF parent_controls.id IS NOT NULL AND 
       NEW.zone_id = ANY(parent_controls.restricted_zones) THEN
        INSERT INTO security_alerts (alert_type, child_id, session_id, zone_id, severity, message)
        SELECT 'zone_violation', bs.child_id, bs.id, NEW.zone_id, 'high',
               'Child entered restricted zone'
        FROM bracelet_sessions bs WHERE bs.id = NEW.session_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_security_violations
    AFTER INSERT ON zone_entries
    FOR EACH ROW EXECUTE FUNCTION check_security_violations();

-- Вставка базовых зон
INSERT INTO zones (id, name, description, zone_type, age_restrictions, capacity) VALUES
('11111111-1111-1111-1111-111111111111', 'Main Entrance', 'Главный вход в игровой центр', 'entrance', '{}', 100),
('22222222-2222-2222-2222-222222222222', 'Toddler Zone', 'Игровая зона для малышей 0-3 года', 'play_area', '{"min_age": 0, "max_age": 3}', 20),
('33333333-3333-3333-3333-333333333333', 'Kids Zone', 'Активная зона для детей 4-7 лет', 'play_area', '{"min_age": 4, "max_age": 7}', 30),
('44444444-4444-4444-4444-444444444444', 'Teen Zone', 'Спортивная зона для детей 8+ лет', 'sports', '{"min_age": 8}', 25),
('55555555-5555-5555-5555-555555555555', 'Cafe Area', 'Кафе зона для отдыха', 'cafe', '{}', 40),
('66666666-6666-6666-6666-666666666666', 'Party Room 1', 'Комната для празднования дня рождения', 'party_room', '{}', 15),
('77777777-7777-7777-7777-777777777777', 'Party Room 2', 'Комната для празднования дня рождения', 'party_room', '{}', 15),
('88888888-8888-8888-8888-888888888888', 'Creative Workshop', 'Творческая мастерская', 'creative', '{"min_age": 3}', 20)
ON CONFLICT (id) DO NOTHING;

-- Вставка RFID считывателей
INSERT INTO rfid_readers (id, reader_code, zone_id, location_description, reader_type) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'READER-ENT-IN', '11111111-1111-1111-1111-111111111111', 'Главный вход - турникет входа', 'entry'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'READER-ENT-OUT', '11111111-1111-1111-1111-111111111111', 'Главный вход - турникет выхода', 'exit'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'READER-TOD-IN', '22222222-2222-2222-2222-222222222222', 'Вход в зону малышей', 'entry'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'READER-KID-IN', '33333333-3333-3333-3333-333333333333', 'Вход в детскую зону', 'entry'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'READER-TEE-IN', '44444444-4444-4444-4444-444444444444', 'Вход в подростковую зону', 'entry'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'READER-CAF-IN', '55555555-5555-5555-5555-555555555555', 'Вход в кафе', 'entry'),
('gggggggg-gggg-gggg-gggg-gggggggggggg', 'READER-P1-IN', '66666666-6666-6666-6666-666666666666', 'Вход в комнату праздников 1', 'entry'),
('hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'READER-P2-IN', '77777777-7777-7777-7777-777777777777', 'Вход в комнату праздников 2', 'entry'),
('iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', 'READER-CRE-IN', '88888888-8888-8888-8888-888888888888', 'Вход в творческую мастерскую', 'entry')
ON CONFLICT (reader_code) DO NOTHING;

-- Создание представлений для аналитики

-- Текущее состояние зон
CREATE OR REPLACE VIEW zone_status AS
SELECT 
    z.id,
    z.name,
    z.zone_type,
    z.current_occupancy,
    z.capacity,
    ROUND((z.current_occupancy::DECIMAL / z.capacity) * 100, 2) as occupancy_percentage,
    CASE 
        WHEN z.current_occupancy >= z.capacity THEN 'full'
        WHEN z.current_occupancy >= z.capacity * 0.8 THEN 'busy'
        WHEN z.current_occupancy >= z.capacity * 0.5 THEN 'moderate'
        ELSE 'available'
    END as status
FROM zones z
WHERE z.is_active = true;

-- Активные сессии с текущими зонами
CREATE OR REPLACE VIEW active_sessions_with_zones AS
SELECT 
    bs.*,
    b.bracelet_code,
    b.rfid_tag,
    c.name as child_name,
    c.age as child_age,
    p.name as parent_name,
    p.phone as parent_phone,
    tp.name as tariff_name,
    tp.price as tariff_price,
    z.name as current_zone_name,
    z.zone_type as current_zone_type
FROM bracelet_sessions bs
JOIN bracelets b ON bs.bracelet_id = b.id
JOIN children c ON bs.child_id = c.id
JOIN parents p ON bs.parent_id = p.id
JOIN tariff_plans tp ON bs.tariff_plan_id = tp.id
LEFT JOIN zones z ON bs.current_zone_id = z.id
WHERE bs.is_active = true;

-- Неразрешенные оповещения безопасности
CREATE OR REPLACE VIEW unresolved_security_alerts AS
SELECT 
    sa.*,
    c.name as child_name,
    p.name as parent_name,
    p.phone as parent_phone,
    z.name as zone_name
FROM security_alerts sa
JOIN children c ON sa.child_id = c.id
JOIN parents p ON c.parent_id = p.id
LEFT JOIN zones z ON sa.zone_id = z.id
WHERE sa.auto_resolved = false
ORDER BY sa.severity DESC, sa.created_at DESC;

-- Комментарии к новым таблицам
COMMENT ON TABLE zones IS 'Зоны игрового центра с ограничениями и вместимостью';
COMMENT ON TABLE rfid_readers IS 'RFID считыватели в различных зонах';
COMMENT ON TABLE rfid_events IS 'Сырые события от RFID считывателей';
COMMENT ON TABLE zone_entries IS 'Записи о пребывании детей в зонах';
COMMENT ON TABLE security_alerts IS 'Оповещения системы безопасности';
COMMENT ON TABLE child_achievements IS 'Достижения детей для геймификации';
COMMENT ON TABLE parental_controls IS 'Настройки родительского контроля';
COMMENT ON TABLE analytics_daily IS 'Ежедневная аналитика по зонам';

-- Готово! Теперь система поддерживает полное RFID зонирование и аналитику. 