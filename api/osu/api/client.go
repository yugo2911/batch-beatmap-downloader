package api

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/nzbasic/batch-beatmap-downloader/api/config"
)

func parseJson[T ProxyRequest](body T, reader io.Reader) (T, error) {
	decoder := json.NewDecoder(reader)
	err := decoder.Decode(&body)
	if err != nil {
		return T{}, err
	}

	return body, err
}

func request[T ProxyRequest](url string, params map[string]interface{}, response T) (T, error) {
	reqUrl := config.Config.Proxy.BaseUrl + "/" + url

	req, err := http.NewRequest("GET", reqUrl, nil)
	if err != nil {
		fmt.Println(err.Error())
	}

	q := req.URL.Query()
	q.Add("application", config.Config.Proxy.Application)
	for key, value := range params {
		q.Add(key, fmt.Sprintf("%v", value))
	}

	req.URL.RawQuery = q.Encode()

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		fmt.Println(err.Error())
	}

	defer res.Body.Close()
	return parseJson(response, res.Body)
}
