# Data Update Guide

This guide explains how to update the leaderboard data by replacing the CSV file.

## Quick Start

To update the leaderboard data:

1. Place your CSV file at: `data/deals.csv`
2. Refresh the application (or wait up to 5 minutes for cache to clear)
3. The leaderboard will automatically load the new data

That's it! No scripts to run, no rebuilding required.

## CSV File Location

The application reads data from:
```
data/deals.csv
```

This file is gitignored and should NOT be committed to version control. Only the processed data structure matters, not the raw CSV.

## CSV Format Requirements

### Metadata Lines

The first **7 lines** of the CSV file are treated as metadata and will be skipped during parsing. This matches the format used by the original Python conversion script.

### Required Columns

Your CSV must include these columns (exact names):

| Column Name | Description | Format Example |
|------------|-------------|----------------|
| `Deal Name` | Name of the deal/client | "John Smith" |
| `GHB - Stage` | Current deal stage | "Booking Done", "Site Visit Done", etc. |
| `GHB Deal Owner` | Primary advisor name | "Amit Kumar" |
| `Research Partner` | Research partner name | "Priya Singh" |
| `Txn. Partner` | Transaction partner name | "Rahul Sharma" |
| `Created On` | Deal creation date | "15/04/2025 10:30 AM" |
| `Discovery Call Done` | Discovery completion date | "18/04/2025 02:15 PM" |
| `Shortlisting Done` | Shortlisting completion date | "22/04/2025 11:00 AM" |
| `Site Visit Done` | Site visit completion date | "25/04/2025 03:45 PM" |
| `Deep Dive Done` | Deep dive completion date | "28/04/2025 09:20 AM" |
| `Closure Done` | Closure date | "02/05/2025 04:30 PM" |
| `Collection Done` | Collection completion date | "10/05/2025 01:00 PM" |
| `GHB Amount Paid` | Payment amount | "₹ 2,499.00" or "₹ 4,999.00" |

### Date Format

All date fields must follow this format:
```
DD/MM/YYYY HH:MM AM/PM
```

Examples:
- `15/04/2025 10:30 AM`
- `22/04/2025 02:15 PM`
- `01/05/2025 09:00 AM`

**Important:** Only the date part (DD/MM/YYYY) is used. The time part is ignored but should be present to match the expected format.

### Amount Format

The `GHB Amount Paid` column should use this format:
```
₹ 2,499.00
```

- Rupee symbol (₹) is optional
- Commas in numbers are supported
- Decimal places (.00) are optional
- If parsing fails, defaults to ₹2,499

Examples:
- `₹ 2,499.00` → 2499
- `₹ 4,999.00` → 4999
- `2499` → 2499
- `10000` → 10000

### Stage Values and Status Mapping

The `GHB - Stage` column maps to internal status codes:

| Stage Value | Status Code | Display Name |
|------------|-------------|--------------|
| `Yet To Start` | L | Live |
| `LongList Call Scheduled` | D | Dropped |
| `Shortlisting Done` | D | Dropped |
| `Site Visit Scheduled` | H | On Hold |
| `Site Visit Done` | H | On Hold |
| `Deep Dive Done` | H | On Hold |
| `Booking Done` | B | Booking Done |
| `Closure Done` | C | Collection Done |
| `Collection Done` | C | Collection Done |
| (any other value) | L | Live |

## How It Works

### Base Date

All dates in the CSV are converted to "days since base date" for efficient storage. The base date is:

```
April 1, 2025
```

For example:
- April 1, 2025 → 0 days
- April 15, 2025 → 14 days
- May 1, 2025 → 30 days

This allows the application to calculate date differences and turnaround times efficiently.

### Data Processing Flow

1. **CSV Read**: The API route reads `data/deals.csv`
2. **Skip Metadata**: First 7 lines are skipped
3. **Parse Columns**: Remaining rows are parsed with column headers
4. **Extract Advisors**: Unique names from GHB Deal Owner, Research Partner, and Txn. Partner columns
5. **Sort Advisors**: Names are sorted alphabetically into the `NM` array
6. **Transform Records**: Each deal is converted into a 13-element array in `RW` format
7. **Cache**: Results are cached for 5 minutes on the server
8. **Client Fetch**: Browser fetches JSON from `/api/deals`
9. **Render**: Dashboard processes and displays the data

### Data Cache

The API endpoint caches parsed data for **5 minutes** (300 seconds). This means:

- After updating the CSV, changes may take up to 5 minutes to appear
- Restart the development server to immediately reflect changes
- In production, wait 5 minutes or trigger a revalidation

## Troubleshooting

### CSV Not Loading

**Symptom:** Error message "Failed to load deals data"

**Solutions:**
1. Verify the CSV file exists at `data/deals.csv`
2. Check file permissions (should be readable)
3. Ensure the first 7 lines are present (even if empty/metadata)
4. Verify all required columns exist with exact names

### Dates Not Parsing

**Symptom:** Deals show "0 days" or incorrect dates

**Solutions:**
1. Check date format matches `DD/MM/YYYY HH:MM AM/PM`
2. Ensure day and month have leading zeros (e.g., `01` not `1`)
3. Verify dates are not before April 1, 2025 (base date)

### Advisors Not Appearing

**Symptom:** Advisor names missing from dropdowns

**Solutions:**
1. Check advisor names are not empty in CSV
2. Verify column names exactly match: `GHB Deal Owner`, `Research Partner`, `Txn. Partner`
3. Ensure names don't have extra spaces (trimmed automatically, but check anyway)

### Amount Showing as 2499

**Symptom:** All deals show default amount ₹2,499

**Solutions:**
1. Verify `GHB Amount Paid` column exists
2. Check amount format includes rupee symbol or is plain number
3. Remove any special characters except ₹, comma, and period

## Example CSV Structure

```csv
Line 1: Metadata
Line 2: Metadata
Line 3: Metadata
Line 4: Metadata
Line 5: Metadata
Line 6: Metadata
Line 7: Metadata
Deal Name,GHB - Stage,GHB Deal Owner,Research Partner,Txn. Partner,Created On,Discovery Call Done,Shortlisting Done,Site Visit Done,Deep Dive Done,Closure Done,Collection Done,GHB Amount Paid
Amit Kumar,Booking Done,Priya Singh,Rahul Sharma,Neha Gupta,01/04/2025 09:00 AM,05/04/2025 10:30 AM,10/04/2025 02:15 PM,15/04/2025 11:00 AM,20/04/2025 03:45 PM,25/04/2025 04:30 PM,01/05/2025 01:00 PM,₹ 4,999.00
John Smith,Site Visit Done,Amit Patel,,,02/04/2025 10:00 AM,06/04/2025 11:00 AM,11/04/2025 03:00 PM,16/04/2025 10:30 AM,,,,₹ 2,499.00
```

## Developer Notes

### File Structure

```
data/
├── .gitkeep           # Ensures directory is tracked in git
└── deals.csv          # Your CSV data (gitignored)

lib/
└── csv-parser.ts      # CSV parsing logic

app/
├── api/
│   └── deals/
│       └── route.ts   # API endpoint
└── page.tsx           # Main dashboard (fetches from API)
```

### Modifying CSV Columns

If your CSV structure changes (different column names or additional fields):

1. Update `lib/csv-parser.ts` to match new column names
2. Update the parsing logic for new fields
3. Update the `RW` array structure if adding/removing elements
4. Update this guide to reflect changes

### Performance

- Current dataset: ~1,300 deals
- Parse time: <500ms
- API response: ~200-300ms
- The 5-minute cache prevents excessive re-parsing
- Consider increasing cache time for larger datasets

## Comparison with Old Workflow

### Before (Python Script)
```bash
# 1. Update CSV at specific path
# 2. Run: python scripts/convert-csv-to-data.py
# 3. Commit generated app/leaderboard-data.js
# 4. Rebuild application
# 5. Deploy
```

### Now (CSV Drop-in)
```bash
# 1. Place CSV at data/deals.csv
# 2. Refresh browser (or wait 5 min)
# Done!
```

## Support

If you encounter issues not covered in this guide:

1. Check browser console for error messages
2. Verify CSV format matches requirements exactly
3. Restart development server to clear all caches
4. Review `lib/csv-parser.ts` for parsing logic details
