package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

// Cấu trúc data trả về cho Frontend
type TeamRank struct {
	TeamID       int       `json:"team_id"`
	TeamName     string    `json:"team_name"`
	CorrectCount int       `json:"correct_count"` // Số câu (trạm) đúng
	Score        int       `json:"score"`         // Số điểm hiện tại
	UpdatedAt    time.Time `json:"updated_at"`
}

type ScoreboardHub struct {
	clients    map[*websocket.Conn]bool
	broadcast  chan []TeamRank
	register   chan *websocket.Conn
	unregister chan *websocket.Conn
	mu         sync.RWMutex // Khóa đọc/ghi để an toàn đa luồng (Concurrency)
	cache      []TeamRank   // Lưu bảng điểm ngay trên RAM để tối ưu tốc độ
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func NewScoreboardHub() *ScoreboardHub {
	return &ScoreboardHub{
		clients:    make(map[*websocket.Conn]bool),
		broadcast:  make(chan []TeamRank),
		register:   make(chan *websocket.Conn),
		unregister: make(chan *websocket.Conn),
		cache:      make([]TeamRank, 0),
	}
}

func (h *ScoreboardHub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client] = true
			h.mu.Unlock()

			// TỐI ƯU: Gửi ngay dữ liệu trong Cache hiện tại khi client vừa kết nối
			h.mu.RLock()
			if len(h.cache) > 0 {
				data, _ := json.Marshal(h.cache)
				client.WriteMessage(websocket.TextMessage, data)
			}
			h.mu.RUnlock()

		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				client.Close()
			}
			h.mu.Unlock()

		case ranks := <-h.broadcast:
			h.mu.Lock()
			h.cache = ranks // Cập nhật bộ nhớ đệm RAM
			data, err := json.Marshal(ranks)
			if err != nil {
				log.Println("Lỗi mã hóa dữ liệu bảng điểm:", err)
				h.mu.Unlock()
				continue
			}

			// Phát sóng tới tất cả các client đang kết nối thời gian thực
			for client := range h.clients {
				err := client.WriteMessage(websocket.TextMessage, data)
				if err != nil {
					client.Close()
					delete(h.clients, client)
				}
			}
			h.mu.Unlock()
		}
	}
}

// TỐI ƯU HOÀN HẢO: Truyền biến db toàn cục từ main.go vào để tránh lỗi "Database Locked"
func (h *ScoreboardHub) RefreshFromDB(currentDB *sql.DB) {
	if currentDB == nil {
		log.Println("Lỗi: Biến kết nối Database truyền vào Scoreboard bị rỗng (nil)")
		return
	}

	// Query lấy dữ liệu từ kết nối dùng chung an toàn
	query := `
        SELECT t.team_id, t.team_name, COALESCE(s.score, 0), COALESCE(c.finishedStations, '')
        FROM teams t
        LEFT JOIN scores s ON t.team_id = s.team_id
        LEFT JOIN checkpoints c ON t.team_id = c.team_id
        WHERE t.role = 'player' AND t.login_time IS NOT NULL
    `
	rows, err := currentDB.Query(query)
	if err != nil {
		log.Printf("Lỗi query dữ liệu bảng điểm: %v\n", err)
		return
	}
	defer rows.Close()

	updatedRanks := make([]TeamRank, 0)
	for rows.Next() {
		var r TeamRank
		var finishedStr string
		err := rows.Scan(&r.TeamID, &r.TeamName, &r.Score, &finishedStr)
		if err != nil {
			continue
		}

		// Tính toán số câu đúng từ chuỗi finishedStations
		count := 0
		if finishedStr != "" {
			// Split by comma and count non-empty parts
			parts := strings.Split(finishedStr, ",")
			for _, part := range parts {
				if strings.TrimSpace(part) != "" {
					count++
				}
			}
		}
		r.CorrectCount = count
		r.UpdatedAt = time.Now()

		updatedRanks = append(updatedRanks, r)
	}

	// Đẩy mảng mới vào kênh phát sóng
	h.broadcast <- updatedRanks
}

// Biến toàn cục để tương tác từ main.go
var globalScoreHub *ScoreboardHub
var globalDB *sql.DB
