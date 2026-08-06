// Dùng queue để xếp các đội vào Trụ
// Không trụ nào có quá 2 đội
// Đội vào sau nhưng giải xong trước thì vẫn thoát Trụ trước

package main

import (
	"fmt"
	"sync"
)

type Queue struct {
	ID      int
	Team    []string
	MaxSize int
	mu      sync.Mutex
}

func NewQueue(id int) *Queue {
	return &Queue{
		ID:      id,
		Team:    make([]string, 0),
		MaxSize: 2,
	}
}

func (q *Queue) Join(team string) bool {
	q.mu.Lock()
	defer q.mu.Unlock()
	if len(q.Team) < q.MaxSize {
		q.Team = append(q.Team, team)
		fmt.Printf("Đội %s đã tham gia giải Trụ %d. Trụ hiện tại: %v\n", team, q.ID, q.Team)
		return true
	}
	fmt.Printf("Trụ %d đã đủ đội.\n", q.ID)
	return false
}

func (q *Queue) Answer(team string, correct bool) {
	index := -1
	for i, p := range q.Team {
		if p == team {
			index = i
			break
		}
	}

	if index == -1 {
		fmt.Printf("Đội %s đã thoát Trụ %d.\n", team, q.ID)
		return
	}

	if correct {
		q.Team = append(q.Team[:index], q.Team[index+1:]...)
		fmt.Printf("Đội %s trả lời chính xác và thoát Trụ %d.\n", team, q.ID)
		// nextQueue.Join(team)
	} else {
		fmt.Printf("Đội %s trả lời sai. Đội %s đang kẹt ở Trụ %d.\n", team, team, q.ID)
	}
}

func simultaneousJoin(queue *Queue, teams []string) {
	var wg sync.WaitGroup

	for _, team := range teams {
		wg.Add(1)
		go func(teamName string) {
			defer wg.Done()
			queue.Join(teamName)
		}(team)
	}

	wg.Wait()
}
