package update

import (
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/nzbasic/batch-beatmap-downloader/api/config"
	"github.com/nzbasic/batch-beatmap-downloader/api/database"
	"github.com/nzbasic/batch-beatmap-downloader/api/osu"
	"github.com/nzbasic/batch-beatmap-downloader/api/osu/api"
	"github.com/thehowl/go-osuapi"
)

// API rate limiting
var apiLimiter = struct {
	count int
	mutex sync.Mutex
}{}

// BeatmapsetSearch represents the search response from osu! API v2
type BeatmapsetSearch struct {
	Beatmapsets  []BeatmapsetInfo `json:"beatmapsets"`
	CursorString string           `json:"cursor_string"`
}

// BeatmapsetInfo represents beatmapset info from API v2 search
type BeatmapsetInfo struct {
	ID         int    `json:"id"`
	Status     string `json:"status"`
	RankedDate string `json:"ranked_date"`
}

func addAPICount() {
	apiLimiter.mutex.Lock()
	apiLimiter.count++
	apiLimiter.mutex.Unlock()
}

func resetAPICount() {
	apiLimiter.mutex.Lock()
	apiLimiter.count = 0
	apiLimiter.mutex.Unlock()
}

func waitForAPILimit() {
	for {
		apiLimiter.mutex.Lock()
		count := apiLimiter.count
		apiLimiter.mutex.Unlock()

		if count < 50 {
			break
		}
		time.Sleep(500 * time.Millisecond)
	}
}

// GetNewBeatmapsLoop runs multiple goroutines to search for different types of maps
func GetNewBeatmapsLoop() {
	// Reset API counter every minute
	go func() {
		for {
			time.Sleep(time.Minute)
			resetAPICount()
		}
	}()

	// Search for ranked maps
	go func() {
		for {
			waitForAPILimit()
			searchRankedMaps()
			// searchQualifiedMaps()
			searchLovedMaps()
			time.Sleep(time.Minute)
		}
	}()

	log.Println("Started beatmap crawler")

	// Keep the function running
	select {}
}

// GetBeatmap downloads and processes a beatmap by its set ID
func GetBeatmap(setId int) {
	c := osuapi.NewClient(config.Config.Osu.Key)
	beatmaps, err := c.GetBeatmaps(osuapi.GetBeatmapsOpts{
		BeatmapSetID: setId,
	})

	if err != nil {
		log.Printf("osu! API error for set %d: %v", setId, err)
		return
	}
	if len(beatmaps) == 0 {
		log.Printf("No beatmaps found for set %d", setId)
		return
	}

	buffer, err := api.DownloadBeatmapset(setId)
	if err != nil {
		log.Printf("Error downloading beatmap %d: %v", setId, err)
		return
	}

	body, err := ioutil.ReadAll(&buffer)
	if err != nil {
		log.Printf("Error reading buffer for set %d: %v", setId, err)
		return
	}

	beatmapsData, err := osu.ParseOszInMemoryWithApiData(beatmaps, body)
	if err != nil {
		log.Printf("Error parsing beatmap data for set %d: %v", setId, err)
		return
	}

	for _, beatmapData := range beatmapsData {
		if beatmapData.Title == "" {
			log.Printf("Set %d: no title, skipping", setId)
			continue
		}
		database.AddBeatmap(beatmapData)
	}
	log.Printf("Successfully processed set %d", setId)
}

// searchRankedMaps searches for newly ranked beatmaps
func searchRankedMaps() {
	log.Println("Searching for ranked maps...")
	url := "https://osu.ppy.sh/api/v2/beatmapsets/search?nsfw=true&s=ranked&sort=ranked_desc"

	var data BeatmapsetSearch
	if err := makeAPIRequest(url, &data); err != nil {
		log.Printf("Error searching ranked maps: %v", err)
		return
	}

	processBeatmapsets(data.Beatmapsets, "ranked")
}

// searchQualifiedMaps searches for qualified beatmaps
func searchQualifiedMaps() {
	log.Println("Searching for qualified maps...")
	url := "https://osu.ppy.sh/api/v2/beatmapsets/search?nsfw=true&s=qualified&sort=updated_desc"

	var data BeatmapsetSearch
	if err := makeAPIRequest(url, &data); err != nil {
		log.Printf("Error searching qualified maps: %v", err)
		return
	}

	processBeatmapsets(data.Beatmapsets, "qualified")
}

// searchLovedMaps searches for loved beatmaps
func searchLovedMaps() {
	log.Println("Searching for loved maps...")
	url := "https://osu.ppy.sh/api/v2/beatmapsets/search?nsfw=true&s=loved&sort=updated_desc"

	var data BeatmapsetSearch
	if err := makeAPIRequest(url, &data); err != nil {
		log.Printf("Error searching loved maps: %v", err)
		return
	}

	processBeatmapsets(data.Beatmapsets, "loved")
}

// SearchMonth searches for all ranked beatmaps from the last month using pagination
func SearchMonth() {
	log.Println("Starting month search for ranked beatmaps...")

	// Calculate the date one month ago
	oneMonthAgo := time.Now().AddDate(0, -1, 0)
	log.Printf("Searching for beatmaps ranked after: %s", oneMonthAgo.Format("2006-01-02"))

	totalProcessed := 0
	cursorString := ""

	for {
		// Build URL with cursor if we have one
		var url string
		if cursorString != "" {
			url = fmt.Sprintf("https://osu.ppy.sh/api/v2/beatmapsets/search?nsfw=true&s=ranked&sort=ranked_desc&cursor_string=%s", cursorString)
		} else {
			url = "https://osu.ppy.sh/api/v2/beatmapsets/search?nsfw=true&s=ranked&sort=ranked_desc"
		}

		var data BeatmapsetSearch
		if err := makeAPIRequest(url, &data); err != nil {
			log.Printf("Error searching ranked maps: %v", err)
			break
		}

		if len(data.Beatmapsets) == 0 {
			log.Println("No more beatmapsets found")
			break
		}

		// Check if we've reached beatmaps older than one month
		foundOldMap := false
		var validBeatmapsets []BeatmapsetInfo

		for _, beatmapset := range data.Beatmapsets {
			if beatmapset.RankedDate != "" {
				// Parse the ranked date
				rankedDate, err := time.Parse("2006-01-02T15:04:05Z", beatmapset.RankedDate)
				if err != nil {
					log.Printf("Error parsing ranked date for set %d: %v", beatmapset.ID, err)
					continue
				}

				// If this beatmap is older than one month, stop processing
				if rankedDate.Before(oneMonthAgo) {
					log.Printf("Found beatmap %d ranked on %s (older than one month), stopping search", beatmapset.ID, rankedDate.Format("2006-01-02"))
					foundOldMap = true
					break
				}

				validBeatmapsets = append(validBeatmapsets, beatmapset)
			}
		}

		// Process the valid beatmapsets
		if len(validBeatmapsets) > 0 {
			log.Printf("Processing %d beatmapsets from this page", len(validBeatmapsets))
			processBeatmapsets(validBeatmapsets, "ranked-month")
			totalProcessed += len(validBeatmapsets)
		}

		// If we found an old map, stop the search
		if foundOldMap {
			break
		}

		// If there's no cursor string, we've reached the end
		if data.CursorString == "" {
			log.Println("No more pages available")
			break
		}

		// Update cursor for next page
		cursorString = data.CursorString

		// Rate limiting between pages
		time.Sleep(2 * time.Second)

		log.Printf("Processed page, moving to next page (total processed so far: %d)", totalProcessed)
	}

	log.Printf("Month search completed. Total beatmapsets processed: %d", totalProcessed)
}

// SearchMonthTest is a test version of SearchMonth that doesn't download, just logs what it would process
func SearchMonthTest() {
	log.Println("Starting month search TEST (no downloads)...")

	// Calculate the date one month ago
	oneMonthAgo := time.Now().AddDate(0, -1, 0)
	log.Printf("Searching for beatmaps ranked after: %s", oneMonthAgo.Format("2006-01-02"))

	totalFound := 0
	cursorString := ""
	pageCount := 0

	for {
		pageCount++
		log.Printf("Fetching page %d...", pageCount)

		// Build URL with cursor if we have one
		var url string
		if cursorString != "" {
			url = fmt.Sprintf("https://osu.ppy.sh/api/v2/beatmapsets/search?nsfw=true&s=ranked&sort=ranked_desc&cursor_string=%s", cursorString)
		} else {
			url = "https://osu.ppy.sh/api/v2/beatmapsets/search?nsfw=true&s=ranked&sort=ranked_desc"
		}

		var data BeatmapsetSearch
		if err := makeAPIRequest(url, &data); err != nil {
			log.Printf("Error searching ranked maps: %v", err)
			break
		}

		if len(data.Beatmapsets) == 0 {
			log.Println("No more beatmapsets found")
			break
		}

		log.Printf("Page %d: Found %d beatmapsets", pageCount, len(data.Beatmapsets))

		// Check if we've reached beatmaps older than one month
		foundOldMap := false
		validCount := 0

		for _, beatmapset := range data.Beatmapsets {
			if beatmapset.RankedDate != "" {
				// Parse the ranked date
				rankedDate, err := time.Parse("2006-01-02T15:04:05Z", beatmapset.RankedDate)
				if err != nil {
					log.Printf("Error parsing ranked date for set %d: %v", beatmapset.ID, err)
					continue
				}

				// If this beatmap is older than one month, stop processing
				if rankedDate.Before(oneMonthAgo) {
					log.Printf("Found beatmap %d ranked on %s (older than one month), stopping search", beatmapset.ID, rankedDate.Format("2006-01-02"))
					foundOldMap = true
					break
				}

				validCount++
				if validCount <= 3 { // Show first 3 as examples
					log.Printf("  - Set %d: %s (ranked %s)", beatmapset.ID, beatmapset.Status, rankedDate.Format("2006-01-02"))
				}
			}
		}

		totalFound += validCount
		log.Printf("Page %d: %d valid beatmapsets (total so far: %d)", pageCount, validCount, totalFound)

		// If we found an old map, stop the search
		if foundOldMap {
			break
		}

		// If there's no cursor string, we've reached the end
		if data.CursorString == "" {
			log.Println("No more pages available")
			break
		}

		// Update cursor for next page
		cursorString = data.CursorString

		// Rate limiting between pages
		time.Sleep(1 * time.Second)

		// Safety limit for testing
		if pageCount >= 20 {
			log.Printf("Reached page limit for testing (20 pages), stopping...")
			break
		}
	}

	log.Printf("Month search TEST completed. Total pages: %d, Total beatmapsets found: %d", pageCount, totalFound)
}

// makeAPIRequest makes an authenticated request to the osu! API v2
func makeAPIRequest(url string, result interface{}) error {
	// Ensure we have a valid token
	if err := api.EnsureValidToken(); err != nil {
		return fmt.Errorf("authentication failed: %v", err)
	}

	client := &http.Client{}
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return err
	}

	// Add authentication header
	token := config.Config.Osu.Token
	req.Header.Set("Authorization", fmt.Sprintf("%s %s", token.TokenType, token.AccessToken))
	req.Header.Set("Content-Type", "application/json")

	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	addAPICount()

	if resp.StatusCode != 200 {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("API request failed with status %d: %s", resp.StatusCode, string(body))
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return err
	}

	return json.Unmarshal(body, result)
}

// processBeatmapsets processes a list of beatmapsets and downloads new ones
func processBeatmapsets(beatmapsets []BeatmapsetInfo, category string) {
	if len(beatmapsets) == 0 {
		log.Printf("No %s beatmapsets found", category)
		return
	}

	log.Printf("Found %d %s beatmapsets to process", len(beatmapsets), category)

	for _, beatmapset := range beatmapsets {
		// Check if we already have this beatmapset
		if beatmapExists(beatmapset.ID) {
			continue
		}
		log.Printf("Downloading new %s beatmapset: %d", category, beatmapset.ID)
		GetBeatmap(beatmapset.ID)

		// Rate limit downloads
		time.Sleep(1 * time.Second)
	}
}

// beatmapExists checks if a beatmapset already exists in the database
func beatmapExists(setId int) bool {
	query := fmt.Sprintf("SELECT COUNT(*) FROM beatmaps WHERE setId = %d", setId)
	row := database.QueryRow(query)
	var count int
	err := row.Scan(&count)
	if err != nil {
		log.Printf("Error checking if beatmapset %d exists: %v", setId, err)
		return false
	}
	return count > 0
}

// getLatestSetId gets the latest set ID from the API (fallback method)
func getLatestSetId() int {
	c := osuapi.NewClient(config.Config.Osu.Key)
	time := time.Now().AddDate(0, 0, -1)
	res, err := c.GetBeatmaps(osuapi.GetBeatmapsOpts{
		Since: &time,
	})

	if err != nil {
		log.Printf("Error getting latest set ID: %v", err)
		return 0
	}

	highestId := 0
	for _, beatmap := range res {
		if beatmap.BeatmapSetID > highestId {
			highestId = beatmap.BeatmapSetID
		}
	}

	return highestId
}

// GetNewBeatmapsLegacy is the old method for finding new beatmaps (fallback)
func GetNewBeatmapsLegacy() {
	row := database.QueryRow("SELECT setId FROM beatmaps ORDER BY setId DESC LIMIT 1")
	var lastSetId int

	err := row.Scan(&lastSetId)
	if err != nil {
		log.Printf("Error getting last set ID: %v", err)
		return
	}

	highestId := getLatestSetId()
	if highestId > 0 && highestId > lastSetId+1 {
		log.Printf("Legacy search: Downloading from %d to %d", lastSetId+1, highestId)
		for i := lastSetId + 1; i <= highestId; i++ {
			// Only download if it doesn't exist and might be ranked/qualified/loved
			if !beatmapExists(i) {
				GetBeatmap(i)
				time.Sleep(1 * time.Second)
			}
		}
	}
}
