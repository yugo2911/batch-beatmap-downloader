package update

import (
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"time"

	"github.com/nzbasic/batch-beatmap-downloader/api/database"
	"github.com/nzbasic/batch-beatmap-downloader/api/osu"
	"github.com/nzbasic/batch-beatmap-downloader/api/osu/api"
	"github.com/thehowl/go-osuapi"
)

func GetNewBeatmapsLoop() {
	row := database.QueryRow("SELECT setId FROM beatmaps ORDER BY setId DESC LIMIT 1")
	var lastSetId int

	err := row.Scan(&lastSetId)
	if err != nil {
		log.Println(err)
	}

	lastSetId = 1800000
	highestId := 2124033

	fmt.Printf("Downloading from %d to %d\n", highestId, lastSetId+1)
	for i := highestId; i > lastSetId; i-- {
		if database.Exists(i) {
			// fmt.Printf("%d exists\n", i)
			continue
		}

		// fmt.Printf("%d checking\n", i)

		res := getBeatmap(i)

		if res {
			fmt.Printf("%d added\n", i)
		} else {
		}

		time.Sleep(2 * time.Second)
	}

	time.Sleep(5 * time.Minute)
	GetNewBeatmapsLoop()
}

func getBeatmap(setId int) bool {
	c := osuapi.NewClient(os.Getenv("OSU_KEY"))
	beatmaps, err := c.GetBeatmaps(osuapi.GetBeatmapsOpts{
		BeatmapSetID: setId,
	})

	if err != nil {
		log.Println("osu! API error", err)
		return false
	}

	if len(beatmaps) == 0 {
		return false
	}

	shouldAdd := false
	for _, beatmap := range beatmaps {
		if beatmap.ApprovedDate.GetTime().Unix() > 0 || beatmap.Playcount > 1000 {
			shouldAdd = true
		}
	}

	if !shouldAdd {
		return false
	}

	buffer, err := api.DownloadBeatmap(fmt.Sprintf("%d", setId))
	if err != nil {
		log.Printf("Error downloading beatmap %d", setId)
		log.Println(err)
		return false
	}

	body, err := ioutil.ReadAll(&buffer)
	if err != nil {
		log.Println("Error reading buffer", err)
		return false
	}

	beatmapsData := osu.ParseOszInMemoryWithApiData(beatmaps, body)
	for _, beatmapData := range beatmapsData {
		if beatmapData.Title == "" {
			log.Println(setId, "no title")
			continue
		}

		database.AddBeatmap(beatmapData)
	}

	return true
}

func getLatestSetId() int {
	c := osuapi.NewClient(os.Getenv("OSU_KEY"))
	time := time.Now().AddDate(0, 0, -1)
	res, err := c.GetBeatmaps(osuapi.GetBeatmapsOpts{
		Since: &time,
	})

	fmt.Printf("%d", len(res))

	if err != nil {
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
