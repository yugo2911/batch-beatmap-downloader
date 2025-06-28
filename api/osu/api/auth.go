package api

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/nzbasic/batch-beatmap-downloader/api/config"
)

// login logs into osu! API and stores tokens
func login() error {
	data := map[string]string{
		"client_id":     config.Config.Osu.LazerClientId,
		"client_secret": config.Config.Osu.LazerClientSecret,
		"grant_type":    "password",
		"username":      config.Config.Osu.Username,
		"password":      config.Config.Osu.Password,
		"scope":         "*",
	}
	payload, _ := json.Marshal(data)

	req, err := http.NewRequest("POST", config.Config.Osu.LazerOauthURL, bytes.NewBuffer(payload))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode != 200 {
		b, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("login failed: %s", string(b))
	}
	var res config.Token
	if err := json.NewDecoder(resp.Body).Decode(&res); err != nil {
		return err
	}
	config.Config.Osu.Token = res
	config.Config.Osu.TokenAcquiredAt = time.Now()

	// Save token to file for persistence
	if err := config.SaveTokenToFile(); err != nil {
		fmt.Printf("Warning: Failed to save token to file: %v\n", err)
	}

	return nil
}

// checkTokenRefresh ensures token is valid, and refreshes or re-logs if expired
func checkTokenRefresh() error {
	token := config.Config.Osu.Token
	tokenAcquiredAt := config.Config.Osu.TokenAcquiredAt

	// If no token exists, login
	if token.AccessToken == "" || tokenAcquiredAt.IsZero() {
		fmt.Println("No token found, logging in...")
		return login()
	}

	// Check if token is expired
	expiry := tokenAcquiredAt.Add(time.Duration(token.ExpiresIn) * time.Second)
	if time.Now().After(expiry) {
		fmt.Println("Token expired, attempting to refresh...")

		// Try to refresh token first
		if err := refreshToken(); err != nil {
			fmt.Printf("Token refresh failed (%v), logging in with credentials...\n", err)
			return login()
		}
		return nil
	}

	return nil
}

// refreshToken attempts to refresh the access token using the refresh token
func refreshToken() error {
	if config.Config.Osu.Token.RefreshToken == "" {
		return fmt.Errorf("no refresh token available")
	}

	data := map[string]string{
		"client_id":     config.Config.Osu.LazerClientId,
		"client_secret": config.Config.Osu.LazerClientSecret,
		"grant_type":    "refresh_token",
		"refresh_token": config.Config.Osu.Token.RefreshToken,
	}
	payload, _ := json.Marshal(data)

	req, err := http.NewRequest("POST", config.Config.Osu.LazerOauthURL, bytes.NewBuffer(payload))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		b, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("token refresh failed: %s", string(b))
	}

	var res config.Token
	if err := json.NewDecoder(resp.Body).Decode(&res); err != nil {
		return err
	}

	config.Config.Osu.Token = res
	config.Config.Osu.TokenAcquiredAt = time.Now()

	// Save refreshed token to file
	if err := config.SaveTokenToFile(); err != nil {
		fmt.Printf("Warning: Failed to save refreshed token to file: %v\n", err)
	}

	fmt.Println("Successfully refreshed access token")
	return nil
}

// EnsureValidToken ensures that a valid token is available by checking, refreshing, or logging in as needed
func EnsureValidToken() error {
	return checkTokenRefresh()
}
