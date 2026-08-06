-- ============================================================
-- UPDATE TEAM NAMES IN SUPABASE - Final list with Noname
-- ============================================================

-- Delete existing player teams (keep host team)
DELETE FROM scores WHERE team_id IN (1, 2, 3, 4, 5, 6, 7);
DELETE FROM checkpoints WHERE team_id IN (1, 2, 3, 4, 5, 6, 7);
DELETE FROM teams WHERE team_id IN (1, 2, 3, 4, 5, 6, 7);

-- Insert new teams (7 teams + Noname)
INSERT INTO teams (team_id, team_name, login_code) VALUES
(1, 'Noname', 'noname123'),
(2, 'HVL', 'hvl23'),
(3, 'GHacker', 'ghacker36'),
(4, '4D', '4444d'),
(5, 'blackpink', 'blackpink4444'),
(6, 'PTLC', 'ptlc123'),
(7, 'AI-T4', 'ait4321');

-- Insert scores for new teams
INSERT INTO scores (team_id, score, confirm_count) VALUES
(1, 0, 0),
(2, 0, 0),
(3, 0, 0),
(4, 0, 0),
(5, 0, 0),
(6, 0, 0),
(7, 0, 0);

-- Insert checkpoints for new teams
INSERT INTO checkpoints (team_id, finishedStations, atStation) VALUES
(1, '', 1),
(2, '', 1),
(3, '', 1),
(4, '', 1),
(5, '', 1),
(6, '', 1),
(7, '', 1);

-- Verification query
SELECT team_id, team_name, login_code FROM teams ORDER BY team_id;
