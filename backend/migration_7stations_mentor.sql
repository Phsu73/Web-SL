-- ============================================================
-- HACKATHON GAME MIGRATION: 7 Stations + Mentor Code System
-- ============================================================
-- This migration adds:
-- 1. 7 stations (up from 5)
-- 2. station_codes table (35 codes: 7 stations × 5 codes)
-- 3. mentor_code column to teams table
-- 4. Resets checkpoints for new game
-- ============================================================

-- STEP 1: Add mentor_code column to teams table
ALTER TABLE teams ADD COLUMN mentor_code VARCHAR DEFAULT NULL;

-- STEP 2: Create station_codes table
CREATE TABLE IF NOT EXISTS station_codes (
    station_id INTEGER,
    code_number INTEGER,  -- 1-5 for each station
    code_value VARCHAR,   -- The actual code string
    points INTEGER,       -- 10, 20, 30, 40, 50
    used_by_team_id INTEGER DEFAULT NULL,  -- Track which team used which code
    used_at DATETIME DEFAULT NULL,
    PRIMARY KEY (station_id, code_number),
    FOREIGN KEY (station_id) REFERENCES stations(station_id),
    FOREIGN KEY (used_by_team_id) REFERENCES teams(team_id)
);

-- STEP 3: Clear existing stations and insert 7 new stations
DELETE FROM stations;
INSERT INTO stations (station_id, name) VALUES
(1, 'Thử thách 1'),
(2, 'Thử thách 2'),
(3, 'Thử thách 3'),
(4, 'Thử thách 4'),
(5, 'Thử thách 5'),
(6, 'Thử thách 6'),
(7, 'Thử thách 7');

-- STEP 4: Insert 35 codes (7 stations × 5 codes each)
-- Format: (station_id, code_number, code_value, points)
DELETE FROM station_codes;
INSERT INTO station_codes (station_id, code_number, code_value, points) VALUES
-- Station 1
(1, 1, 'X7B9K2M', 10), (1, 2, '4P8L1QW', 20), (1, 3, 'T5V3N8Z', 30), (1, 4, '2Y6C9R4', 40), (1, 5, 'J1H7M4K', 50),
-- Station 2
(2, 1, '8D5F2G9', 10), (2, 2, 'W3N6T1P', 20), (2, 3, '7K4R8Y2', 30), (2, 4, 'M9L2B5C', 40), (2, 5, '5Q1V7Z3', 50),
-- Station 3
(3, 1, 'H8J3F6X', 10), (3, 2, '6G9P4N1', 20), (3, 3, 'B2M5K8T', 30), (3, 4, '3R7Y1C6', 40), (3, 5, 'V4Z9L2H', 50),
-- Station 4
(4, 1, '9N6W3P8', 10), (4, 2, 'F1D8G5J', 20), (4, 3, '2C5B9M4', 30), (4, 4, 'K7T2R6Y', 40), (4, 5, '8X3F1V9', 50),
-- Station 5
(5, 1, 'P6N9L4W', 10), (5, 2, '1Z7Q3H5', 20), (5, 3, 'M4K8B2C', 30), (5, 4, '5Y1R7T6', 40), (5, 5, 'G9F3D8J', 50),
-- Station 6
(6, 1, '3W6P9N2', 10), (6, 2, 'H2L5V8Z', 20), (6, 3, '7C4M1B9', 30), (6, 4, 'R8Y3K6T', 40), (6, 5, '4J9G2F5', 50),
-- Station 7
(7, 1, 'N1P7W4L', 10), (7, 2, '6V2Z8H3', 20), (7, 3, 'B5M9C1R', 30), (7, 4, '9T6K3Y7', 40), (7, 5, 'X2F5J8D', 50);

-- STEP 5: Reset checkpoints for 7 stations
UPDATE checkpoints SET finishedStations = '', atStation = 1, station_start_time = NULL;

-- STEP 6: Reset scores for new game
UPDATE scores SET score = 0, confirm_count = 0;

-- STEP 7: Clear hint_click table
DELETE FROM hint_click;

-- STEP 8: Clear queues
DELETE FROM queues;

-- ============================================================
-- Verification queries (run these to verify migration)
-- ============================================================
-- SELECT COUNT(*) FROM stations;  -- Should be 7
-- SELECT COUNT(*) FROM station_codes;  -- Should be 35
-- SELECT * FROM stations ORDER BY station_id;
-- SELECT * FROM station_codes ORDER BY station_id, code_number;
