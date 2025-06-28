# Resync Command

This command downloads beatmap sets specified in a text file containing comma-separated set IDs.

## Usage

1. Make sure your `.env` file has the `RESYNC_FILE` variable set to point to a text file containing comma-separated beatmap set IDs.

2. The resync file should contain beatmap set IDs in the format: `1,2,3,4,5`

3. Run the command:
   ```bash
   go run main.go
   ```
   
   Or build and run:
   ```bash
   go build -o resync .
   ./resync
   ```

## Environment Variables Required

- `RESYNC_FILE`: Path to the text file containing comma-separated beatmap set IDs
- `OSU_KEY`: Your osu! API key (used by the GetBeatmap function)
- Database connection variables (used by the database package)

## Features

- Reads comma-separated beatmap set IDs from the specified file
- Validates each set ID (must be a positive integer)
- Downloads each beatmap set using the existing `update.GetBeatmap` function
- Includes rate limiting (1 second delay between downloads)
- Provides progress logging
- Handles errors gracefully (skips invalid IDs, continues with others)

## Example Resync File Content

```
1,2,3,456789,987654,12345
```
