-- ============================================================
-- UPDATE TEAM NAMES IN SUPABASE
-- ============================================================

-- Delete existing player teams (keep host team)
DELETE FROM scores WHERE team_id IN (1, 2, 3, 4, 5, 6);
DELETE FROM checkpoints WHERE team_id IN (1, 2, 3, 4, 5, 6);
DELETE FROM teams WHERE team_id IN (1, 2, 3, 4, 5, 6);

-- Insert new teams with auto-generated login codes
-- Team IDs: 1-6
INSERT INTO teams (team_id, team_name, login_code) VALUES
(1, 'HVL', 'hvl2026'),
(2, 'Người đẹp và hacker', 'nguoidep2026'),
(3, '4-Dimensional (4D)', '4d2026'),
(4, 'Blackpink', 'bpink2026'),
(5, 'PTLC', 'ptlc2026'),
(6, 'AI-T4', 'ait42026');

-- Insert scores for new teams
INSERT INTO scores (team_id, score, confirm_count) VALUES
(1, 0, 0),
(2, 0, 0),
(3, 0, 0),
(4, 0, 0),
(5, 0, 0),
(6, 0, 0);

-- Insert checkpoints for new teams
INSERT INTO checkpoints (team_id, finishedStations, atStation) VALUES
(1, '', 1),
(2, '', 1),
(3, '', 1),
(4, '', 1),
(5, '', 1),
(6, '', 1);

-- Verification query
SELECT team_id, team_name, login_code FROM teams ORDER BY team_id;
