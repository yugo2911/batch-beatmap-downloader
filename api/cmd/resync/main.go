package main

import (
	"log"

	"github.com/nzbasic/batch-beatmap-downloader/api/config"
	"github.com/nzbasic/batch-beatmap-downloader/api/database"
	"github.com/nzbasic/batch-beatmap-downloader/api/database/update"
	"github.com/nzbasic/batch-beatmap-downloader/api/osu/api"
)

func main() {
	defer database.Close()

	if config.Config.ResyncFile == "" {
		log.Fatal("RESYNC_FILE environment variable not set")
	}

	api.EnsureValidToken()
	update.GetNewBeatmapsLoop()

	// // Read the resync file
	// content, err := ioutil.ReadFile(config.Config.ResyncFile)
	// if err != nil {
	// 	log.Fatalf("Error reading resync file %s: %v", config.Config.ResyncFile, err)
	// }

	// // Parse comma-separated set IDs
	// setIdsStr := strings.TrimSpace(string(content))
	// if setIdsStr == "" {
	// 	log.Println("Resync file is empty, nothing to download")
	// 	return
	// }

	// setIdStrings := strings.Split(setIdsStr, ",")
	// setIds := make([]int, 0, len(setIdStrings))

	// // Convert strings to integers and validate
	// for _, idStr := range setIdStrings {
	// 	idStr = strings.TrimSpace(idStr)
	// 	if idStr == "" {
	// 		continue
	// 	}

	// 	setId, err := strconv.Atoi(idStr)
	// 	if err != nil {
	// 		log.Printf("Invalid set ID '%s', skipping: %v", idStr, err)
	// 		continue
	// 	}

	// 	if setId <= 0 {
	// 		log.Printf("Invalid set ID %d, must be positive, skipping", setId)
	// 		continue
	// 	}

	// 	setIds = append(setIds, setId)
	// }

	// if len(setIds) == 0 {
	// 	log.Println("No valid set IDs found in resync file")
	// 	return
	// }

	// log.Printf("Found %d beatmap sets to download", len(setIds))
	// log.Printf("Starting resync download process...")

	// // Download each beatmap set
	// for i, setId := range setIds {
	// 	// Skip if the set ID is already in the database
	// 	if database.Exists(setId) {
	// 		log.Printf("Beatmap set %d already exists in the database, skipping", setId)
	// 		continue
	// 	}

	// 	log.Printf("Downloading beatmap set %d (%d/%d)", setId, i+1, len(setIds))

	// 	update.GetBeatmap(setId)

	// 	// Sleep between downloads to avoid rate limiting
	// 	if i < len(setIds)-1 {
	// 		time.Sleep(1 * time.Second)
	// 	}
	// }

	// log.Printf("Resync download process completed. Downloaded %d beatmap sets.", len(setIds))
}
