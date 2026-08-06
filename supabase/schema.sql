-- ============================================================
-- SUPABASE DATABASE SCHEMA FOR HACKATHON GAME
-- PostgreSQL version (migrated from SQLite)
-- ============================================================

-- Drop existing tables if they exist (clean slate)
DROP TABLE IF EXISTS score_adjustments CASCADE;
DROP TABLE IF EXISTS station_codes CASCADE;
DROP TABLE IF EXISTS hint_click CASCADE;
DROP TABLE IF EXISTS queues CASCADE;
DROP TABLE IF EXISTS checkpoints CASCADE;
DROP TABLE IF EXISTS scores CASCADE;
DROP TABLE IF EXISTS stations CASCADE;
DROP TABLE IF EXISTS teams CASCADE;

-- ============================================================
-- TEAMS TABLE
-- ============================================================
CREATE TABLE teams (
    team_id INTEGER PRIMARY KEY,
    team_name VARCHAR(100) NOT NULL,
    login_code VARCHAR(50) NOT NULL UNIQUE,
    role VARCHAR(20) DEFAULT 'player',
    mentor_code VARCHAR(50) DEFAULT NULL,
    login_time TIMESTAMP DEFAULT NULL
);

-- ============================================================
-- STATIONS TABLE
-- ============================================================
CREATE TABLE stations (
    station_id INTEGER PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    question TEXT,
    answer VARCHAR(100),
    room VARCHAR(100),
    hint1 TEXT,
    hint2 TEXT,
    hint3 TEXT
);

-- ============================================================
-- SCORES TABLE
-- ============================================================
CREATE TABLE scores (
    team_id INTEGER PRIMARY KEY REFERENCES teams(team_id) ON DELETE CASCADE,
    score INTEGER DEFAULT 0,
    confirm_count INTEGER DEFAULT 0
);

-- ============================================================
-- CHECKPOINTS TABLE
-- ============================================================
CREATE TABLE checkpoints (
    team_id INTEGER PRIMARY KEY REFERENCES teams(team_id) ON DELETE CASCADE,
    finishedStations TEXT DEFAULT '',
    atStation INTEGER DEFAULT 1,
    station_start_time TIMESTAMP DEFAULT NULL
);

-- ============================================================
-- STATION CODES TABLE (35 codes: 7 stations × 5 codes)
-- ============================================================
CREATE TABLE station_codes (
    station_id INTEGER REFERENCES stations(station_id) ON DELETE CASCADE,
    code_number INTEGER NOT NULL,
    code_value VARCHAR(20) NOT NULL,
    points INTEGER NOT NULL,
    used_by_team_id INTEGER DEFAULT NULL REFERENCES teams(team_id) ON DELETE SET NULL,
    used_at TIMESTAMP DEFAULT NULL,
    PRIMARY KEY (station_id, code_number)
);

-- ============================================================
-- QUEUES TABLE
-- ============================================================
CREATE TABLE queues (
    queue_id SERIAL PRIMARY KEY,
    position INTEGER NOT NULL,
    team_id INTEGER NOT NULL REFERENCES teams(team_id) ON DELETE CASCADE,
    station_id INTEGER REFERENCES stations(station_id) ON DELETE CASCADE
);

-- ============================================================
-- HINT CLICK TABLE
-- ============================================================
CREATE TABLE hint_click (
    team_id INTEGER REFERENCES teams(team_id) ON DELETE CASCADE,
    question_id INTEGER REFERENCES stations(station_id) ON DELETE CASCADE,
    clicked BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (team_id, question_id)
);

-- ============================================================
-- SCORE ADJUSTMENTS TABLE
-- ============================================================
CREATE TABLE score_adjustments (
    id SERIAL PRIMARY KEY,
    team_id INTEGER NOT NULL REFERENCES teams(team_id) ON DELETE CASCADE,
    points_change INTEGER NOT NULL,
    reason TEXT,
    adjusted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- INSERT DATA: 7 STATIONS
-- ============================================================
INSERT INTO stations (station_id, name, question, room) VALUES
(1, 'Thử thách 1', 'Question 1 here', 'Room 1'),
(2, 'Thử thách 2', 'Question 2 here', 'Room 2'),
(3, 'Thử thách 3', 'Question 3 here', 'Room 3'),
(4, 'Thử thách 4', 'Question 4 here', 'Room 4'),
(5, 'Thử thách 5', 'Question 5 here', 'Room 5'),
(6, 'Thử thách 6', 'Question 6 here', 'Room 6'),
(7, 'Thử thách 7', 'Question 7 here', 'Room 7');

-- ============================================================
-- INSERT DATA: STATION CODES (35 codes)
-- ============================================================
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

-- ============================================================
-- INSERT DATA: INITIAL TEAMS
-- ============================================================
INSERT INTO teams (team_id, team_name, login_code) VALUES
(1, 'HVL', 'hvl2026'),
(2, 'Người đẹp và hacker', 'nguoidep2026'),
(3, '4-Dimensional (4D)', '4d2026'),
(4, 'Blackpink', 'bpink2026'),
(5, 'PTLC', 'ptlc2026'),
(6, 'AI-T4', 'ait42026');

-- Host team
INSERT INTO teams (team_id, team_name, login_code, role) VALUES
(999999, 'Giám sát', 'host2026', 'host');

-- ============================================================
-- INSERT DATA: INITIAL SCORES
-- ============================================================
INSERT INTO scores (team_id, score, confirm_count) VALUES
(1, 0, 0),
(2, 0, 0),
(3, 0, 0),
(4, 0, 0),
(5, 0, 0),
(6, 0, 0),
(999999, 0, 0);

-- ============================================================
-- INSERT DATA: INITIAL CHECKPOINTS
-- ============================================================
INSERT INTO checkpoints (team_id, finishedStations, atStation) VALUES
(1, '', 1),
(2, '', 1),
(3, '', 1),
(4, '', 1),
(5, '', 1),
(6, '', 1),
(999999, '', 1);

-- ============================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================================
CREATE INDEX idx_teams_login_code ON teams(login_code);
CREATE INDEX idx_teams_role ON teams(role);
CREATE INDEX idx_station_codes_code_value ON station_codes(code_value);
CREATE INDEX idx_station_codes_used_by ON station_codes(used_by_team_id);
CREATE INDEX idx_scores_team_id ON scores(team_id);
CREATE INDEX idx_checkpoints_team_id ON checkpoints(team_id);
CREATE INDEX idx_hint_click_team ON hint_click(team_id);
CREATE INDEX idx_queues_team_id ON queues(team_id);
CREATE INDEX idx_queues_station_id ON queues(station_id);
