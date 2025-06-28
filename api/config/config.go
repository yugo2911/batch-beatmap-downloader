package config

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
)

type Token struct {
	TokenType    string `json:"token_type"`
	ExpiresIn    int64  `json:"expires_in"`
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}

type CDN struct {
	Key string `json:"key"`
	Url string `json:"url"`
}

type DB struct {
	Full    string `json:"full"`
	Meta    string `json:"meta"`
	Log     string `json:"log"`
	Metrics string `json:"metrics"`
}

type Proxy struct {
	Application string `json:"application"`
	BaseUrl     string `json:"base_url"`
}

type Osu struct {
	Username          string    `json:"username"`
	Password          string    `json:"password"`
	Token             Token     `json:"token"`
	TokenAcquiredAt   time.Time `json:"-"`
	Key               string    `json:"key"`
	LazerClientId     string    `json:"lazer_client_id"`
	LazerClientSecret string    `json:"lazer_client_secret"`
	LazerOauthURL     string    `json:"lazer_oauth_url"`
	LazerApiURL       string    `json:"lazer_api_url"`
}

type config struct {
	CDN        CDN
	DB         DB
	Proxy      Proxy
	Osu        Osu
	ResyncFile string
	TokenFile  string
}

var Config config

// TokenData represents the token data that will be persisted
type TokenData struct {
	Token           Token     `json:"token"`
	TokenAcquiredAt time.Time `json:"token_acquired_at"`
}

// SaveTokenToFile saves the current token to the configured file
func SaveTokenToFile() error {
	if Config.TokenFile == "" {
		return nil // No token file configured, skip saving
	}

	tokenData := TokenData{
		Token:           Config.Osu.Token,
		TokenAcquiredAt: Config.Osu.TokenAcquiredAt,
	}

	data, err := json.MarshalIndent(tokenData, "", "  ")
	if err != nil {
		return err
	}

	return ioutil.WriteFile(Config.TokenFile, data, 0600)
}

// loadTokenFromFile loads the token from the configured file
func loadTokenFromFile() {
	if Config.TokenFile == "" {
		return // No token file configured, skip loading
	}

	data, err := ioutil.ReadFile(Config.TokenFile)
	if err != nil {
		// File doesn't exist or can't be read, that's okay
		return
	}

	var tokenData TokenData
	if err := json.Unmarshal(data, &tokenData); err != nil {
		log.Printf("Warning: Failed to parse token file: %v", err)
		return
	}

	Config.Osu.Token = tokenData.Token
	Config.Osu.TokenAcquiredAt = tokenData.TokenAcquiredAt
}

func init() {
	godotenv.Load()

	Config = config{
		CDN: CDN{
			Key: os.Getenv("CDN_KEY"),
			Url: os.Getenv("CDN_URL"),
		},
		DB: DB{
			Full:    os.Getenv("FULL_DB_LOCATION"),
			Meta:    os.Getenv("META_DB_LOCATION"),
			Log:     os.Getenv("LOG_LOCATION"),
			Metrics: os.Getenv("METRICS_LOCATION"),
		},
		Proxy: Proxy{
			Application: os.Getenv("PROXY_APPLICATION"),
			BaseUrl:     os.Getenv("PROXY_BASE_URL"),
		},
		Osu: Osu{
			Username:          os.Getenv("OSU_USERNAME"),
			Password:          os.Getenv("OSU_PASSWORD"),
			Token:             Token{},
			Key:               os.Getenv("OSU_KEY"),
			LazerClientId:     "5",
			LazerClientSecret: "FGc9GAtyHzeQDshWP5Ah7dega8hJACAJpQtw6OXk",
			LazerOauthURL:     "https://osu.ppy.sh/oauth/token",
			LazerApiURL:       "https://osu.ppy.sh/api/v2/beatmapsets/%d/download",
		}, ResyncFile: os.Getenv("RESYNC_FILE"),
		TokenFile: os.Getenv("TOKEN_FILE"),
	}

	// Load existing token from file if it exists
	loadTokenFromFile()
}
