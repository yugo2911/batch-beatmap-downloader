package main

import (
	"log"

	"github.com/joho/godotenv"
	"github.com/nzbasic/batch-beatmap-downloader/api/database"
	"github.com/nzbasic/batch-beatmap-downloader/api/database/update"
)

func main() {
	defer database.Close()

	// Load environment variables
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	log.Println("Starting month search command...")

	// Run the month search
	update.SearchMonth()

	log.Println("Month search command completed.")
}
