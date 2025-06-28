package api

import (
	"bytes"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strconv"
	"sync"
	"time"

	"github.com/nzbasic/batch-beatmap-downloader/api/config"
)

var (
	downloadCount      int
	downloadTimestamps []int64
	maxDownloads       = 1000
	window             = 10 * time.Minute
	mutex              = &sync.Mutex{}
)

// DownloadBeatmapset downloads a beatmapset, waits if threshold is reached, panics on 429
func DownloadBeatmapset(id int) (bytes.Buffer, error) {
	if err := EnsureValidToken(); err != nil {
		return bytes.Buffer{}, err
	}
	for {
		if canDownload() {
			break
		}
		sleep := waitDuration()
		fmt.Printf("Download threshold reached, sleeping for %v...\n", sleep)
		time.Sleep(sleep)
	}
	url := fmt.Sprintf(config.Config.Osu.LazerApiURL, id)
	req, err := http.NewRequest("GET", url+"?noVideo=1", nil)
	if err != nil {
		return bytes.Buffer{}, err
	}
	req.Header.Set("Authorization", fmt.Sprintf("%s %s", config.Config.Osu.Token.TokenType, config.Config.Osu.Token.AccessToken))

	downloadClient := &http.Client{
		Transport: &http.Transport{
			ResponseHeaderTimeout: 5 * time.Second,
		},
	}

	resp, err := downloadClient.Do(req)
	if err != nil {
		return bytes.Buffer{}, err
	}
	defer resp.Body.Close()

	now := time.Now().Unix()
	mutex.Lock()
	downloadCount++
	downloadTimestamps = append(downloadTimestamps, now)
	mutex.Unlock()

	if resp.StatusCode == 429 {
		count := requestCountInWindow()
		panic(fmt.Sprintf("429 Too Many Requests. %d requests in the past 10 minutes.", count))
	}
	if resp.StatusCode != 200 {
		io.ReadAll(resp.Body)

		return bytes.Buffer{}, fmt.Errorf("osu! API error: status=%d", resp.StatusCode)
	}
	// Check file validity
	contentType := resp.Header.Get("Content-Type")
	if contentType != "application/x-osu-beatmap-archive" {
		return bytes.Buffer{}, errors.New("invalid file: wrong content type")
	}
	clen := resp.Header.Get("Content-Length")

	if clen == "" {
		return bytes.Buffer{}, errors.New("invalid file: missing content length")
	}

	size, err := strconv.Atoi(clen)
	if err != nil {
		return bytes.Buffer{}, fmt.Errorf("invalid file: content length is not a number: %s", clen)
	}

	if size < 500 {
		return bytes.Buffer{}, fmt.Errorf("invalid file: content length is too small: %d", size)
	}

	var buf bytes.Buffer
	tee := io.TeeReader(resp.Body, &buf)
	setIdString := fmt.Sprint(id)
	uploadFilename := setIdString + ".osz"

	a, err := http.NewRequest(http.MethodPut, fmt.Sprintf("https://bbd-api.nzbasic.workers.dev/%s", uploadFilename), tee)
	if err != nil {
		resp.Body.Close()
		return bytes.Buffer{}, err
	}

	a.Header.Set("Content-Type", "application/octet-stream")
	a.Header.Set("X-Custom-Auth-Key", config.Config.CDN.Key)

	uploadClient := &http.Client{}

	resp, err = uploadClient.Do(a)
	if err != nil {
		return bytes.Buffer{}, err
	}

	return buf, nil
}

// canDownload checks if under the threshold for this 10-min window
func canDownload() bool {
	mutex.Lock()
	defer mutex.Unlock()
	cleanupOld()
	return requestCountInWindow() < maxDownloads
}

// waitDuration returns the duration to wait before next download is allowed
func waitDuration() time.Duration {
	mutex.Lock()
	defer mutex.Unlock()
	cleanupOld()
	if len(downloadTimestamps) < maxDownloads {
		return 0
	}
	oldest := downloadTimestamps[0]
	return time.Until(time.Unix(oldest, 0).Add(window))
}

// requestCountInWindow returns number of requests in the window
func requestCountInWindow() int {
	cleanupOld()
	return len(downloadTimestamps)
}

// cleanupOld removes timestamps older than window
func cleanupOld() {
	now := time.Now().Unix()
	cutoff := now - int64(window.Seconds())
	n := 0
	for _, ts := range downloadTimestamps {
		if ts > cutoff {
			break
		}
		n++
	}
	downloadTimestamps = downloadTimestamps[n:]
}

func DownloadBeatmap(setId string) (bytes.Buffer, error) {
	base := os.Getenv("DOWNLOAD_BASE_URL")

	uploadClient := &http.Client{}
	downloadClient := &http.Client{
		Transport: &http.Transport{
			ResponseHeaderTimeout: 5 * time.Second,
		},
	}

	setIdString := fmt.Sprint(setId)
	uploadFilename := setIdString + ".osz"

	res, err := downloadClient.Get(base + setIdString)
	if err != nil {
		return bytes.Buffer{}, err
	}

	time.Sleep(2000)

	if res.ContentLength == 36 {
		res.Body.Close()
		return bytes.Buffer{}, errors.New(setIdString + " doesn't exist")
	}

	if res.StatusCode != http.StatusOK {
		res.Body.Close()
		log.Printf("%d\n", res.StatusCode)
		return bytes.Buffer{}, errors.New("status code is not 200")
	}

	var buf bytes.Buffer
	tee := io.TeeReader(res.Body, &buf)

	a, err := http.NewRequest(http.MethodPut, fmt.Sprintf("https://bbd-api.nzbasic.workers.dev/%s", uploadFilename), tee)
	if err != nil {
		res.Body.Close()
		return bytes.Buffer{}, err
	}

	a.Header.Set("Content-Type", "application/octet-stream")
	a.Header.Set("X-Custom-Auth-Key", os.Getenv("CDN_KEY"))

	res, err = uploadClient.Do(a)
	if err != nil {
		return bytes.Buffer{}, err
	}

	return buf, nil
}
