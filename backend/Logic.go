package main

import (
	"fmt"
	"strconv"
	"strings"
)

// Score manager
func normalize(s string) string {
	s = strings.ToLower(s)
	trimmed := strings.TrimSpace(s)
	return trimmed
}

func checkAnswer(teamAnswer string, correctAnswer string) bool {
	return normalize(teamAnswer) == normalize(correctAnswer)
}

func calScore(originScore int, addScore int, hintClicked int, timeElapsedSeconds int) int {
	// Base score with hint penalty
	baseScore := addScore - 30*hintClicked

	// Time bonus: faster answers get more points
	// Max bonus if answered within 60 seconds (1 minute)
	// Bonus decreases linearly over time, reaching 0 after 10 minutes
	maxTimeBonus := 50
	timeLimitSeconds := 600 // 10 minutes

	var timeBonus int
	if timeElapsedSeconds < 60 {
		timeBonus = maxTimeBonus
	} else if timeElapsedSeconds < timeLimitSeconds {
		// Linear decrease from 50 to 0 over 10 minutes
		timeBonus = maxTimeBonus * (timeLimitSeconds - timeElapsedSeconds) / (timeLimitSeconds - 60)
	} else {
		timeBonus = 0
	}

	return originScore + baseScore + timeBonus
}

// Login manager
func checkLoginInfo(teamID int, inputCode string) bool {
	correctCode, err := loadLoginInfo(teamID)
	if err != nil {
		fmt.Printf("Error loading login info: %v\n", err)
		return false
	}
	return inputCode == correctCode
}

// manage station availability
func containsStation(finished string, target int) bool {
	parts := strings.Split(finished, ",")
	for _, p := range parts {
		p = strings.TrimSpace(p)
		if p == "" {
			continue
		}
		num, err := strconv.Atoi(p)
		if err != nil {
			continue
		}
		if num == target {
			return true
		}
	}
	return false
}

func appendFinishedStation(finished string, target int) string {
	if containsStation(finished, target) {
		return finished
	}
	if finished == "" {
		return strconv.Itoa(target) + ","
	}
	return finished + strconv.Itoa(target) + ","
}

func checkStationAvailable(teamID int, stationID int) (bool, error) {
	var finishedStations string
	var err error
	finishedStations, err = loadFinishedStations(teamID)
	if err != nil {
		return false, fmt.Errorf("failed to load finished stations: %w", err)
	}

	// Allow switching to any unfinished station
	if containsStation(finishedStations, stationID) {
		fmt.Printf("Team %d has already finished station %d\n", teamID, stationID)
		return false, nil
	}
	// Allow team to switch stations freely if they haven't completed this one
	fmt.Printf("Team %d is allowed to access station %d\n", teamID, stationID)
	return true, nil
}

// getHintCount returns the number of hints used by a team for a specific station
// func getHintCount(teamID int, stationID int) (int, error) {
// 	ctx := context.Background()
// 	docID := fmt.Sprintf("team_%d_station_%d", teamID, stationID)
// 	doc, err := firestoreClient.Collection("hints").Doc(docID).Get(ctx)
// 	if err != nil {
// 		// If document doesn't exist, return 0
// 		if firestore.IsNotFound(err) {
// 			return 0, nil
// 		}
// 		return 0, err
// 	}

// 	data := doc.Data()
// 	if count, ok := data["count"].(int64); ok {
// 		return int(count), nil
// 	}
// 	return 0, nil
// }

// incrementHintCount increases the hint usage count by 1
// func incrementHintCount(teamID int, stationID int) error {
// 	ctx := context.Background()
// 	docID := fmt.Sprintf("team_%d_station_%d", teamID, stationID)

// 	_, err := firestoreClient.Collection("hints").Doc(docID).Set(ctx, map[string]interface{}{
// 		"count": firestore.Increment(1),
// 	}, firestore.MergeAll)
// 	return err
// }
