package main

import (
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/nzbasic/batch-beatmap-downloader/api/database"
)

func main() {
	defer database.Close()

	rows, err := database.Query("SELECT DISTINCT setId FROM beatmaps WHERE approvedDate < 0 and playCount < 1000")
	if err != nil {
		panic(err)
	}

	setIds := make([]int, 0)
	for rows.Next() {
		var setId int
		err := rows.Scan(&setId)
		if err != nil {
			panic(err)
		}

		setIds = append(setIds, setId)
	}

	rows.Close()

	fmt.Printf("removing %d\n", len(setIds))

	time.Sleep(time.Minute * 1)

	for i, setId := range setIds {
		err := removeBeatmap(setId)

		if err != nil {
			fmt.Printf("error removing %d\n", setId)
			continue
		}

		_, err = database.Exec("delete from beatmaps where setId = ?", setId)

		if err != nil {
			fmt.Printf("error db delete %d\n", setId)
			continue
		}

		if i%100 == 0 {
			fmt.Printf("done %d / %d\n", i, len(setIds))
		}
	}
}

func removeBeatmap(setId int) error {
	uploadClient := &http.Client{}

	setIdString := fmt.Sprint(setId)
	uploadFilename := setIdString + ".osz"

	a, err := http.NewRequest(http.MethodDelete, fmt.Sprintf("https://bbd-api.nzbasic.workers.dev/%s", uploadFilename), nil)
	if err != nil {
		return err
	}

	a.Header.Set("Content-Type", "application/octet-stream")
	a.Header.Set("X-Custom-Auth-Key", os.Getenv("CDN_KEY"))

	_, err = uploadClient.Do(a)

	return err
}
