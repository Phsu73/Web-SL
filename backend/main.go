package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"sync"
	"time"

	_ "modernc.org/sqlite"

	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
)

type Request struct {
	Team    string `json:"team"`
	QueueID int    `json:"queueID"`
	Answer  string `json:"answer"`
}

type AnswerRequest struct {
	TeamID    int    `json:"teamID"`
	StationID int    `json:"stationID"`
	Answer    string `json:"answer"`
}

type AnswerResponse struct {
	Correct bool   `json:"correct"`
	Message string `json:"message"`
}

type LoginRequest struct {
	TeamName  string `json:"teamName"`
	LoginCode string `json:"loginCode"`
}

type LoginResponse struct {
	Correct   bool   `json:"correct"`
	LoginTime string `json:"loginTime,omitempty"`
	ExpiresAt string `json:"expiresAt,omitempty"`
	Role      string `json:"role,omitempty"`
	TeamID    int    `json:"teamID,omitempty"`
}

type HintRequest struct {
	TeamID     int `json:"teamID"`
	QuestionID int `json:"questionID"`
	HintNum    int `json:"hintNum"`
}
type HintResponse struct {
	Hint string `json:"hint"`
}

type QueueRequest struct {
	TeamID  int `json:"teamID"`
	QueueID int `json:"queueID"`
}

type QuestionRequest struct {
	StationID int `json:"stationID"`
	TeamID    int `json:"teamID"`
}
type QuestionResponse struct {
	IsValid bool   `json:"isValid"`
	Message string `json:"message,omitempty"`
}

type QueueResponse struct {
	IsAvailable bool `json:"isAvailable"`
}

type ProgressRequest struct {
	TeamID    int `json:"teamID"`
	StationID int `json:"stationID"`
}

type ProgressResponse struct {
	IsUpdated bool `json:"isUpdated"`
}

type GetProgressRequest struct {
	TeamID int `json:"teamID"`
}

type GetProgressResponse struct {
	Progress         int    `json:"stationNum"`
	NextStation      string `json:"nextStation"`
	FinishedStations []int  `json:"finishedStations,omitempty"`
}

type HintRevealRequest struct {
	TeamID int `json:"teamID"`
}

type HintRevealResponse struct {
	HintClickedNum int    `json:"hintClickedNum"`
	Hint1          string `json:"hint1,omitempty"`
	Hint2          string `json:"hint2,omitempty"`
	Hint3          string `json:"hint3,omitempty"`
}

type ResetScoreRequest struct {
	TeamID int `json:"teamID"`
}

type ResetScoreResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message,omitempty"`
}

type CodeRequest struct {
	TeamID int    `json:"teamID"`
	Code   string `json:"code"`
}

type CodeResponse struct {
	Success     bool   `json:"success"`
	Message     string `json:"message,omitempty"`
	Points      int    `json:"points,omitempty"`
	NextStation int    `json:"nextStation,omitempty"`
}

type ScoreAdjustRequest struct {
	TeamID       int    `json:"teamID"`
	PointsChange int    `json:"pointsChange"`
	Reason       string `json:"reason"`
}

type ScoreAdjustResponse struct {
	Success  bool   `json:"success"`
	Message  string `json:"message,omitempty"`
	NewScore int    `json:"newScore,omitempty"`
}

type UnlockChallengeRequest struct {
	TeamID    int `json:"teamID"`
	StationID int `json:"stationID"`
}

type UnlockChallengeResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message,omitempty"`
}

type TeamProgressResponse struct {
	TeamID           int    `json:"teamID"`
	TeamName         string `json:"teamName"`
	Score            int    `json:"score"`
	CurrentStation   int    `json:"currentStation"`
	FinishedStations []int  `json:"finishedStations"`
}

type MentorCodeRequest struct {
	TeamID    int    `json:"teamID"`
	StationID int    `json:"stationID"`
	Code      string `json:"code"`
}

type MentorCodeResponse struct {
	Success     bool   `json:"success"`
	Message     string `json:"message"`
	Points      int    `json:"points"`
	NextStation int    `json:"nextStation"`
}

type MentorLoginRequest struct {
	MentorCode string `json:"mentorCode"`
}

type MentorLoginResponse struct {
	Success  bool   `json:"success"`
	Message  string `json:"message,omitempty"`
	TeamID   int    `json:"teamID,omitempty"`
	TeamName string `json:"teamName,omitempty"`
}

type MentorCodesResponse struct {
	Codes []map[string]interface{} `json:"codes"`
}

type GenerateMentorCodeRequest struct {
	TeamId int `json:"teamId"`
}

type GenerateMentorCodeResponse struct {
	Success    bool   `json:"success"`
	TeamID     int    `json:"teamId"`
	TeamName   string `json:"teamName"`
	MentorCode string `json:"mentor_code"`
	Message    string `json:"message,omitempty"`
}

type DeleteMentorCodeRequest struct {
	TeamId int `json:"teamId"`
}

type DeleteMentorCodeResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message,omitempty"`
}

type MentorVerifyRequest struct {
	MentorCode string `json:"mentorCode"`
}

type MentorVerifyResponse struct {
	Success  bool   `json:"success"`
	Message  string `json:"message,omitempty"`
	TeamID   int    `json:"teamId,omitempty"`
	TeamName string `json:"teamName,omitempty"`
}

func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")

		allowedOrigins := os.Getenv("ALLOWED_ORIGINS")
		if allowedOrigins == "" {
			allowedOrigins = "http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174,https://hackagame.netlify.app"
		}

		allowOrigin := ""
		originsList := strings.Split(allowedOrigins, ",")
		for _, allowedOrigin := range originsList {
			if strings.TrimSpace(allowedOrigin) == origin {
				allowOrigin = origin
				break
			}
		}

		if allowOrigin == "" && origin != "" {
			if strings.HasPrefix(origin, "http://localhost:") || strings.HasPrefix(origin, "http://127.0.0.1:") ||
				strings.HasPrefix(origin, "https://localhost:") || strings.HasPrefix(origin, "https://127.0.0.1:") {
				allowOrigin = origin
			}
		}

		if allowOrigin != "" {
			w.Header().Set("Access-Control-Allow-Origin", allowOrigin)
		} else if origin != "" {
			w.Header().Set("Access-Control-Allow-Origin", "*")
		}
		w.Header().Set("Vary", "Origin")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Team-ID")
		w.Header().Set("Access-Control-Allow-Credentials", "true")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}

var gameMutex sync.RWMutex
var gameStarted bool
var gameStartTime time.Time

func isHost(teamID int) (bool, error) {
	if teamID == 999999 {
		return true, nil
	}

	if globalDB == nil {
		return false, fmt.Errorf("database connection not ready")
	}

	var role sql.NullString
	err := globalDB.QueryRow("SELECT role FROM teams WHERE team_id = ?", teamID).Scan(&role)
	if err != nil {
		if err == sql.ErrNoRows {
			return false, nil
		}
		return false, fmt.Errorf("query role: %v", err)
	}
	return role.Valid && role.String == "host", nil
}

func gameStatusHandler(w http.ResponseWriter, r *http.Request) {
	gameMutex.RLock()
	started := gameStarted
	startTime := gameStartTime
	gameMutex.RUnlock()

	w.Header().Set("Content-Type", "application/json")
	response := map[string]interface{}{"started": started}
	if started && !startTime.IsZero() {
		response["startTime"] = startTime.Format(time.RFC3339)
	}
	json.NewEncoder(w).Encode(response)
}

func sessionCheckHandler(w http.ResponseWriter, r *http.Request) {
	teamIDStr := r.Header.Get("X-Team-ID")
	if teamIDStr == "" {
		http.Error(w, "Team ID required", http.StatusUnauthorized)
		return
	}

	teamID, err := strconv.Atoi(teamIDStr)
	if err != nil {
		http.Error(w, "Invalid team ID", http.StatusBadRequest)
		return
	}

	isValid, _, err := checkSessionValidity(teamID)
	if err != nil || !isValid {
		http.Error(w, "Session invalid or expired", http.StatusUnauthorized)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]bool{"valid": true})
}

func gameStartHandler(w http.ResponseWriter, r *http.Request) {
	teamIDStr := r.Header.Get("X-Team-ID")
	teamID, err := strconv.Atoi(teamIDStr)
	if err != nil {
		http.Error(w, "Team ID required", http.StatusUnauthorized)
		return
	}

	isHostUser, err := isHost(teamID)
	if err != nil {
		http.Error(w, "Failed to verify host", http.StatusInternalServerError)
		return
	}
	if !isHostUser {
		http.Error(w, "Only host can start game", http.StatusForbidden)
		return
	}

	gameMutex.Lock()
	if !gameStarted {
		gameStarted = true
		gameStartTime = time.Now()

		// Reset all player data when starting new game
		if globalDB != nil {
			globalDB.Exec("UPDATE checkpoints SET finishedStations = '', atStation = 1")
			globalDB.Exec("UPDATE scores SET score = 0")
			globalDB.Exec("DELETE FROM hint_click")
			globalDB.Exec("DELETE FROM queues")
			fmt.Println("Reset all player data for new game")

			// Generate mentor codes for all teams
			go func() {
				rows, err := globalDB.Query("SELECT team_id FROM teams WHERE role = 'player'")
				if err != nil {
					fmt.Printf("Failed to query teams for mentor code generation: %v\n", err)
					return
				}
				defer rows.Close()

				for rows.Next() {
					var tid int
					err := rows.Scan(&tid)
					if err != nil {
						continue
					}

					_, err = generateMentorCode(tid)
					if err != nil {
						fmt.Printf("Failed to generate mentor code for team %d: %v\n", tid, err)
					}
				}
				fmt.Println("Generated mentor codes for all teams")
			}()
		}
	}
	gameMutex.Unlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]bool{"started": true})
}

func gameResetHandler(w http.ResponseWriter, r *http.Request) {
	teamIDStr := r.Header.Get("X-Team-ID")
	teamID, err := strconv.Atoi(teamIDStr)
	if err != nil {
		http.Error(w, "Team ID required", http.StatusUnauthorized)
		return
	}

	isHostUser, err := isHost(teamID)
	if err != nil {
		http.Error(w, "Failed to verify host", http.StatusInternalServerError)
		return
	}
	if !isHostUser {
		http.Error(w, "Only host can reset game", http.StatusForbidden)
		return
	}

	gameMutex.Lock()
	gameStarted = false
	gameStartTime = time.Time{} // zero value
	gameMutex.Unlock()

	if globalDB != nil {
		globalDB.Exec("UPDATE checkpoints SET finishedStations = '', atStation = 0")
		globalDB.Exec("UPDATE scores SET score = 0")
		globalDB.Exec("DELETE FROM hint_click")
		globalDB.Exec("DELETE FROM queues")
		fmt.Println("Game reset: all player data cleared")

		// Reset station codes so they can be used again
		err := resetAllStationCodes()
		if err != nil {
			fmt.Printf("Warning: Failed to reset station codes: %v\n", err)
		} else {
			fmt.Println("Station codes have been reset")
		}
	}

	if globalScoreHub != nil && globalDB != nil {
		go globalScoreHub.RefreshFromDB(globalDB)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]bool{"reset": true})
}

func gameKickAllHandler(w http.ResponseWriter, r *http.Request) {
	teamIDStr := r.Header.Get("X-Team-ID")
	teamID, err := strconv.Atoi(teamIDStr)
	if err != nil {
		http.Error(w, "Team ID required", http.StatusUnauthorized)
		return
	}

	isHostUser, err := isHost(teamID)
	if err != nil {
		http.Error(w, "Failed to verify host", http.StatusInternalServerError)
		return
	}
	if !isHostUser {
		http.Error(w, "Only host can kick teams", http.StatusForbidden)
		return
	}

	var kickedCount int
	if globalDB != nil {
		result, err := globalDB.Exec(
			"UPDATE teams SET login_time = NULL WHERE team_id != 999999",
		)
		if err != nil {
			http.Error(w, "Failed to kick teams", http.StatusInternalServerError)
			return
		}
		rowsAffected, _ := result.RowsAffected()
		kickedCount = int(rowsAffected)
		fmt.Printf("Kicked %d team(s) from the game\n", kickedCount)
	}

	if globalScoreHub != nil && globalDB != nil {
		go globalScoreHub.RefreshFromDB(globalDB)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"kicked": true,
		"count":  kickedCount,
	})
}

func hasRoleColumn(db *sql.DB) bool {
	rows, err := db.Query("PRAGMA table_info(teams)")
	if err != nil {
		fmt.Printf("Lỗi kiểm tra schema teams: %v\n", err)
		return false
	}
	defer rows.Close()

	var cid int
	var name, ctype string
	var notnull, pk int
	var dfltValue sql.NullString
	for rows.Next() {
		err = rows.Scan(&cid, &name, &ctype, &notnull, &dfltValue, &pk)
		if err != nil {
			fmt.Printf("Lỗi scan PRAGMA table_info: %v\n", err)
			return false
		}
		if name == "role" {
			return true
		}
	}
	return false
}

func checkLoginInfoLocal(teamName string, loginCode string) (int, bool, string) {
	fallbackTeams := map[string]struct {
		ID   int
		Code string
		Role string
	}{
		"3AE":               {ID: 1, Code: "3ae123", Role: "player"},
		"5 đứa":             {ID: 2, Code: "5dua45", Role: "player"},
		"Nguyễn Huệ":        {ID: 3, Code: "nguyenhue", Role: "player"},
		"Tò Te Tí Tèo":      {ID: 4, Code: "totetiteo", Role: "player"},
		"Trio Trường Chinh": {ID: 5, Code: "triotruongchinh", Role: "player"},
		"Team ghép đội":     {ID: 6, Code: "teamghep", Role: "player"},
		"Giám sát":          {ID: 999999, Code: "host2026", Role: "host"},
	}

	if team, ok := fallbackTeams[teamName]; ok {
		result := strings.EqualFold(team.Code, loginCode)
		fmt.Printf("Login attempt for Team '%s': fallback code='%s', input='%s', result=%v\n", teamName, team.Code, loginCode, result)
		return team.ID, result, team.Role
	}

	db, err := sql.Open("sqlite", "./hackathon-game.db")
	if err != nil {
		fmt.Printf("Lỗi mở DB: %v\n", err)
		return 0, false, "player"
	}
	defer db.Close()

	var teamID int
	var dbLoginCode, role sql.NullString
	if hasRoleColumn(db) {
		query := "SELECT team_id, login_code, role FROM teams WHERE team_name = ?"
		err = db.QueryRow(query, teamName).Scan(&teamID, &dbLoginCode, &role)
	} else {
		query := "SELECT team_id, login_code FROM teams WHERE team_name = ?"
		err = db.QueryRow(query, teamName).Scan(&teamID, &dbLoginCode)
	}
	if err != nil {
		fmt.Printf("Lỗi Query hoặc sai TeamName: %v\n", err)
		return 0, false, "player"
	}

	fmt.Printf("Login attempt for Team '%s': DB code valid=%v, DB code='%s', Input code='%s'\n", teamName, dbLoginCode.Valid, dbLoginCode.String, loginCode)

	if !dbLoginCode.Valid || dbLoginCode.String == "" {
		fmt.Printf("Team '%s' không có login_code hợp lệ trong DB\n", teamName)
		return 0, false, "player"
	}

	result := strings.EqualFold(dbLoginCode.String, loginCode)
	resolvedRole := "player"
	if role.Valid && role.String != "" {
		resolvedRole = role.String
	}
	fmt.Printf("Kết quả check login cho Team '%s': %v, role=%s, teamID=%d\n", teamName, result, resolvedRole, teamID)
	return teamID, result, resolvedRole
}

func loginHandler(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}
	fmt.Printf("Received login request from team name: %s\n", req.TeamName)

	teamID, isCorrect, role := checkLoginInfoLocal(req.TeamName, req.LoginCode)

	var response LoginResponse
	if isCorrect {
		newLoginTime := time.Now()
		loginTime, err := saveAndLoadLoginTime(teamID, newLoginTime)
		expiresAt := loginTime.Add(4 * 24 * time.Hour)

		if err != nil {
			http.Error(w, "Failed to save login time", http.StatusInternalServerError)
			return
		}
		response = LoginResponse{
			Correct:   true,
			LoginTime: loginTime.Format(time.RFC3339),
			ExpiresAt: expiresAt.Format(time.RFC3339),
			Role:      role,
			TeamID:    teamID,
		}
	} else {
		response = LoginResponse{
			Correct: false,
		}
		fmt.Printf("Team '%s' provided incorrect login code\n", req.TeamName)
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func logoutHandler(w http.ResponseWriter, r *http.Request) {
	teamIDStr := r.Header.Get("X-Team-ID")
	if teamIDStr == "" {
		http.Error(w, "Team ID required", http.StatusUnauthorized)
		return
	}

	teamID, err := strconv.Atoi(teamIDStr)
	if err != nil {
		http.Error(w, "Invalid team ID", http.StatusBadRequest)
		return
	}

	isHostUser, err := isHost(teamID)
	if err != nil {
		http.Error(w, "Failed to verify role", http.StatusInternalServerError)
		return
	}

	if globalDB != nil {
		if isHostUser {
			// Host logout: logout all players
			_, err = globalDB.Exec("UPDATE teams SET login_time = NULL WHERE role = 'player'")
			if err != nil {
				http.Error(w, "Failed to logout all players", http.StatusInternalServerError)
				return
			}
			fmt.Printf("Host logged out, all players logged out successfully\n")
		} else {
			// Player logout: logout only this player
			_, err = globalDB.Exec("UPDATE teams SET login_time = NULL WHERE team_id = ?", teamID)
			if err != nil {
				http.Error(w, "Failed to logout", http.StatusInternalServerError)
				return
			}
			fmt.Printf("Team %d logged out successfully\n", teamID)
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]bool{"loggedOut": true})
}

func resetScoreHandler(w http.ResponseWriter, r *http.Request) {
	teamIDStr := r.Header.Get("X-Team-ID")
	teamID, err := strconv.Atoi(teamIDStr)
	if err != nil {
		http.Error(w, "Team ID required", http.StatusUnauthorized)
		return
	}

	isHostUser, err := isHost(teamID)
	if err != nil {
		http.Error(w, "Failed to verify host", http.StatusInternalServerError)
		return
	}
	if !isHostUser {
		http.Error(w, "Only host can reset scores", http.StatusForbidden)
		return
	}

	var req ResetScoreRequest
	err = json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	// Check if this is the first or second confirmation
	var confirmCount int
	err = globalDB.QueryRow("SELECT COALESCE(confirm_count, 0) FROM scores WHERE team_id = ?", req.TeamID).Scan(&confirmCount)
	if err != nil && err != sql.ErrNoRows {
		http.Error(w, "Failed to check confirmation count", http.StatusInternalServerError)
		return
	}

	if confirmCount >= 1 {
		// Second confirmation - actually reset the score
		_, err = globalDB.Exec("UPDATE scores SET score = 0, confirm_count = 0 WHERE team_id = ?", req.TeamID)
		if err != nil {
			http.Error(w, "Failed to reset score", http.StatusInternalServerError)
			return
		}
		fmt.Printf("Host confirmed twice - score reset for team %d\n", req.TeamID)

		if globalScoreHub != nil && globalDB != nil {
			go globalScoreHub.RefreshFromDB(globalDB)
		}

		w.Header().Set("Content-Type", "application/json")
		response := ResetScoreResponse{
			Success: true,
			Message: fmt.Sprintf("Score reset for team %d", req.TeamID),
		}
		json.NewEncoder(w).Encode(response)
	} else {
		// First confirmation - increment counter
		_, err = globalDB.Exec("UPDATE scores SET confirm_count = 1 WHERE team_id = ?", req.TeamID)
		if err != nil {
			http.Error(w, "Failed to set confirmation count", http.StatusInternalServerError)
			return
		}
		fmt.Printf("Host first confirmation for team %d - need one more to reset\n", req.TeamID)

		w.Header().Set("Content-Type", "application/json")
		response := ResetScoreResponse{
			Success: true,
			Message: fmt.Sprintf("First confirmation for team %d - confirm again to reset score", req.TeamID),
		}
		json.NewEncoder(w).Encode(response)
	}
}

func validateSession(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		teamIDStr := r.Header.Get("X-Team-ID")
		if teamIDStr == "" {
			http.Error(w, "Team ID required", http.StatusUnauthorized)
			return
		}

		teamID, err := strconv.Atoi(teamIDStr)
		if err != nil {
			http.Error(w, "Invalid team ID", http.StatusBadRequest)
			return
		}

		isValid, remainingSeconds, err := checkSessionValidity(teamID)
		if err != nil {
			http.Error(w, "Session check failed", http.StatusInternalServerError)
			return
		}

		if !isValid {
			http.Error(w, "Session expired", http.StatusUnauthorized)
			return
		}

		w.Header().Set("X-Session-Remaining", strconv.Itoa(remainingSeconds))

		next.ServeHTTP(w, r)
	})
}

func validatePlayerOnly(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		teamIDStr := r.Header.Get("X-Team-ID")
		teamID, err := strconv.Atoi(teamIDStr)
		if err != nil {
			http.Error(w, "Invalid team ID", http.StatusBadRequest)
			return
		}

		isHostUser, err := isHost(teamID)
		if err != nil {
			http.Error(w, "Failed to verify role", http.StatusInternalServerError)
			return
		}
		if isHostUser {
			http.Error(w, "Host cannot access player endpoints", http.StatusForbidden)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func questionHandler(w http.ResponseWriter, r *http.Request) {
	teamIDStr := r.Header.Get("X-Team-ID")
	teamID, err := strconv.Atoi(teamIDStr)
	if err != nil {
		http.Error(w, "Team ID required", http.StatusUnauthorized)
		return
	}

	vars := mux.Vars(r)
	idStr := vars["stationID"]
	fmt.Printf("Received request for stationID: %s\n", idStr)
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	finishedStations, err := loadFinishedStations(teamID)
	if err != nil {
		http.Error(w, "Failed to load finished stations", http.StatusInternalServerError)
		return
	}
	if containsStation(finishedStations, id) {
		http.Error(w, "Trạm này đã hoàn thành. Không thể truy cập lại.", http.StatusForbidden)
		return
	}

	fmt.Printf("Loading question for station ID: %d\n", id)
	question, err := loadQuestion(id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	resp := map[string]string{"question": question}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func hintRevealHandler(w http.ResponseWriter, r *http.Request) {
	var req HintRevealRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	fmt.Printf("Received hint reveal request from team %d\n", req.TeamID)

	var questionID int
	questionID, err = loadCurrentStation(req.TeamID)
	if err != nil {
		fmt.Printf("Error loading current station for team %d: %v\n", req.TeamID, err)
		http.Error(w, "Failed to load current station", http.StatusInternalServerError)
		return
	}

	fmt.Printf("Team %d accessing hint page for station %d\n", req.TeamID, questionID)

	var checkHintClicked int
	checkHintClicked, err = loadHintClicked(req.TeamID, questionID)
	if err != nil && err != sql.ErrNoRows {
		fmt.Printf("Error loading hint clicked for team %d at station %d: %v\n", req.TeamID, questionID, err)
		http.Error(w, "Failed to load hint clicked", http.StatusInternalServerError)
		return
	}

	var response HintRevealResponse
	response.HintClickedNum = checkHintClicked

	fmt.Printf("Team %d has clicked %d hints for station %d\n", req.TeamID, checkHintClicked, questionID)

	if checkHintClicked > 0 {
		for i := 1; i <= checkHintClicked && i <= 3; i++ {
			hint, err := loadHint(questionID, i)
			if err != nil {
				fmt.Printf("Error loading hint %d for station %d: %v\n", i, questionID, err)
				http.Error(w, "Failed to load hint", http.StatusInternalServerError)
				return
			}
			switch i {
			case 1:
				response.Hint1 = hint
			case 2:
				response.Hint2 = hint
			case 3:
				response.Hint3 = hint
			}
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
	fmt.Printf("Successfully sent hint reveal response to team %d\n", req.TeamID)
}

func hintHandler(w http.ResponseWriter, r *http.Request) {
	var req HintRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}
	fmt.Printf("Received hint request from team %d for station %d: hint %d\n", req.TeamID, req.QuestionID, req.HintNum)
	err = saveHintClicked(req.TeamID, req.QuestionID, req.HintNum)
	if err != nil {
		http.Error(w, "Failed to save hint click", http.StatusInternalServerError)
		return
	}

	var hint string
	hint, err = loadHint(req.QuestionID, req.HintNum)
	if err != nil {
		http.Error(w, "Failed to load hint", http.StatusInternalServerError)
		return
	}

	var response HintResponse
	response = HintResponse{
		Hint: hint,
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
func submitCodeHandler(w http.ResponseWriter, r *http.Request) {
	var req CodeRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}
	fmt.Printf("Received code submission from team %d: %s\n", req.TeamID, req.Code)

	// Get current station for the team
	currentStation, err := loadCurrentStation(req.TeamID)
	if err != nil {
		http.Error(w, "Failed to load current station", http.StatusInternalServerError)
		return
	}

	if currentStation == 0 || currentStation > 7 {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(CodeResponse{
			Success: false,
			Message: "Không có thử thách nào đang mở.",
		})
		return
	}

	// Check if team already completed this station
	completed, err := hasTeamCompletedStation(req.TeamID, currentStation)
	if err != nil {
		http.Error(w, "Failed to check station completion", http.StatusInternalServerError)
		return
	}
	if completed {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(CodeResponse{
			Success: false,
			Message: "Đội đã hoàn thành trạm này rồi.",
		})
		return
	}

	// Load and validate the code from station_codes table
	code, err := loadStationCode(currentStation, req.Code)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(CodeResponse{
			Success: false,
			Message: "Code không đúng. Vui lòng thử lại.",
		})
		return
	}

	// Check if code already used by this team
	alreadyUsed, err := isCodeAlreadyUsed(req.TeamID, currentStation, req.Code)
	if err != nil {
		http.Error(w, "Failed to check code usage", http.StatusInternalServerError)
		return
	}
	if alreadyUsed {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(CodeResponse{
			Success: false,
			Message: "Đội đã dùng code này rồi.",
		})
		return
	}

	// Mark code as used
	err = markCodeAsUsed(req.TeamID, currentStation, req.Code)
	if err != nil {
		http.Error(w, "Failed to mark code as used", http.StatusInternalServerError)
		return
	}

	// Add points to team's score (using code's point value)
	currentScore, err := loadScore(req.TeamID)
	if err != nil {
		http.Error(w, "Failed to load current score", http.StatusInternalServerError)
		return
	}
	newScore := currentScore + code.Points
	err = saveScore(req.TeamID, newScore)
	if err != nil {
		http.Error(w, "Failed to save score", http.StatusInternalServerError)
		return
	}

	fmt.Printf("Team %d completed station %d with code worth %d points. New score: %d\n", req.TeamID, currentStation, code.Points, newScore)

	// Update progress (mark current station as finished)
	isUpdated, err := updateProgress(req.TeamID, currentStation)
	if err != nil {
		http.Error(w, "Failed to update progress", http.StatusInternalServerError)
		return
	}

	var nextStation int
	if isUpdated {
		// Remove current station
		err = removeCurrentStation(req.TeamID)
		if err != nil {
			http.Error(w, "Failed to remove current station", http.StatusInternalServerError)
			return
		}

		// Set next station
		nextStation = currentStation + 1
		if nextStation <= 7 {
			err = addCurrentStation(req.TeamID, nextStation)
			if err != nil {
				http.Error(w, "Failed to set next station", http.StatusInternalServerError)
				return
			}
		} else {
			nextStation = 0 // All stations completed
		}

		// Trigger scoreboard update
		if globalScoreHub != nil && globalDB != nil {
			go globalScoreHub.RefreshFromDB(globalDB)
		}
	} else {
		nextStation = currentStation
	}

	fmt.Printf("Team %d submitted valid code for station %d. Points: %d, New score: %d, Next station: %d\n", req.TeamID, currentStation, code.Points, newScore, nextStation)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(CodeResponse{
		Success:     true,
		Message:     fmt.Sprintf("Chính xác! +%d điểm", code.Points),
		Points:      code.Points,
		NextStation: nextStation,
	})
}

func adjustScoreHandler(w http.ResponseWriter, r *http.Request) {
	var req ScoreAdjustRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}
	fmt.Printf("Score adjustment request: teamID=%d, pointsChange=%d, reason=%s\n", req.TeamID, req.PointsChange, req.Reason)

	// Get current score
	currentScore, err := loadScore(req.TeamID)
	if err != nil {
		http.Error(w, "Failed to load current score", http.StatusInternalServerError)
		return
	}

	// Calculate new score
	newScore := currentScore + req.PointsChange
	if newScore < 0 {
		newScore = 0 // Prevent negative scores
	}

	// Save new score
	err = saveScore(req.TeamID, newScore)
	if err != nil {
		http.Error(w, "Failed to save score", http.StatusInternalServerError)
		return
	}

	// Log the adjustment
	_, err = globalDB.Exec("INSERT INTO score_adjustments (team_id, points_change, reason) VALUES (?, ?, ?)",
		req.TeamID, req.PointsChange, req.Reason)
	if err != nil {
		fmt.Printf("Warning: Failed to log score adjustment: %v\n", err)
	}

	// Trigger scoreboard update
	if globalScoreHub != nil && globalDB != nil {
		go globalScoreHub.RefreshFromDB(globalDB)
	}

	fmt.Printf("Team %d score adjusted from %d to %d (change: %d)\n", req.TeamID, currentScore, newScore, req.PointsChange)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(ScoreAdjustResponse{
		Success:  true,
		Message:  "Điểm đã được điều chỉnh thành công",
		NewScore: newScore,
	})
}

func unlockChallengeHandler(w http.ResponseWriter, r *http.Request) {
	var req UnlockChallengeRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}
	fmt.Printf("Unlock challenge request: teamID=%d, stationID=%d\n", req.TeamID, req.StationID)

	// Set the team's current station
	err = addCurrentStation(req.TeamID, req.StationID)
	if err != nil {
		http.Error(w, "Failed to set current station", http.StatusInternalServerError)
		return
	}

	fmt.Printf("Team %d unlocked station %d\n", req.TeamID, req.StationID)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(UnlockChallengeResponse{
		Success: true,
		Message: "Thử thách đã được mở khóa",
	})
}

func getTeamProgressHandler(w http.ResponseWriter, r *http.Request) {
	teamIDStr := r.URL.Query().Get("teamID")
	if teamIDStr == "" {
		http.Error(w, "teamID parameter required", http.StatusBadRequest)
		return
	}

	teamID, err := strconv.Atoi(teamIDStr)
	if err != nil {
		http.Error(w, "Invalid teamID", http.StatusBadRequest)
		return
	}

	// Get team name
	var teamName string
	err = globalDB.QueryRow("SELECT team_name FROM teams WHERE team_id = ?", teamID).Scan(&teamName)
	if err != nil {
		http.Error(w, "Team not found", http.StatusNotFound)
		return
	}

	// Get score
	score, err := loadScore(teamID)
	if err != nil {
		http.Error(w, "Failed to load score", http.StatusInternalServerError)
		return
	}

	// Get current station
	currentStation, err := loadCurrentStation(teamID)
	if err != nil {
		http.Error(w, "Failed to load current station", http.StatusInternalServerError)
		return
	}

	// Get finished stations
	finishedStationsStr, err := loadFinishedStations(teamID)
	if err != nil {
		http.Error(w, "Failed to load finished stations", http.StatusInternalServerError)
		return
	}

	finishedStations := []int{}
	if finishedStationsStr != "" {
		parts := strings.Split(finishedStationsStr, ",")
		for _, p := range parts {
			p = strings.TrimSpace(p)
			if p == "" {
				continue
			}
			num, err := strconv.Atoi(p)
			if err != nil {
				continue
			}
			if num > 0 {
				finishedStations = append(finishedStations, num)
			}
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(TeamProgressResponse{
		TeamID:           teamID,
		TeamName:         teamName,
		Score:            score,
		CurrentStation:   currentStation,
		FinishedStations: finishedStations,
	})
}

func answerHandler(w http.ResponseWriter, r *http.Request) {
	var req AnswerRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}
	fmt.Printf("Received answer from team %d for station %d: %s\n", req.TeamID, req.StationID, req.Answer)
	var correctAnswer string
	correctAnswer, err = loadCorrectAnswer(req.StationID)
	if err != nil {
		http.Error(w, "Failed to load correct answer", http.StatusInternalServerError)
		return
	}
	isCorrect := checkAnswer(req.Answer, correctAnswer)
	var response AnswerResponse
	if isCorrect {
		currentScore, err := loadScore(req.TeamID)
		if err != nil {
			http.Error(w, "Failed to load current score", http.StatusInternalServerError)
			return
		}
		var hintClicked int
		hintClicked, err = loadHintClicked(req.TeamID, req.StationID)
		if err == sql.ErrNoRows {
			hintClicked = 0
		}
		fmt.Printf("Hint clicked for team %d at station %d: %d\n", req.TeamID, req.StationID, hintClicked)
		if hintClicked < 0 {
			fmt.Printf("Warning: Negative hintClicked value for team %d at station %d, resetting to 0\n", req.TeamID, req.StationID)
			hintClicked = 0
		}
		fmt.Printf("Hint clicked for team %d at station %d: %d\n", req.TeamID, req.StationID, hintClicked)

		// Calculate time elapsed since question started (default to 0 if not tracked)
		timeElapsed := 0 // TODO: Implement question start time tracking
		newScore := calScore(currentScore, 100, hintClicked, timeElapsed)
		fmt.Printf("Team %d current score: %d, new score after answering: %d\n", req.TeamID, currentScore, newScore)
		err = saveScore(req.TeamID, newScore)
		if err != nil {
			http.Error(w, "Failed to save score", http.StatusInternalServerError)
			return
		}
		var room string
		room, err = loadRoom(req.StationID)
		if err != nil {
			http.Error(w, "Failed to load room", http.StatusInternalServerError)
			return
		}
		response = AnswerResponse{
			Correct: true,
			Message: room,
		}
		fmt.Printf("Team %d got correct answer. Score updated to %d\n", req.TeamID, newScore)
		err = removeQueue(req.TeamID, req.StationID)
		if err != nil {
			http.Error(w, "Failed to remove team from queue", http.StatusInternalServerError)
			return
		}
		fmt.Printf("Team %d removed from queue for station %d\n", req.TeamID, req.StationID)

		// ========================================================
		// 🔥 REAL-TIME SCOREBOARD TRIGGER (THỜI GIAN THỰC)
		// SỬA LỖI: Truyền biến db vào để chạy đồng bộ an toàn
		// ========================================================
		if globalScoreHub != nil && globalDB != nil {
			go globalScoreHub.RefreshFromDB(globalDB)
		}
		// ========================================================
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func handleQuestionClick(w http.ResponseWriter, r *http.Request) {
	var req QuestionRequest
	var response QuestionResponse
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}
	fmt.Printf("Received question request from team %d for station %d\n", req.TeamID, req.StationID)

	// Check if station is already completed
	finishedStations, err := loadFinishedStations(req.TeamID)
	if err != nil {
		http.Error(w, "Failed to load finished stations", http.StatusInternalServerError)
		return
	}
	if containsStation(finishedStations, req.StationID) {
		response = QuestionResponse{
			IsValid: false,
			Message: "Trạm này đã hoàn thành. Không thể truy cập lại.",
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
		return
	}

	isValid, err := checkStationAvailable(req.TeamID, req.StationID)
	if err != nil {
		http.Error(w, "Failed to check station availability", http.StatusInternalServerError)
		return
	}
	if isValid {
		isAvailable, err := addQueue(req.TeamID, req.StationID)
		if err != nil {
			http.Error(w, "Failed to add team to queue", http.StatusInternalServerError)
			return
		}
		if isAvailable {
			err := addCurrentStation(req.TeamID, req.StationID)
			if err != nil {
				http.Error(w, "Failed to set current station", http.StatusInternalServerError)
				return
			}
			fmt.Printf("Added current station %d for Team %d \n", req.StationID, req.TeamID)
			response = QuestionResponse{
				IsValid: true,
			}
			fmt.Printf("Team %d added to queue for station %d\n", req.TeamID, req.StationID)
		} else {
			response = QuestionResponse{
				IsValid: false,
				Message: "Queue is full for this station.",
			}
			fmt.Printf("Team %d cannot access station %d due to full queue\n", req.TeamID, req.StationID)
		}
	} else {
		response = QuestionResponse{
			IsValid: false,
			Message: "Invalid station for this team.",
		}
		fmt.Printf("Team %d cannot access station %d\n", req.TeamID, req.StationID)
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
	fmt.Printf("Station availability for team %d at station %d: %t\n", req.TeamID, req.StationID, isValid)
}

func updateProgressHandler(w http.ResponseWriter, r *http.Request) {
	var req ProgressRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}
	fmt.Printf("Received progress update request from team %d for station %d\n", req.TeamID, req.StationID)

	isUpdated, err := updateProgress(req.TeamID, req.StationID)
	if err != nil {
		http.Error(w, "Failed to update progress", http.StatusInternalServerError)
		return
	}
	if isUpdated {
		err = removeCurrentStation(req.TeamID)
		if err != nil {
			http.Error(w, "Failed to remove current station", http.StatusInternalServerError)
			return
		}

		// ========================================================
		// 🔥 REAL-TIME SCOREBOARD TRIGGER (THỜI GIAN THỰC)
		// Cập nhật lại số câu đúng (tiến trình trạm) lên màn hình LED/Dashboard
		// ========================================================
		if globalScoreHub != nil && globalDB != nil {
			go globalScoreHub.RefreshFromDB(globalDB)
		}
		// ========================================================
	}
	response := ProgressResponse{
		IsUpdated: isUpdated,
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
	fmt.Printf("Progress updated for team %d at station %d: %t\n", req.TeamID, req.StationID, isUpdated)
	if isUpdated {
		fmt.Printf("Team %d has successfully updated their progress at station %d\n", req.TeamID, req.StationID)
	} else {
		fmt.Printf("Team %d failed to update progress at station %d\n", req.TeamID, req.StationID)
	}
}

func progressHandler(w http.ResponseWriter, r *http.Request) {
	var req GetProgressRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}
	fmt.Printf("Received progress request from team %d", req.TeamID)
	finishedStations, err := loadFinishedStations(req.TeamID)
	if err != nil {
		http.Error(w, "Failed to load finished stations", http.StatusInternalServerError)
		return
	}
	var finishedCount int
	finishedIDs := []int{}
	if finishedStations == "" {
		finishedCount = 0
	} else {
		parts := strings.Split(finishedStations, ",")
		for _, p := range parts {
			p = strings.TrimSpace(p)
			if p == "" {
				continue
			}
			num, err := strconv.Atoi(p)
			if err != nil {
				continue
			}
			if num > 0 {
				finishedCount++
				finishedIDs = append(finishedIDs, num)
			}
		}
	}
	var currentStation int
	currentStation, err = loadCurrentStation(req.TeamID)
	if err != nil {
		http.Error(w, "Failed to load current station", http.StatusInternalServerError)
		return
	}
	response := GetProgressResponse{
		Progress:         currentStation,
		NextStation:      "",
		FinishedStations: finishedIDs,
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
	fmt.Printf("Successfully sent progress status.")
}

// ============================================================
// MENTOR CODE HANDLERS
// ============================================================

func mentorLoginHandler(w http.ResponseWriter, r *http.Request) {
	var req MentorLoginRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	teamID, err := validateMentorCode(req.MentorCode)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(MentorLoginResponse{
			Success: false,
			Message: "Mentor code không hợp lệ",
		})
		return
	}

	// Get team name
	var teamName string
	err = globalDB.QueryRow("SELECT team_name FROM teams WHERE team_id = ?", teamID).Scan(&teamName)
	if err != nil {
		http.Error(w, "Failed to load team name", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(MentorLoginResponse{
		Success:  true,
		TeamID:   teamID,
		TeamName: teamName,
	})
	fmt.Printf("Mentor logged in for team %d (%s)\n", teamID, teamName)
}

func mentorCodeSubmitHandler(w http.ResponseWriter, r *http.Request) {
	// Get mentor team ID from header
	mentorTeamIDStr := r.Header.Get("X-Team-ID")
	if mentorTeamIDStr == "" {
		http.Error(w, "Team ID required", http.StatusUnauthorized)
		return
	}

	mentorTeamID, err := strconv.Atoi(mentorTeamIDStr)
	if err != nil {
		http.Error(w, "Invalid team ID", http.StatusBadRequest)
		return
	}

	var req MentorCodeRequest
	err = json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	fmt.Printf("Mentor (team %d) submitting code for station %d: %s\n", mentorTeamID, req.StationID, req.Code)

	// Validate station exists (1-7)
	if req.StationID < 1 || req.StationID > 7 {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(MentorCodeResponse{
			Success: false,
			Message: "Trạm không hợp lệ (phải từ 1-7)",
		})
		return
	}

	// Check if team already completed this station
	completed, err := hasTeamCompletedStation(req.TeamID, req.StationID)
	if err != nil {
		http.Error(w, "Failed to check station completion", http.StatusInternalServerError)
		return
	}
	if completed {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(MentorCodeResponse{
			Success: false,
			Message: "Đội đã hoàn thành trạm này rồi. Không thể dùng thêm code.",
		})
		return
	}

	// Load and validate the code
	code, err := loadStationCode(req.StationID, req.Code)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(MentorCodeResponse{
			Success: false,
			Message: "Code không đúng. Vui lòng thử lại.",
		})
		return
	}

	// Check if code already used by this team
	alreadyUsed, err := isCodeAlreadyUsed(req.TeamID, req.StationID, req.Code)
	if err != nil {
		http.Error(w, "Failed to check code usage", http.StatusInternalServerError)
		return
	}
	if alreadyUsed {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(MentorCodeResponse{
			Success: false,
			Message: "Đội đã dùng code này rồi. Mỗi team chỉ được dùng 1 code/trạm.",
		})
		return
	}

	// Mark code as used
	err = markCodeAsUsed(req.TeamID, req.StationID, req.Code)
	if err != nil {
		http.Error(w, "Failed to mark code as used", http.StatusInternalServerError)
		return
	}

	// Add points to team's score
	currentScore, err := loadScore(req.TeamID)
	if err != nil {
		http.Error(w, "Failed to load current score", http.StatusInternalServerError)
		return
	}
	newScore := currentScore + code.Points
	err = saveScore(req.TeamID, newScore)
	if err != nil {
		http.Error(w, "Failed to save score", http.StatusInternalServerError)
		return
	}

	fmt.Printf("Team %d completed station %d with code worth %d points. New score: %d\n",
		req.TeamID, req.StationID, code.Points, newScore)

	// Update progress (mark current station as finished)
	isUpdated, err := updateProgress(req.TeamID, req.StationID)
	if err != nil {
		http.Error(w, "Failed to update progress", http.StatusInternalServerError)
		return
	}

	var nextStation int
	if isUpdated {
		// Remove current station
		err = removeCurrentStation(req.TeamID)
		if err != nil {
			http.Error(w, "Failed to remove current station", http.StatusInternalServerError)
			return
		}

		// Set next station
		nextStation = req.StationID + 1
		if nextStation <= 7 {
			err = addCurrentStation(req.TeamID, nextStation)
			if err != nil {
				http.Error(w, "Failed to set next station", http.StatusInternalServerError)
				return
			}
		} else {
			nextStation = 0 // All stations completed
		}

		// Trigger scoreboard update
		if globalScoreHub != nil && globalDB != nil {
			go globalScoreHub.RefreshFromDB(globalDB)
		}
	} else {
		nextStation = req.StationID
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(MentorCodeResponse{
		Success:     true,
		Message:     fmt.Sprintf("Chính xác! +%d điểm", code.Points),
		Points:      code.Points,
		NextStation: nextStation,
	})
}

// ============================================================
// ADMIN MENTOR CODE HANDLERS
// ============================================================

func generateMentorCodesHandler(w http.ResponseWriter, r *http.Request) {
	teamIDStr := r.Header.Get("X-Team-ID")
	teamID, err := strconv.Atoi(teamIDStr)
	if err != nil {
		http.Error(w, "Team ID required", http.StatusUnauthorized)
		return
	}

	isHostUser, err := isHost(teamID)
	if err != nil {
		http.Error(w, "Failed to verify host", http.StatusInternalServerError)
		return
	}
	if !isHostUser {
		http.Error(w, "Only host can generate mentor codes", http.StatusForbidden)
		return
	}

	// Get all player teams
	rows, err := globalDB.Query("SELECT team_id FROM teams WHERE role = 'player'")
	if err != nil {
		http.Error(w, "Failed to query teams", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var generatedCodes []map[string]interface{}
	for rows.Next() {
		var tid int
		err := rows.Scan(&tid)
		if err != nil {
			continue
		}

		code, err := generateMentorCode(tid)
		if err != nil {
			fmt.Printf("Failed to generate mentor code for team %d: %v\n", tid, err)
			continue
		}

		// Get team name
		var teamName string
		globalDB.QueryRow("SELECT team_name FROM teams WHERE team_id = ?", tid).Scan(&teamName)

		generatedCodes = append(generatedCodes, map[string]interface{}{
			"team_id":     tid,
			"team_name":   teamName,
			"mentor_code": code,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"codes":   generatedCodes,
	})
	fmt.Printf("Generated %d mentor codes\n", len(generatedCodes))
}

func getMentorCodesHandler(w http.ResponseWriter, r *http.Request) {
	codes, err := getAllMentorCodes()
	if err != nil {
		http.Error(w, "Failed to get mentor codes", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(MentorCodesResponse{
		Codes: codes,
	})
}

func resetStationCodesHandler(w http.ResponseWriter, r *http.Request) {
	teamIDStr := r.Header.Get("X-Team-ID")
	teamID, err := strconv.Atoi(teamIDStr)
	if err != nil {
		http.Error(w, "Team ID required", http.StatusUnauthorized)
		return
	}

	isHostUser, err := isHost(teamID)
	if err != nil {
		http.Error(w, "Failed to verify host", http.StatusInternalServerError)
		return
	}
	if !isHostUser {
		http.Error(w, "Only host can reset station codes", http.StatusForbidden)
		return
	}

	err = resetAllStationCodes()
	if err != nil {
		http.Error(w, "Failed to reset station codes", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]bool{
		"success": true,
	})
	fmt.Println("All station codes have been reset")
}

func generateMentorCodeForTeamHandler(w http.ResponseWriter, r *http.Request) {
	teamIDStr := r.Header.Get("X-Team-ID")
	teamID, err := strconv.Atoi(teamIDStr)
	if err != nil {
		http.Error(w, "Team ID required", http.StatusUnauthorized)
		return
	}

	isHostUser, err := isHost(teamID)
	if err != nil {
		http.Error(w, "Failed to verify host", http.StatusInternalServerError)
		return
	}
	if !isHostUser {
		http.Error(w, "Only host can generate mentor codes", http.StatusForbidden)
		return
	}

	var req GenerateMentorCodeRequest
	err = json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	// Generate mentor code for the specific team
	code, err := generateMentorCode(req.TeamId)
	if err != nil {
		http.Error(w, "Failed to generate mentor code", http.StatusInternalServerError)
		return
	}

	// Get team name
	var teamName string
	err = globalDB.QueryRow("SELECT team_name FROM teams WHERE team_id = ?", req.TeamId).Scan(&teamName)
	if err != nil {
		http.Error(w, "Team not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(GenerateMentorCodeResponse{
		Success:    true,
		TeamID:     req.TeamId,
		TeamName:   teamName,
		MentorCode: code,
	})
	fmt.Printf("Generated mentor code for team %d (%s)\n", req.TeamId, teamName)
}

func deleteMentorCodeHandler(w http.ResponseWriter, r *http.Request) {
	teamIDStr := r.Header.Get("X-Team-ID")
	teamID, err := strconv.Atoi(teamIDStr)
	if err != nil {
		http.Error(w, "Team ID required", http.StatusUnauthorized)
		return
	}

	isHostUser, err := isHost(teamID)
	if err != nil {
		http.Error(w, "Failed to verify host", http.StatusInternalServerError)
		return
	}
	if !isHostUser {
		http.Error(w, "Only host can delete mentor codes", http.StatusForbidden)
		return
	}

	var req DeleteMentorCodeRequest
	err = json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	err = deleteMentorCode(req.TeamId)
	if err != nil {
		http.Error(w, "Failed to delete mentor code", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(DeleteMentorCodeResponse{
		Success: true,
		Message: "Mentor code deleted successfully",
	})
	fmt.Printf("Deleted mentor code for team %d\n", req.TeamId)
}

func mentorVerifyHandler(w http.ResponseWriter, r *http.Request) {
	// Get user team ID from header (not the mentor's team ID)
	userTeamIDStr := r.Header.Get("X-Team-ID")
	if userTeamIDStr == "" {
		http.Error(w, "Team ID required", http.StatusUnauthorized)
		return
	}

	// Verify user session
	userTeamID, err := strconv.Atoi(userTeamIDStr)
	if err != nil {
		http.Error(w, "Invalid team ID", http.StatusBadRequest)
		return
	}

	isValid, _, err := checkSessionValidity(userTeamID)
	if err != nil || !isValid {
		http.Error(w, "Session invalid or expired", http.StatusUnauthorized)
		return
	}

	var req MentorVerifyRequest
	err = json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	// Validate mentor code
	mentorTeamID, err := validateMentorCode(req.MentorCode)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(MentorVerifyResponse{
			Success: false,
			Message: "Mentor code không hợp lệ",
		})
		return
	}

	// Get team name
	var teamName string
	err = globalDB.QueryRow("SELECT team_name FROM teams WHERE team_id = ?", mentorTeamID).Scan(&teamName)
	if err != nil {
		http.Error(w, "Team not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(MentorVerifyResponse{
		Success:  true,
		TeamID:   mentorTeamID,
		TeamName: teamName,
		Message:  "Xác thực mentor thành công",
	})
	fmt.Printf("Mentor code verified for user team %d, mentor team %d (%s)\n", userTeamID, mentorTeamID, teamName)
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("OK"))
}

func ensureDatabaseInitialized(db *sql.DB, dbPath string) error {
	var tableCount int
	err := db.QueryRow("SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name='teams'").Scan(&tableCount)
	if err == nil && tableCount > 0 {
		return nil
	}

	seedPath := filepath.Join(filepath.Dir(dbPath), "hackathon-game.sql")
	seedData, err := os.ReadFile(seedPath)
	if err != nil {
		if os.IsNotExist(err) {
			return nil
		}
		return fmt.Errorf("read seed SQL: %w", err)
	}

	if _, err := db.Exec(string(seedData)); err != nil {
		return fmt.Errorf("initialize database from seed: %w", err)
	}

	fmt.Printf("Initialized database from %s\n", seedPath)
	return nil
}

// WebSocket handler cho Scoreboard realtime
func scoreboardWSHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Lỗi upgrade WebSocket:", err)
		return
	}

	// Đăng ký client mới vào hub
	globalScoreHub.register <- conn
	log.Println("Client WebSocket kết nối Scoreboard")

	// Lắng nghe để tự động unregister khi client disconnect
	go func() {
		defer func() {
			globalScoreHub.unregister <- conn
			log.Println("Client WebSocket ngắt kết nối Scoreboard")
		}()

		for {
			_, _, err := conn.ReadMessage()
			if err != nil {
				if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
					log.Printf("Lỗi WebSocket: %v", err)
				}
				return
			}
		}
	}()
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	var err error
	// Database path from environment variable with fallback
	dbPath := os.Getenv("DB_PATH")
	if dbPath == "" {
		dbPath = filepath.Join(".", "hackathon-game.db")
	}
	globalDB, err = sql.Open("sqlite", dbPath)
	if err != nil {
		log.Fatalf("Lỗi mở DB: %v", err)
	}
	defer globalDB.Close()

	if err := ensureDatabaseInitialized(globalDB, dbPath); err != nil {
		log.Printf("Cảnh báo khởi tạo DB: %v", err)
	}

	globalScoreHub = NewScoreboardHub()
	go globalScoreHub.Run()

	r := mux.NewRouter()
	r.Use(enableCORS)

	r.HandleFunc("/health", healthHandler).Methods("GET")
	r.HandleFunc("/", healthHandler).Methods("GET")
	r.HandleFunc("/login", loginHandler).Methods("POST", "OPTIONS")
	r.HandleFunc("/logout", logoutHandler).Methods("POST", "OPTIONS")
	r.HandleFunc("/ws/scoreboard", scoreboardWSHandler)
	r.HandleFunc("/game/status", gameStatusHandler).Methods("GET")
	r.HandleFunc("/game/sessioncheck", sessionCheckHandler).Methods("GET", "OPTIONS")
	r.HandleFunc("/game/start", gameStartHandler).Methods("POST", "OPTIONS")
	r.HandleFunc("/game/reset", gameResetHandler).Methods("POST", "OPTIONS")
	r.HandleFunc("/game/kickall", gameKickAllHandler).Methods("POST", "OPTIONS")
	r.HandleFunc("/game/resetscore", resetScoreHandler).Methods("POST", "OPTIONS")
	r.HandleFunc("/admin/adjust-score", adjustScoreHandler).Methods("POST", "OPTIONS")
	r.HandleFunc("/admin/unlock-challenge", unlockChallengeHandler).Methods("POST", "OPTIONS")
	r.HandleFunc("/admin/team-progress", getTeamProgressHandler).Methods("GET")
	r.HandleFunc("/admin/generate-mentor-codes", generateMentorCodesHandler).Methods("POST", "OPTIONS")
	r.HandleFunc("/admin/generate-mentor-code", generateMentorCodeForTeamHandler).Methods("POST", "OPTIONS")
	r.HandleFunc("/admin/delete-mentor-code", deleteMentorCodeHandler).Methods("POST", "OPTIONS")
	r.HandleFunc("/admin/mentor-codes", getMentorCodesHandler).Methods("GET", "OPTIONS")
	r.HandleFunc("/admin/reset-station-codes", resetStationCodesHandler).Methods("POST", "OPTIONS")

	// Mentor routes (no session required for login, but required for submit)
	r.HandleFunc("/mentor/login", mentorLoginHandler).Methods("POST", "OPTIONS")
	r.HandleFunc("/mentor/verify", mentorVerifyHandler).Methods("POST", "OPTIONS")

	protected := r.PathPrefix("/").Subrouter()
	protected.Use(validateSession)

	playerOnly := protected.PathPrefix("/").Subrouter()
	playerOnly.Use(validatePlayerOnly)
	playerOnly.HandleFunc("/submit-code", submitCodeHandler).Methods("POST", "OPTIONS")
	playerOnly.HandleFunc("/loadprogress", progressHandler).Methods("POST", "OPTIONS")

	// Mentor routes (protected but not player-only - mentors can access)
	protected.HandleFunc("/mentor/submit-code", mentorCodeSubmitHandler).Methods("POST", "OPTIONS")

	fmt.Printf("Server đang chạy trên port %s (Chế độ dữ liệu SQLite Local)\n", port)
	log.Fatal(http.ListenAndServe(":"+port, r))
}
