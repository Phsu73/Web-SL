-- ============================================================
-- HACKATHON GAME DATABASE SCHEMA (SQLite - Local Development)
-- For production, use Supabase PostgreSQL
-- ============================================================

CREATE TABLE stations (
    station_id INTEGER PRIMARY KEY,
    name VARCHAR,
    question TEXT,
    answer VARCHAR,
    room VARCHAR,
    hint1 TEXT,
    hint2 TEXT,
    hint3 TEXT
);

CREATE TABLE teams (
    team_id INTEGER PRIMARY KEY,
    team_name VARCHAR,
    login_code VARCHAR,
    role VARCHAR DEFAULT 'player',
    mentor_code VARCHAR DEFAULT NULL,
    login_time DATETIME
);

CREATE TABLE scores (
    team_id INTEGER,
    score INTEGER,
    confirm_count INTEGER DEFAULT 0,
    FOREIGN KEY (team_id) REFERENCES teams(team_id)
);

CREATE TABLE checkpoints (
    team_id INTEGER,
    finishedStations VARCHAR,
    atStation INTEGER,
    station_start_time DATETIME,
    FOREIGN KEY (team_id) REFERENCES teams(team_id),
    FOREIGN KEY (atStation) REFERENCES stations(station_id)
);

CREATE TABLE score_adjustments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    team_id INTEGER,
    points_change INTEGER,
    reason VARCHAR,
    adjusted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(team_id)
);

CREATE TABLE station_codes (
    station_id INTEGER,
    code_number INTEGER NOT NULL,
    code_value VARCHAR NOT NULL,
    points INTEGER NOT NULL,
    used_by_team_id INTEGER DEFAULT NULL,
    used_at DATETIME DEFAULT NULL,
    PRIMARY KEY (station_id, code_number),
    FOREIGN KEY (station_id) REFERENCES stations(station_id),
    FOREIGN KEY (used_by_team_id) REFERENCES teams(team_id)
);

CREATE TABLE queues (
    queue_id INTEGER,
    position INTEGER NOT NULL,
    team_id INTEGER NOT NULL,
    FOREIGN KEY (team_id) REFERENCES teams(team_id),
    FOREIGN KEY (station_id) REFERENCES stations(station_id)
);

CREATE TABLE hint_click (
    team_id INTEGER,
    question_id INTEGER,
    clicked BOOLEAN DEFAULT 0,
    PRIMARY KEY (team_id, question_id),
    FOREIGN KEY (team_id) REFERENCES teams(team_id),
    FOREIGN KEY (question_id) REFERENCES stations(station_id)
);

-- ============================================================
-- INSERT STATIONS (7 stations)
-- ============================================================
INSERT INTO stations (station_id, name) VALUES
(1, 'Thử thách 1'),
(2, 'Thử thách 2'),
(3, 'Thử thách 3'),
(4, 'Thử thách 4'),
(5, 'Thử thách 5'),
(6, 'Thử thách 6'),
(7, 'Thử thách 7');

-- ============================================================
-- INSERT STATION CODES (35 codes: 7 stations × 5 codes)
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
-- INSERT TEAMS (6 teams + 1 host)
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
-- INSERT SCORES
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
-- INSERT CHECKPOINTS
-- ============================================================
INSERT INTO checkpoints (team_id, finishedStations, atStation) VALUES
(1, '', 1),
(2, '', 1),
(3, '', 1),
(4, '', 1),
(5, '', 1),
(6, '', 1),
(999999, '', 1);
