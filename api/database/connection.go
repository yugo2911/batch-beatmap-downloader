package database

import (
	"database/sql"

	"github.com/joho/godotenv"
	"github.com/nzbasic/batch-beatmap-downloader/api/config"
)

var metaDb *sql.DB
var fullDb *sql.DB

func open() {
	godotenv.Load()
	metaDb, _ = sql.Open("sqlite3", config.Config.DB.Meta)
	fullDb, _ = sql.Open("sqlite3", config.Config.DB.Full)

	println("Total Maps:", GetBeatmapCount())
	// RefreshFarm()
	// BatchUpdate(AddFarm)

	var count int
	row := metaDb.QueryRow("SELECT COUNT(*) FROM beatmaps WHERE farm=1")
	row.Scan(&count)
	println("Farm Maps:", count)

	row = metaDb.QueryRow("SELECT COUNT(*) FROM beatmaps WHERE stream=1")
	row.Scan(&count)
	println("Stream Maps:", count)
}

func Close() {
	metaDb.Close()

	if fullDb != nil {
		fullDb.Close()
	}
}

func Begin() (*sql.Tx, error) {
	return metaDb.Begin()
}

func OpenFullDb() {
	fullDb, _ = sql.Open("sqlite3", config.Config.DB.Full)
}
