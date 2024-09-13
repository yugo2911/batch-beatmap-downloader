package metrics

import (
	"time"

	"github.com/nzbasic/batch-beatmap-downloader/api/database"
)

type DatabaseMetrics struct {
	NumberStoredRanked   int
	NumberStoredLoved    int
	NumberStoredUnranked int
	LastBeatmapAdded     int
}

var dbCache DatabaseMetrics
var dbCacheAge time.Time

func GetDatabaseMetrics() DatabaseMetrics {
	// check if cache is still valid
	if time.Now().Before(dbCacheAge.Add(cacheAge)) {
		return dbCache
	}

	var date int
	var ranked int
	var unranked int
	var loved int
	database.QueryRow("SELECT approvedDate FROM beatmaps ORDER BY approvedDate DESC LIMIT 1").Scan(&date)
	database.QueryRow("SELECT COUNT(*) FROM beatmaps WHERE Approved = 'ranked'").Scan(&ranked)
	database.QueryRow("SELECT COUNT(*) FROM beatmaps WHERE Approved = 'loved'").Scan(&loved)
	database.QueryRow("SELECT COUNT(*) FROM beatmaps WHERE Approved = 'WIP' OR Approved = 'graveyard' OR Approved = 'pending'").Scan(&unranked)

	dbCacheAge = time.Now()
	dbCache = DatabaseMetrics{
		NumberStoredRanked:   ranked,
		NumberStoredLoved:    loved,
		NumberStoredUnranked: unranked,
		LastBeatmapAdded:     date,
	}

	return dbCache
}
