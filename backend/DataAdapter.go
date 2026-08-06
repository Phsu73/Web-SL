package main

import (
	"database/sql"
	"fmt"
	"os"
	"strconv"
	"sync"
	"time"

	_ "modernc.org/sqlite"
)

// Đường dẫn tới database SQLite - có thể set qua environment variable
func getDBPath() string {
	if path := os.Getenv("DB_PATH"); path != "" {
		return path
	}
	return "./hackathon-game.db" // Fallback cho local development
}

var (
	dbMutex            sync.RWMutex // Đảm bảo an toàn concurrency đọc/ghi file local
	loginTimeMutex     sync.RWMutex
	fallbackLoginTimes = make(map[int]time.Time)
)

// ==========================================
// CÁC HÀM LIÊN QUAN ĐẾN ĐĂNG NHẬP & PHIÊN
// ==========================================

func saveAndLoadLoginTime(teamID int, loginTime time.Time) (time.Time, error) {
	dbMutex.Lock()
	defer dbMutex.Unlock()

	db, err := sql.Open("sqlite", getDBPath())
	if err != nil {
		fmt.Printf("WARNING: cannot open DB for login_time save: %v. Using in-memory fallback.\n", err)
		loginTimeMutex.Lock()
		fallbackLoginTimes[teamID] = loginTime
		loginTimeMutex.Unlock()
		return loginTime, nil
	}
	defer db.Close()

	// Store as Unix timestamp to avoid timezone issues
	timestamp := loginTime.Unix()
	fmt.Printf("Attempting to UPDATE teams SET login_time=%d WHERE team_id=%d\n", timestamp, teamID)
	_, err = db.Exec("UPDATE teams SET login_time = ? WHERE team_id = ?",
		timestamp, teamID)
	if err != nil {
		fmt.Printf("WARNING: database login_time update failed: %v. Using in-memory fallback.\n", err)
		loginTimeMutex.Lock()
		fallbackLoginTimes[teamID] = loginTime
		loginTimeMutex.Unlock()
		return loginTime, nil
	}
	fmt.Printf("Successfully updated login_time for team %d\n", teamID)

	// Query back the login_time - could be Unix timestamp (int) or DATETIME string
	var existingTimestamp interface{}
	err = db.QueryRow("SELECT login_time FROM teams WHERE team_id = ?", teamID).Scan(&existingTimestamp)
	if err != nil {
		fmt.Printf("WARNING: query login time failed: %v. Using in-memory fallback.\n", err)
		loginTimeMutex.Lock()
		fallbackLoginTimes[teamID] = loginTime
		loginTimeMutex.Unlock()
		return loginTime, nil
	}
	fmt.Printf("Queried login_time: %v (type: %T)\n", existingTimestamp, existingTimestamp)

	var resLoginTime time.Time
	switch v := existingTimestamp.(type) {
	case time.Time:
		resLoginTime = v
	case int64:
		resLoginTime = time.Unix(v, 0)
	case string:
		// Try parsing as Unix timestamp string or RFC3339
		if ts, err := strconv.ParseInt(v, 10, 64); err == nil {
			resLoginTime = time.Unix(ts, 0)
		} else if parsedTime, err := time.Parse(time.RFC3339, v); err == nil {
			resLoginTime = parsedTime
		} else {
			return time.Time{}, fmt.Errorf("cannot parse login_time string: %v", err)
		}
	default:
		return time.Time{}, fmt.Errorf("unexpected login_time type: %T", v)
	}
	return resLoginTime, nil
}

func checkSessionValidity(teamID int) (bool, int, error) {
	// No time limit - session never expires
	return true, -1, nil
}

// ==========================================
// CÁC HÀM TẢI CÂU HỎI & GỢI Ý (STATIONS)
// ==========================================

func loadQuestion(stationID int) (string, error) {
	db, err := sql.Open("sqlite", getDBPath())
	if err != nil {
		return "", fmt.Errorf("open DB local: %v", err)
	}
	defer db.Close()

	var question string
	err = db.QueryRow("SELECT question FROM stations WHERE station_id = ?", stationID).Scan(&question)
	if err != nil {
		return "", fmt.Errorf("query question: %v", err)
	}
	return question, nil
}

func loadHint(stationID int, hintNum int) (string, error) {
	db, err := sql.Open("sqlite", getDBPath())
	if err != nil {
		return "", fmt.Errorf("open DB local: %v", err)
	}
	defer db.Close()

	var hint string
	query := fmt.Sprintf("SELECT hint%d FROM stations WHERE station_id = ?", hintNum)
	err = db.QueryRow(query, stationID).Scan(&hint)
	if err != nil {
		return "", fmt.Errorf("query hint: %v", err)
	}
	return hint, nil
}

func loadCorrectAnswer(stationID int) (string, error) {
	db, err := sql.Open("sqlite", getDBPath())
	if err != nil {
		return "", fmt.Errorf("open DB local: %v", err)
	}
	defer db.Close()

	var answer string
	err = db.QueryRow("SELECT answer FROM stations WHERE station_id = ?", stationID).Scan(&answer)
	if err != nil {
		return "", fmt.Errorf("query answer: %v", err)
	}
	return answer, nil
}

func loadRoom(stationID int) (string, error) {
	db, err := sql.Open("sqlite", getDBPath())
	if err != nil {
		return "", fmt.Errorf("open DB local: %v", err)
	}
	defer db.Close()

	var room string
	err = db.QueryRow("SELECT room FROM stations WHERE station_id = ?", stationID).Scan(&room)
	if err != nil {
		return "", fmt.Errorf("query room: %v", err)
	}
	return room, nil
}

// ==========================================
// CÁC HÀM QUẢN LÝ TIẾN ĐỘ & ĐIỂM SỐ
// ==========================================

func loadScore(teamID int) (int, error) {
	db, err := sql.Open("sqlite", getDBPath())
	if err != nil {
		return -1, fmt.Errorf("open DB local: %v", err)
	}
	defer db.Close()

	var score int
	err = db.QueryRow("SELECT score FROM scores WHERE team_id = ?", teamID).Scan(&score)
	if err != nil {
		return -1, fmt.Errorf("query score: %v", err)
	}
	return score, nil
}

func saveScore(teamID int, score int) error {
	dbMutex.Lock()
	defer dbMutex.Unlock()

	db, err := sql.Open("sqlite", getDBPath())
	if err != nil {
		return fmt.Errorf("open DB local: %v", err)
	}
	defer db.Close()

	_, err = db.Exec("UPDATE scores SET score = ? WHERE team_id = ?", score, teamID)
	if err != nil {
		return fmt.Errorf("update score failed: %v", err)
	}
	return nil
}

func loadHintClicked(teamID int, questionID int) (int, error) {
	db, err := sql.Open("sqlite", getDBPath())
	if err != nil {
		return -1, fmt.Errorf("open DB local: %v", err)
	}
	defer db.Close()

	var hintClicked int
	err = db.QueryRow("SELECT clicked FROM hint_click WHERE team_id = ? AND question_id = ?", teamID, questionID).Scan(&hintClicked)
	if err == sql.ErrNoRows {
		return 0, nil
	}
	if err != nil {
		return -1, fmt.Errorf("query hint clicked: %v", err)
	}
	return hintClicked, nil
}

func saveHintClicked(teamID int, questionID int, clicked int) error {
	dbMutex.Lock()
	defer dbMutex.Unlock()

	db, err := sql.Open("sqlite", getDBPath())
	if err != nil {
		return fmt.Errorf("open DB local: %v", err)
	}
	defer db.Close()

	var currentClicked int
	err = db.QueryRow("SELECT clicked FROM hint_click WHERE team_id = ? AND question_id = ?", teamID, questionID).Scan(&currentClicked)
	if err != nil && err != sql.ErrNoRows {
		return fmt.Errorf("check current hint click failed: %v", err)
	}

	if currentClicked < clicked {
		res, err := db.Exec("UPDATE hint_click SET clicked = ? WHERE team_id = ? AND question_id = ?", clicked, teamID, questionID)
		if err != nil {
			return fmt.Errorf("update hint_click failed: %v", err)
		}
		rows, err := res.RowsAffected()
		if err != nil {
			return fmt.Errorf("checking rows affected: %v", err)
		}
		if rows == 0 {
			_, err := db.Exec("INSERT INTO hint_click (team_id, question_id, clicked) VALUES (?, ?, ?)", teamID, questionID, clicked)
			if err != nil {
				return fmt.Errorf("insert hint_click failed: %v", err)
			}
		}
	}
	return nil
}

// ==========================================
// CÁC HÀM QUẢN LÝ TRẠM CỦA ĐỘI (CHECKPOINTS)
// ==========================================

func addCurrentStation(teamID int, stationID int) error {
	dbMutex.Lock()
	defer dbMutex.Unlock()

	db, err := sql.Open("sqlite", getDBPath())
	if err != nil {
		return fmt.Errorf("open DB local: %v", err)
	}
	defer db.Close()

	_, err = db.Exec("UPDATE checkpoints SET atStation = ?, station_start_time = CURRENT_TIMESTAMP WHERE team_id = ?", stationID, teamID)
	if err != nil {
		return fmt.Errorf("update current station: %v", err)
	}
	return nil
}

func loadCurrentStation(teamID int) (int, error) {
	db, err := sql.Open("sqlite", getDBPath())
	if err != nil {
		return -1, fmt.Errorf("open DB local: %v", err)
	}
	defer db.Close()

	var currentStation int
	err = db.QueryRow("SELECT atStation FROM checkpoints WHERE team_id = ?", teamID).Scan(&currentStation)
	if err != nil {
		return -1, fmt.Errorf("query current station: %v", err)
	}
	return currentStation, nil
}

func loadStationStartTime(teamID int) (time.Time, error) {
	db, err := sql.Open("sqlite", getDBPath())
	if err != nil {
		return time.Time{}, fmt.Errorf("open DB local: %v", err)
	}
	defer db.Close()

	var startTime time.Time
	err = db.QueryRow("SELECT station_start_time FROM checkpoints WHERE team_id = ?", teamID).Scan(&startTime)
	if err != nil {
		return time.Time{}, fmt.Errorf("query station start time: %v", err)
	}
	return startTime, nil
}

func removeCurrentStation(teamID int) error {
	dbMutex.Lock()
	defer dbMutex.Unlock()

	db, err := sql.Open("sqlite", getDBPath())
	if err != nil {
		return fmt.Errorf("open DB local: %v", err)
	}
	defer db.Close()

	_, err = db.Exec("UPDATE checkpoints SET atStation = 0 WHERE team_id = ?", teamID)
	if err != nil {
		return fmt.Errorf("update current station: %v", err)
	}
	return nil
}

func loadFinishedStations(teamID int) (string, error) {
	db, err := sql.Open("sqlite", getDBPath())
	if err != nil {
		return "", fmt.Errorf("open DB local: %v", err)
	}
	defer db.Close()

	var finishedStations string
	err = db.QueryRow("SELECT finishedStations FROM checkpoints WHERE team_id = ?", teamID).Scan(&finishedStations)
	if err != nil {
		return "", fmt.Errorf("query finished stations: %v", err)
	}
	return finishedStations, nil
}

func updateProgress(teamID int, stationID int) (bool, error) {
	dbMutex.Lock()
	defer dbMutex.Unlock()

	db, err := sql.Open("sqlite", getDBPath())
	if err != nil {
		return false, fmt.Errorf("open DB local: %v", err)
	}
	defer db.Close()

	var currentStation int
	err = db.QueryRow("SELECT atStation FROM checkpoints WHERE team_id = ?", teamID).Scan(&currentStation)
	if err != nil {
		return false, fmt.Errorf("query atStation failed: %v", err)
	}
	if currentStation != stationID {
		return false, nil
	}
	var finishedStations string
	err = db.QueryRow("SELECT finishedStations FROM checkpoints WHERE team_id = ?", teamID).Scan(&finishedStations)
	if err != nil {
		return false, fmt.Errorf("query finished stations failed: %v", err)
	}

	updatedFinished := appendFinishedStation(finishedStations, stationID)
	_, err = db.Exec("UPDATE checkpoints SET finishedStations = ? WHERE team_id = ?", updatedFinished, teamID)
	if err != nil {
		return false, fmt.Errorf("update progress: %v", err)
	}
	return true, nil
}

// ==========================================
// CÁC HÀM XÁC THỰC & QUẢN LÝ HÀNG ĐỢI DƯỚI SQL
// ==========================================

func loadLoginInfo(teamID int) (string, error) {
	db, err := sql.Open("sqlite", getDBPath())
	if err != nil {
		return "", fmt.Errorf("open DB local: %v", err)
	}
	defer db.Close()

	var loginCode string
	err = db.QueryRow("SELECT login_code FROM teams WHERE team_id = ?", teamID).Scan(&loginCode)
	if err != nil {
		return "", fmt.Errorf("query login_code: %v", err)
	}
	return loginCode, nil
}

func addQueue(teamID int, questionID int) (bool, error) {
	dbMutex.Lock()
	defer dbMutex.Unlock()

	db, err := sql.Open("sqlite", getDBPath())
	if err != nil {
		return false, fmt.Errorf("open DB local: %v", err)
	}
	defer db.Close()

	var existingPosition int
	err = db.QueryRow(`SELECT position FROM queues WHERE queue_id = ? AND team_id = ?`, questionID, teamID).Scan(&existingPosition)
	if err == nil {
		return true, nil
	} else if err != sql.ErrNoRows {
		return false, fmt.Errorf("failed to check existing queue position: %v", err)
	}

	var count int
	err = db.QueryRow(`SELECT COUNT(*) FROM queues WHERE queue_id = ?`, questionID).Scan(&count)
	if err != nil {
		return false, fmt.Errorf("failed to count queue: %v", err)
	}

	if count >= 2 { // Giới hạn luật chơi: Không quá 2 đội tại một Trụ
		return false, nil
	}

	position := count + 1

	_, err = db.Exec(`
		INSERT INTO queues (queue_id, position, team_id)
		VALUES (?, ?, ?)`, questionID, position, teamID)
	if err != nil {
		return false, fmt.Errorf("insert into queues: %v", err)
	}

	return true, nil
}

func removeQueue(teamID int, questionID int) error {
	dbMutex.Lock()
	defer dbMutex.Unlock()

	db, err := sql.Open("sqlite", getDBPath())
	if err != nil {
		return fmt.Errorf("open DB local: %v", err)
	}
	defer db.Close()

	var pos int
	err = db.QueryRow(`SELECT position FROM queues WHERE queue_id = ? AND team_id = ?`, questionID, teamID).Scan(&pos)
	if err == sql.ErrNoRows {
		return nil
	} else if err != nil {
		return fmt.Errorf("failed to find team position: %v", err)
	}

	_, err = db.Exec(`DELETE FROM queues WHERE queue_id = ? AND team_id = ?`, questionID, teamID)
	if err != nil {
		return fmt.Errorf("failed to delete team from queue: %v", err)
	}

	_, err = db.Exec(`
		UPDATE queues
		SET position = position - 1
		WHERE queue_id = ? AND position > ?
	`, questionID, pos)
	if err != nil {
		return fmt.Errorf("failed to shift queue: %v", err)
	}

	return nil
}

// ==========================================
// CÁC HÀM QUẢN LÝ STATION CODES & MENTOR
// ==========================================

// StationCode represents a code for a station
type StationCode struct {
	StationID  int
	CodeNumber int
	CodeValue  string
	Points     int
}

// loadStationCode retrieves a station code by its value
func loadStationCode(stationID int, codeValue string) (*StationCode, error) {
	db, err := sql.Open("sqlite", getDBPath())
	if err != nil {
		return nil, fmt.Errorf("open DB local: %v", err)
	}
	defer db.Close()

	var code StationCode
	err = db.QueryRow(`
		SELECT station_id, code_number, code_value, points
		FROM station_codes
		WHERE station_id = ? AND code_value = ?
	`, stationID, codeValue).Scan(&code.StationID, &code.CodeNumber, &code.CodeValue, &code.Points)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("code not found")
		}
		return nil, fmt.Errorf("query station code: %v", err)
	}

	return &code, nil
}

// isCodeAlreadyUsed checks if a team has already used a specific code
func isCodeAlreadyUsed(teamID int, stationID int, codeValue string) (bool, error) {
	db, err := sql.Open("sqlite", getDBPath())
	if err != nil {
		return false, fmt.Errorf("open DB local: %v", err)
	}
	defer db.Close()

	var usedByTeamID sql.NullInt64
	err = db.QueryRow(`
		SELECT used_by_team_id
		FROM station_codes
		WHERE station_id = ? AND code_value = ?
	`, stationID, codeValue).Scan(&usedByTeamID)

	if err != nil {
		if err == sql.ErrNoRows {
			return false, nil
		}
		return false, fmt.Errorf("query code usage: %v", err)
	}

	// Code is used if used_by_team_id is not null and matches our team
	if usedByTeamID.Valid && int(usedByTeamID.Int64) == teamID {
		return true, nil
	}

	return false, nil
}

// markCodeAsUsed marks a station code as used by a team
func markCodeAsUsed(teamID int, stationID int, codeValue string) error {
	dbMutex.Lock()
	defer dbMutex.Unlock()

	db, err := sql.Open("sqlite", getDBPath())
	if err != nil {
		return fmt.Errorf("open DB local: %v", err)
	}
	defer db.Close()

	_, err = db.Exec(`
		UPDATE station_codes
		SET used_by_team_id = ?, used_at = CURRENT_TIMESTAMP
		WHERE station_id = ? AND code_value = ?
	`, teamID, stationID, codeValue)

	if err != nil {
		return fmt.Errorf("mark code as used: %v", err)
	}

	return nil
}

// hasTeamCompletedStation checks if a team has already completed a station
func hasTeamCompletedStation(teamID int, stationID int) (bool, error) {
	finishedStations, err := loadFinishedStations(teamID)
	if err != nil {
		return false, err
	}
	return containsStation(finishedStations, stationID), nil
}

// generateMentorCode generates a unique mentor code for a team
func generateMentorCode(teamID int) (string, error) {
	dbMutex.Lock()
	defer dbMutex.Unlock()

	db, err := sql.Open("sqlite", getDBPath())
	if err != nil {
		return "", fmt.Errorf("open DB local: %v", err)
	}
	defer db.Close()

	// Generate random 6-character code
	code := fmt.Sprintf("MENTOR-%d-%s", teamID, randomString(4))

	_, err = db.Exec(`UPDATE teams SET mentor_code = ? WHERE team_id = ?`, code, teamID)
	if err != nil {
		return "", fmt.Errorf("save mentor code: %v", err)
	}

	return code, nil
}

// validateMentorCode checks if a mentor code is valid and returns the associated team ID
func validateMentorCode(mentorCode string) (int, error) {
	db, err := sql.Open("sqlite", getDBPath())
	if err != nil {
		return 0, fmt.Errorf("open DB local: %v", err)
	}
	defer db.Close()

	var teamID int
	err = db.QueryRow(`SELECT team_id FROM teams WHERE mentor_code = ?`, mentorCode).Scan(&teamID)
	if err != nil {
		if err == sql.ErrNoRows {
			return 0, fmt.Errorf("invalid mentor code")
		}
		return 0, fmt.Errorf("query mentor code: %v", err)
	}

	return teamID, nil
}

// getAllMentorCodes retrieves all mentor codes for admin display
func getAllMentorCodes() ([]map[string]interface{}, error) {
	db, err := sql.Open("sqlite", getDBPath())
	if err != nil {
		return nil, fmt.Errorf("open DB local: %v", err)
	}
	defer db.Close()

	rows, err := db.Query(`
		SELECT t.team_id, t.team_name, t.mentor_code
		FROM teams t
		WHERE t.role = 'player'
		ORDER BY t.team_id
	`)
	if err != nil {
		return nil, fmt.Errorf("query mentor codes: %v", err)
	}
	defer rows.Close()

	var codes []map[string]interface{}
	for rows.Next() {
		var teamID int
		var teamName, mentorCode sql.NullString
		err := rows.Scan(&teamID, &teamName, &mentorCode)
		if err != nil {
			continue
		}

		codes = append(codes, map[string]interface{}{
			"team_id":     teamID,
			"team_name":   teamName.String,
			"mentor_code": mentorCode.String,
		})
	}

	return codes, nil
}

// resetAllStationCodes marks all station codes as unused (for new game)
func resetAllStationCodes() error {
	dbMutex.Lock()
	defer dbMutex.Unlock()

	db, err := sql.Open("sqlite", getDBPath())
	if err != nil {
		return fmt.Errorf("open DB local: %v", err)
	}
	defer db.Close()

	_, err = db.Exec(`UPDATE station_codes SET used_by_team_id = NULL, used_at = NULL`)
	if err != nil {
		return fmt.Errorf("reset station codes: %v", err)
	}

	return nil
}

// randomString generates a random string of given length
func randomString(length int) string {
	const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, length)
	for i := range b {
		b[i] = charset[time.Now().UnixNano()%int64(len(charset))]
	}
	return string(b)
}

// deleteMentorCode removes the mentor code for a specific team
func deleteMentorCode(teamID int) error {
	dbMutex.Lock()
	defer dbMutex.Unlock()

	db, err := sql.Open("sqlite", getDBPath())
	if err != nil {
		return fmt.Errorf("open DB local: %v", err)
	}
	defer db.Close()

	_, err = db.Exec(`UPDATE teams SET mentor_code = NULL WHERE team_id = ?`, teamID)
	if err != nil {
		return fmt.Errorf("delete mentor code: %v", err)
	}

	return nil
}
