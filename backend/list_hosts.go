package main

import (
	"database/sql"
	"fmt"
	"os"

	_ "github.com/jackc/pgx/v5/stdlib"
)

func ListHosts() {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://postgres:trannguyenphu125@db.bhufnlndpxfcjagzmjrs.supabase.co:5432/postgres"
	}

	db, err := sql.Open("pgx", dbURL)
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
