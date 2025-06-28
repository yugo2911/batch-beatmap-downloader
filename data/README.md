# Token Management

This system implements OAuth2 token management with refresh token support for the osu! API.

## Features

- **Token Persistence**: Tokens are saved to a file and loaded on startup
- **Automatic Refresh**: Expired tokens are automatically refreshed using the refresh token
- **Fallback Authentication**: If refresh fails, the system falls back to username/password login
- **Secure Storage**: Token file permissions are set to 0600 (owner read/write only)

## Configuration

Add the following environment variable to your `.env` file:

```
TOKEN_FILE=/path/to/token.json
```

For Docker deployments, you can mount a volume to persist tokens:

```yaml
volumes:
  - ./data:/app/data
```

Then set `TOKEN_FILE=/app/data/token.json`

## Authentication Flow

1. **Initial Authentication**: Uses username/password to get access and refresh tokens
2. **Token Validation**: Checks if current token is valid (not expired)
3. **Token Refresh**: If expired, attempts to refresh using refresh token
4. **Fallback Login**: If refresh fails, falls back to username/password authentication
5. **Token Persistence**: All successful authentications save tokens to file

## Usage

```go
import "github.com/nzbasic/batch-beatmap-downloader/api/osu/api"

// Ensure a valid token is available
if err := api.EnsureValidToken(); err != nil {
    log.Fatal("Authentication failed:", err)
}

// Now you can make authenticated API calls
```

## Security Considerations

- Token files are created with 0600 permissions (owner read/write only)
- Token files should be excluded from version control (added to .gitignore)
- For production deployments, use bind mounts or volumes to persist tokens outside containers
- Consider using proper secrets management in production environments

## Environment Variables Required

- `OSU_USERNAME`: Your osu! username
- `OSU_PASSWORD`: Your osu! password  
- `TOKEN_FILE`: Path where tokens should be saved/loaded (optional, if not set tokens won't persist)
