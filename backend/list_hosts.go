package main

import (
	"database/sql"
	"fmt"

	_ "modernc.org/sqlite"
)

func ListHosts() {
	db, err := sql.Open("sqlite", "./hackathon-game.db")
	if err != nil {
		fmt.Println("open error:", err)
		return
	}
	defer db.Close()

	rows, err := db.Query("SELECT team_id, team_name, role FROM teams WHERE role = 'host'")
	if err != nil {
		fmt.Println("query err:", err)
		return
	}
	defer rows.Close()
	for rows.Next() {
		var id int
		var name, role sql.NullString
		rows.Scan(&id, &name, &role)
		fmt.Printf("host team: id=%d name=%s role=%s\n", id, name.String, role.String)
	}
}
