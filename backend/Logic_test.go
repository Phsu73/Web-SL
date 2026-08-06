package main

import "testing"

func TestCalScore(t *testing.T) {
	if got := calScore(0, 100, 0, 0); got != 150 {
		t.Fatalf("expected 150 points with no hints and max time bonus, got %d", got)
	}

	if got := calScore(0, 100, 1, 0); got != 120 {
		t.Fatalf("expected 120 points after one hint and max time bonus, got %d", got)
	}

	if got := calScore(0, 100, 0, 600); got != 100 {
		t.Fatalf("expected 100 points with no hints and no time bonus, got %d", got)
	}
}

func TestAppendFinishedStation(t *testing.T) {
	got := appendFinishedStation("1,2,", 2)
	if got != "1,2," {
		t.Fatalf("expected duplicate station to be ignored, got %q", got)
	}

	got = appendFinishedStation("1,2,", 3)
	if got != "1,2,3," {
		t.Fatalf("expected new station to be appended, got %q", got)
	}
}
