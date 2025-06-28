# Month Search Command

This command searches for all ranked beatmaps from the last month using the osu! API v2 search endpoint with pagination.

## Features

- **Pagination Support**: Uses cursor-based pagination to fetch all results
- **Date Filtering**: Automatically stops when it encounters beatmaps older than 1 month
- **Rate Limiting**: Includes proper rate limiting between API requests
- **Detailed Logging**: Provides comprehensive logging of the search progress

## How it Works

1. Starts with the most recently ranked beatmaps (sort=ranked_desc)
2. Fetches pages of results using cursor_string for pagination
3. Checks each beatmap's ranked_date against the 1-month threshold
4. Stops when it finds a beatmap older than 1 month
5. Downloads all valid beatmaps found during the search

## Usage

```bash
cd api/cmd/month-search
go run main.go
```

Or build and run:
```bash
go build -o month-search .
./month-search
```

## Environment Variables Required

- All standard database and API configuration variables
- `OSU_USERNAME`: Your osu! username
- `OSU_PASSWORD`: Your osu! password
- `TOKEN_FILE`: Path for token persistence (optional)

## Example Output

```
Starting month search command...
Starting month search for ranked beatmaps...
Searching for beatmaps ranked after: 2025-05-24
Processing 50 beatmapsets from this page
Downloading new ranked-month beatmapset: 2391095
...
Found beatmap 2307879 ranked on 2025-05-20 (older than one month), stopping search
Month search completed. Total beatmapsets processed: 1247
Month search command completed.
```

## API Endpoints Used

- `https://osu.ppy.sh/api/v2/beatmapsets/search?nsfw=true&s=ranked&sort=ranked_desc`
- With pagination: `...&cursor_string={cursor}`

## Notes

- This is a manual operation intended to be run occasionally
- The search automatically stops at the 1-month boundary
- All found beatmaps are processed through the normal download pipeline
- Uses the same authentication system as other commands
