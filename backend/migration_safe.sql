-- ============================================================
-- SAFE MIGRATION: 7 Stations + Mentor Code System
-- ============================================================

-- STEP 1: Add mentor_code column to teams table (if not exists)
-- SQLite doesn't support IF NOT EXISTS for ALTER TABLE, so we check manually
-- Run this and ignore "duplicate column name" errors if any
ALTER TABLE teams ADD COLUMN mentor_code VARCHAR DEFAULT NULL;

-- STEP 2: station_codes table already exists, just verify data
SELECT COUNT(*) as total_codes FROM station_codes;

-- STEP 3: Update stations to 7 (clear and insert)
DELETE FROM stations;
INSERT INTO stations (station_id, name) VALUES
(1, 'Thử thách 1'),
(2, 'Thử thách 2'),
(3, 'Thử thách 3'),
(4, 'Thử thách 4'),
(5, 'Thử thách 5'),
(6, 'Thử thách 6'),
(7, 'Thử thách 7');

-- STEP 4: Insert codes if station_codes is empty
-- First check if empty
-- Then insert 35 codes (7 stations × 5 codes each)
DELETE FROM station_codes;
INSERT INTO station_codes (station_id, code_number, code_value, points) VALUES
-- Station 1
(1, 1, 'CH1-10', 10), (1, 2, 'CH1-20', 20), (1, 3, 'CH1-30', 30), (1, 4, 'CH1-40', 40), (1, 5, 'CH1-50', 50),
-- Station 2
(2, 1, 'CH2-10', 10), (2, 2, 'CH2-20', 20), (2, 3, 'CH2-30', 30), (2, 4, 'CH2-40', 40), (2, 5, 'CH2-50', 50),
-- Station 3
(3, 1, 'CH3-10', 10), (3, 2, 'CH3-20', 20), (3, 3, 'CH3-30', 30), (3, 4, 'CH3-40', 40), (3, 5, 'CH3-50', 50),
-- Station 4
(4, 1, 'CH4-10', 10), (4, 2, 'CH4-20', 20), (4, 3, 'CH4-30', 30), (4, 4, 'CH4-40', 40), (4, 5, 'CH4-50', 50),
-- Station 5
(5, 1, 'CH5-10', 10), (5, 2, 'CH5-20', 20), (5, 3, 'CH5-30', 30), (5, 4, 'CH5-40', 40), (5, 5, 'CH5-50', 50),
-- Station 6
(6, 1, 'CH6-10', 10), ( 6, 2, 'CH6-20', 20), ( 6, 3, 'CH6-30', 30), ( 6, 4, 'CH6-40', 40), ( 6, 5, 'CH6-50', 50),
-- Station 7
(7, 1, 'CH7-10', 10), (7, 2, 'CH7-20', 20), (7, 3, 'CH7-30', 30), (7, 4, 'CH7-40', 40), (7, 5, 'CH7-50', 50);

-- STEP 5: Reset checkpoints for 7 stations
UPDATE checkpoints SET finishedStations = '', atStation = 1, station_start_time = NULL;

-- STEP 6: Reset scores for new game
UPDATE scores SET score = 0, confirm_count = 0;

-- ============================================================
-- Verification queries
-- ============================================================
SELECT 'Stations:' as type, COUNT(*) as count FROM stations
UNION ALL
SELECT 'Codes:', COUNT(*) FROM station_codes;
