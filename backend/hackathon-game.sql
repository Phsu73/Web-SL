CREATE TABLE stations (
    station_id INTEGER PRIMARY KEY,
    name VARCHAR,
    answer VARCHAR
);

CREATE TABLE teams (
    team_id INTEGER PRIMARY KEY,
    team_name VARCHAR,
    login_code VARCHAR,
    role VARCHAR DEFAULT 'player',
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

INSERT INTO stations (station_id, name, answer) VALUES
(1, 'Thử thách 1', 'ANSWER1'),
(2, 'Thử thách 2', 'ANSWER2'),
(3, 'Thử thách 3', 'ANSWER3'),
(4, 'Thử thách 4', 'ANSWER4'),
(5, 'Thử thách 5', 'ANSWER5');

INSERT INTO teams (team_id, team_name, login_code) VALUES (000001, '3AE', '3ae123');
INSERT INTO teams (team_id, team_name, login_code) VALUES (000002, '5 đứa', '5dua45');
INSERT INTO teams (team_id, team_name, login_code) VALUES (000003, 'Nguyễn Huệ', 'nguyenhue');
INSERT INTO teams (team_id, team_name, login_code) VALUES (000004, 'Tò Te Tí Tèo', 'totetiteo');
INSERT INTO teams (team_id, team_name, login_code) VALUES (000005, 'Trio Trường Chinh', 'triotruongchinh');
INSERT INTO teams (team_id, team_name, login_code) VALUES (000006, 'Team ghép đội', 'teamghep');
INSERT INTO teams (team_id, team_name, login_code, role) VALUES (999999, 'Giám sát', 'host2026', 'host');

INSERT INTO scores (team_id, score) VALUES (000001, 0);
INSERT INTO scores (team_id, score) VALUES (000002, 0);
INSERT INTO scores (team_id, score) VALUES (000003, 0);
INSERT INTO scores (team_id, score) VALUES (000004, 0);
INSERT INTO scores (team_id, score) VALUES (000005, 0);
INSERT INTO scores (team_id, score) VALUES (000006, 0);

INSERT INTO checkpoints (team_id, finishedStations, atStation) VALUES (000001, '', 1);
INSERT INTO checkpoints (team_id, finishedStations, atStation) VALUES (000002, '', 1);
INSERT INTO checkpoints (team_id, finishedStations, atStation) VALUES (000003, '', 1);
INSERT INTO checkpoints (team_id, finishedStations, atStation) VALUES (000004, '', 1);
INSERT INTO checkpoints (team_id, finishedStations, atStation) VALUES (000005, '', 1);
INSERT INTO checkpoints (team_id, finishedStations, atStation) VALUES (000006, '', 1);
